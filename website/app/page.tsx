'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/product-card';
import { CategoryCard } from '@/components/product/category-card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { ArrowRight, Star, Truck, Shield, HeadphonesIcon } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/products`).then(r => r.json()),
      fetch(`${API}/api/categories`).then(r => r.json()),
    ]).then(([p, c]) => {
      setProducts(p.slice(0, 8));
      setCategories(c.slice(0, 6));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mx-auto px-4 py-12"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <>
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
          <div className="grid items-center gap-6 sm:gap-8 md:grid-cols-2">
            <div className="space-y-4 sm:space-y-6">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:text-sm">🎉 Summer Sale — Up to 60% Off</span>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">Discover Premium<span className="text-primary"> Products </span>You&apos;ll Love</h1>
              <p className="max-w-md text-base text-muted-foreground sm:text-lg">Shop the latest trends in electronics, fashion, and home decor. Premium quality at unbeatable prices.</p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Button size="default" className="sm:size-lg" asChild><Link href="/products">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                <Button size="default" className="sm:size-lg" variant="outline" asChild><Link href="/deals">View Deals</Link></Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground sm:gap-6 sm:text-sm">
                <span className="flex items-center gap-1"><Truck className="h-3 w-3 sm:h-4 sm:w-4" /> Free Shipping</span>
                <span className="flex items-center gap-1"><Shield className="h-3 w-3 sm:h-4 sm:w-4" /> Secure Payment</span>
                <span className="flex items-center gap-1"><HeadphonesIcon className="h-3 w-3 sm:h-4 sm:w-4" /> 24/7 Support</span>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600" alt="Shopping" className="h-full w-full object-cover mix-blend-overlay" />
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-xl bg-background p-4 shadow-lg">
                <div className="flex items-center gap-2"><Star className="h-5 w-5 fill-yellow-400 text-yellow-400" /><span className="font-bold">4.8</span><span className="text-sm text-muted-foreground">(10k+ reviews)</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="mb-6 sm:mb-8 flex items-center justify-between"><h2 className="text-xl font-bold sm:text-2xl">Featured Products</h2><Button variant="link" asChild><Link href="/products">View All <ArrowRight className="ml-1 h-4 w-4" /></Link></Button></div>
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p: any) => (<ProductCard key={p._id} product={{ id: p._id, slug: p.slug, name: p.name, price: p.price, comparePrice: p.comparePrice, image: p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', rating: p.rating || 4.5, reviews: p.reviewCount || 0 }} />))}
        </div>
      </section>

      <section className="bg-muted/50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 sm:mb-8 text-xl font-bold sm:text-2xl">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((c: any) => (<CategoryCard key={c._id} category={{ id: c._id, name: c.name, image: c.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', count: c.productCount || 0 }} />))}
          </div>
        </div>
      </section>
    </>
  );
}
