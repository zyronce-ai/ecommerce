'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Trash2 } from 'lucide-react';
import { useApi, apiDelete } from '@/lib/use-api';
import { toast } from 'sonner';

export default function ReviewsPage() {
  const { data: reviews, loading, refetch } = useApi<any[]>('/api/reviews');

  async function handleDelete(id: string) {
    if (!confirm('Delete this review?')) return;
    try {
      await apiDelete(`/api/reviews/${id}`);
      toast.success('Deleted');
      refetch();
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold">Reviews</h1><p className="text-sm text-muted-foreground">Manage product reviews</p></div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading...</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="p-4 font-medium">Product</th><th className="p-4 font-medium">User</th><th className="p-4 font-medium">Rating</th><th className="p-4 font-medium">Review</th><th className="p-4 font-medium">Date</th><th className="p-4 font-medium">Actions</th></tr></thead>
              <tbody>{(reviews ?? []).map((r: any) => (<tr key={r._id} className="border-b last:border-0"><td className="p-4 font-medium">{r.product?.toString().slice(0, 8) ?? '-'}</td><td className="p-4">{r.name ?? r.user}</td><td className="p-4"><div className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /><span>{r.rating}</span></div></td><td className="p-4 text-muted-foreground max-w-[200px] truncate">{r.comment ?? r.title}</td><td className="p-4 text-muted-foreground">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td><td className="p-4"><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(r._id)}><Trash2 className="h-4 w-4" /></Button></td></tr>))}</tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
