'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Package, ShoppingBag, IndianRupee, MessageSquare, Settings, LogOut, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { clearToken, isAuthenticated } from '@/lib/use-api';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/earnings', label: 'Earnings', icon: IndianRupee },
  { href: '/chat', label: 'Messages', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function VendorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }).then(r => r.json()).then(d => { if (d.email) setUser(d); }).catch(() => {});
    }
  }, []);

  function handleLogout() {
    clearToken();
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/login');
  }

  return (
    <aside className="flex w-64 shrink-0 border-r bg-card flex-col">
      <div className="flex h-14 items-center gap-2 border-b px-6">
        <Store className="h-5 w-5 text-primary" />
        <span className="text-lg font-bold">Vendor Panel</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (<Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors', active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}><item.icon className="h-4 w-4" />{item.label}</Link>);
        })}
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8"><AvatarFallback>V</AvatarFallback></Avatar>
          <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{user?.name || 'Vendor'}</p><p className="text-xs text-muted-foreground truncate">{user?.email || 'vendor@shophub.com'}</p></div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}><LogOut className="h-4 w-4" /></Button>
        </div>
      </div>
    </aside>
  );
}
