'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product/product-card';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/wishlist-context';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function WishlistPage() {
  const { productIds, loading: wlLoading } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wlLoading) return;
    if (productIds.length === 0) { setProducts([]); setLoading(false); return; }
    fetch(`${API}/api/products`).then(r => r.json()).then((all) => {
      setProducts(all.filter((p: any) => productIds.includes(p._id)));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [productIds, wlLoading]);

  if (loading) return <div className="container mx-auto px-3 py-6"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-6 sm:mb-8"><h1 className="text-xl font-bold sm:text-3xl">My Wishlist</h1><p className="text-xs text-muted-foreground sm:text-sm">{products.length} items saved</p></div>
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20">
          <Heart className="h-12 w-12 text-muted-foreground sm:h-16 sm:w-16" />
          <h2 className="mt-3 text-lg font-semibold sm:mt-4 sm:text-xl">Your wishlist is empty</h2>
          <p className="text-sm text-muted-foreground">Save items you love to your wishlist</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p: any) => (<ProductCard key={p._id} product={{ id: p._id, name: p.name, price: p.price, comparePrice: p.comparePrice, image: p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', rating: p.rating || 4.5, reviews: p.reviewCount || 0 }} />))}
        </div>
      )}
    </div>
  );
}
