"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const container = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Mouse follow effect
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const x = clientX - container.current!.getBoundingClientRect().left;
        const y = clientY - container.current!.getBoundingClientRect().top;

        gsap.to(glowRef.current, {
          x,
          y,
          duration: 1.5,
          ease: "power2.out",
        });
      };

      window.addEventListener("mousemove", handleMouseMove);

      // Entrance Animations
      tl.fromTo(
        ".hero-badge",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8 }
      )
        .fromTo(
          ".char-reveal",
          { opacity: 0, y: 50, rotateX: -90 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            stagger: 0.02,
            duration: 1,
            ease: "back.out(1.7)",
          },
          "-=0.4"
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.6"
        )
        .fromTo(
          btnRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.6 },
          "-=0.4"
        );

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    },
    { scope: container }
  );

  const titleText = "La sécurité des paiements, réinventée.";

  return (
    <section
      ref={container}
      className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-black text-white px-6 py-24"
    >
      {/* Background Grid & Glow */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div
        ref={glowRef}
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-5xl text-center space-y-8">

        {/* Badge */}
        <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-white/10 backdrop-blur-md text-xs font-medium text-indigo-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Compatible avec Stripe & Adyen
        </div>

        {/* Main Title with Char Split */}
        <h1 ref={titleRef} className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1]">
          {titleText.split("").map((char, i) => (
            <span key={i} className="char-reveal inline-block origin-bottom">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p ref={subRef} className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          Orylo protège votre e-commerce contre la fraude en temps réel.{" "}
          <span className="text-white font-medium">Latence &lt;350ms</span>, zéro friction pour vos clients légitimes.
        </p>

        {/* Buttons */}
        <div ref={btnRef} className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
          <Link
            href="/dashboard"
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-white px-8 font-medium text-black transition-all hover:bg-zinc-200 hover:scale-105"
          >
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
              <div className="relative h-full w-8 bg-white/20" />
            </div>
            <span className="flex items-center gap-2">
              Commencer maintenant <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
          <Link
            href="#features"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-white/10 bg-zinc-900/50 px-8 font-medium text-white backdrop-blur-xl transition-all hover:bg-white/5"
          >
            Voir la démo
          </Link>
        </div>
      </div>

      {/* Decorative Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
    </section>
  );
}
