'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, formatDate } from '@/lib/utils';
import { getToken } from '@/lib/use-api';
import { Package } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const STATUS_BADGE: Record<string, string> = { DELIVERED: 'success', PROCESSING: 'warning', SHIPPED: 'default', PENDING: 'secondary', CANCELLED: 'destructive' };

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then((user) => {
        if (user.id) return fetch(`${API}/api/orders/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
        return [];
      }).then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mx-auto px-3 py-6"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-6 sm:mb-8"><h1 className="text-xl font-bold sm:text-3xl">My Orders</h1><p className="text-xs text-muted-foreground sm:text-sm">Track and manage your orders</p></div>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20">
          <Package className="h-12 w-12 text-muted-foreground sm:h-16 sm:w-16" />
          <h2 className="mt-3 text-lg font-semibold sm:mt-4 sm:text-xl">No orders yet</h2>
          <p className="text-sm text-muted-foreground">Start shopping to see your orders here</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id} className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center justify-between gap-2 p-3 sm:p-6">
                <div className="min-w-0">
                  <p className="text-sm font-medium sm:text-base">{order.id?.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">{formatDate(order.createdAt)}</p>
                  <p className="text-xs text-muted-foreground">{order.items?.length || 0} items</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold sm:text-base">{formatPrice(order.total)}</p>
                  <Badge variant={(STATUS_BADGE[order.status] || 'secondary') as any}>{order.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
