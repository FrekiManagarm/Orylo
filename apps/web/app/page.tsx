import HeroSection from "@/components/landing/hero-section";
import HowItWorks from "@/components/landing/how-it-works";
import FeaturesSection from "@/components/landing/features-section";
import AIExplainerSection from "@/components/landing/ai-explainer-section";
import ComparisonSection from "@/components/landing/comparison-section";
import PricingSection from "@/components/landing/pricing-section";
import RoiCalculator from "@/components/landing/roi-calculator";
import FAQSection from "@/components/landing/faq-section";
import CTASection from "@/components/landing/cta-section";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://orylo.app";

export const metadata: Metadata = {
  title: "Orylo - Advanced Fraud Detection",
  description:
    "Latency-free fraud protection for Stripe. Stop card testing and chargebacks in real-time.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Orylo - Advanced Fraud Detection",
    description:
      "Latency-free fraud protection for Stripe. Stop card testing and chargebacks in real-time.",
    url: baseUrl,
  },
  twitter: {
    title: "Orylo - Advanced Fraud Detection",
    description:
      "Latency-free fraud protection for Stripe. Stop card testing and chargebacks in real-time.",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-foreground overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
      <Navbar />

      <main>
        <HeroSection />
        <HowItWorks />
        <FeaturesSection />
        <AIExplainerSection />
        <ComparisonSection />
        <RoiCalculator />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
