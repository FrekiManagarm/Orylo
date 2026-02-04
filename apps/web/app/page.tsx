import Features from "@/components/landing/features-section";
import RoiCalculator from "@/components/landing/roi-calculator";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero-section";
import Navbar from "@/components/landing/navbar";
import Pricing from "@/components/landing/pricing-section";
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://orylo.app";

export const metadata: Metadata = {
  title: "Orylo - Fraud Protection for Stripe",
  description:
    "Stop card testing and chargebacks automatically. Native Stripe integration, real-time detection, and AI explanations.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Orylo - Fraud Protection for Stripe",
    description:
      "Stop card testing and chargebacks automatically. Native Stripe integration, real-time detection, and AI explanations.",
    url: baseUrl,
  },
  twitter: {
    title: "Orylo - Fraud Protection for Stripe",
    description:
      "Stop card testing and chargebacks automatically. Native Stripe integration, real-time detection, and AI explanations.",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-foreground overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <main>
        <Hero />
        <Features />
        <RoiCalculator />
        <Pricing />
      </main>

      <Footer />
    </div>
  );
}
