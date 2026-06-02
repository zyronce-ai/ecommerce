import Typesense from 'typesense';
import type { SearchResponseHit } from 'typesense/lib/Typesense/Documents';
import { Product } from '../../mongo/models/Product';

const client = new Typesense.Client({
  nodes: [{
    host: process.env.TYPESENSE_HOST || 'localhost',
    port: Number(process.env.TYPESENSE_PORT) || 8108,
    protocol: process.env.TYPESENSE_PROTOCOL || 'http',
  }],
  apiKey: process.env.TYPESENSE_API_KEY || '',
  connectionTimeoutSeconds: 5,
});

const COLLECTION = 'products';

export async function createCollection() {
  try {
    const existing = await client.collections(COLLECTION).retrieve();
    const fieldNames = (existing.fields || []).map((f: any) => f.name);
    if (!fieldNames.includes('isActive')) {
      console.log('[TYPESENSE] Adding isActive field to existing collection');
      try {
        await client.collections(COLLECTION).update({ fields: [{ name: 'isActive', type: 'bool', optional: true }] });
      } catch (e: any) {
        console.warn('[TYPESENSE] Could not add isActive field:', e.message);
      }
    }
  } catch {
    await client.collections().create({
      name: COLLECTION,
      fields: [
        { name: 'name', type: 'string' },
        { name: 'slug', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'price', type: 'float' },
        { name: 'category', type: 'string', facet: true },
        { name: 'tags', type: 'string[]', facet: true, optional: true },
        { name: 'inStock', type: 'bool' },
        { name: 'isActive', type: 'bool', optional: true },
        { name: 'rating', type: 'float' },
        { name: 'images', type: 'string[]', optional: true },
        { name: 'vendor', type: 'string' },
      ],
      default_sorting_field: 'rating',
    });
  }
}

function toTypesenseDoc(product: any) {
  return {
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    price: product.price || 0,
    category: product.category?.name || product.category || '',
    tags: product.tags || [],
    inStock: product.inStock ?? true,
    isActive: product.isActive !== false,
    rating: product.rating || 0,
    images: product.images || [],
    vendor: product.vendor || '',
  };
}

export async function syncProduct(product: any) {
  try {
    await client.collections(COLLECTION).documents().upsert(toTypesenseDoc(product));
  } catch (err: any) {
    console.error('[TYPESENSE] sync error:', err.message);
  }
}

export async function removeProduct(id: string) {
  try {
    await client.collections(COLLECTION).documents(id).delete();
    console.log(`[TYPESENSE] Removed product ${id}`);
  } catch (err: any) {
    if (err.message?.includes('Not Found') || err.httpStatus === 404) {
      return;
    }
    console.error(`[TYPESENSE] Failed to remove product ${id}:`, err.message);
  }
}

export async function searchProducts(params: {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  perPage?: number;
}) {
  const { q, category, minPrice, maxPrice, sort, page = 1, perPage = 20 } = params;

  const filterBy: string[] = ['isActive:!=false'];
  if (category) filterBy.push(`category:=${category}`);
  if (minPrice !== undefined) filterBy.push(`price:>=${minPrice}`);
  if (maxPrice !== undefined) filterBy.push(`price:<=${maxPrice}`);

  let sortBy = 'rating:desc';
  if (sort === 'price_asc') sortBy = 'price:asc';
  else if (sort === 'price_desc') sortBy = 'price:desc';
  else if (sort === 'newest') sortBy = 'createdAt:desc';

  const searchParams: any = {
    q: q || '',
    query_by: 'name,description',
    filter_by: filterBy.join('&&'),
    sort_by: sortBy,
    page,
    per_page: perPage,
  };

  if (!q) searchParams.q = '*';

  const result = await client.collections(COLLECTION).documents().search(searchParams);

  return {
    hits: result.hits?.map((h: SearchResponseHit<any>) => ({
      _id: h.document.id,
      ...h.document,
      textMatch: h.text_match_info?.score || 0,
    })) || [],
    total: result.found || 0,
    page: result.page || 1,
    perPage: (result as any).per_page || perPage,
  };
}

export async function syncAllProducts() {
  try {
    const products = await Product.find({});
    const docs = products.map(toTypesenseDoc);
    await client.collections(COLLECTION).documents().import(docs, { action: 'upsert' });
    console.log(`[TYPESENSE] Synced ${docs.length} products`);
  } catch (err: any) {
    console.error('[TYPESENSE] syncAll error:', err.message);
  }
}
