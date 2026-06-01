import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SWRegister } from '@/components/notifications/sw-register';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'ShopHub - Your Premium E-Commerce Store',
    template: '%s | ShopHub',
  },
  description: 'Discover amazing products at unbeatable prices. Shop electronics, fashion, home goods and more.',
  keywords: ['ecommerce', 'shop', 'online store', 'electronics', 'fashion', 'deals'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'ShopHub',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <SWRegister />
          </div>
        </Providers>
      </body>
    </html>
  );
}
