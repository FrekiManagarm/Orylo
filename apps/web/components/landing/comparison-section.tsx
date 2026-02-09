"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const comparisonRows = [
  {
    feature: "PRICING",
    radar: "€500–5,000 / month",
    orylo: "€99–399 / month (transparent)",
    oryloWin: true,
  },
  {
    feature: "DETECTION_TIMING",
    radar: "After payment (post-auth)",
    orylo: "Real-time, webhook-triggered (<350ms P95)",
    oryloWin: true,
  },
  {
    feature: "RULE_TUNING",
    radar: "Manual, static rules",
    orylo: "Custom rules + AI-driven insights",
    oryloWin: true,
  },
  {
    feature: "TRUST_SCORE",
    radar: null,
    orylo: "Per-customer learning from behavior",
    oryloWin: true,
  },
  {
    feature: "ONE_CLICK_ACTIONS",
    radar: null,
    orylo: "Block, whitelist, custom rules",
    oryloWin: true,
  },
  {
    feature: "FALSE_POSITIVES",
    radar: "~77% of flagged tx (industry)",
    orylo: "<10% target, feedback loop",
    oryloWin: true,
  },
];

export default function ComparisonSection() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const table = document.querySelector(".comparison-table");
      const rows = gsap.utils.toArray<HTMLElement>(".comparison-row");

      gsap.fromTo(
        table,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container.current,
            start: "top 75%",
          },
        }
      );

      gsap.fromTo(
        rows,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.05,
          delay: 0.2,
          scrollTrigger: {
            trigger: container.current,
            start: "top 75%",
          },
        }
      );
    },
    { scope: container }
  );

  return (
    <section
      id="comparison"
      className="py-32 bg-black border-t border-white/10 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

      <div ref={container} className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">
              COMPARISON
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4">
              Stripe Radar <span className="text-zinc-600">vs</span>{" "}
              <span className="text-indigo-500">Orylo</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              Why merchants switch: real-time detection, transparent pricing, and
              fewer false positives.
            </p>
          </div>

          <div className="comparison-table border border-white/10 rounded-lg overflow-x-auto bg-black/40 backdrop-blur-sm min-w-0">
            <div className="min-w-[520px]">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_1fr] gap-px bg-white/10 border-b border-white/10">
                <div className="bg-zinc-900/80 px-4 py-3">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    CRITERION
                  </span>
                </div>
                <div className="bg-zinc-900/80 px-4 py-3">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    Stripe Radar
                  </span>
                </div>
                <div className="bg-indigo-950/30 border-indigo-500/20 px-4 py-3">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                    Orylo
                  </span>
                </div>
              </div>

              {comparisonRows.map((row, i) => (
                <div
                  key={row.feature}
                  className="comparison-row grid grid-cols-[1fr_1fr_1fr] gap-px bg-white/5 border-b border-white/5 last:border-b-0"
                >
                  <div className="bg-black/40 px-4 py-4 border-r border-white/5">
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                      {row.feature.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="bg-black/30 px-4 py-4 flex items-center gap-2">
                    {row.radar === null ? (
                      <span className="text-zinc-600 text-sm font-mono">—</span>
                    ) : (
                      <>
                        <X className="h-4 w-4 shrink-0 text-red-500/80" />
                        <span className="text-sm text-zinc-500">{row.radar}</span>
                      </>
                    )}
                  </div>
                  <div className="bg-black/40 border-l border-indigo-500/10 px-4 py-4 flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-green-500" />
                    <span className="text-sm text-zinc-300">{row.orylo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] font-mono text-zinc-600 text-center mt-6 uppercase tracking-widest">
            Source: PRD positioning vs traditional solutions (Stripe Radar, Sift). Orylo is Stripe-native and webhook-triggered.
          </p>
        </div>
      </div>
    </section>
  );
}
