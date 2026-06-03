'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { User, MapPin, Pencil, Trash2, Plus, ChevronLeft, Loader2 } from 'lucide-react';
import { getToken } from '@/lib/use-api';
import { toast } from 'sonner';
import { usePincode } from '@/hooks/use-pincode';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Address {
  id: string;
  userId: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
];

export default function SettingsPage() {
  const [tab, setTab] = useState<'profile' | 'addresses'>('profile');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });

  const { lookup: lookupPincode, loading: pinLoading, result: pinResult, error: pinError } = usePincode();

  const token = typeof window !== 'undefined' ? getToken() : null;
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {};

  useEffect(() => {
    if (token) {
      fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then((u) => {
          if (u.id) setForm({ name: u.name || '', email: u.email || '', phone: u.phone || '' });
        }).catch(() => {});
    }
  }, [token]);

  const fetchAddresses = () => {
    if (!token) return;
    fetch(`${API}/api/addresses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setAddresses).catch(() => {});
  };

  useEffect(() => { if (tab === 'addresses') fetchAddresses(); }, [tab, token]);

  useEffect(() => {
    if (pinResult) {
      setAddrForm((prev) => {
        const next = { ...prev, city: pinResult.city, state: pinResult.state };
        if (prev.city && prev.city !== pinResult.city) next.city = prev.city;
        if (prev.state && prev.state !== pinResult.state) next.state = prev.state;
        return next;
      });
    }
  }, [pinResult]);

  async function handleSave() {
    if (!token) { toast.error('Please login'); return; }
    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        method: 'PUT', headers, body: JSON.stringify({ name: form.name, phone: form.phone }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Saved');
    } catch (err: any) { toast.error(err.message); }
  }

  function resetAddrForm(a?: Address) {
    setAddrForm(a ? { line1: a.line1, line2: a.line2 || '', city: a.city, state: a.state, pincode: a.pincode, isDefault: a.isDefault } : { line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });
    setEditing(a || null);
    setShowForm(true);
  }

  async function saveAddress() {
    if (!token) return;
    const body = { ...addrForm, line2: addrForm.line2 || undefined };
    try {
      const url = editing ? `${API}/api/addresses/${editing.id}` : `${API}/api/addresses`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(editing ? 'Updated' : 'Added');
      setShowForm(false);
      setEditing(null);
      fetchAddresses();
    } catch (err: any) { toast.error(err.message); }
  }

  async function deleteAddress(id: string) {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/addresses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Deleted');
      fetchAddresses();
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
      <h1 className="mb-6 text-xl font-bold sm:mb-8 sm:text-3xl">Settings</h1>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-1 lg:col-span-1">
          <button onClick={() => setTab('profile')} className={`w-full flex items-center gap-3 rounded-lg p-3 sm:p-4 text-left transition-colors ${tab === 'profile' ? 'bg-muted' : 'hover:bg-muted/50'}`}>
            <User className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
            <div><p className="text-sm font-medium sm:text-base">Profile</p><p className="text-xs text-muted-foreground sm:text-sm">Manage your personal info</p></div>
          </button>
          <button onClick={() => setTab('addresses')} className={`w-full flex items-center gap-3 rounded-lg p-3 sm:p-4 text-left transition-colors ${tab === 'addresses' ? 'bg-muted' : 'hover:bg-muted/50'}`}>
            <MapPin className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
            <div><p className="text-sm font-medium sm:text-base">Addresses</p><p className="text-xs text-muted-foreground sm:text-sm">Manage saved addresses</p></div>
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          {tab === 'profile' && (
            <Card>
              <CardHeader className="p-4 sm:p-6"><CardTitle className="text-sm sm:text-base">Profile Information</CardTitle></CardHeader>
              <CardContent className="space-y-3 p-4 pt-0 sm:space-y-4 sm:p-6 sm:pt-0">
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:space-y-2"><Label className="text-xs sm:text-sm">Full Name</Label><Input className="h-9 text-sm sm:h-10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="space-y-1.5 sm:space-y-2"><Label className="text-xs sm:text-sm">Email</Label><Input className="h-9 text-sm sm:h-10" value={form.email} disabled /></div>
                  <div className="space-y-1.5 sm:space-y-2"><Label className="text-xs sm:text-sm">Phone</Label><Input className="h-9 text-sm sm:h-10" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                </div>
                <Button className="text-sm" onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {tab === 'addresses' && (
            <Card>
              <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between">
                <CardTitle className="text-sm sm:text-base">Saved Addresses</CardTitle>
                {!showForm && <Button size="sm" onClick={() => resetAddrForm()} className="gap-1"><Plus className="h-4 w-4" />Add</Button>}
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
                {showForm ? (
                  <div className="space-y-3 border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditing(null); }} className="h-7 px-2"><ChevronLeft className="h-4 w-4" /></Button>
                      <p className="text-sm font-medium">{editing ? 'Edit Address' : 'New Address'}</p>
                    </div>
                    <div className="space-y-1.5"><Label className="text-xs">Street Address</Label><Input className="h-9 text-sm" value={addrForm.line1} onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })} placeholder="House no., building, street" /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Address Line 2 (optional)</Label><Input className="h-9 text-sm" value={addrForm.line2} onChange={(e) => setAddrForm({ ...addrForm, line2: e.target.value })} placeholder="Area, landmark" /></div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1.5"><Label className="text-xs">City</Label><Input className="h-9 text-sm" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} /></div>
                      <div className="space-y-1.5"><Label className="text-xs">State</Label>
                        <Select value={addrForm.state} onValueChange={(v) => setAddrForm({ ...addrForm, state: v })}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select state" /></SelectTrigger>
                          <SelectContent>
                            {INDIAN_STATES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5"><Label className="text-xs">Pincode</Label>
                        <div className="relative">
                          <Input className="h-9 text-sm pr-7" maxLength={6} value={addrForm.pincode} onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setAddrForm({ ...addrForm, pincode: v }); lookupPincode(v); }} placeholder="6-digit" />
                          {pinLoading && <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin text-muted-foreground" />}
                        </div>
                        {pinError && <p className="text-xs text-destructive mt-0.5">{pinError}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="default-addr" checked={addrForm.isDefault} onCheckedChange={(v) => setAddrForm({ ...addrForm, isDefault: v === true })} />
                      <Label htmlFor="default-addr" className="text-xs cursor-pointer">Set as default address</Label>
                    </div>
                    <Button size="sm" onClick={saveAddress}>{editing ? 'Update' : 'Save'} Address</Button>
                  </div>
                ) : addresses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No saved addresses yet. Click &quot;Add&quot; to save one.</p>
                ) : (
                  addresses.map((a) => (
                    <div key={a.id} className="flex items-start justify-between border rounded-lg p-3 sm:p-4">
                      <div className="space-y-0.5 text-sm">
                        <p className="font-medium">{a.line1}{a.isDefault && <span className="ml-2 text-xs text-primary font-normal">Default</span>}</p>
                        {a.line2 && <p className="text-muted-foreground">{a.line2}</p>}
                        <p className="text-muted-foreground">{a.city}, {a.state} - {a.pincode}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => resetAddrForm(a)} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteAddress(a.id)} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
