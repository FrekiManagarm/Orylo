"use client";

import { Button } from "@/components/ui/button";
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
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const plans = [
  {
    name: "PROTO",
    displayPrice: "FREE",
    period: "BETA ACCESS",
    description: "For early adopters testing the system.",
    features: ["1k tx/mo volume", "Auto-Blocking", "Discord Access"],
    cta: "INIT_ACCESS",
    href: "/auth/register",
    popular: false,
  },
  {
    name: "CORE",
    displayPrice: "99€",
    period: "/ MONTH",
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
    displayPrice: "399€",
    period: "/ MONTH",
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
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-20 text-center tracking-tighter">
          ACCESS <span className="text-zinc-600">TIERS</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`pricing-card relative flex flex-col bg-black border-white/10 hover:border-white/20 transition-all duration-300 opacity-0 ${plan.popular
                  ? "border-indigo-500/50 shadow-2xl shadow-indigo-900/20"
                  : ""
                }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-[10px] font-bold px-3 py-1 text-white uppercase tracking-widest font-mono">
                  Recommended
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-lg text-zinc-400 font-mono tracking-widest uppercase">
                  {plan.name}
                </CardTitle>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-bold text-white tracking-tighter font-mono">
                    {plan.displayPrice}
                  </span>
                </div>
                <div className="text-xs text-indigo-400 font-mono mt-2 uppercase">
                  {plan.period}
                </div>
                <CardDescription className="mt-6 text-zinc-500 font-mono text-xs">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 mt-6 border-t border-white/5 pt-6">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0 h-4 w-4 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                      <span className="ml-3 text-sm text-zinc-300 font-mono">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  render={<Link href={plan.href}>{plan.cta}</Link>}
                  className={`w-full rounded-none h-12 font-mono text-sm tracking-widest ${plan.popular
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "bg-zinc-900 text-white hover:bg-zinc-800 border border-white/10"
                    }`}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
