import { Store } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Store className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">About ShopHub</h1>
      </div>

      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p>
          ShopHub is your premier online shopping destination, offering a curated selection of quality products across
          fashion, home & living, and more. We are committed to providing an exceptional shopping experience with
          competitive prices and reliable delivery.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8">Our Mission</h2>
        <p>
          To make quality products accessible to everyone with a seamless, secure, and enjoyable shopping experience
          from browse to delivery.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-8">Why Shop With Us?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Curated products from trusted brands and sellers</li>
          <li>Secure payments and data protection</li>
          <li>Fast and reliable shipping across India</li>
          <li>Easy returns and dedicated customer support</li>
          <li>Regular deals and exclusive offers</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-8">Contact</h2>
        <p>
          Have questions? Visit our <a href="/contact" className="text-primary hover:underline">Contact page</a> or
          check our <a href="/help" className="text-primary hover:underline">Help Center</a> for assistance.
        </p>
      </div>
    </div>
  );
}
