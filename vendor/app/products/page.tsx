'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/utils';
import { useApi, apiPost, apiPut, apiDelete, getVendorId } from '@/lib/use-api';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function VendorProductsPage() {
  const vendorId = getVendorId() || '';
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', price: 0, stock: 0, description: '' });
  const { data: products, loading, refetch } = useApi<any[]>(`/api/vendor/products/${vendorId}`);

  const filtered = (products ?? []).filter((p: any) =>
    (p.name?.toLowerCase() ?? '').includes(search.toLowerCase())
  );

  function openCreate() {
    setEditing(null);
    setForm({ name: '', price: 0, stock: 0, description: '' });
    setOpen(true);
  }

  function openEdit(p: any) {
    setEditing(p);
    setForm({ name: p.name, price: p.price, stock: p.stock ?? 0, description: p.description ?? '' });
    setOpen(true);
  }

  async function handleSave() {
    if (!vendorId) { toast.error('Vendor ID not found. Please login again.'); return; }
    try {
      if (editing) {
        await apiPut(`/api/vendor/products/${editing._id}`, form);
        toast.success('Updated');
      } else {
        await apiPost(`/api/vendor/products/${vendorId}`, form);
        toast.success('Created');
      }
      setOpen(false);
      refetch();
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    try { await apiDelete(`/api/vendor/products/${id}`); toast.success('Deleted'); refetch(); } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">My Products</h1><p className="text-sm text-muted-foreground">Manage your product listings</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Product</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Product' : 'New Product'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1"><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} /></div>
              <div className="space-y-1"><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} /></div>
              <div className="space-y-1"><Label>Description</Label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" /></div>
              <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card><CardHeader><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div></CardHeader>
      <CardContent>
        {loading ? (<p className="text-sm text-muted-foreground">Loading...</p>) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Product</th><th className="pb-3 font-medium">Price</th><th className="pb-3 font-medium">Stock</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Actions</th></tr></thead>
            <tbody>{filtered.map((p: any) => (<tr key={p._id} className="border-b last:border-0"><td className="py-3 font-medium">{p.name}</td><td className="py-3">{formatPrice(p.price)}</td><td className="py-3">{p.stock ?? '-'}</td><td className="py-3"><Badge variant={p.isActive !== false ? 'success' : 'secondary'}>{p.isActive !== false ? 'Active' : 'Inactive'}</Badge></td><td className="py-3"><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p._id)}><Trash2 className="h-4 w-4" /></Button></div></td></tr>))}</tbody>
          </table>
        )}
      </CardContent></Card>
    </div>
  );
}
