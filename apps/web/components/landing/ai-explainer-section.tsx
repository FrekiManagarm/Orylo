"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Lightbulb, Layers, TrendingUp, Eye, ArrowRight, ShieldCheck, ShieldAlert, ScanSearch } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: ScanSearch,
    title: "1. Scan",
    subtitle: "7+ Signals",
    desc: "IP, Velocity, Device...",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Lightbulb,
    title: "2. Score",
    subtitle: "0-100 Risk",
    desc: "Single clear metric",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: TrendingUp,
    title: "3. Learn",
    subtitle: "Adaptive",
    desc: "Trust scores evolve",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: ShieldCheck,
    title: "4. Decide",
    subtitle: "You Control",
    desc: "Allow, Block, or Rule",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

export default function AIExplainerSection() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>(".ai-card");
      const arrows = gsap.utils.toArray<HTMLElement>(".ai-arrow");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top 75%",
        },
      });

      tl.fromTo(
        items,
        { opacity: 0, scale: 0.8, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.5)",
        }
      ).fromTo(
        arrows,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1 },
        "-=0.3"
      );
    },
    { scope: container }
  );

  return (
    <section
      id="how-orylo-ai-works"
      ref={container}
      className="py-12 bg-black border-t border-white/5 relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-900/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tighter">
            AI Logic <span className="text-zinc-600">Simplified</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            From raw data to clear decision in milliseconds.
          </p>
        </div>

        {/* Visual Flow */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="contents">
              {/* Card */}
              <div className={cn(
                "ai-card relative flex flex-col items-center text-center p-6 rounded-2xl border bg-zinc-900/40 backdrop-blur-sm w-full md:w-64 h-full min-h-[200px] hover:bg-zinc-900/60 transition-colors group",
                step.border
              )}>
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300", step.bg, step.color)}>
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
                <div className={cn("text-xs font-mono uppercase tracking-wider mb-3", step.color)}>
                  {step.subtitle}
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Arrow (except last) */}
              {i < steps.length - 1 && (
                <div className="ai-arrow text-zinc-600 hidden md:block">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
              {i < steps.length - 1 && (
                <div className="ai-arrow text-zinc-600 md:hidden py-2">
                  <ArrowRight className="w-6 h-6 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
