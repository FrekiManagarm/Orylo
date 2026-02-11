"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    },
    { scope: container }
  );

  const steps = [
    {
      title: "Connect",
      desc: "Connect your Stripe account in one click. No code changes required to get started.",
    },
    {
      title: "Analyze",
      desc: "Every payment is analyzed by our engines (Velocity, IP, Trust Score) in real time.",
    },
    {
      title: "Decide",
      desc: "Orylo blocks fraudulent transactions before they cost you money. You keep full control.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-12 bg-black border-t border-white/10 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

      <div ref={container} className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header: titre et description sans ligne */}
          <div className="text-center mb-20">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">
              DEPLOYMENT_FLOW
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">
              As easy as <span className="text-indigo-500">1, 2, 3</span>
            </h2>
            <p className="text-zinc-400 text-lg mt-4 max-w-xl mx-auto">
              Stripe connection, real-time analysis, one-click decisions.
            </p>
          </div>

          {/* Bloc timeline : la ligne ne couvre que cette zone (en dessous du titre) */}
          <div className="relative">
            {/* Ligne centrale (track + fill animé) */}
            <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2">
              <div className="absolute inset-0 w-full bg-white/10" />
              <div className="timeline-line absolute top-0 left-0 w-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            </div>

            <div className="space-y-12 md:space-y-24 relative">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`step-item relative flex flex-col md:flex-row gap-8 md:gap-0 ${i % 2 !== 0 ? "md:flex-row-reverse" : ""
                    } items-center`}
                >
                  {/* Content Side */}
                  <div
                    className={`flex-1 pl-12 md:pl-0 ${i % 2 === 0
                      ? "md:pr-16 md:text-right"
                      : "md:pl-16 md:text-left"
                      }`}
                  >
                    <div className="group p-6 rounded-lg bg-black/40 border border-white/10 backdrop-blur-sm hover:border-indigo-500/50 transition-all duration-300 relative overflow-hidden">
                      {/* Corner markers */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-indigo-500 transition-colors" />
                      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-indigo-500 transition-colors" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-indigo-500 transition-colors" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-indigo-500 transition-colors" />
                      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                        STEP_0{i + 1}
                      </span>
                      <h3 className="text-xl font-bold font-mono text-white mt-2 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-zinc-500 text-sm leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className="absolute left-[19px] md:left-1/2 -translate-x-1/2 top-[24px] md:top-1/2 md:-translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black border-2 border-white/10 z-10 shadow-xl ring-2 ring-black">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                  </div>

                  {/* Empty Side for layout balance */}
                  <div className="hidden md:block md:flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
