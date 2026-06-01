'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Copy, Trash2, Edit } from 'lucide-react';
import { useApi, apiPost, apiPut, apiDelete } from '@/lib/use-api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CouponsPage() {
  const { data: coupons, loading, refetch } = useApi<any[]>('/api/coupons');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ code: '', discount: 0, minOrder: 0, maxUses: 100, type: 'PERCENTAGE', isActive: true });

  function openCreate() {
    setEditing(null);
    setForm({ code: '', discount: 0, minOrder: 0, maxUses: 100, type: 'PERCENTAGE', isActive: true });
    setOpen(true);
  }

  function openEdit(c: any) {
    setEditing(c);
    setForm({ code: c.code, discount: c.discount, minOrder: c.minOrder ?? 0, maxUses: c.maxUses ?? 100, type: c.type || 'PERCENTAGE', isActive: c.isActive !== false });
    setOpen(true);
  }

  async function handleSave() {
    try {
      if (editing) {
        await apiPut(`/api/coupons/${editing._id}`, form);
        toast.success('Updated');
      } else {
        await apiPost('/api/coupons', form);
        toast.success('Created');
      }
      setOpen(false);
      refetch();
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this coupon?')) return;
    try { await apiDelete(`/api/coupons/${id}`); toast.success('Deleted'); refetch(); } catch (err: any) { toast.error(err.message); }
  }

  async function handleCopy(code: string) {
    await navigator.clipboard.writeText(code);
    toast.success('Copied');
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Coupons</h1><p className="text-sm text-muted-foreground">Manage discounts and promotions</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Coupon</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Coupon' : 'New Coupon'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
              <div className="space-y-1"><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PERCENTAGE">Percentage</SelectItem><SelectItem value="FLAT">Flat</SelectItem></SelectContent></Select></div>
              <div className="space-y-1"><Label>Discount</Label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: +e.target.value })} /></div>
              <div className="space-y-1"><Label>Min Order</Label><Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: +e.target.value })} /></div>
              <div className="space-y-1"><Label>Max Uses</Label><Input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: +e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (<p className="p-4 text-sm text-muted-foreground">Loading...</p>) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="p-4 font-medium">Code</th><th className="p-4 font-medium">Discount</th><th className="p-4 font-medium">Min Order</th><th className="p-4 font-medium">Usage</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Expires</th><th className="p-4 font-medium">Actions</th></tr></thead>
              <tbody>{(coupons ?? []).map((c: any) => (<tr key={c._id} className="border-b last:border-0"><td className="p-4 font-medium">{c.code}</td><td className="p-4">{c.type === 'PERCENTAGE' ? `${c.discount}% OFF` : `₹${c.discount} OFF`}</td><td className="p-4">₹{c.minOrder ?? 0}</td><td className="p-4">{c.usedCount ?? 0}/{c.maxUses ?? '-'}</td><td className="p-4"><Badge variant={c.isActive !== false ? 'success' : 'secondary'}>{c.isActive !== false ? 'Active' : 'Inactive'}</Badge></td><td className="p-4 text-muted-foreground">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '-'}</td><td className="p-4"><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(c.code)}><Copy className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c._id)}><Trash2 className="h-4 w-4" /></Button></div></td></tr>))}</tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
