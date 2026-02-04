"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorks() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>(".step-item");
      const line = document.querySelector(".timeline-line");

      // Animate line height based on scroll
      gsap.fromTo(
        line,
        { height: "0%" },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: container.current,
            start: "top center",
            end: "bottom center",
            scrub: 1,
          },
        }
      );

      steps.forEach((step, i) => {
        gsap.fromTo(
          step,
          { opacity: 0.2, x: i % 2 === 0 ? -50 : 50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            scrollTrigger: {
              trigger: step,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        )
      });
    },
    { scope: container }
  );

  const steps = [
    {
      title: "Connexion",
      desc: "Connectez votre compte Stripe en un clic. Aucune modification de code requise pour commencer.",
    },
    {
      title: "Analyse",
      desc: "Chaque paiement est analysé par nos moteurs (Vélocité, IP, Trust Score) en temps réel.",
    },
    {
      title: "Décision",
      desc: "Orylo bloque les transactions frauduleuses avant qu'elles ne coûtent de l'argent. Vous gardez le contrôle total.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-black text-white overflow-hidden">
      <div ref={container} className="max-w-4xl mx-auto relative">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
          Simple comme <span className="text-indigo-500">1, 2, 3</span>
        </h2>

        {/* Central Line */}
        <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-[2px] bg-zinc-800 -translate-x-1/2">
          <div className="timeline-line w-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
        </div>

        <div className="space-y-12 md:space-y-24">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`step-item relative flex flex-col md:flex-row gap-8 md:gap-0 ${i % 2 !== 0 ? "md:flex-row-reverse" : ""
                } items-center`}
            >
              {/* Content Side */}
              <div className={`flex-1 pl-12 md:pl-0 ${i % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"
                }`}>
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm hover:border-indigo-500/30 transition-colors">
                  <h3 className="text-2xl font-bold mb-2 text-white">{step.title}</h3>
                  <p className="text-zinc-400">{step.desc}</p>
                </div>
              </div>

              {/* Center Node */}
              <div className="absolute left-[19px] md:left-1/2 -translate-x-1/2 top-[24px] md:top-1/2 md:-translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black border-4 border-zinc-800 z-10 shadow-xl">
                <div className="w-3 h-3 bg-indigo-500 rounded-full" />
              </div>

              {/* Empty Side for layout balance */}
              <div className="hidden md:block md:flex-1" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
