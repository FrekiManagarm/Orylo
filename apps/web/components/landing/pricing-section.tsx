"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/**
 * Pricing Section Component
 * 
 * Story 2.14:
 * - AC6: Pricing section displaying pricing with monthly/annual toggle
 * 
 * Design inspired by biume.com with Orylo brand colors
 */
export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const monthlyPrice = 99;
  const annualPrice = Math.round(monthlyPrice * 12 * 0.75); // 25% discount
  const savings = monthlyPrice * 12 - annualPrice;

  const features = [
    "Assistant IA illimité",
    "Détection en temps réel",
    "Règles custom personnalisées",
    "Dashboard complet & Analytics",
    "Clients & Transactions illimités",
    "Support prioritaire 7j/7",
  ];

  return (
    <section className="w-full py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center max-w-3xl mx-auto">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Un tarif unique, tout inclus
            </h2>
            <p className="text-lg text-muted-foreground">
              Accédez à toutes les fonctionnalités sans limite.
            </p>
          </div>

          {/* Monthly/Annual Toggle */}
          <div className="flex items-center gap-3">
            <Label htmlFor="billing-toggle" className={cn("text-sm font-medium", !isAnnual && "text-foreground")}>
              Mensuel
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <div className="flex items-center gap-2">
              <Label htmlFor="billing-toggle" className={cn("text-sm font-medium", isAnnual && "text-foreground")}>
                Annuel
              </Label>
              {isAnnual && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                  -25%
                </span>
              )}
            </div>
          </div>

          {/* Pricing Card */}
          <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold tracking-tight">
                  {isAnnual ? annualPrice : monthlyPrice}€
                </span>
                <span className="text-muted-foreground">/{isAnnual ? "an" : "mois"}</span>
              </div>
              {isAnnual && (
                <p className="text-sm font-medium text-success">
                  Vous économisez {savings}€ par an
                </p>
              )}
              <CardDescription className="text-base">
                Une solution complète pour protéger votre business de A à Z. Sans frais cachés. Annulable à tout moment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-6">
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "lg" }), "w-full")}
              >
                Commencer l'essai gratuit (15j)
              </Link>
              <p className="text-xs text-muted-foreground">
                Pas de carte bancaire requise
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
