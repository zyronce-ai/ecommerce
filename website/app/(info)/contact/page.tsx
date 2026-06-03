import { Mail, Phone, MapPin, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
      <p className="text-muted-foreground mb-10">We are here to help! Reach out to us anytime.</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        <div className="border rounded-lg p-5 text-center">
          <Mail className="h-6 w-6 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Email</h3>
          <p className="text-sm text-muted-foreground">support@shophub.com</p>
        </div>
        <div className="border rounded-lg p-5 text-center">
          <Phone className="h-6 w-6 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Phone</h3>
          <p className="text-sm text-muted-foreground">+91-1800-123-4567</p>
        </div>
        <div className="border rounded-lg p-5 text-center sm:col-span-2 lg:col-span-1">
          <Clock className="h-6 w-6 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Hours</h3>
          <p className="text-sm text-muted-foreground">Mon-Sat, 9AM-6PM</p>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Frequently Accessed</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { href: '/help', label: 'Help Center' },
            { href: '/faq', label: 'FAQ' },
            { href: '/returns', label: 'Returns & Refunds' },
            { href: '/shipping', label: 'Shipping Info' },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors text-sm">
              {link.label}
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
