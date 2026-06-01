'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getToken, getVendorId } from '@/lib/use-api';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function VendorSettingsPage() {
  const vendorId = getVendorId() || '';
  const [form, setForm] = useState({ name: '', email: '', phone: '', gst: '', description: '', accountName: '', accountNumber: '', ifsc: '', upi: '' });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    const token = getToken();
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then((u) => {
      setForm((prev) => ({ ...prev, name: u.name || '', email: u.email || '', phone: u.phone || '' }));
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [vendorId]);

  async function handleSaveProfile() {
    const token = getToken();
    try {
      const res = await fetch(`${API}/api/vendor/settings/${vendorId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: form.name }) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Profile saved');
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleSavePayout() {
    const token = getToken();
    try {
      const res = await fetch(`${API}/api/vendor/payouts/${vendorId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ accountName: form.accountName, accountNumber: form.accountNumber, ifsc: form.ifsc, upi: form.upi }) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Payout info saved');
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div className="p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-sm text-muted-foreground">Manage your vendor profile</p></div>
      <div className="space-y-4">
        <Card><CardHeader><CardTitle>Store Profile</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Store Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Store Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>GST Number</Label><Input value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Store Description</Label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" /></div>
          <Button onClick={handleSaveProfile}>Save Changes</Button>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Payout Settings</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Bank Account Name</Label><Input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} /></div>
            <div className="space-y-2"><Label>Bank Account Number</Label><Input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} /></div>
            <div className="space-y-2"><Label>IFSC Code</Label><Input value={form.ifsc} onChange={(e) => setForm({ ...form, ifsc: e.target.value })} /></div>
            <div className="space-y-2"><Label>UPI ID</Label><Input value={form.upi} onChange={(e) => setForm({ ...form, upi: e.target.value })} /></div>
          </div>
          <Button onClick={handleSavePayout}>Update Payout Info</Button>
        </CardContent></Card>
      </div>
    </div>
  );
}
