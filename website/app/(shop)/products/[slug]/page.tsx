'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/product/product-card';
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, Shield, RotateCcw, ChevronRight, ZoomIn, Check, Loader2 } from 'lucide-react';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const { addToCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/products/${slug}`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`${API}/api/products`).then(r => r.json()),
    ]).then(([p, all]) => {
      if (p.error) { setProduct(null); return; }
      setProduct(p);
      const sameCat = all.filter((x: any) => x.category?._id === p.category?._id && x._id !== p._id).slice(0, 4);
      setProducts(sameCat.length ? sameCat : all.filter((x: any) => x._id !== p._id).slice(0, 4));
    }).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [slug]);

  async function handleAddToCart() {
    if (!product?._id || adding) return;
    setAdding(true);
    await addToCart(product._id, quantity);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (loading) return (
    <div className="container mx-auto px-3 py-20 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  if (!product) return (
    <div className="container mx-auto px-3 py-20 text-center">
      <h2 className="text-xl font-bold">Product not found</h2>
      <p className="mt-2 text-sm text-muted-foreground">This product may have been removed or the link is invalid</p>
      <Button className="mt-4" asChild><Link href="/products">Browse Products</Link></Button>
    </div>
  );

  const discount = calculateDiscount(product.price, product.comparePrice);
  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'];
  const stockLevel = product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock';
  const stockLabel = stockLevel === 'in-stock' ? `${product.stock} in stock` : stockLevel === 'low-stock' ? `Only ${product.stock} left` : 'Out of stock';
  const stockColor = stockLevel === 'in-stock' ? 'text-green-600' : stockLevel === 'low-stock' ? 'text-amber-600' : 'text-destructive';

  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
      <nav className="mb-4 flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-foreground">Products</Link>
        {product.category?.name && <><ChevronRight className="h-3 w-3" /><span className="text-foreground">{product.category.name}</span></>}
        <ChevronRight className="h-3 w-3" />
        <span className="truncate max-w-[120px] sm:max-w-[200px] text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-6 md:grid-cols-2 md:gap-10">
        <div className="space-y-3">
          <div
            className={`relative aspect-square overflow-hidden rounded-xl bg-muted cursor-${zoomed ? 'zoom-out' : 'zoom-in'}`}
            onMouseMove={(e) => {
              if (!zoomed) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              e.currentTarget.querySelector('img')!.style.transformOrigin = `${x}% ${y}%`;
            }}
          >
            <img
              src={images[selectedImage].startsWith('http') ? images[selectedImage] : `${API}${images[selectedImage]}`}
              alt={product.name}
              className={`h-full w-full object-cover transition-all duration-200 ${zoomed ? 'scale-150' : ''}`}
              onClick={() => setZoomed(!zoomed)}
            />
            {discount && <Badge className="absolute left-3 top-3 text-sm">{discount}% OFF</Badge>}
            <button onClick={() => setZoomed(!zoomed)} className="absolute right-3 top-3 rounded-full bg-background/80 p-1.5 shadow-sm hover:bg-background">
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => { setSelectedImage(i); setZoomed(false); }} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${selectedImage === i ? 'border-primary' : 'border-transparent'} hover:border-primary/50 transition-colors`}>
                  <img src={img.startsWith('http') ? img : `${API}${img}`} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold sm:text-3xl">{product.name}</h1>
            {product.rating !== undefined && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((s) => (<Star key={s} className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${s <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />))}
                </div>
                <span className="text-sm text-muted-foreground">{product.rating} ({product.reviewCount || product.reviewsCount || 0} reviews)</span>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-primary sm:text-4xl">{formatPrice(product.price)}</span>
            {discount && <><span className="text-base text-muted-foreground line-through sm:text-lg">{formatPrice(product.comparePrice)}</span><Badge variant="destructive">{discount}% OFF</Badge></>}
          </div>

          <p className={`text-sm font-medium ${stockColor}`}>{stockLabel}</p>

          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          <Separator />

          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
              <span className="w-12 text-center text-sm font-medium">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
            </div>
            <Button className="flex-1 h-10" onClick={handleAddToCart} disabled={adding || stockLevel === 'out-of-stock'}>
              {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : added ? <Check className="mr-2 h-4 w-4" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
              {adding ? 'Adding...' : added ? 'Added!' : 'Add to Cart'}
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => toggle(product._id)}>
              <Heart className={`h-4 w-4 ${isWishlisted(product._id) ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/50 p-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-primary" />Free Shipping</div>
            <div className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" />Secure Payment</div>
            <div className="flex items-center gap-1.5"><RotateCcw className="h-4 w-4 text-primary" />7-day Returns</div>
          </div>

          {product.specs && Object.keys(product.specs).length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-base font-medium mb-3">Specifications</h3>
                <div className="rounded-lg border overflow-hidden text-sm">
                  {Object.entries(product.specs).map(([k, v], i) => (
                    <div key={k} className={`flex justify-between px-4 py-2.5 ${i % 2 === 0 ? 'bg-muted/30' : ''}`}>
                      <span className="text-muted-foreground font-medium">{k}</span>
                      <span className="text-right max-w-[60%]">{v as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Separator className="my-8" />
      <h2 className="mb-4 text-lg font-bold sm:text-xl">Related Products</h2>
      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p: any) => (
          <ProductCard key={p._id} product={{
            id: p.slug || p._id, name: p.name, price: p.price, comparePrice: p.comparePrice,
            image: p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
            rating: p.rating || 4.5, reviews: p.reviewCount || p.reviewsCount || 0,
          }} />
        ))}
      </div>
    </div>
  );
}
