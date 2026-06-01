'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useApi, apiPut } from '@/lib/use-api';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SettingsPage() {
  const { data: settings, loading } = useApi<any>('/api/settings');
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (settings && !form) setForm(settings);
  }, [settings, form]);

  async function handleSave() {
    try {
      await apiPut('/api/settings', form);
      toast.success('Settings saved');
    } catch (err: any) { toast.error(err.message); }
  }

  if (loading || !form) return <div className="p-6"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-sm text-muted-foreground">Manage store settings</p></div>
      <div className="space-y-4">
        <Card><CardHeader><CardTitle>Store Information</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Store Name</Label><Input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} /></div>
            <div className="space-y-2"><Label>Store Email</Label><Input value={form.storeEmail} onChange={(e) => setForm({ ...form, storeEmail: e.target.value })} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Address</Label><Input value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          </div>
          <Button onClick={handleSave}>Save Changes</Button>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>General Settings</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="font-medium">Maintenance Mode</p><p className="text-sm text-muted-foreground">Put store in maintenance mode</p></div><Switch checked={form.maintenanceMode} onCheckedChange={(v) => setForm({ ...form, maintenanceMode: v })} /></div>
          <div className="flex items-center justify-between"><div><p className="font-medium">New User Registration</p><p className="text-sm text-muted-foreground">Allow new user signups</p></div><Switch checked={form.allowRegistration} onCheckedChange={(v) => setForm({ ...form, allowRegistration: v })} /></div>
          <div className="flex items-center justify-between"><div><p className="font-medium">Guest Checkout</p><p className="text-sm text-muted-foreground">Allow checkout without login</p></div><Switch checked={form.guestCheckout} onCheckedChange={(v) => setForm({ ...form, guestCheckout: v })} /></div>
          <Button onClick={handleSave}>Save Changes</Button>
        </CardContent></Card>
      </div>
    </div>
  );
}
