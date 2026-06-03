import { RotateCcw, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Returns & Refunds</h1>
      <p className="text-muted-foreground mb-8">Our return policy is simple and customer-friendly.</p>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <div className="border rounded-lg p-4">
          <RotateCcw className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-semibold mb-1">7-Day Returns</h3>
          <p className="text-sm text-muted-foreground">Items can be returned within 7 days of delivery.</p>
        </div>
        <div className="border rounded-lg p-4">
          <RefreshCw className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-semibold mb-1">Easy Process</h3>
          <p className="text-sm text-muted-foreground">Initiate from your Orders page. We handle pickup.</p>
        </div>
        <div className="border rounded-lg p-4">
          <ShieldCheck className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-semibold mb-1">Full Refund</h3>
          <p className="text-sm text-muted-foreground">Refund processed within 5-7 business days.</p>
        </div>
        <div className="border rounded-lg p-4">
          <AlertTriangle className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-semibold mb-1">Conditions Apply</h3>
          <p className="text-sm text-muted-foreground">Items must be unused with original packaging.</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">How to Return</h2>
      <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-8">
        <li>Go to <Link href="/orders" className="text-primary hover:underline">My Orders</Link> and find the item you want to return.</li>
        <li>Click "Return" and select the reason.</li>
        <li>Pack the item securely with all accessories and tags.</li>
        <li>Our pickup partner will collect the item within 2-3 days.</li>
        <li>Refund is processed once the item is received and inspected.</li>
      </ol>

      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <strong>Note:</strong> Some items (personal care, innerwear, perishables) are not eligible for returns.
        For any issues, <Link href="/contact" className="text-primary hover:underline">contact support</Link>.
      </div>
    </div>
  );
}
