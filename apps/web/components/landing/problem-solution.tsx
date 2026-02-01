"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Shield, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProblemSolutionSection() {
  return (
    <section className="w-full py-24 relative overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-8 text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white"
          >
            The problem with <span className="text-red-500">Stripe Radar</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-zinc-400"
          >
            Stripe Radar lets fraud slip through. Result: your account gets suspended and you lose money.
          </motion.p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          {/* Problem Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-red-500/20 bg-red-500/5 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                  <CardTitle className="text-2xl text-white">Stripe Radar</CardTitle>
                </div>
                <p className="text-red-200/60 text-sm font-medium">
                  Limited detection, too many false positives
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {[
                    "Only 60-70% card testing detection",
                    "77% false positives = wasted time",
                    "Static rules miss evolving fraud",
                    "Risk of Stripe account suspension",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-300">
                      <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Solution Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/5 opacity-50 pointer-events-none" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Shield className="h-6 w-6 text-emerald-500" />
                  </div>
                  <CardTitle className="text-2xl text-white">Orylo</CardTitle>
                </div>
                <p className="text-emerald-200/60 text-sm font-medium">
                  Collective AI that blocks fraud BEFORE impact
                </p>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-4">
                  {[
                    "95%+ card testing detection",
                    "<10% false positives",
                    "AI learning from 100+ merchants",
                    "Proactive account protection",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-white">
                      <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
