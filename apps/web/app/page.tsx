import Features from "@/components/landing/features-section";
import RoiCalculator from "@/components/landing/roi-calculator";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero-section";
import Navbar from "@/components/landing/navbar";
import Pricing from "@/components/landing/pricing-section";
import { ProblemSolutionSection } from "@/components/landing/problem-solution";
import { SocialProof } from "@/components/landing/social-proof";
import { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://orylo.app";

export const metadata: Metadata = {
  title: "Orylo - Stop Card Testing. Understand Why.",
  description:
    "Detect and block card testing attacks with visual explanations. See exactly why each transaction was flagged. Setup in 5 minutes. From €99/month.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Orylo - Stop Card Testing. Understand Why.",
    description:
      "Detect and block card testing attacks with visual explanations. See exactly why each transaction was flagged. Setup in 5 minutes. From €99/month.",
    url: baseUrl,
  },
  twitter: {
    title: "Orylo - Stop Card Testing. Understand Why.",
    description:
      "Detect and block card testing attacks with visual explanations. See exactly why each transaction was flagged. Setup in 5 minutes. From €99/month.",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-foreground overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <main>
        <Hero />
        <ProblemSolutionSection />
        <Features />
        <RoiCalculator />
        <Pricing />
        <SocialProof />
      </main>

      <Footer />
    </div>
  );
}
