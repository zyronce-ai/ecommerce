'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { useApi, apiPut, apiDelete } from '@/lib/use-api';
import { Search, Shield, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const { data: users, loading, refetch } = useApi<any[]>('/api/admin/users');

  const filtered = (users ?? []).filter((u: any) =>
    (u.name?.toLowerCase() ?? '').includes(search.toLowerCase()) ||
    (u.email?.toLowerCase() ?? '').includes(search.toLowerCase())
  );

  async function handleRoleChange(id: string, role: string) {
    try {
      await apiPut(`/api/admin/users/${id}/role`, { role });
      toast.success('Role updated');
      refetch();
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this user?')) return;
    try { await apiDelete(`/api/admin/users/${id}`); toast.success('Deleted'); refetch(); } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold">Users</h1><p className="text-sm text-muted-foreground">Manage registered users</p></div>
      <Card>
        <CardHeader><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search users..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div></CardHeader>
        <CardContent>
          {loading ? (<p className="text-sm text-muted-foreground">Loading...</p>) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground"><th className="pb-3 font-medium">Name</th><th className="pb-3 font-medium">Email</th><th className="pb-3 font-medium">Role</th><th className="pb-3 font-medium">Joined</th><th className="pb-3 font-medium">Actions</th></tr></thead>
                <tbody>{filtered.map((u: any) => (<tr key={u.id} className="border-b last:border-0"><td className="py-3 font-medium">{u.name}</td><td className="py-3 text-muted-foreground">{u.email}</td><td className="py-3"><Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v)}><SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USER">USER</SelectItem><SelectItem value="VENDOR">VENDOR</SelectItem><SelectItem value="ADMIN">ADMIN</SelectItem></SelectContent></Select></td><td className="py-3 text-muted-foreground">{formatDate(u.createdAt)}</td><td className="py-3"><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(u.id)}><Trash2 className="h-4 w-4" /></Button></td></tr>))}</tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
