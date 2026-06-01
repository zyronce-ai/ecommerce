'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useApi, apiPost, apiPut, apiDelete } from '@/lib/use-api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function CategoriesPage() {
  const { data: categories, loading, refetch } = useApi<any[]>('/api/categories');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', isActive: true });

  function openCreate() {
    setEditing(null);
    setForm({ name: '', slug: '', isActive: true });
    setOpen(true);
  }

  function openEdit(c: any) {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, isActive: c.isActive !== false });
    setOpen(true);
  }

  async function handleSave() {
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
    if (!confirm('Delete this category?')) return;
    try { await apiDelete(`/api/categories/${id}`); toast.success('Deleted'); refetch(); } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Categories</h1><p className="text-sm text-muted-foreground">Organize your product categories</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Category</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
              <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (<p className="p-4 text-sm text-muted-foreground">Loading...</p>) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="p-4 font-medium">Name</th><th className="p-4 font-medium">Slug</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Actions</th></tr></thead>
              <tbody>{(categories ?? []).map((c: any) => (<tr key={c._id} className="border-b last:border-0"><td className="p-4 font-medium">{c.name}</td><td className="p-4 text-muted-foreground">{c.slug}</td><td className="p-4"><Badge variant={c.isActive !== false ? 'success' : 'secondary'}>{c.isActive !== false ? 'Active' : 'Inactive'}</Badge></td><td className="p-4"><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c._id)}><Trash2 className="h-4 w-4" /></Button></div></td></tr>))}</tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
