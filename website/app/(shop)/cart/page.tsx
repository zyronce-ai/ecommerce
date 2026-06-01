'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Tag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/contexts/cart-context';

export default function CartPage() {
  const { items, loading, addToCart, updateQuantity, removeFromCart } = useCart();
  const [coupon, setCoupon] = useState('');

  const subtotal = items.reduce((s, i) => s + (i._product?.price || 0) * i.quantity, 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping;

  if (loading) return <div className="container mx-auto px-3 py-6"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-4 flex items-center gap-3 sm:mb-6 sm:gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/products"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div><h1 className="text-xl font-bold sm:text-2xl">Shopping Cart</h1><p className="text-xs text-muted-foreground sm:text-sm">{items.length} items in your cart</p></div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20">
          <ShoppingBag className="h-12 w-12 text-muted-foreground sm:h-16 sm:w-16" />
          <h2 className="mt-3 text-lg font-semibold sm:mt-4 sm:text-xl">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground">Add items to get started</p>
          <Button className="mt-4" asChild><Link href="/products">Continue Shopping</Link></Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-8 lg:grid-cols-3">
          <div className="space-y-3 sm:space-y-4 lg:col-span-2">
            {items.map((item) => (<Card key={item.id}><CardContent className="flex gap-3 p-3 sm:gap-4 sm:p-4"><img src={item._product?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'} alt={item._product?.name || ''} className="h-16 w-16 rounded-lg object-cover sm:h-24 sm:w-24" /><div className="flex-1 min-w-0"><h3 className="text-sm font-medium sm:text-base truncate">{item._product?.name || 'Product'}</h3><p className="mt-1 text-sm font-bold sm:text-base">{formatPrice(item._product?.price || 0)}</p></div><div className="flex flex-col items-end justify-between">                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive" onClick={() => removeFromCart(item.id)}><Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Button><div className="flex items-center border rounded-md"><Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-3 w-3" /></Button><span className="w-6 text-center text-xs sm:w-8 sm:text-sm">{item.quantity}</span><Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-3 w-3" /></Button></div></div></CardContent></Card>))}
          </div>
          <div><Card><CardHeader className="p-4 sm:p-6"><CardTitle className="text-sm sm:text-base">Order Summary</CardTitle></CardHeader><CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0 text-xs sm:text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div><Separator /><div className="flex justify-between font-bold"><span>Total</span><span>{formatPrice(total)}</span></div><div className="flex gap-2"><Input placeholder="Coupon code" className="h-9 text-xs sm:h-10" value={coupon} onChange={(e) => setCoupon(e.target.value)} /><Button variant="outline" size="sm" className="shrink-0 text-xs"><Tag className="mr-1 h-3 w-3" />Apply</Button></div><Button className="w-full text-xs sm:text-sm" asChild><Link href="/checkout">Proceed to Checkout</Link></Button></CardContent></Card></div>
        </div>
      )}
    </div>
  );
}
