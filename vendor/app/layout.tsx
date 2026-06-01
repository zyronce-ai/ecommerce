import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/providers';
import { VendorSidebar } from '@/components/vendor-sidebar';

const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = { title: { default: 'Vendor | ShopHub', template: '%s | ShopHub Vendor' }, description: 'ShopHub Vendor Panel' };

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" suppressHydrationWarning>      <body className={inter.className} suppressHydrationWarning><Providers><div className="flex min-h-screen"><VendorSidebar /><main className="flex-1 overflow-auto">{children}</main></div></Providers></body></html>);
}
