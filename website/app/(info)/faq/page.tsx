import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  { q: 'How do I place an order?', a: 'Browse products, add items to your cart, proceed to checkout, enter your shipping address, and choose a payment method. Once confirmed, you will receive an order confirmation.' },
  { q: 'What payment methods do you accept?', a: 'We accept credit/debit cards, UPI (Google Pay, PhonePe, Paytm), net banking, and Cash on Delivery (COD) for eligible orders.' },
  { q: 'How long does shipping take?', a: 'Standard shipping takes 3-7 business days depending on your location. Metro cities typically receive orders faster. Express shipping is available for select products.' },
  { q: 'Can I track my order?', a: 'Yes! Go to the Orders page in your account to track your order status. You will also receive email/SMS updates at each stage.' },
  { q: 'What is your return policy?', a: 'You can return items within 7 days of delivery. Items must be unused and in original packaging. Visit the Returns page to initiate a return.' },
  { q: 'How do I get a refund?', a: 'Once your return is received and inspected, refunds are processed within 5-7 business days. Refunds go back to the original payment method.' },
  { q: 'Do you ship internationally?', a: 'Currently we ship only within India. International shipping is coming soon.' },
  { q: 'How can I contact support?', a: 'You can reach us via the Contact page, email at support@shophub.com, or call us at +91-1800-123-4567 (Mon-Sat, 9AM-6PM).' },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
      <p className="text-muted-foreground mb-8">Quick answers to common questions.</p>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="border rounded-lg group">
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-muted/50 rounded-lg">
              <span className="font-medium text-sm">{faq.q}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground group-open:hidden" />
              <ChevronUp className="h-4 w-4 text-muted-foreground hidden group-open:block" />
            </summary>
            <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
          </details>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Still have questions? <a href="/contact" className="text-primary hover:underline">Contact us</a>
      </div>
    </div>
  );
}
