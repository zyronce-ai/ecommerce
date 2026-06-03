import { Truck, Package, MapPin, Clock } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Shipping Information</h1>
      <p className="text-muted-foreground mb-8">We deliver across India with speed and care.</p>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <div className="border rounded-lg p-4">
          <Truck className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-semibold mb-1">Standard Shipping</h3>
          <p className="text-sm text-muted-foreground">3-7 business days. Free on orders above ₹499.</p>
        </div>
        <div className="border rounded-lg p-4">
          <Clock className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-semibold mb-1">Express Shipping</h3>
          <p className="text-sm text-muted-foreground">1-2 business days. Available for select products at checkout.</p>
        </div>
        <div className="border rounded-lg p-4">
          <Package className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-semibold mb-1">Order Tracking</h3>
          <p className="text-sm text-muted-foreground">Track your order anytime from your Orders page with real-time updates.</p>
        </div>
        <div className="border rounded-lg p-4">
          <MapPin className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-semibold mb-1">Service Areas</h3>
          <p className="text-sm text-muted-foreground">We deliver to all pin codes across India. International coming soon.</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">Shipping Policy</h2>
      <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
        <li>Orders are processed within 24 hours (excluding weekends and holidays).</li>
        <li>Estimated delivery time starts from the date of dispatch.</li>
        <li>You will receive a confirmation email with tracking details once shipped.</li>
        <li>COD orders are verified before dispatch and may have higher shipping fees.</li>
      </ul>

      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        For shipping-related issues or address changes, <a href="/contact" className="text-primary hover:underline">contact us</a> immediately after placing your order.
      </div>
    </div>
  );
}
