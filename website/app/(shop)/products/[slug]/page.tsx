'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/product/product-card';
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/products/${slug}`).then(r => r.json()),
      fetch(`${API}/api/products`).then(r => r.json()),
    ]).then(([p, all]) => {
      setProduct(p);
      setProducts(all.slice(0, 4));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container mx-auto px-3 py-6"><p className="text-muted-foreground">Loading...</p></div>;
  if (!product) return <div className="container mx-auto px-3 py-6"><p className="text-muted-foreground">Product not found</p></div>;

  const discount = calculateDiscount(product.price, product.comparePrice);
  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'];

  return (
    <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
      <div className="grid gap-4 sm:gap-8 md:grid-cols-2">
        <div className="space-y-3 sm:space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg sm:rounded-xl bg-muted">
            <img src={images[selectedImage]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex gap-2 sm:gap-3">
            {images.map((img: string, i: number) => (
              <button key={i} onClick={() => setSelectedImage(i)} className={`h-14 w-14 sm:h-20 sm:w-20 overflow-hidden rounded-md border-2 ${selectedImage === i ? 'border-primary' : 'border-transparent'}`}>
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <div><h1 className="text-lg sm:text-2xl font-bold">{product.name}</h1><div className="mt-1 flex items-center gap-2"><div className="flex items-center gap-0.5">{[1,2,3,4,5].map((s) => (<Star key={s} className={`h-3 w-3 sm:h-4 sm:w-4 ${s <= Math.round(product.rating || 4.5) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />))}</div><span className="text-xs sm:text-sm text-muted-foreground">({product.reviewCount || 0} reviews)</span></div></div>
          <div className="flex items-baseline gap-2 sm:gap-3">
            <span className="text-xl sm:text-3xl font-bold">{formatPrice(product.price)}</span>
            {discount && <><span className="text-sm sm:text-lg text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span><Badge variant="destructive">{discount}% OFF</Badge></>}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
          {product.stock !== undefined && <p className={`text-xs sm:text-sm ${product.stock > 0 ? 'text-green-600' : 'text-destructive'}`}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>}
          <Separator />
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center border rounded-md"><Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-3 w-3 sm:h-4 sm:w-4" /></Button><span className="w-8 sm:w-12 text-center text-sm sm:text-base">{quantity}</span><Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => setQuantity(quantity + 1)}><Plus className="h-3 w-3 sm:h-4 sm:w-4" /></Button></div>
            <Button className="flex-1 text-xs sm:text-sm" onClick={() => addToCart(product._id, quantity)}><ShoppingCart className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> Add to Cart</Button>
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 shrink-0" onClick={() => toggle(product._id)}><Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isWishlisted(product._id) ? 'fill-red-500 text-red-500' : ''}`} /></Button>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 rounded-lg bg-muted/50 p-2 sm:p-3 text-xs sm:text-sm"><div className="flex items-center gap-1.5"><Truck className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />Free Shipping</div><div className="flex items-center gap-1.5"><Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />Secure</div><div className="flex items-center gap-1.5"><RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />7-day Returns</div></div>
          {product.specs && <><Separator /><div><h3 className="text-sm sm:text-base font-medium mb-2">Specifications</h3><div className="space-y-1 text-xs sm:text-sm">{Object.entries(product.specs).map(([k, v]) => (<div key={k} className="flex justify-between border-b py-1"><span className="text-muted-foreground">{k}</span><span>{v as string}</span></div>))}</div></div></>}
        </div>
      </div>
      <Separator className="my-6 sm:my-8" />
      <h2 className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold">Related Products</h2>
      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.filter((p: any) => p._id !== product._id).slice(0, 4).map((p: any) => (<ProductCard key={p._id} product={{ id: p._id, name: p.name, price: p.price, comparePrice: p.comparePrice, image: p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', rating: p.rating || 4.5, reviews: p.reviewCount || 0 }} />))}
      </div>
    </div>
  );
}
