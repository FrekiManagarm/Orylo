"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * Hero Section Component
 * 
 * Story 2.14:
 * - AC1: Hero section with headline and subheadline from GTM positioning
 * - AC2: Primary CTA "Start Free Trial" linking to /login
 * - AC3: Secondary CTA "Learn More" (smooth scroll)
 * 
 * Design inspired by biume.com with Orylo brand colors
 */
export function HeroSection() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Background Effects - Subtle grid pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-primary/10 opacity-40 blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-6 text-center max-w-4xl mx-auto">
          
          {/* Badge - Subtle and minimal */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium border-border bg-muted/50 text-muted-foreground"
          >
            L'IA au service de la protection contre la fraude
          </motion.div>

          {/* Main Headline - Simple and clear */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-foreground"
          >
            Simplifiez votre protection avec intelligence
          </motion.h1>
          
          {/* Subheadline - Descriptive and clear */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl leading-relaxed"
          >
            Détectez les fraudes que Stripe Radar manque, accédez à l'historique intelligent et protégez votre business en un clic.
          </motion.p>

          {/* CTAs - Side by side, clean design */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 pt-2"
          >
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg" }), "gap-2 text-base h-12 px-6")}
            >
              Commencer gratuitement
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToFeatures}
              className="gap-2 text-base h-12 px-6"
            >
              Voir la démo
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
