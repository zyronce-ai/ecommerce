'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Search, SlidersHorizontal, Grid3X3, List } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function ProductsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/products`).then(r => r.json()),
      fetch(`${API}/api/categories`).then(r => r.json()),
    ]).then(([products, cats]) => {
      setAllProducts(products);
      setCategories(cats.map((c: any) => c.name));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  };

  const filtered = allProducts
    .filter((p: any) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((p: any) => p.price >= priceRange[0] && p.price <= priceRange[1])
    .filter((p: any) => selectedCategories.length === 0 || selectedCategories.includes(p.category?.name))
    .sort((a: any, b: any) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-9 h-9 sm:h-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Sheet><SheetTrigger asChild><Button variant="outline" size="sm" className="lg:hidden"><SlidersHorizontal className="h-4 w-4" /></Button></SheetTrigger><SheetContent side="left"><FilterSidebar categories={categories} selectedCategories={selectedCategories} toggleCategory={toggleCategory} priceRange={priceRange} setPriceRange={setPriceRange} /></SheetContent></Sheet>
          <Select value={sort} onValueChange={setSort}><SelectTrigger className="w-32 h-9 sm:h-10 text-xs sm:text-sm"><SelectValue /></SelectTrigger><SelectContent>{SORT_OPTIONS.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent></Select>
          <div className="hidden sm:flex border rounded-md"><Button variant={view === 'grid' ? 'default' : 'ghost'} size="icon" className="h-9 w-9" onClick={() => setView('grid')}><Grid3X3 className="h-4 w-4" /></Button><Button variant={view === 'list' ? 'default' : 'ghost'} size="icon" className="h-9 w-9" onClick={() => setView('list')}><List className="h-4 w-4" /></Button></div>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="hidden w-56 shrink-0 lg:block"><FilterSidebar categories={categories} selectedCategories={selectedCategories} toggleCategory={toggleCategory} priceRange={priceRange} setPriceRange={setPriceRange} /></aside>
        <div className="flex-1">
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3' : 'space-y-3'}>
              {filtered.map((p: any) => (
                <ProductCard key={p._id} product={{ id: p._id, name: p.name, price: p.price, comparePrice: p.comparePrice, image: p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', rating: p.rating || 4.5, reviews: p.reviewCount || 0 }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSidebar({ categories, selectedCategories, toggleCategory, priceRange, setPriceRange }: any) {
  return (
    <div className="space-y-6">
      <div><h3 className="mb-3 text-sm font-medium">Categories</h3><div className="space-y-2">{categories.map((cat: string) => (<label key={cat} className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={selectedCategories.includes(cat)} onCheckedChange={() => toggleCategory(cat)} />{cat}</label>))}</div></div>
      <Separator />
      <div><h3 className="mb-3 text-sm font-medium">Price Range</h3><Slider min={0} max={10000} step={100} value={priceRange} onValueChange={setPriceRange} className="mb-2" /><div className="flex justify-between text-xs text-muted-foreground"><span>₹0</span><span>₹10,000</span></div></div>
    </div>
  );
}
