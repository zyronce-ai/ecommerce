'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';
import { useApi } from '@/lib/use-api';
import { Search } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = { DELIVERED: 'success', PROCESSING: 'warning', SHIPPED: 'default', PENDING: 'secondary', CANCELLED: 'destructive', CONFIRMED: 'info' };

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const { data: orders, loading } = useApi<any[]>('/api/admin/orders');

  const filtered = (orders ?? []).filter((o: any) =>
    (o.id?.toLowerCase() ?? '').includes(search.toLowerCase()) ||
    (o.user?.name?.toLowerCase() ?? '').includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold">Orders</h1><p className="text-sm text-muted-foreground">Manage customer orders</p></div>
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Order</th><th className="pb-3 font-medium">Customer</th><th className="pb-3 font-medium">Items</th><th className="pb-3 font-medium">Total</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Date</th></tr></thead>
                <tbody>{filtered.map((o: any) => (<tr key={o.id} className="border-b last:border-0"><td className="py-3 font-medium">{o.id?.slice(0, 8)}</td><td className="py-3">{o.user?.name ?? o.userId?.slice(0, 8)}</td><td className="py-3">{Array.isArray(o.items) ? o.items.length : '-'}</td><td className="py-3 font-medium">{formatPrice(o.total)}</td><td className="py-3"><Badge variant={(STATUS_BADGE[o.status] || 'secondary') as any}>{o.status}</Badge></td><td className="py-3 text-muted-foreground">{formatDate(o.createdAt)}</td></tr>))}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
