'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { useApi, getVendorId } from '@/lib/use-api';
import { IndianRupee, TrendingUp, Calendar, Wallet } from 'lucide-react';

export default function EarningsPage() {
  const vendorId = getVendorId() || '';
  const { data: earnings, loading } = useApi<any>(`/api/vendor/earnings/${vendorId}`);

  const EARNINGS = [
    { label: 'Total Earnings', value: earnings ? formatPrice(earnings.totalRevenue) : '—', icon: IndianRupee },
    { label: 'Total Orders', value: earnings?.totalOrders ?? '—', icon: TrendingUp },
    { label: 'Pending Payout', value: earnings ? formatPrice(earnings.pendingPayouts) : '—', icon: Calendar },
    { label: 'Balance', value: earnings ? formatPrice((earnings.totalRevenue ?? 0) - (earnings.pendingPayouts ?? 0)) : '—', icon: Wallet },
  ];

  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold">Earnings</h1><p className="text-sm text-muted-foreground">Track your revenue and payouts</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {EARNINGS.map((e) => (<Card key={e.label}><CardContent className="flex items-center justify-between p-6"><div><p className="text-sm text-muted-foreground">{e.label}</p><p className="text-2xl font-bold">{e.value}</p></div><div className="rounded-full bg-primary/10 p-3"><e.icon className="h-5 w-5 text-primary" /></div></CardContent></Card>))}
      </div>

      <Card className="mt-6"><CardHeader><CardTitle>Transaction History</CardTitle></CardHeader><CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Date</th><th className="pb-3 font-medium">Order</th><th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Status</th></tr></thead>
            <tbody>{(earnings?.transactions ?? []).map((t: any, i: number) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-3">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-'}</td>
                <td className="py-3 font-medium">{t.id?.slice(0, 8)}</td>
                <td className="py-3 font-medium">{formatPrice(t.total)}</td>
                <td className="py-3"><span className="text-green-600">{t.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </CardContent></Card>
    </div>
  );
}
