'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/product/product-card';
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, Shield, RotateCcw, ChevronRight, ZoomIn, Check, Loader2, MessageSquare, Send } from 'lucide-react';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { getToken } from '@/lib/use-api';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { toast } from 'sonner';

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
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/products/${slug}`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`${API}/api/products`).then(r => r.json()),
    ]).then(([p, all]) => {
      if (p.error) { setProduct(null); return; }
      setProduct(p);
      const sameCat = all.filter((x: any) => x.category?._id === p.category?._id && x._id !== p._id).slice(0, 4);
      setProducts(sameCat.length ? sameCat : all.filter((x: any) => x._id !== p._id).slice(0, 4));
      fetch(`${API}/api/reviews/product/${p._id}`).then(r => r.json()).then(setReviews).catch(() => {});
    }).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [slug]);

  async function handleSubmitReview() {
    const token = getToken();
    if (!token) { toast.error('Please login to leave a review'); return; }
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product: product._id, ...reviewForm }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const newReview = await res.json();
      setReviews(prev => [newReview, ...prev]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err: any) { toast.error(err.message); } finally { setSubmittingReview(false); }
  }

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
      <h2 className="mb-4 text-lg font-bold sm:text-xl">Customer Reviews</h2>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((r: any) => (
              <div key={r._id} className="rounded-lg border p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map((s) => (<Star key={s} className={`h-3 w-3 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />))}
                  </div>
                  <span className="text-xs text-muted-foreground">{r.name || 'Anonymous'}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                {r.title && <p className="text-sm font-medium">{r.title}</p>}
                {r.comment && <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>}
              </div>
            ))
          )}
        </div>
        <div>
          <div className="rounded-lg border p-3 sm:p-4 sticky top-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> Write a Review</h3>
            <div className="flex items-center gap-1 mb-3">
              {[1,2,3,4,5].map((s) => (
                <button key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                  <Star className={`h-5 w-5 ${s <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <input
              placeholder="Review title"
              value={reviewForm.title}
              onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
              className="w-full rounded-md border px-3 py-1.5 text-xs mb-2 outline-none focus:border-primary"
            />
            <textarea
              placeholder="Write your review..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              rows={3}
              className="w-full rounded-md border px-3 py-1.5 text-xs mb-3 outline-none focus:border-primary resize-none"
            />
            <Button size="sm" className="w-full h-8 text-xs" onClick={handleSubmitReview} disabled={submittingReview}>
              {submittingReview ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-8" />
      <h2 className="mb-4 text-lg font-bold sm:text-xl">Related Products</h2>
      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p: any) => (
          <ProductCard key={p._id} product={{
            id: p._id, slug: p.slug, name: p.name, price: p.price, comparePrice: p.comparePrice,
            image: p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
            rating: p.rating || 4.5, reviews: p.reviewCount || p.reviewsCount || 0,
          }} />
        ))}
      </div>
    </div>
  );
}
