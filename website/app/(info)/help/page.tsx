import { HelpCircle, Search, ShoppingCart, CreditCard, Truck, RotateCcw, MessageCircle } from 'lucide-react';

const topics = [
  { icon: Search, title: 'Finding Products', desc: 'Use the search bar or browse categories to find what you need. Filter by price, category, or sort by newest.' },
  { icon: ShoppingCart, title: 'Placing an Order', desc: 'Add items to cart, proceed to checkout, enter your address, and choose a payment method.' },
  { icon: CreditCard, title: 'Payment Options', desc: 'We accept credit/debit cards, UPI, net banking, and Cash on Delivery (COD).' },
  { icon: Truck, title: 'Shipping & Delivery', desc: 'Orders are typically delivered within 3-7 business days. Track your order from the Orders page.' },
  { icon: RotateCcw, title: 'Returns & Refunds', desc: 'Items can be returned within 7 days of delivery. Visit our Returns page to initiate a return.' },
  { icon: MessageCircle, title: 'Contact Support', desc: 'Need help? Reach out via our Contact page or check the FAQ for quick answers.' },
];

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Help Center</h1>
      <p className="text-muted-foreground mb-10">How can we help you today?</p>

      <div className="grid gap-6 sm:grid-cols-2">
        {topics.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.title} className="border rounded-lg p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">{t.title}</h3>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-5 bg-muted/50 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          Still need help? <a href="/contact" className="text-primary hover:underline font-medium">Contact us</a> or check our <a href="/faq" className="text-primary hover:underline font-medium">FAQ</a>.
        </p>
      </div>
    </div>
  );
}
