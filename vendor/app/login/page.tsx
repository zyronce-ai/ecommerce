'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { setToken, setVendorId } from '@/lib/use-api';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function VendorLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsVerification) throw new Error('Please verify your email first. Check your inbox.');
        throw new Error(data.error || 'Login failed');
      }
      setToken(data.token);
      setVendorId(data.user.id);
      document.cookie = `token=${data.token}; path=/; max-age=${7 * 86400}; SameSite=Lax`;
      toast.success(`Welcome ${data.user.name}`);
      const redirect = new URLSearchParams(window.location.search).get('redirect') || '/';
      router.push(redirect);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center"><CardTitle>Vendor Login</CardTitle><p className="text-sm text-muted-foreground">ShopHub Vendor Panel</p></CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
            <p className="text-center text-xs text-muted-foreground">Don&apos;t have an account? <Link href="/signup" className="text-primary hover:underline">Register as Vendor</Link></p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
