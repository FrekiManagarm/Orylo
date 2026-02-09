"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Zap, Brain, Lock } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "AUTO_BLOCK_PROTOCOL",
    subtitle: "Real-time Intervention",
    description:
      "No manual review latency. Threats are neutralized instantly at the gateway level.",
    icon: ShieldAlert,
    className: "md:col-span-2",
    visual: (
      <div className="mt-6 relative h-24 w-full bg-black/40 rounded border border-white/5 overflow-hidden flex items-center px-4 font-mono text-xs">
        <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
        <div className="w-full space-y-2 relative z-10">
          <div className="flex justify-between text-red-400">
            <span>THREAT_DETECTED</span>
            <span>[BLOCKING]</span>
          </div>
          <div className="h-1 w-full bg-red-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 animate-[width-fill_1.5s_ease-out_forwards]"
              style={{ width: "100%" }}
            />
          </div>
          <div className="text-zinc-600">
            ID: tx_8923...9902 blocked successfully.
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "LATENCY_ZERO",
    subtitle: "< 350ms Processing",
    description: "Invisible layer. Your checkout speed remains unaffected.",
    icon: Zap,
    className: "md:col-span-1",
    visual: (
      <div className="mt-8 flex justify-center relative group-hover:scale-105 transition-transform duration-500">
        <div className="absolute inset-0 bg-green-500/10 blur-xl rounded-full" />
        <div className="relative border border-green-500/30 bg-black/50 h-24 w-24 rounded-full flex items-center justify-center">
          <div className="text-center">
            <span className="block text-2xl font-bold text-white font-mono">
              35
            </span>
            <span className="text-[10px] text-green-500 font-mono tracking-widest">
              MS
            </span>
          </div>
          <div className="absolute top-0 w-full h-full border-t-2 border-green-500 rounded-full animate-spin" />
        </div>
      </div>
    ),
  },
  {
    title: "NEURAL_EXPLAIN",
    subtitle: "AI Analysis Core",
    description:
      "Decodes fraud patterns into plain English actionable insights.",
    icon: Brain,
    className: "md:col-span-1",
    visual: (
      <div className="mt-4 p-4 rounded bg-indigo-500/5 border border-indigo-500/10 font-mono text-[10px] text-zinc-400 leading-relaxed group-hover:bg-indigo-500/10 transition-colors duration-500">
        <span className="text-indigo-400 block mb-2">
          {">"} ANALYZING_PATTERN...
        </span>
        <p>
          Subject IP <span className="text-white">[RU]</span> mismatch with Card
          Issuer <span className="text-white">[US]</span>.
          <br />
          Velocity spike detected.
        </p>
      </div>
    ),
  },
  {
    title: "NATIVE_SYNC",
    subtitle: "Stripe Integration",
    description: "One-click connection. Zero code required for deployment.",
    icon: Lock,
    className: "md:col-span-2",
    visual: (
      <div className="mt-6 flex items-center justify-center gap-12 relative">
        <div className="absolute h-px w-32 bg-linear-to-r from-transparent via-indigo-500 to-transparent top-1/2 -translate-y-1/2 animate-pulse" />

        <div className="h-14 w-14 bg-zinc-900 border border-white/10 rounded flex items-center justify-center relative z-10 group">
          <span className="text-indigo-400 font-bold text-xl group-hover:scale-110 transition-transform">
            S
          </span>
        </div>

        <div className="h-14 w-14 bg-zinc-900 border border-white/10 rounded flex items-center justify-center relative z-10 group">
          <div className="h-6 w-6 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-black font-bold text-xs">O</span>
          </div>
        </div>
      </div>
    ),
  },
];

export default function FeaturesSection() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".feature-card");

      gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container.current,
            start: "top 80%",
          },
        },
      );
    },
    { scope: container },
  );

  return (
    <section id="features" className="py-32 bg-black relative overflow-hidden">
      <div ref={container} className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-white/10 pb-8">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tighter">
              SYSTEM <span className="text-zinc-600">MODULES</span>
            </h2>
            <p className="text-zinc-400 max-w-xl text-lg">
              Deploying advanced countermeasures against card testing attacks.
            </p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-xs font-mono text-zinc-500 mb-1">
              SYSTEM_STATUS
            </div>
            <div className="flex items-center gap-2 text-green-500 text-sm font-bold">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              ONLINE
            </div>
          </div>
        </div>

        <div className="feature-grid grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`${feature.className} feature-card group opacity-0`}
            >
              <Card className="h-full bg-black/40 border-white/10 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden backdrop-blur-sm relative hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                {/* Corner Markers */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-indigo-500 transition-colors duration-300" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-indigo-500 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-indigo-500 transition-colors duration-300" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-indigo-500 transition-colors duration-300" />

                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <CardHeader className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 rounded-sm bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-indigo-500 group-hover:bg-indigo-500/10 transition-all duration-300">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">
                      MOD_0{index + 1}
                    </span>
                  </div>
                  <CardTitle className="text-xl text-white font-mono tracking-wide group-hover:text-indigo-100 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">
                    {feature.subtitle}
                  </div>
                  <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">
                    {feature.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0 relative z-10">
                  {feature.visual}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Metric Strip */}
        <div className="metric-strip grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 max-w-7xl mx-auto mt-20 border border-white/10 opacity-1">
          {[
            { label: "Active Detectors", value: "07" },
            { label: "Uptime Guarantee", value: "99.9%" },
            { label: "ROI Multiplier", value: "4.2x" },
            { label: "Setup Time", value: "05m" },
          ].map((stat, i) => (
            <div
              key={i}
              className="metric-item bg-black p-8 text-center hover:bg-zinc-900/50 transition-colors group cursor-crosshair"
            >
              <div className="text-3xl font-bold text-white font-mono mb-2 group-hover:text-indigo-400 transition-colors">
                {stat.value}
              </div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
