"use client";

import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Social Proof Section Component
 * 
 * Story 2.14:
 * - AC7: Social proof section with testimonial and final CTA
 * 
 * Design inspired by biume.com "Prêt à démarrer ?" section
 */
export function SocialProofSection() {
  return (
    <section className="w-full py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-12 text-center max-w-4xl mx-auto">
          {/* Main CTA Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Prêt à démarrer ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transformez votre protection contre la fraude dès aujourd'hui
            </p>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Rejoignez les centaines de marchands qui font confiance à Orylo pour protéger leur business au quotidien
            </p>
          </div>

          {/* Offer Badge */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  Offre de lancement
                </div>
                <h3 className="text-2xl font-semibold">Lancez-vous sans risque</h3>
                <p className="text-muted-foreground">
                  Testez toutes les fonctionnalités pendant 15 jours, sans carte bancaire. Notre équipe vous accompagne à chaque étape.
                </p>
                <ul className="space-y-2 text-left max-w-md mx-auto">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">✓</span>
                    <span>Essai gratuit de 15 jours</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">✓</span>
                    <span>Formation personnalisée incluse</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">✓</span>
                    <span>Support dédié 7j/7</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">✓</span>
                    <span>Migration de vos données offerte</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg" }), "gap-2 text-base h-12 px-6")}
            >
              Commencer gratuitement
            </Link>
            <Button
              size="lg"
              variant="outline"
              asChild
            >
              <a href="mailto:contact@orylo.com" className="gap-2 text-base h-12 px-6">
                Demander une démo
              </a>
            </Button>
          </div>

          {/* Testimonial */}
          <Card className="border-border bg-muted/30 max-w-2xl">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Quote className="h-8 w-8 text-primary/50" />
                <blockquote className="text-lg font-medium text-foreground italic">
                  "Orylo a révolutionné ma protection contre la fraude. Je gagne du temps sur la gestion des transactions suspectes et mes clients apprécient la transparence."
                </blockquote>
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                    MC
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Marie C.</p>
                    <p className="text-sm text-muted-foreground">E-commerce, Paris</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground pt-2">98% satisfait</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
