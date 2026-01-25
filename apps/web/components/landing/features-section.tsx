"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Network, Settings, CheckCircle2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
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
      title: "Protection Réelle",
      description: "95%+ détection card testing vs Stripe Radar 60-70%",
      proofPoint: "Sauvez votre business, pas juste vos transactions",
      icon: Shield,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      className: "md:col-span-2 md:row-span-2",
      visual: (
        <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-gradient-to-tl from-blue-500/20 to-transparent rounded-tl-full opacity-50" />
      )
    },
    {
      title: "Intelligence Collective",
      description: "Network effect, apprend de 100+ marchands",
      proofPoint: "Fraudeur détecté chez A = protège B, C, D",
      icon: Network,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      className: "md:col-span-1 md:row-span-1",
      visual: (
        <div className="absolute right-4 top-4">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-purple-500/50 animate-pulse delay-75" />
            <div className="w-2 h-2 rounded-full bg-purple-500/30 animate-pulse delay-150" />
          </div>
        </div>
      )
    },
    {
      title: "Empathie & Contrôle",
      description: "Règles custom, gestion clients, explications françaises",
      proofPoint: "Personnalisez chaque règle",
      icon: Settings,
      color: "text-green-500",
      bg: "bg-green-500/10",
      className: "md:col-span-1 md:row-span-1",
      visual: null
    },
  ];

  return (
    <section id="features" className="w-full py-20 md:py-32 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              Pourquoi choisir Orylo ?
            </h2>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
              Une approche radicalement différente de la lutte contre la fraude
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto auto-rows-[minmax(200px,auto)]">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(feature.className, "group")}
              >
                <Card className="h-full relative overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-950">
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent via-transparent to-${feature.color.split('-')[1]}-500/5`} />
                  
                  {feature.visual}

                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className={`inline-flex items-center justify-center p-3 rounded-xl w-fit mb-4 ${feature.bg}`}>
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                    <CardDescription className="text-base mt-2">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-2 text-sm font-medium text-muted-foreground bg-muted/30 p-3 rounded-lg backdrop-blur-sm">
                      <CheckCircle2 className={`h-5 w-5 ${feature.color} shrink-0`} />
                      <p>{feature.proofPoint}</p>
                    </div>
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
