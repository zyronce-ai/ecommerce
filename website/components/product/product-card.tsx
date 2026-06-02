'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, Star, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    comparePrice?: number;
    image: string;
    rating?: number;
    reviews?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = calculateDiscount(product.price, product.comparePrice);
  const { addToCart } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    await addToCart(product.id, 1);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg active:scale-[0.98] touch-action-manipulation">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {discount && (
            <Badge className="absolute left-1.5 top-1.5 bg-destructive text-[10px] sm:text-xs">
              {discount}% OFF
            </Badge>
          )}
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-1.5 top-1.5 h-7 w-7 opacity-100 transition-opacity group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id); }}
          >
            <Heart className={`h-3.5 w-3.5 ${isWishlisted(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      </Link>
      <CardContent className="p-2.5 sm:p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-1 text-xs font-medium sm:text-sm hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        {product.rating && (
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] text-muted-foreground sm:text-xs">
              {product.rating} ({product.reviews})
            </span>
          </div>
        )}
        <div className="mt-1.5 flex items-center gap-1.5 sm:mt-2 sm:gap-2">
          <span className="text-sm font-bold text-primary sm:text-base">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="text-[10px] text-muted-foreground line-through sm:text-sm">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
        <Button className="mt-2 w-full sm:mt-3" size="sm" onClick={handleAddToCart} disabled={adding}>
          {adding ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : added ? <Check className="mr-1.5 h-3 w-3" /> : <ShoppingCart className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />}
          <span className="text-xs sm:text-sm">{adding ? 'Adding...' : added ? 'Added' : 'Add to Cart'}</span>
        </Button>
      </CardContent>
    </Card>
  );
}
