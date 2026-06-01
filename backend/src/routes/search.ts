import { Router, Request, Response } from 'express';
import { Product } from '../../mongo/models/Product';
import { searchProducts } from '../utils/typesense.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { q, category, minPrice, maxPrice, sort, page, perPage } = req.query;

    if (process.env.TYPESENSE_API_KEY) {
      const result = await searchProducts({
        q: q as string,
        category: category as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort: sort as string,
        page: page ? Number(page) : undefined,
        perPage: perPage ? Number(perPage) : undefined,
      });
      return res.json(result);
    }

    const filter: any = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };

    const products = await Product.find(filter).sort(sortOption).limit(Number(perPage) || 50);
    res.json({ hits: products.map((p: any) => ({ _id: p._id, ...p.toObject() })), total: products.length, page: 1, perPage: Number(perPage) || 50 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sync', async (_req: Request, res: Response) => {
  try {
    if (!process.env.TYPESENSE_API_KEY) return res.status(400).json({ error: 'Typesense not configured' });
    const { syncAllProducts } = await import('../utils/typesense.js');
    await syncAllProducts();
    res.json({ message: 'Sync complete' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
