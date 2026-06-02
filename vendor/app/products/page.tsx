'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/utils';
import { useApi, apiPost, apiPut, apiDelete, getVendorId } from '@/lib/use-api';
import { Search, Plus, Edit, Trash2, Upload, ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function VendorProductsPage() {
  const vendorId = getVendorId() || '';
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [step, setStep] = useState<'category' | 'form'>('category');
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [form, setForm] = useState({ name: '', description: '', price: 0, comparePrice: 0, stock: 0, category: '', tags: '' });
  const [images, setImages] = useState<string[]>([]);
  const [specs, setSpecs] = useState<{ k: string; v: string }[]>([{ k: '', v: '' }]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: products, loading, refetch } = useApi<any[]>(`/api/vendor/products/${vendorId}`);
  const { data: categories } = useApi<any[]>('/api/categories');

  const filtered = (products ?? []).filter((p: any) =>
    (p.name?.toLowerCase() ?? '').includes(search.toLowerCase())
  );

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '', price: 0, comparePrice: 0, stock: 0, category: '', tags: '' });
    setImages([]);
    setSpecs([{ k: '', v: '' }]);
    setSelectedCat('');
    setStep('category');
    setOpen(true);
  }

  function openEdit(p: any) {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || '', price: p.price, comparePrice: p.comparePrice || 0,
      stock: p.stock ?? 0, category: p.category?._id || p.category || '', tags: (p.tags || []).join(', '),
    });
    setImages(p.images || []);
    setSpecs(p.specs ? Object.entries(p.specs).map(([k, v]) => ({ k, v: v as string })) : [{ k: '', v: '' }]);
    setSelectedCat(p.category?._id || p.category || '');
    setStep('form');
    setOpen(true);
  }

  function selectCategory(catId: string) {
    setSelectedCat(catId);
    setForm(f => ({ ...f, category: catId }));
    setStep('form');
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of Array.from(files)) fd.append('images', f);
      const res = await fetch(`${API}/api/upload/images`, { method: 'POST', body: fd });
      const data = await res.json();
      setImages(prev => [...prev, ...data.urls].slice(0, 4));
      toast.success('Images uploaded');
    } catch { toast.error('Upload failed'); } finally { setUploading(false); }
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx));
  }

  function addSpec() { setSpecs(prev => [...prev, { k: '', v: '' }]); }

  function removeSpec(idx: number) { setSpecs(prev => prev.filter((_, i) => i !== idx)); }

  function updateSpec(idx: number, field: 'k' | 'v', val: string) {
    setSpecs(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  }

  async function handleSave() {
    if (!vendorId) { toast.error('Vendor ID not found. Please login again.'); return; }
    try {
      const specsObj: Record<string, string> = {};
      specs.filter(s => s.k.trim()).forEach(s => { specsObj[s.k.trim()] = s.v; });

      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images,
        specs: specsObj,
      };

      if (editing) {
        await apiPut(`/api/vendor/products/${editing._id}`, payload);
        toast.success('Updated');
      } else {
        await apiPost(`/api/vendor/products/${vendorId}`, payload);
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
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            {step === 'category' ? (
              <>
                <DialogHeader><DialogTitle>Select Category</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-2 py-2">
                  {(categories ?? []).filter((c: any) => c.isActive !== false).map((c: any) => (
                    <Button key={c._id} variant="outline" className="h-auto flex-col gap-1 p-3" onClick={() => selectCategory(c._id)}>
                      {c.image && <img src={c.image.startsWith('http') ? c.image : `${API}${c.image}`} className="h-12 w-12 rounded object-cover" />}
                      <span className="text-sm font-medium">{c.name}</span>
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setStep('category')}><ArrowLeft className="h-4 w-4" /></Button>
                    <DialogTitle>{editing ? 'Edit Product' : 'New Product'}</DialogTitle>
                  </div>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Description</Label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>Selling Price</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} /></div>
                    <div className="space-y-1"><Label>MRP</Label><Input type="number" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: +e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} /></div>
                    <div className="space-y-1"><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
                  </div>
                  <div className="space-y-1"><Label>Images (max 4)</Label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading || images.length >= 4}>
                        <Upload className="mr-1 h-4 w-4" />{uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    </div>
                    <div className="flex gap-2 mt-2">
                      {images.map((url, i) => (
                        <div key={i} className="relative h-16 w-16 rounded border overflow-hidden">
                          <img src={url.startsWith('http') ? url : `${API}${url}`} className="h-full w-full object-cover" />
                          <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"><X className="h-3 w-3" /></button>
                        </div>
                      ))}
                      {images.length === 0 && <p className="text-xs text-muted-foreground">No images selected</p>}
                    </div>
                  </div>
                  <div className="space-y-1"><Label>Specifications</Label>
                    {specs.map((s, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <Input placeholder="Key" value={s.k} onChange={(e) => updateSpec(i, 'k', e.target.value)} className="flex-1" />
                        <Input placeholder="Value" value={s.v} onChange={(e) => updateSpec(i, 'v', e.target.value)} className="flex-1" />
                        {specs.length > 1 && <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeSpec(i)}><X className="h-4 w-4" /></Button>}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addSpec} className="mt-1">+ Add Row</Button>
                  </div>
                  <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Create'} Product</Button>
                </div>
              </>
            )}
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
