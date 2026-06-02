'use client';

import { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingBag, IndianRupee, TrendingUp, Star, Wallet, Clock, CheckCircle } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { useApi, getVendorId } from '@/lib/use-api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function VendorDashboard() {
  try {
    return <ErrorBoundary><VendorDashboardInner /></ErrorBoundary>;
  } catch (e: any) {
    console.error('[VendorDashboard] Error:', e);
    return <div className="p-6 text-center"><p className="text-destructive">{e.message}</p></div>;
  }
}

function VendorDashboardInner() {
  const vendorId = getVendorId() || '';
  const { data: stats } = useApi<any>(`/api/vendor/stats/${vendorId}`);
  const { data: orders } = useApi<any[]>(`/api/vendor/orders/${vendorId}`);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [earnings, setEarnings] = useState<any>(null);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!vendorId) return;
    fetch(`${API}/api/vendor/products/${vendorId}`).then(r => r.json()).then((products) => {
      if (Array.isArray(products)) setTopProducts(products.slice(0, 3));
    }).catch(() => {});
    fetch(`${API}/api/vendor/earnings/${vendorId}`).then((r) => r.ok ? r.json() : null).then((data) => {
      if (data && typeof data === 'object' && !data.error) setEarnings(data);
    }).catch(() => {});
  }, [vendorId]);

  if (!mounted) return null;

  const STATS = [
    { label: 'Total Revenue', value: stats ? formatPrice(stats.revenue) : '—', change: 'Live', icon: IndianRupee, trend: 'up' },
    { label: 'Orders', value: stats?.orders ?? '—', change: 'Total', icon: ShoppingBag, trend: 'up' },
    { label: 'Products', value: stats?.products ?? '—', change: 'Listed', icon: Package, trend: 'up' },
    { label: 'Pending Payout', value: earnings ? formatPrice(earnings.pendingPayouts) : '—', change: 'Pending', icon: Wallet, trend: 'up' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold">Vendor Dashboard</h1><p className="text-sm text-muted-foreground">Manage your store and products</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (<Card key={s.label}><CardContent className="flex items-center justify-between p-6"><div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold">{s.value}</p><div className="mt-1 flex items-center gap-1 text-sm text-green-600"><TrendingUp className="h-3 w-3" />{s.change}</div></div><div className="rounded-full bg-primary/10 p-3"><s.icon className="h-5 w-5 text-primary" /></div></CardContent></Card>))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card><CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader><CardContent>
            {(orders ?? []).slice(0, 5).map((o: any) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg border p-3 mb-2 last:mb-0">
                <div><p className="text-sm font-medium">{o.id?.slice(0, 8)}</p><p className="text-xs text-muted-foreground">{o.userId?.slice(0, 8)}</p></div>
                <div className="text-right"><p className="text-sm font-bold">{formatPrice(o.total)}</p><p className="text-xs text-muted-foreground">{o.status}</p></div>
              </div>
            ))}
            {(!orders || orders.length === 0) && <p className="text-sm text-muted-foreground">No orders yet</p>}
          </CardContent></Card>
        </div>

        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Earnings Overview</CardTitle></CardHeader><CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-600" />Total Revenue</span>
              <span className="font-bold">{earnings ? formatPrice(earnings.totalRevenue) : '—'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-600" />Pending Payouts</span>
              <span className="font-bold">{earnings ? formatPrice(earnings.pendingPayouts) : '—'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5"><ShoppingBag className="h-3.5 w-3.5 text-primary" />Total Orders</span>
              <span className="font-bold">{earnings?.totalOrders ?? '—'}</span>
            </div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Top Products</CardTitle></CardHeader><CardContent>
            {topProducts.length > 0 ? topProducts.map((p: any, i: number) => (
              <div key={p._id || i} className="flex items-center justify-between rounded-lg border p-3 mb-2 last:mb-0">
                <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</div><div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{formatPrice(p.price)}</p></div></div>
                <p className="text-sm font-bold">{p.stock ? `${p.stock} in stock` : '—'}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">No products yet</p>}
          </CardContent></Card>
        </div>
      </div>
    </div>
  );
}
