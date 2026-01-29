"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Network, Settings } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Features Section Component
 * 
 * Story 2.14:
 * - AC5: Features section showcasing 3 key differentiators
 */
export function FeaturesSection() {
  const features = [
    {
      title: "Intelligence Artificielle",
      description: "L'IA analyse vos transactions en temps réel, détecte les patterns de fraude et vous suggère des actions basées sur l'historique.",
      proofPoint: "Détection 95%+ vs Stripe Radar 60-70%",
      icon: Shield,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Détection Automatisée",
      description: "Bloquez automatiquement les fraudes évidentes et recevez des alertes pour les cas nécessitant votre attention.",
      proofPoint: "Protection proactive 24/7",
      icon: Network,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Règles Personnalisées",
      description: "Créez des règles custom adaptées à votre business, gérez vos clients et recevez des explications en français.",
      proofPoint: "Contrôle total sur votre protection",
      icon: Settings,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <section id="features" className="w-full py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl mb-3 text-muted-foreground">
              Plateforme tout-en-un
            </h2>
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Conçu pour votre tranquillité d'esprit
            </h3>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
              Libérez-vous des préoccupations de fraude et concentrez-vous sur ce qui compte vraiment : développer votre business.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full relative overflow-hidden border bg-card hover:shadow-lg transition-all duration-300">
                  <CardHeader className="space-y-3">
                    <div className={`inline-flex items-center justify-center p-2.5 rounded-lg w-fit ${feature.bg}`}>
                      <Icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.proofPoint}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
