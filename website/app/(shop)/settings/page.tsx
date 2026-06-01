'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Bell, Shield } from 'lucide-react';
import { getToken } from '@/lib/use-api';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SettingsPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then((u) => {
          if (u.id) setForm({ name: u.name || '', email: u.email || '', phone: u.phone || '' });
        }).catch(() => {});
    }
  }, []);

  async function handleSave() {
    const token = getToken();
    if (!token) { toast.error('Please login'); return; }
    try {
      const res = await fetch(`${API}/api/auth/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: form.name, phone: form.phone }) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Saved');
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
      <h1 className="mb-6 text-xl font-bold sm:mb-8 sm:text-3xl">Settings</h1>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-1 lg:col-span-1">
          <div className="flex items-center gap-3 rounded-lg bg-muted p-3 sm:p-4"><User className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" /><div><p className="text-sm font-medium sm:text-base">Profile</p><p className="text-xs text-muted-foreground sm:text-sm">Manage your personal info</p></div></div>
        </div>
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          <Card><CardHeader className="p-4 sm:p-6"><CardTitle className="text-sm sm:text-base">Profile Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 sm:space-y-4 sm:p-6 sm:pt-0">
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:space-y-2"><Label className="text-xs sm:text-sm">Full Name</Label><Input className="h-9 text-sm sm:h-10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1.5 sm:space-y-2"><Label className="text-xs sm:text-sm">Email</Label><Input className="h-9 text-sm sm:h-10" value={form.email} disabled /></div>
              <div className="space-y-1.5 sm:space-y-2"><Label className="text-xs sm:text-sm">Phone</Label><Input className="h-9 text-sm sm:h-10" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <Button className="text-sm" onClick={handleSave}>Save Changes</Button>
          </CardContent></Card>
        </div>
      </div>
    </div>
  );
}
