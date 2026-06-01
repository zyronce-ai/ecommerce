'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function VendorSignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [verifyLink, setVerifyLink] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register-vendor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setVerifyLink(data.link || '');
      setSent(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyNow() {
    setVerifying(true);
    try {
      const token = new URLSearchParams(verifyLink?.split('?')[1] || '').get('token');
      if (!token) throw new Error('No token found');
      const res = await fetch(`${API}/api/auth/verify-email?token=${token}`, { redirect: 'manual' });
      if (res.status === 200 || res.type === 'opaqueredirect') {
        setVerified(true);
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Verification failed');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setVerifying(false);
    }
  }

  // auto-verify after signup
  useEffect(() => {
    if (verifyLink) {
      const token = new URLSearchParams(verifyLink?.split('?')[1] || '').get('token');
      if (token) {
        fetch(`${API}/api/auth/verify-email?token=${token}`, { redirect: 'manual' }).then((r) => {
          if (r.status === 200 || r.type === 'opaqueredirect') setVerified(true);
        }).catch(() => {});
      }
    }
  }, [verifyLink]);

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-6 pb-6 space-y-4">
            {verified ? (
              <>
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <h2 className="text-xl font-bold">Email Verified!</h2>
                <p className="text-sm text-muted-foreground">Your vendor account is active. You can now log in.</p>
                <Button asChild className="w-full"><Link href="/login">Go to Login</Link></Button>
              </>
            ) : verifying ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <h2 className="text-xl font-bold">Verifying...</h2>
                <p className="text-sm text-muted-foreground">Please wait while we verify your email.</p>
              </>
            ) : (
              <>
                <Mail className="h-12 w-12 text-primary mx-auto" />
                <h2 className="text-xl font-bold">Verification Email Sent!</h2>
                <p className="text-sm text-muted-foreground">Check your inbox at <strong>{form.email}</strong> or verify directly below.</p>
                <Button className="w-full" onClick={verifyNow}>Verify Now</Button>
                {verifyLink && (
                  <div className="rounded-lg border bg-muted p-3 text-xs">
                    <p className="mb-1 font-medium text-muted-foreground">Or click this link:</p>
                    <a href={verifyLink} className="break-all text-primary hover:underline">{verifyLink}</a>
                  </div>
                )}
                <Button asChild variant="outline" className="w-full"><Link href="/login">Go to Login</Link></Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Become a Vendor</CardTitle>
          <p className="text-sm text-muted-foreground">Create your ShopHub seller account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2"><Label>Store Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</Button>
            <p className="text-center text-xs text-muted-foreground">Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link></p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
