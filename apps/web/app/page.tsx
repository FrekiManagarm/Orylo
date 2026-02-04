import Hero from "@/components/landing-v2/hero";
import BentoFeatures from "@/components/landing-v2/bento-features";
import InfiniteTicker from "@/components/landing-v2/ticker";
import HowItWorks from "@/components/landing-v2/how-it-works";
import CTA from "@/components/landing-v2/cta";
import Navbar from "@/components/landing-v2/navbar";
import Footer from "@/components/landing-v2/footer";
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://orylo.app";

export const metadata: Metadata = {
  title: "Orylo - La sécurité des paiements, réinventée.",
  description:
    "Détectez et bloquez la fraude en temps réel avec Orylo. Intégration Stripe native, latence <350ms, et décisions assistées par IA.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Orylo - La sécurité des paiements, réinventée.",
    description:
      "Détectez et bloquez la fraude en temps réel avec Orylo. Intégration Stripe native, latence <350ms, et décisions assistées par IA.",
    url: baseUrl,
  },
  twitter: {
    title: "Orylo - La sécurité des paiements, réinventée.",
    description:
      "Détectez et bloquez la fraude en temps réel avec Orylo. Intégration Stripe native, latence <350ms, et décisions assistées par IA.",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-foreground overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <main>
        <Hero />
        <InfiniteTicker />
        <BentoFeatures />
        <HowItWorks />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
