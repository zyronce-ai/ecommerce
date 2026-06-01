'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Store, Github, Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { setToken } from '@/lib/use-api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setToken(data.token);
      document.cookie = `token=${data.token}; path=/; max-age=${7 * 86400}; SameSite=Lax`;
      router.push('/');
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-3 sm:px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center px-4 sm:px-6">
          <div className="mb-4 flex justify-center"><Store className="h-8 w-8 text-primary sm:h-10 sm:w-10" /></div>
          <CardTitle className="text-lg sm:text-2xl">Welcome back</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Sign in to your ShopHub account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button variant="outline" className="w-full" onClick={() => signIn('google', { callbackUrl: '/' })}><Mail className="mr-2 h-4 w-4" /> Continue with Google</Button>
            <Button variant="outline" className="w-full" onClick={() => signIn('github', { callbackUrl: '/' })}><Github className="mr-2 h-4 w-4" /> Continue with GitHub</Button>
          </div>
          <div className="my-6 flex items-center"><Separator className="flex-1" /><span className="mx-4 text-xs text-muted-foreground">OR</span><Separator className="flex-1" /></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">Don&apos;t have an account? <Link href="/register" className="font-medium text-primary hover:underline">Sign up</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
