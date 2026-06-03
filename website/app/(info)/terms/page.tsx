import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold">Terms of Service</h1>
      </div>

      <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
        <p><strong className="text-foreground">Last updated:</strong> January 2026</p>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Account Registration</h2>
          <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized use.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Orders & Payments</h2>
          <p>All orders are subject to product availability. We reserve the right to cancel orders if payment is not verified or if pricing errors occur. Prices are inclusive of applicable taxes unless stated otherwise.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Pricing & Availability</h2>
          <p>Prices and availability are subject to change without notice. We strive to keep product information accurate but cannot guarantee that all listings are error-free.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Returns & Refunds</h2>
          <p>Our return policy is outlined on the <a href="/returns" className="text-primary hover:underline">Returns page</a>. Refunds are processed according to the policy applicable at the time of purchase.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Intellectual Property</h2>
          <p>All content on this website including product images, descriptions, logos, and trademarks are owned by ShopHub or our partners. Unauthorized use is prohibited.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Limitation of Liability</h2>
          <p>ShopHub shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services, including but not limited to delayed delivery or product defects beyond our control.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Changes to Terms</h2>
          <p>We reserve the right to update these terms at any time. Changes will be posted on this page with an updated revision date.</p>
        </section>
      </div>
    </div>
  );
}
