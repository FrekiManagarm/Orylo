"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Prix affichés = annual (per month). Monthly = +25% (annual = -25% discount)
const plans = [
  {
    name: "PROTO",
    priceMonthly: null,
    priceAnnual: null,
    periodLabel: "BETA ACCESS",
    description: "For early adopters testing the system.",
    features: ["1k tx/mo volume", "Auto-Blocking", "Discord Access"],
    cta: "INIT_ACCESS",
    href: "/auth/register",
    popular: false,
  },
  {
    name: "CORE",
    priceMonthly: 132, // 99 / 0.75
    priceAnnual: 99,
    periodLabel: "/ MONTH",
    description: "Standard protection for growth.",
    features: [
      "10k tx/mo volume",
      "Trust Scores",
      "Custom Rules Engine",
      "Priority Support",
    ],
    cta: "ACTIVATE_CORE",
    href: "/auth/register",
    popular: true,
  },
  {
    name: "MAX",
    priceMonthly: 532, // 399 / 0.75
    priceAnnual: 399,
    periodLabel: "/ MONTH",
    description: "Enterprise grade infrastructure.",
    features: [
      "Uncapped volume",
      "Dedicated API",
      "SLA 99.9%",
      "Dedicated Manager",
    ],
    cta: "CONTACT_SALES",
    href: "mailto:sales@orylo.com",
    popular: false,
  },
];

export default function PricingSection() {
  const container = useRef<HTMLDivElement>(null);
  const [isAnnual, setIsAnnual] = useState(true);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".pricing-card");

      gsap.fromTo(
        cards,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container.current,
            start: "top 70%",
          },
        }
      );
    },
    { scope: container }
  );

  return (
    <section id="pricing" className="py-32 bg-black relative">
      <div ref={container} className="container mx-auto px-4 relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-12 text-center tracking-tighter">
          ACCESS <span className="text-zinc-600">TIERS</span>
        </h2>

        {/* Billing toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <span
            className={`text-sm font-mono uppercase tracking-wider transition-colors ${!isAnnual ? "text-white font-bold" : "text-zinc-500"
              }`}
          >
            Monthly
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={(checked) => setIsAnnual(!!checked)}
            className="data-checked:bg-indigo-500 data-unchecked:bg-zinc-700"
          />
          <span
            className={`text-sm font-mono uppercase tracking-wider transition-colors ${isAnnual ? "text-white font-bold" : "text-zinc-500"
              }`}
          >
            Annual
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 text-[10px] font-bold font-mono uppercase tracking-widest">
            Save 25%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isFree = plan.priceAnnual === null && plan.priceMonthly === null;
            const displayPrice = isFree
              ? "FREE"
              : isAnnual
                ? `${plan.priceAnnual}€`
                : `${plan.priceMonthly}€`;
            const period = isFree
              ? plan.periodLabel
              : isAnnual
                ? `${plan.periodLabel} (billed annually)`
                : plan.periodLabel;

            return (
              <Card
                key={plan.name}
                className={`pricing-card relative flex flex-col bg-black border-white/10 hover:border-indigo-500/30 transition-all duration-500 opacity-0 group overflow-visible ${plan.popular
                  ? "border-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.15)] scale-105 z-10"
                  : "hover:scale-[1.02]"
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-indigo-600 text-[10px] font-bold px-4 py-1.5 text-white uppercase tracking-widest font-mono rounded-full shadow-lg shadow-indigo-500/50 whitespace-nowrap">
                    Recommended
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-xl text-zinc-400 font-mono tracking-widest uppercase group-hover:text-white transition-colors">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4 flex items-baseline flex-wrap gap-x-2">
                    <span className="text-5xl md:text-6xl font-bold text-white tracking-tighter font-mono group-hover:text-indigo-100 transition-colors">
                      {displayPrice}
                    </span>
                  </div>
                  <div className="text-xs text-indigo-500 font-bold font-mono mt-2 uppercase tracking-wide">
                    {period}
                  </div>
                  <CardDescription className="mt-6 text-zinc-500 font-mono text-xs leading-relaxed">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 mt-6 border-t border-white/5 pt-6">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start group/item">
                        <div className="shrink-0 h-5 w-5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mt-0.5 group-hover/item:border-indigo-500 group-hover/item:bg-indigo-500/20 transition-colors">
                          <Check className="h-3 w-3 text-zinc-400 group-hover/item:text-indigo-400 transition-colors" />
                        </div>
                        <span className="ml-3 text-sm text-zinc-400 font-mono group-hover/item:text-zinc-200 transition-colors">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    render={<Link href={plan.href}>{plan.cta}</Link>}
                    className={`w-full rounded-sm h-12 font-mono text-sm font-bold tracking-widest uppercase transition-all duration-300 ${plan.popular
                      ? "bg-white text-black hover:bg-indigo-50 hover:scale-[1.02] shadow-lg"
                      : "bg-zinc-900 text-white hover:bg-zinc-800 border border-white/10 hover:border-white/30"
                      }`}
                  />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
