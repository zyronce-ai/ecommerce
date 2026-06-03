'use client';

import { useState, useEffect } from 'react';
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
import { CreditCard, Truck, X, CheckCircle, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function decodeToken(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return null; }
}

const PAYMENT_METHODS = [
  { value: 'stripe', label: 'Credit/Debit Card', icon: CreditCard },
  { value: 'cod', label: 'Cash on Delivery', icon: Truck },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ name: '', email: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string>('new');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const token = getToken();
  const user = token ? decodeToken(token) : null;
  const userId = user?.id || '';

  useEffect(() => {
    if (token) {
      fetch(`${API}/api/addresses`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(setSavedAddresses).catch(() => {});
    }
  }, [token]);

  function selectSavedAddress(id: string) {
    setSelectedAddrId(id);
    if (id === 'new') {
      setAddress({ name: user?.name || '', email: user?.email || '', phone: '', street: '', city: '', state: '', pincode: '' });
    } else {
      const a = savedAddresses.find((a: any) => a.id === id);
      if (a) setAddress((prev) => ({ ...prev, street: a.line1, city: a.city, state: a.state, pincode: a.pincode }));
    }
  }

  const subtotal = items.reduce((s, i) => s + (i._product?.price || 0) * i.quantity, 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.05);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'PERCENTAGE') {
      discount = Math.round(subtotal * (appliedCoupon.discount / 100));
    } else {
      discount = appliedCoupon.discount;
    }
  }
  discount = Math.min(discount, subtotal);
  const total = Math.max(subtotal + shipping + tax - discount, 0);

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch(`${API}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.minOrder && subtotal < data.minOrder) {
        throw new Error(`Minimum order of ${formatPrice(data.minOrder)} required`);
      }
      setAppliedCoupon(data);
      toast.success(`Coupon applied! You save ${data.type === 'PERCENTAGE' ? data.discount + '%' : formatPrice(data.discount)}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode('');
  }

  async function handlePlaceOrder() {
    if (!token) { toast.error('Please login first'); router.push('/login?redirect=/checkout'); return; }
    if (!userId) { toast.error('Could not identify user'); return; }
    if (!address.name || !address.street || !address.city || !address.state || !address.pincode) {
      toast.error('Please fill in all shipping fields');
      return;
    }
    setLoading(true);
    try {
      const orderPayload: any = {
        userId,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i._product?.price, name: i._product?.name })),
        total,
        address,
        paymentMethod,
        status: 'PENDING',
      };
      if (appliedCoupon) {
        orderPayload.couponCode = appliedCoupon.code;
        orderPayload.discount = discount;
      }

      if (paymentMethod === 'stripe') {
        const payRes = await fetch(`${API}/api/payments/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: Math.round(total * 100) }),
        });
        const payData = await payRes.json();
        if (!payRes.ok) throw new Error(payData.error);
        orderPayload.paymentIntentId = payData.clientSecret;
      }

      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      clearCart();
      toast.success(paymentMethod === 'cod' ? 'Order placed!' : 'Order placed! Payment initiated.');
      router.push('/orders');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-3 py-20 text-center">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="mt-2 text-sm text-muted-foreground">Add some items before checking out</p>
        <Button className="mt-4" onClick={() => router.push('/products')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-1 sm:gap-4">
          {['Shipping', 'Payment', 'Confirm'].map((label, i) => (
            <div key={label} className="flex items-center gap-1 sm:gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium sm:h-8 sm:w-8 sm:text-sm ${step >= i + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
              <span className={`hidden text-xs sm:inline sm:text-sm ${step >= i + 1 ? 'font-medium' : 'text-muted-foreground'}`}>{label}</span>
              {i < 2 && <div className="hidden h-px w-4 bg-border sm:block sm:w-8" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:gap-8 lg:grid-cols-3">
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          {step === 1 && (
            <Card>
              <CardHeader className="p-4 sm:p-6"><CardTitle className="text-sm sm:text-base">Shipping Address</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-3">
                {savedAddresses.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <Label className="text-xs text-muted-foreground">Saved Addresses</Label>
                    {savedAddresses.map((a: any) => (
                      <label key={a.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${selectedAddrId === a.id ? 'border-primary' : ''}`}>
                        <input type="radio" name="saved-addr" checked={selectedAddrId === a.id} onChange={() => selectSavedAddress(a.id)} className="mt-1 accent-primary" />
                        <div className="text-sm flex-1">
                          <p className="font-medium">{a.line1}{a.isDefault && <span className="ml-1 text-[10px] text-primary">Default</span>}</p>
                          {a.line2 && <p className="text-muted-foreground text-xs">{a.line2}</p>}
                          <p className="text-muted-foreground text-xs">{a.city}, {a.state} - {a.pincode}</p>
                        </div>
                      </label>
                    ))}
                    <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${selectedAddrId === 'new' ? 'border-primary' : ''}`}>
                      <input type="radio" name="saved-addr" checked={selectedAddrId === 'new'} onChange={() => selectSavedAddress('new')} className="mt-1 accent-primary" />
                      <div className="flex items-center gap-2 text-sm"><Plus className="h-4 w-4" /><span>Use a new address</span></div>
                    </label>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2"><Label>Full Name</Label><Input value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={address.email} onChange={(e) => setAddress({ ...address, email: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Phone</Label><Input type="tel" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} /></div>
                  <div className="space-y-1.5 sm:col-span-2"><Label>Street Address</Label><Input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>City</Label><Input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>State</Label><Input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Pincode</Label><Input value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} /></div>
                </div>
              </CardContent>
              <div className="p-4 sm:p-6 pt-0"><Button onClick={() => setStep(2)}>Continue to Payment</Button></div>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader className="p-4 sm:p-6"><CardTitle className="text-sm sm:text-base">Payment Method</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  {PAYMENT_METHODS.map((pm) => (
                    <label key={pm.value} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 sm:p-4 has-[[data-state=checked]]:border-primary">
                      <RadioGroupItem value={pm.value} />
                      <pm.icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      <span className="text-sm sm:text-base">{pm.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </CardContent>
              <div className="flex gap-3 p-4 sm:p-6 pt-0">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)}>Review Order</Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader className="p-4 sm:p-6"><CardTitle className="text-sm sm:text-base">Confirm Order</CardTitle></CardHeader>
              <CardContent className="space-y-2 p-4 pt-0 sm:p-6 sm:pt-0 text-xs sm:text-sm">
                <p><strong>Shipping to:</strong> {address.name}, {address.street}, {address.city}, {address.state} - {address.pincode}</p>
                <p><strong>Payment:</strong> {PAYMENT_METHODS.find((p) => p.value === paymentMethod)?.label}</p>
                <p><strong>Items:</strong> {items.length} item(s)</p>
              </CardContent>
              <div className="flex gap-3 p-4 sm:p-6 pt-0">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handlePlaceOrder} disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing...</> : 'Place Order'}
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader className="p-4 sm:p-6"><CardTitle className="text-sm sm:text-base">Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 p-4 pt-0 sm:space-y-3 sm:p-6 sm:pt-0 text-xs sm:text-sm">
              <div className="flex justify-between"><span>Subtotal ({items.length} items)</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between"><span>Tax (5%)</span><span>{formatPrice(tax)}</span></div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-green-600">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>{appliedCoupon.code}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>-{formatPrice(discount)}</span>
                    <button onClick={handleRemoveCoupon} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                  </div>
                </div>
              )}

              <Separator />
              <div className="flex justify-between font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>

              <div className="pt-2">
                <Label className="text-xs">Coupon Code</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Enter coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="h-9 text-xs"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <Button variant="outline" size="sm" className="h-9 shrink-0" onClick={handleRemoveCoupon}>Remove</Button>
                  ) : (
                    <Button size="sm" className="h-9 shrink-0" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}>
                      {couponLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
