'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { getToken } from '@/lib/use-api';
import { useCart } from '@/contexts/cart-context';
import { CreditCard, Wallet, Truck } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const PAYMENT_METHODS = [
  { value: 'stripe', label: 'Credit/Debit Card', icon: CreditCard },
  { value: 'paypal', label: 'PayPal', icon: Wallet },
  { value: 'cod', label: 'Cash on Delivery', icon: Truck },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ name: '', email: '', phone: '', street: '', city: '', state: '', pincode: '' });

  const subtotal = items.reduce((s, i) => s + (i._product?.price || 0) * i.quantity, 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  async function handlePlaceOrder() {
    const token = getToken();
    if (!token) { toast.error('Please login first'); router.push('/login?redirect=/checkout'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: '', items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i._product?.price })), total, address, paymentMethod, status: 'PENDING' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      clearCart();
      toast.success('Order placed!');
      router.push('/orders');
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-1 sm:gap-4">
          {['Cart', 'Shipping', 'Payment', 'Confirm'].map((label, i) => (
            <div key={label} className="flex items-center gap-1 sm:gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium sm:h-8 sm:w-8 sm:text-sm ${step >= i + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
              <span className={`hidden text-xs sm:inline sm:text-sm ${step >= i + 1 ? 'font-medium' : 'text-muted-foreground'}`}>{label}</span>
              {i < 3 && <div className="hidden h-px w-4 bg-border sm:block sm:w-8" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:gap-8 lg:grid-cols-3">
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          {step === 1 && (
            <Card><CardHeader className="p-4 sm:p-6"><CardTitle className="text-sm sm:text-base">Shipping Address</CardTitle></CardHeader>
            <CardContent className="grid gap-3 p-4 pt-0 sm:grid-cols-2 sm:gap-4 sm:p-6 sm:pt-0">
              <div className="space-y-1.5 sm:col-span-2 sm:space-y-2"><Label>Full Name</Label><Input value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} /></div>
              <div className="space-y-1.5 sm:space-y-2"><Label>Email</Label><Input type="email" value={address.email} onChange={(e) => setAddress({ ...address, email: e.target.value })} /></div>
              <div className="space-y-1.5 sm:space-y-2"><Label>Phone</Label><Input type="tel" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} /></div>
              <div className="space-y-1.5 sm:col-span-2 sm:space-y-2"><Label>Street Address</Label><Input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} /></div>
              <div className="space-y-1.5 sm:space-y-2"><Label>City</Label><Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></div>
              <div className="space-y-1.5 sm:space-y-2"><Label>State</Label><Input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} /></div>
              <div className="space-y-1.5 sm:space-y-2"><Label>Pincode</Label><Input value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} /></div>
            </CardContent>
            <div className="p-4 sm:p-6 pt-0"><Button onClick={() => setStep(2)}>Continue to Payment</Button></div></Card>
          )}
          {step === 2 && (
            <Card><CardHeader className="p-4 sm:p-6"><CardTitle className="text-sm sm:text-base">Payment Method</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                {PAYMENT_METHODS.map((pm) => (<label key={pm.value} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 sm:p-4 has-[[data-state=checked]]:border-primary"><RadioGroupItem value={pm.value} /><pm.icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" /><span className="text-sm sm:text-base">{pm.label}</span></label>))}
              </RadioGroup>
            </CardContent>
            <div className="flex gap-3 p-4 sm:p-6 pt-0"><Button variant="outline" onClick={() => setStep(1)}>Back</Button><Button onClick={() => setStep(3)}>Review Order</Button></div></Card>
          )}
          {step === 3 && (
            <Card><CardHeader className="p-4 sm:p-6"><CardTitle className="text-sm sm:text-base">Confirm Order</CardTitle></CardHeader>
            <CardContent className="space-y-2 p-4 pt-0 sm:p-6 sm:pt-0 text-xs sm:text-sm">
              <p><strong>Shipping to:</strong> {address.name}, {address.street}, {address.city}, {address.state} - {address.pincode}</p>
              <p><strong>Payment:</strong> {PAYMENT_METHODS.find((p) => p.value === paymentMethod)?.label}</p>
              <p><strong>Items in order:</strong> Will be fetched from your cart</p>
            </CardContent>
            <div className="flex gap-3 p-4 sm:p-6 pt-0"><Button variant="outline" onClick={() => setStep(2)}>Back</Button><Button onClick={handlePlaceOrder} disabled={loading}>{loading ? 'Placing...' : 'Place Order'}</Button></div></Card>
          )}
        </div>
        <div><Card><CardHeader className="p-4 sm:p-6"><CardTitle className="text-sm sm:text-base">Order Summary</CardTitle></CardHeader><CardContent className="space-y-2 p-4 pt-0 sm:space-y-3 sm:p-6 sm:pt-0 text-xs sm:text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><div className="flex justify-between"><span>Shipping</span><span>Free</span></div><div className="flex justify-between"><span>Tax (5%)</span><span>{formatPrice(tax)}</span></div><Separator /><div className="flex justify-between font-bold"><span>Total</span><span>{formatPrice(total)}</span></div></CardContent></Card></div>
      </div>
    </div>
  );
}
