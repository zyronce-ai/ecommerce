import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
      </div>

      <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
        <p><strong className="text-foreground">Last updated:</strong> January 2026</p>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Information We Collect</h2>
          <p>We collect information you provide when creating an account, placing an order, or contacting support. This includes your name, email, phone number, shipping address, and payment information. We also automatically collect certain technical data like IP address, browser type, and device information to improve our services.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Process and fulfill your orders</li>
            <li>Send order updates and shipping notifications</li>
            <li>Provide customer support</li>
            <li>Improve our website and personalize your experience</li>
            <li>Send promotional offers (only with your consent)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Data Protection</h2>
          <p>We implement industry-standard security measures including SSL encryption, secure payment gateways, and regular security audits. Your payment details are never stored on our servers.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Third-Party Sharing</h2>
          <p>We do not sell your personal data. We share necessary information only with trusted partners for order fulfillment (shipping carriers, payment processors) and analytics (Google Analytics).</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Your Rights</h2>
          <p>You can access, update, or delete your account information anytime from Settings. You can opt out of marketing emails at any time.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Contact</h2>
          <p>For privacy-related inquiries, contact us at privacy@shophub.com.</p>
        </section>
      </div>
    </div>
  );
}
