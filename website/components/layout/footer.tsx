import Link from 'next/link';
import { Store, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 sm:space-y-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <Store className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              ShopHub
            </Link>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Your one-stop destination for quality products at the best prices. Shop with confidence!
            </p>
            <div className="flex gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-8 sm:w-8">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-8 sm:w-8">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-8 sm:w-8">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              </span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-xs font-semibold sm:text-sm">Shop</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground sm:space-y-2 sm:text-sm">
              <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/products?category=fashion" className="hover:text-primary transition-colors">Fashion</Link></li>
              <li><Link href="/products?category=home" className="hover:text-primary transition-colors">Home & Living</Link></li>
              <li><Link href="/deals" className="hover:text-primary transition-colors">Deals & Offers</Link></li>
            </ul>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-xs font-semibold sm:text-sm">Customer Service</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground sm:space-y-2 sm:text-sm">
              <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping Info</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-xs font-semibold sm:text-sm">Company</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground sm:space-y-2 sm:text-sm">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/become-vendor" className="hover:text-primary transition-colors">Become a Vendor</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground sm:mt-12 sm:text-sm">
          <p>&copy; {new Date().getFullYear()} ShopHub. All rights reserved. Made with ❤️</p>
        </div>
      </div>
    </footer>
  );
}
