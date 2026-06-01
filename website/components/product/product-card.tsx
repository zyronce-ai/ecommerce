import Link from 'next/link';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice, calculateDiscount } from '@/lib/utils';

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
          >
            <Heart className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Link>
      <CardContent className="p-2.5 sm:p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-1 text-xs font-medium sm:text-sm">{product.name}</h3>
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
        <Button className="mt-2 w-full sm:mt-3" size="sm">
          <ShoppingCart className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" /> 
          <span className="text-xs sm:text-sm">Add to Cart</span>
        </Button>
      </CardContent>
    </Card>
  );
}
