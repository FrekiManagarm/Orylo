"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * Hero Section Component
 * 
 * Story 2.14:
 * - AC1: Hero section with headline and subheadline from GTM positioning
 * - AC2: Primary CTA "Start Free Trial" linking to /login
 * - AC3: Secondary CTA "Learn More" (smooth scroll)
 */
export function HeroSection() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] bg-blue-500/10 opacity-30 blur-[120px] rounded-full mix-blend-multiply filter"></div>
        <div className="absolute left-0 bottom-0 -z-10 h-[500px] w-[500px] bg-purple-500/10 opacity-30 blur-[120px] rounded-full mix-blend-multiply filter"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-8 text-center">
          
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Nouvelle IA de détection v2.0 disponible
          </motion.div>

          {/* AC1: Headline from GTM strategy */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl max-w-6xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
          >
            Ne laissez plus Stripe <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-purple-600 animate-gradient-x">fermer votre compte</span>
          </motion.h1>
          
          {/* AC1: Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-[800px] text-xl text-muted-foreground md:text-2xl leading-relaxed"
          >
            Orylo détecte et bloque les attaques de card testing que Stripe Radar manque. 
            <span className="block mt-2 text-foreground font-medium">Rejoignez l'intelligence collective de 100+ marchands.</span>
          </motion.p>

          {/* AC2, AC3: CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4"
          >
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg" }), "gap-2 w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5")}
            >
              Commencer l'essai gratuit
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToFeatures}
              className="gap-2 w-full sm:w-auto text-lg h-14 px-8 rounded-full border-2 hover:bg-muted/50"
            >
              En savoir plus
            </Button>
          </motion.div>

          {/* Trust indicators (mini social proof) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="pt-12 flex flex-col items-center gap-2 text-sm text-muted-foreground"
          >
            <div className="flex -space-x-2 overflow-hidden p-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-xs font-bold">+100</div>
            </div>
            <p>Déjà plus de <span className="font-bold text-foreground">2M€</span> de transactions sécurisées</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
