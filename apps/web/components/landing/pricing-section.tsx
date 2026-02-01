"use client";

import { motion } from "framer-motion";
import {
  Check,
  Zap,
  Crown,
  Rocket,
  ArrowRight,
  Lock,
  Flame,
} from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "FREE BETA",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Perfect for testing",
    icon: Zap,
    popular: false,
    earlyBird: false,
    features: [
      "Up to €10k processed/mo",
      "Basic detection (Level 1 AI)",
      "Auto-block obvious fraud",
      "Basic Dashboard",
      "Community Support",
    ],
    cta: "Start Free",
    ctaVariant: "outline" as const,
  },
  {
    name: "STANDARD",
    monthlyPrice: 99,
    annualPrice: 990, // 2 months free
    description: "For growing businesses",
    icon: Crown,
    popular: true,
    earlyBird: false,
    features: [
      "Up to €50k processed/mo",
      "Standard detection (Level 2 AI)",
      "10 Custom Rules",
      "Full Dashboard",
      "Email Support",
    ],
    cta: "Get Started",
    ctaVariant: "default" as const,
  },
  {
    name: "PRO",
    monthlyPrice: 399,
    annualPrice: 3990, // 2 months free
    description: "For high volume merchants",
    icon: Rocket,
    popular: false,
    earlyBird: false,
    features: [
      "Unlimited volume",
      "Advanced detection (Level 3 AI)",
      "Unlimited Custom Rules",
      "Advanced Dashboard + API",
      "Priority Support",
    ],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
  },
];

const faqs = [
  {
    question: "What counts as a transaction?",
    answer: "Every payment attempt analyzed by Orylo, whether successful or failed.",
  },
  {
    question: "Can I change plans anytime?",
    answer: "Yes. Upgrade or downgrade anytime. No hidden fees.",
  },
  {
    question: "What if I exceed my transaction limit?",
    answer: "We'll notify you. You can upgrade or we'll pause detection until next month.",
  },
  {
    question: "Is the beta really free?",
    answer: "Yes, the beta is completely free while we fine-tune our detection models.",
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-black">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-indigo-500/20 bg-indigo-500/10"
          >
            <Flame className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-400">
              Beta Access: Start for Free
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold mb-6 text-white"
          >
            Simple, transparent pricing
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-zinc-400 mb-8"
          >
            Start free with our Beta program. Upgrade as you grow.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-3 p-1 bg-white/5 rounded-full border border-white/10 w-fit mx-auto backdrop-blur-sm"
          >
            <span
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                !isAnnual ? "bg-zinc-800 text-white" : "text-zinc-400",
              )}
            >
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-indigo-500"
            />
            <span
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
                isAnnual ? "bg-zinc-800 text-white" : "text-zinc-400",
              )}
            >
              Annual
              <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                2 months free
              </span>
            </span>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          {plans.map((plan, index) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const pricePerMonth = isAnnual && plan.annualPrice > 0
              ? (plan.annualPrice / 12).toFixed(0)
              : plan.monthlyPrice;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="h-full"
              >
                <Card
                  className={cn(
                    "flex flex-col h-full transition-all duration-300 bg-zinc-900/40 backdrop-blur-xl border-white/10 hover:border-white/20 relative overflow-visible",
                    plan.popular &&
                    "border-indigo-500/50 shadow-2xl shadow-indigo-500/10 scale-[1.02] z-10",
                  )}
                >
                  {plan.popular && (
                    <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-indigo-500 to-transparent" />
                  )}

                  <CardHeader className="pb-4 pt-8 px-6">
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={cn(
                          "p-2 rounded-xl",
                          plan.popular
                            ? "bg-indigo-500/20 text-indigo-400"
                            : "bg-white/5 text-zinc-400",
                        )}
                      >
                        <plan.icon className="w-5 h-5" />
                      </div>
                      {plan.popular && (
                        <Badge className="bg-indigo-500 text-white hover:bg-indigo-600">
                          Most Popular
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="text-xl font-bold text-white mb-1">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-zinc-400 text-sm">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 px-6 pb-4">
                    {/* Price */}
                    <div className="mb-6 pb-6 border-b border-white/5">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={cn(
                            "text-4xl font-bold tracking-tight",
                            plan.popular ? "text-white" : "text-white",
                          )}
                        >
                          €{pricePerMonth}
                        </span>
                        <span className="text-zinc-500 font-medium">/mo</span>
                      </div>
                      {isAnnual && plan.annualPrice > 0 && (
                        <div className="text-sm text-zinc-400 mt-1">
                          Billed €{plan.annualPrice} yearly
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div
                            className={cn(
                              "mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                              plan.popular
                                ? "bg-indigo-500/20"
                                : "bg-white/10",
                            )}
                          >
                            <Check
                              className={cn(
                                "h-3 w-3",
                                plan.popular ? "text-indigo-400" : "text-white",
                              )}
                            />
                          </div>
                          <span className="text-sm text-zinc-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="px-6 pb-6 pt-2">
                    <Button
                      className={cn(
                        "w-full h-11 rounded-lg text-sm font-semibold transition-all duration-300",
                        plan.popular
                          ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                          : plan.ctaVariant === "outline"
                            ? "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                            : "bg-white text-black hover:bg-white/90",
                      )}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h3 className="text-xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
              >
                <h4 className="text-sm font-semibold text-white mb-2">
                  {faq.question}
                </h4>
                <p className="text-sm text-zinc-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
