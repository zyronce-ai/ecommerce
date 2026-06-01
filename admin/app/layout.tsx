import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/providers';
import { AdminSidebar } from '@/components/admin-sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = { title: { default: 'Admin | ShopHub', template: '%s | ShopHub Admin' }, description: 'ShopHub Admin Dashboard' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
