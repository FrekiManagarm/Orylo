"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Pricing Section Component
 * 
 * Story 2.14:
 * - AC6: Pricing section displaying 3 tiers with feature comparison
 */
export function PricingSection() {
  const tiers = [
    {
      name: "Free",
      price: "0€",
      period: "/mois",
      description: "Pour démarrer en sécurité",
      limit: "jusqu'à 10K€ CA/mois",
      features: [
        "Détection basique (niveau 1 IA)",
        "Blocage automatique fraudes évidentes",
        "Dashboard basique",
        "Support communauté",
      ],
      cta: "Commencer gratuitement",
      recommended: false,
    },
    {
      name: "Standard",
      price: "99€",
      period: "/mois",
      description: "Pour les entreprises en croissance",
      limit: "jusqu'à 50K€ CA/mois",
      features: [
        "Tout du plan Free, plus :",
        "Détection standard (niveau 2 IA)",
        "Règles custom (10 règles)",
        "Dashboard complet",
        "Support email prioritaire",
      ],
      cta: "Essayer Standard",
      recommended: true,
    },
    {
      name: "Pro",
      price: "399€",
      period: "/mois",
      description: "Pour les gros volumes",
      limit: "illimité CA",
      features: [
        "Tout du plan Standard, plus :",
        "Détection avancée (niveau 3 IA)",
        "Règles custom illimitées",
        "Dashboard avancé + API",
        "Support dédié 24/7",
      ],
      cta: "Contacter les ventes",
      recommended: false,
    },
  ];

  return (
    <section className="w-full py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Tarification Simple et Transparente
          </h2>
          <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
            Choisissez le plan qui correspond à votre volume de transactions. Changez à tout moment.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 w-full max-w-6xl mx-auto items-start">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "relative flex flex-col transition-all duration-200",
                tier.recommended 
                  ? "border-primary shadow-2xl scale-105 z-10" 
                  : "hover:shadow-lg hover:-translate-y-1"
              )}
            >
              {tier.recommended && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
                  <Badge variant="default" className="bg-primary px-3 py-1 text-sm font-medium shadow-sm">
                    <Sparkles className="mr-1 h-3 w-3" /> Recommandé
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                  <span className="text-muted-foreground font-medium">{tier.period}</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground mt-2 bg-muted/50 p-2 rounded text-center">
                  {tier.limit}
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({
                      variant: tier.recommended ? "default" : "outline",
                      size: "lg",
                    }),
                    "w-full font-semibold"
                  )}
                >
                  {tier.cta}
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
