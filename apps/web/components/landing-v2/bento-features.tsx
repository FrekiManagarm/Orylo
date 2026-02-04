"use client";

import React, { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, Shield, Brain, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

// --- Micro-Components for Visualizations ---

const LatencyVisual = () => {
  const [ms, setMs] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMs((prev) => (prev < 340 ? prev + 12 : 342));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute right-4 bottom-4 flex items-end gap-2 p-4 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
      <div className="flex flex-col items-end">
        <span className="text-3xl font-mono font-bold text-amber-500">{ms}ms</span>
        <span className="text-xs text-zinc-500 uppercase tracking-wider">Latency P95</span>
      </div>
      <div className="flex gap-1 h-8 items-end">
        {[40, 60, 30, 80, 50, 90, 20].map((h, i) => (
          <div
            key={i}
            className="w-1 bg-amber-500/50 rounded-full animate-pulse"
            style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
};

const NetworkVisual = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-30">
      <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="4" className="fill-indigo-500 animate-pulse" />
        <circle cx="150" cy="80" r="4" className="fill-purple-500 animate-pulse" style={{ animationDelay: "1s" }} />
        <circle cx="100" cy="150" r="4" className="fill-indigo-400 animate-pulse" style={{ animationDelay: "0.5s" }} />

        <path d="M50 50 L150 80" stroke="url(#grad1)" strokeWidth="1" className="animate-[dash_3s_linear_infinite]" strokeDasharray="5" />
        <path d="M150 80 L100 150" stroke="url(#grad1)" strokeWidth="1" className="animate-[dash_3s_linear_infinite]" strokeDasharray="5" />
        <path d="M100 150 L50 50" stroke="url(#grad1)" strokeWidth="1" className="animate-[dash_3s_linear_infinite]" strokeDasharray="5" />

        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

const EncryptionVisual = () => {
  return (
    <div className="absolute bottom-4 right-4 bg-emerald-950/30 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-xs font-mono text-emerald-400">AES-256 ENCRYPTED</span>
    </div>
  )
}

const TrustScoreVisual = () => {
  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-zinc-800 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke="#3b82f6"
          strokeWidth="8"
          strokeDasharray="251.2"
          strokeDashoffset="20" // 92% filled
          strokeLinecap="round"
          className="drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />
      </svg>
      <div className="text-center">
        <div className="text-3xl font-bold text-white">92</div>
        <div className="text-[10px] text-blue-400 font-medium tracking-widest uppercase">TRUST</div>
      </div>
    </div>
  )
}


const features = [
  {
    title: "Vitesse Supersonique",
    description: "Analyse complète en moins de 350ms. Vos clients ne remarqueront rien, les fraudeurs seront stoppés net.",
    icon: Zap,
    className: "md:col-span-2 min-h-[300px]",
    gradient: "from-amber-500/20 to-orange-600/20",
    visual: <LatencyVisual />,
  },
  {
    title: "IA Prédictive",
    description: "Nos modèles apprennent de chaque tentative de fraude pour s'adapter aux nouvelles menaces.",
    icon: Brain,
    className: "md:col-span-1 min-h-[300px]",
    gradient: "from-indigo-500/20 to-purple-600/20",
    visual: <NetworkVisual />,
  },
  {
    title: "Confidentialité Totale",
    description: "Données chiffrées et conformité GDPR. Nous ne stockons jamais les numéros de carte.",
    icon: Lock,
    className: "md:col-span-1 min-h-[300px]",
    gradient: "from-emerald-500/20 to-teal-600/20",
    visual: <EncryptionVisual />,
  },
  {
    title: "Score de Confiance",
    description: "Chaque client obtient un trust score évolutif basé sur son historique d'achats.",
    icon: Shield,
    className: "md:col-span-2 min-h-[300px]",
    gradient: "from-blue-500/20 to-cyan-600/20",
    visual: <TrustScoreVisual />,
  },
];

export default function BentoFeatures() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".bento-card");

      gsap.fromTo(
        cards,
        {
          y: 50,
          opacity: 0,
          scale: 0.95
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { scope: container }
  );

  return (
    <section id="features" className="py-24 px-6 bg-black relative">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Une protection <span className="text-indigo-500">intégrale</span>.
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Orylo combine 7 détecteurs de fraude exécutés en parallèle pour une précision chirurgicale.
          </p>
        </div>

        <div ref={container} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={cn(
                "bento-card group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/40 p-8 backdrop-blur-md transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10",
                feature.className
              )}
            >
              {/* Hover Gradient */}
              <div
                className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br pointer-events-none",
                  feature.gradient
                )}
              />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex p-3 rounded-xl bg-white/5 text-white mb-4 border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/20">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors max-w-[80%]">
                    {feature.description}
                  </p>
                </div>

                {/* Feature Visual */}
                {feature.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
