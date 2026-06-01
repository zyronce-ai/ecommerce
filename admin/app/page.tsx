'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingBag, Package, IndianRupee, TrendingUp, Activity } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { useApi } from '@/lib/use-api';

export default function AdminDashboard() {
  const { data: stats, loading } = useApi<{ users: number; orders: number; products: number; categories: number; revenue: number }>('/api/admin/stats');
  const { data: recentOrders } = useApi<any[]>('/api/admin/orders');

  const STATS = [
    { label: 'Total Revenue', value: stats ? formatPrice(stats.revenue) : '—', change: 'Live', icon: IndianRupee, trend: 'up' },
    { label: 'Orders', value: stats?.orders ?? '—', change: 'Total', icon: ShoppingBag, trend: 'up' },
    { label: 'Users', value: stats?.users ?? '—', change: 'Registered', icon: Users, trend: 'up' },
    { label: 'Products', value: stats?.products ?? '—', change: 'Listed', icon: Package, trend: 'up' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-sm text-muted-foreground">Welcome to ShopHub Admin</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{loading ? '...' : s.value}</p>
                <div className="mt-1 flex items-center gap-1 text-sm text-green-600"><TrendingUp className="h-3 w-3" />{s.change}</div>
              </div>
              <div className="rounded-full bg-primary/10 p-3"><s.icon className="h-5 w-5 text-primary" /></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <div className="space-y-3">
                {(recentOrders ?? []).slice(0, 5).map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div><p className="text-sm font-medium">{o.id?.slice(0, 8)}</p><p className="text-xs text-muted-foreground">{o.user?.name || o.userId?.slice(0, 8)}</p></div>
                    <div className="text-right"><p className="text-sm font-bold">{formatPrice(o.total)}</p><p className="text-xs text-muted-foreground">{o.status}</p></div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Store Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Total Orders', value: stats?.orders ?? 0 },
                { label: 'Registered Users', value: stats?.users ?? 0 },
                { label: 'Categories', value: stats?.categories ?? 0 },
                { label: 'Products Listed', value: stats?.products ?? 0 },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1"><p className="text-sm">{a.label}</p></div>
                  <span className="text-xs font-medium">{loading ? '...' : a.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
