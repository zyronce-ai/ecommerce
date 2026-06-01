'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Clock } from 'lucide-react';
import { formatPrice, calculateDiscount } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function DealsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/products`).then(r => r.json()).then((data) => {
      setProducts(data.filter((p: any) => p.comparePrice));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mx-auto px-3 py-6"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-6 sm:mb-8"><h1 className="text-xl font-bold sm:text-3xl">Deals & Offers</h1><p className="text-xs text-muted-foreground sm:text-sm">Limited time offers — grab them before they&apos;re gone!</p></div>
      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((deal: any) => {
          const discount = calculateDiscount(deal.price, deal.comparePrice);
          return (
            <Card key={deal._id} className="group overflow-hidden transition-all hover:shadow-lg active:scale-[0.98] touch-action-manipulation">
              <Link href={`/products/${deal.slug || deal._id}`}>
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img src={deal.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'} alt={deal.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  {discount && <Badge className="absolute left-1.5 top-1.5 bg-destructive text-[10px] sm:text-xs">{discount}% OFF</Badge>}
                  <Badge variant="secondary" className="absolute right-1.5 top-1.5 text-[10px] sm:text-xs"><Clock className="mr-0.5 h-2.5 w-2.5 sm:mr-1 sm:h-3 sm:w-3" /> Limited</Badge>
                </div>
              </Link>
              <CardContent className="p-2.5 sm:p-4">
                <Link href={`/products/${deal.slug || deal._id}`}><h3 className="text-xs font-medium sm:text-sm line-clamp-2 hover:text-primary transition-colors">{deal.name}</h3></Link>
                <div className="mt-1 flex items-baseline gap-1 sm:mt-2 sm:gap-1.5">
                  <span className="text-sm font-bold sm:text-base">{formatPrice(deal.price)}</span>
                  {deal.comparePrice && <span className="text-[10px] text-muted-foreground line-through sm:text-xs">{formatPrice(deal.comparePrice)}</span>}
                </div>
                <Button size="sm" variant="outline" className="mt-1.5 h-7 w-full text-[10px] sm:mt-2 sm:h-8 sm:text-xs"><ShoppingCart className="mr-1 h-3 w-3" /> Add to Cart</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
