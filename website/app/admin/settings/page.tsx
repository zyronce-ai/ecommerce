'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getToken } from '@/lib/use-api';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [bannerUrl, setBannerUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const token = typeof window !== 'undefined' ? getToken() : null;
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {};

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/settings`).then(r => r.json()).then((s) => {
      setSettings(s);
      setBannerUrl(s.bannerUrl || '');
    }).catch(() => {});
  }, [token]);

  async function handleUpload(file: File) {
    if (!token) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API}/api/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBannerUrl(data.url);
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/settings`, {
        method: 'PUT', headers, body: JSON.stringify({ bannerUrl }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Banner saved');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Settings</h1>

      <Card>
        <CardHeader><CardTitle>Homepage Banner</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Upload a banner image (1920x950 recommended) to display on the homepage below the navbar.</p>

          {bannerUrl && (
            <div className="relative inline-block">
              <img src={bannerUrl} alt="Banner preview" className="max-h-48 rounded-lg border object-cover" />
              <Button variant="destructive" size="icon" className="absolute right-1 top-1 h-6 w-6" onClick={() => setBannerUrl('')}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
            <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            <div className="flex-1">
              <Input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="Or paste image URL directly" className="text-xs" />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save Banner'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
