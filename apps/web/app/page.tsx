import type { Metadata } from "next";
import { LandingHeader } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSolutionSection } from "@/components/landing/problem-solution";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { SocialProofSection } from "@/components/landing/social-proof";
import { LandingFooter } from "@/components/landing/footer";

/**
 * Landing Page
 * 
 * Story 2.14:
 * - AC1-AC12: Complete landing page with hero, features, pricing, footer
 * - AC11: SEO optimization with metadata
 */

export const metadata: Metadata = {
  title: "Orylo - Protect Your Stripe Account from Fraud | AI-Powered Detection",
  description: "Orylo détecte et bloque les fraudes que Stripe Radar manque. IA collective, 95%+ détection, règles custom. Start free trial.",
  openGraph: {
    title: "Orylo - Protect Your Stripe Account from Fraud",
    description: "AI-powered fraud detection for Stripe merchants",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <ProblemSolutionSection />
        <FeaturesSection />
        <PricingSection />
        <SocialProofSection />
      </main>
      <LandingFooter />
    </div>
  );
}
