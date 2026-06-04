'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken } from '@/lib/use-api';
import { Store, LayoutDashboard, Settings, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then((u) => {
      if (u.role !== 'ADMIN') { router.push('/'); } else { setAuthed(true); }
    }).catch(() => router.push('/login'));
  }, [router]);

  if (!authed) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r bg-muted/30 md:block">
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <Store className="h-5 w-5 text-primary" />
            ShopHub
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
          <Link href="/admin/settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"><Settings className="h-4 w-4" /> Settings</Link>
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"><ArrowLeft className="h-4 w-4" /> Back to Store</Link>
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex h-16 items-center border-b px-4 md:px-6">
          <Link href="/admin" className="md:hidden"><Store className="h-5 w-5 text-primary" /></Link>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" asChild><Link href="/">View Store</Link></Button>
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
