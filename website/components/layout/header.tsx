'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { ShoppingCart, Heart, Search, Menu, User, LogOut, Settings, Store, X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { getInitials } from '@/lib/utils';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { useAuth } from '@/lib/use-auth';
import { NotificationBell } from '@/components/notifications/notification-bell';

export function Header() {
  const { data: session } = useSession();
  const { user: customUser, logout: customLogout } = useAuth();
  const currentUser = customUser || session?.user;
  const { count: cartCount } = useCart();
  const { productIds } = useWishlist();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) router.push(`/products?q=${encodeURIComponent(q)}`);
  }

  async function handleLogout() {
    try { await signOut({ callbackUrl: '/', redirect: false }); } catch {}
    customLogout();
    router.push('/');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b p-4">
                  <Link href="/" className="flex items-center gap-2 text-lg font-bold">
                    <Store className="h-6 w-6 text-primary" />
                    ShopHub
                  </Link>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon"><X className="h-5 w-5" /></Button>
                  </SheetClose>
                </div>
                <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Menu</p>
                  <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted">Home</Link>
                  <Link href="/products" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted">All Products</Link>
                  <Link href="/deals" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted">Deals & Offers</Link>
                  <SeparatorMobile />
                  <p className="mb-2 mt-4 text-xs font-semibold uppercase text-muted-foreground">Categories</p>
                  <Link href="/products?category=fashion" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted">👕 Fashion</Link>
                  <Link href="/products?category=home" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted">🏠 Home & Living</Link>
                  <Link href="/products?category=sports" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted">⚽ Sports</Link>
                  <Link href="/products?category=books" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted">📚 Books</Link>
                  <Link href="/products?category=beauty" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted">💄 Beauty</Link>
                  <SeparatorMobile />
                  <p className="mb-2 mt-4 text-xs font-semibold uppercase text-muted-foreground">Account</p>
                  {currentUser ? (
                    <>
                      <Link href="/orders" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"><Package className="h-4 w-4" /> My Orders</Link>
                      <Link href="/wishlist" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"><Heart className="h-4 w-4" /> Wishlist</Link>
                      <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"><Settings className="h-4 w-4" /> Settings</Link>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-muted">Sign In</Link>
                      <Link href="/register" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted">Create Account</Link>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
            <Store className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            <span className="text-lg font-bold sm:text-xl">ShopHub</span>
          </Link>

          <nav className="hidden gap-4 md:flex lg:gap-6">
            <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">Products</Link>
            <Link href="/products?category=fashion" className="text-sm text-muted-foreground transition-colors hover:text-primary">Fashion</Link>
            <Link href="/products?category=home" className="text-sm text-muted-foreground transition-colors hover:text-primary">Home</Link>
            <Link href="/deals" className="text-sm text-muted-foreground transition-colors hover:text-primary">Deals</Link>
          </nav>
        </div>

        {showSearch ? (
          <form onSubmit={handleSearch} className="absolute inset-x-0 top-0 z-50 flex h-16 items-center gap-2 bg-background px-3 md:relative md:inset-auto md:px-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
            </div>
            <Button variant="ghost" size="icon" type="button" onClick={() => setShowSearch(false)}>
              <X className="h-5 w-5" />
            </Button>
          </form>
        ) : (
          <div className="hidden md:flex md:w-72 lg:w-96">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </form>
          </div>
        )}

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowSearch(true)}>
            <Search className="h-5 w-5" />
          </Button>

          <Link href="/wishlist" className="hidden sm:inline-flex">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              {productIds.length > 0 && <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px]">{productIds.length}</Badge>}
            </Button>
          </Link>

          <NotificationBell />

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px]">{cartCount}</Badge>}
            </Button>
          </Link>

          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                    <AvatarImage src={currentUser.image || ''} />
                    <AvatarFallback>{getInitials(currentUser.name || 'U')}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="truncate">{currentUser.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{currentUser.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="cursor-pointer"><Package className="mr-2 h-4 w-4" /> Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist" className="cursor-pointer"><Heart className="mr-2 h-4 w-4" /> Wishlist</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function SeparatorMobile() {
  return <div className="my-2 border-t" />;
}
