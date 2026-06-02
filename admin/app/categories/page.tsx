'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { useApi, apiPost, apiPut, apiDelete, getToken } from '@/lib/use-api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CategoriesPage() {
  const { data: categories, loading, refetch } = useApi<any[]>('/api/categories');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image: '' });
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  function openCreate() {
    if (!getToken()) { toast.error('Please login first'); return; }
    setEditing(null);
    setForm({ name: '', slug: '', description: '', image: '' });
    setOpen(true);
  }

  function openEdit(c: any) {
    if (!getToken()) { toast.error('Please login first'); return; }
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, description: c.description || '', image: c.image || '' });
    setOpen(true);
  }

  function imgSrc(url: string) {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API}${url}`;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API}/api/upload/image`, { method: 'POST', body: fd });
      const data = await res.json();
      setForm(f => ({ ...f, image: data.url }));
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); } finally { setUploading(false); }
  }

  async function handleSave() {
    if (!getToken()) { toast.error('Session expired. Please login again.'); return; }
    try {
      if (editing) {
        await apiPut(`/api/categories/${editing._id}`, form);
        toast.success('Updated');
      } else {
        await apiPost('/api/categories', form);
        toast.success('Created');
      }
      setOpen(false);
      refetch();
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleDelete(id: string) {
    if (!getToken()) { toast.error('Please login first'); return; }
    if (!confirm('Delete this category?')) return;
    try { await apiDelete(`/api/categories/${id}`); toast.success('Deleted'); refetch(); } catch (err: any) { toast.error(err.message); }
  }

  if (!getToken()) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Please login to manage categories</p>
          <Button asChild><Link href="/login">Go to Login</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Categories</h1><p className="text-sm text-muted-foreground">Organize your product categories</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Category</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })} /></div>
              <div className="space-y-1"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
              <div className="space-y-1"><Label>Description</Label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" /></div>
              <div className="space-y-1"><Label>Image</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
                    {uploading ? 'Uploading...' : 'Choose Image'}
                  </Button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  {form.image ? (
                    <div className="relative h-20 w-20 rounded-lg border overflow-hidden bg-muted">
                      <img
                        src={imgSrc(form.image)}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={() => setForm(f => ({ ...f, image: '' }))}
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (<p className="p-4 text-sm text-muted-foreground">Loading...</p>) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="p-4 font-medium">Image</th><th className="p-4 font-medium">Name</th><th className="p-4 font-medium">Slug</th><th className="p-4 font-medium">Actions</th></tr></thead>
              <tbody>{(categories ?? []).map((c: any) => (<tr key={c._id} className="border-b last:border-0"><td className="p-4">{c.image ? <img src={imgSrc(c.image)} className="h-12 w-12 rounded-lg object-cover" onError={() => setImgError(p => ({ ...p, [c._id]: true }))} /> : <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>}</td><td className="p-4 font-medium">{c.name}</td><td className="p-4 text-muted-foreground">{c.slug}</td><td className="p-4"><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c._id)}><Trash2 className="h-4 w-4" /></Button></div></td></tr>))}</tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
