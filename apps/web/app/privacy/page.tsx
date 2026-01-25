import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - Orylo",
  description: "Orylo privacy policy and GDPR compliance information",
};

/**
 * Privacy Policy Page
 * 
 * Story 3.5 AC8: Privacy policy page with GDPR disclosures
 * 
 * Accessible without authentication
 */
export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <section className="prose prose-slate max-w-none">
        <h2>1. Data We Collect</h2>
        <p>
          Orylo collects the following data to provide fraud detection services:
        </p>
        <ul>
          <li>Transaction metadata (amount, currency, timestamp)</li>
          <li>Customer identifiers (Stripe customer ID, email)</li>
          <li>Payment metadata (last 4 digits of card, country)</li>
          <li>Fraud detection results (risk scores, decisions)</li>
        </ul>

        <h2>2. Data Retention (GDPR Article 5)</h2>
        <p>
          Fraud detection records are automatically deleted after{" "}
          <strong>90 days</strong>. This ensures compliance with GDPR&apos;s data
          minimization principle.
        </p>

        <h2>3. Your Rights (GDPR Articles 15-21)</h2>
        <ul>
          <li>
            <strong>Right to Access</strong>: Request a copy of your data via
            API endpoint <code>/api/customers/[id]/export</code>
          </li>
          <li>
            <strong>Right to Deletion</strong>: Request permanent deletion of
            your data via API endpoint <code>DELETE /api/customers/[id]</code>
          </li>
          <li>
            <strong>Right to Portability</strong>: Export your data in JSON
            format
          </li>
        </ul>

        <h2>4. Security Measures</h2>
        <ul>
          <li>HTTPS encryption for all data in transit</li>
          <li>Database encryption at rest (Neon PostgreSQL)</li>
          <li>
            No storage of full credit card numbers (PCI compliance) - only last 4
            digits and country
          </li>
          <li>Secure session management with HttpOnly cookies</li>
          <li>Multi-tenancy isolation (organization-level data separation)</li>
        </ul>

        <h2>5. Data Processing</h2>
        <p>
          Orylo processes payment data on behalf of merchants. We act as a data
          processor under GDPR. Merchants remain the data controllers.
        </p>

        <h2>6. PCI Compliance</h2>
        <p>
          Orylo is PCI compliant. We do not store, process, or transmit full
          credit card numbers. All payment data is handled securely through
          Stripe, a PCI DSS Level 1 certified payment processor.
        </p>
        <ul>
          <li>No full card numbers (PAN) stored</li>
          <li>No CVV/CVC codes stored</li>
          <li>Only Stripe tokens (pi_xxx, pm_xxx, cus_xxx)</li>
          <li>Card metadata limited to last4 + country (non-sensitive per PCI
            DSS)</li>
        </ul>

        <h2>7. Contact</h2>
        <p>
          For data deletion or export requests, contact:{" "}
          <a href="mailto:privacy@orylo.com" className="text-blue-600 hover:underline">
            privacy@orylo.com
          </a>
        </p>

        <p className="text-sm text-slate-600 mt-8">
          Last updated: January 24, 2026
        </p>
      </section>

      <div className="mt-8 pt-8 border-t">
        <Link
          href="/"
          className="text-blue-600 hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
