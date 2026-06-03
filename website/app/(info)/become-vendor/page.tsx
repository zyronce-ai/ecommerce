import { Store, TrendingUp, DollarSign, Users, BarChart3, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BecomeVendorPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <Store className="h-10 w-10 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Become a Vendor</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Join thousands of sellers on ShopHub and grow your business with India's fastest-growing ecommerce platform.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        <div className="border rounded-lg p-5 text-center">
          <TrendingUp className="h-6 w-6 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Reach Millions</h3>
          <p className="text-sm text-muted-foreground">Access a large customer base across India actively shopping on ShopHub.</p>
        </div>
        <div className="border rounded-lg p-5 text-center">
          <DollarSign className="h-6 w-6 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Easy Payouts</h3>
          <p className="text-sm text-muted-foreground">Weekly payouts directly to your bank account with transparent fee structure.</p>
        </div>
        <div className="border rounded-lg p-5 text-center">
          <BarChart3 className="h-6 w-6 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Seller Dashboard</h3>
          <p className="text-sm text-muted-foreground">Real-time analytics, order management, and inventory control at your fingertips.</p>
        </div>
        <div className="border rounded-lg p-5 text-center">
          <Users className="h-6 w-6 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Dedicated Support</h3>
          <p className="text-sm text-muted-foreground">Get priority support and account management to help you succeed.</p>
        </div>
        <div className="border rounded-lg p-5 text-center">
          <ShieldCheck className="h-6 w-6 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Secure Platform</h3>
          <p className="text-sm text-muted-foreground">Safe transactions, fraud protection, and dispute resolution included.</p>
        </div>
        <div className="border rounded-lg p-5 text-center">
          <Store className="h-6 w-6 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Free Registration</h3>
          <p className="text-sm text-muted-foreground">Zero setup fee. Start selling with minimal investment and grow at your pace.</p>
        </div>
      </div>

      <div className="border rounded-lg p-6 text-center bg-muted/30 max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">Ready to Start?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Vendor registration is currently under development. Register your interest and we will notify you when onboarding opens.
        </p>
        <Link href="/contact">
          <Button>Register Interest</Button>
        </Link>
      </div>
    </div>
  );
}
