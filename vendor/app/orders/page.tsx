'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';
import { useApi, getVendorId } from '@/lib/use-api';

const STATUS_BADGE: Record<string, string> = { DELIVERED: 'success', PROCESSING: 'warning', SHIPPED: 'default', PENDING: 'secondary', CONFIRMED: 'info', CANCELLED: 'destructive' };

export default function VendorOrdersPage() {
  const vendorId = getVendorId() || '';
  const { data: orders, loading } = useApi<any[]>(`/api/vendor/orders/${vendorId}`);

  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold">Orders</h1><p className="text-sm text-muted-foreground">Orders containing your products</p></div>
      <Card><CardContent className="p-0">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="p-4 font-medium">Order</th><th className="p-4 font-medium">Customer</th><th className="p-4 font-medium">Total</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Date</th></tr></thead>
            <tbody>{(orders ?? []).map((o: any) => (<tr key={o.id} className="border-b last:border-0"><td className="p-4 font-medium">{o.id?.slice(0, 8)}</td><td className="p-4">{o.user?.name ?? o.userId?.slice(0, 8)}</td><td className="p-4 font-medium">{formatPrice(o.total)}</td><td className="p-4"><Badge variant={(STATUS_BADGE[o.status] || 'secondary') as any}>{o.status}</Badge></td><td className="p-4 text-muted-foreground">{formatDate(o.createdAt)}</td></tr>))}</tbody>
          </table>
        )}
      </CardContent></Card>
    </div>
  );
}
