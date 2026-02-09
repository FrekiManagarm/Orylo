"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck, Zap } from "lucide-react";
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { TextScramble } from "@/components/ui/text-scramble";
import { cn } from "@/lib/utils";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Intro Animation Sequence
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 1. Initial State Set
    gsap.set(".hero-element", { autoAlpha: 0, y: 30 });
    gsap.set(dashboardRef.current, { 
      autoAlpha: 0, 
      rotationX: 45, 
      y: 100, 
      scale: 0.8 
    });

    // 2. Sequence
    tl.to(".bg-grid-white", { opacity: 0.05, duration: 2, ease: "power2.inOut" })
      .to(".hero-badge", { autoAlpha: 1, y: 0, duration: 0.8 }, "-=1.5")
      .to(".hero-title", { autoAlpha: 1, y: 0, duration: 0.1 }, "-=0.5") // Text is handled by Scramble component
      .to(".hero-desc", { autoAlpha: 1, y: 0, duration: 0.8 }, "+=0.2")
      .to(".hero-btn", { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, "-=0.6")
      .to(dashboardRef.current, {
        autoAlpha: 1,
        rotationX: 0,
        y: 0,
        scale: 1,
        duration: 1.5,
        ease: "expo.out",
      }, "-=1.0");

  }, { scope: containerRef });

  // 3D Tilt Logic (Vanilla JS for max performance)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dashboardRef.current) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate percentage (-1 to 1)
    const xPct = (x / rect.width - 0.5) * 2;
    const yPct = (y / rect.height - 0.5) * 2;

    gsap.to(dashboardRef.current, {
      rotationY: xPct * 5, // Limit rotation
      rotationX: -yPct * 5,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    if (!dashboardRef.current) return;
    gsap.to(dashboardRef.current, {
      rotationY: 0,
      rotationX: 0,
      duration: 1,
      ease: "elastic.out(1, 0.5)",
    });
  };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[110vh] flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden bg-black selection:bg-indigo-500/30"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-0" />
      <div className="absolute inset-0 bg-noise pointer-events-none opacity-20" />
      
      {/* Spotlight Effect behind text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none animate-pulse" />

      <div className="container relative z-10 mx-auto px-4 text-center perspective-[1000px]">
        
        {/* Floating Badge */}
        <div className="hero-element hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/50 border border-white/10 text-xs font-medium text-indigo-300 mb-8 backdrop-blur-md shadow-lg shadow-indigo-500/10 opacity-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Stripe Shield Active
        </div>

        {/* Massive Typography */}
        <h1
          ref={titleRef}
          className="hero-element hero-title text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-white mb-6 leading-[0.9] text-glow select-none opacity-0"
        >
          <div className="flex flex-col items-center">
            <span>FRAUD</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-200 to-zinc-600">
              <TextScramble duration={1.5} characterSet="01">ZERO.</TextScramble>
            </span>
          </div>
        </h1>

        <p className="hero-element hero-desc text-lg md:text-xl text-zinc-400 mb-10 max-w-xl mx-auto font-light opacity-0">
          The <span className="text-indigo-400 font-semibold">latency-free</span> protection layer for modern commerce. 
          Stop card testing before it hits your balance.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
          <div className="hero-element hero-btn opacity-0">
            <Button
              asChild
              size="lg"
              className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 h-12 text-sm font-bold uppercase tracking-wide shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-transform hover:scale-105"
            >
              <Link href="/auth/sign-up">
                Deploy Protection
              </Link>
            </Button>
          </div>
          <div className="hero-element hero-btn opacity-0 text-xs text-zinc-500 font-mono flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            SYSTEM OPERATIONAL
          </div>
        </div>

        {/* 3D Tilted Interface */}
        <div className="relative max-w-5xl mx-auto" style={{ perspective: "2000px" }}>
          <div 
            ref={dashboardRef}
            className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[2.35/1] group opacity-0 will-change-transform"
          >
            
            {/* Glossy Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-20" />
            
            {/* UI Content - Abstract Radar */}
            <div className="absolute inset-0 flex items-center justify-center">
              
              {/* Grid Lines moving */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 animate-grid-flow" />

              {/* Central Radar */}
              <div className="relative w-64 h-64 z-10">
                 <div className="absolute inset-0 border border-indigo-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                 <div className="absolute inset-4 border border-indigo-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                 <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-xl" />
                 
                 {/* Scanning Beam */}
                 <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-indigo-500/20 to-transparent w-[2px] h-full left-1/2 -translate-x-1/2 animate-[spin_2s_linear_infinite]" />
                 
                 {/* Center Icon */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-indigo-500 text-indigo-400 p-4 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                    <ShieldCheck className="h-8 w-8" />
                 </div>
              </div>

              {/* Floating Data Points */}
              <FloatingCard 
                 className="absolute left-[10%] top-[20%]" 
                 label="THREAT BLOCKED" 
                 value="IP MISMATCH" 
                 color="text-red-500"
                 delay={0.5}
              />
              <FloatingCard 
                 className="absolute right-[10%] bottom-[20%]" 
                 label="TRUST SCORE" 
                 value="98/100" 
                 color="text-green-500"
                 delay={0.8}
              />
               <FloatingCard 
                 className="absolute left-[20%] bottom-[10%]" 
                 label="VELOCITY" 
                 value="NORMAL" 
                 color="text-indigo-400"
                 delay={1.1}
              />

            </div>
            
            {/* Bottom Bar UI */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-black/60 border-t border-white/10 flex items-center px-4 justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest z-30">
               <div className="flex gap-4">
                  <span>LATENCY: 32ms</span>
                  <span>STATUS: ACTIVE</span>
               </div>
               <div className="flex gap-2">
                  <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                  <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                  <span className="w-1 h-1 bg-zinc-500 rounded-full" />
               </div>
            </div>
          </div>
          
          {/* Depth Shadow */}
          <div className="absolute -bottom-10 left-10 right-10 h-20 bg-indigo-500/20 blur-[60px] -z-10 rounded-full opacity-50" />
        </div>
      </div>
    </section>
  );
}

function FloatingCard({ className, label, value, color, delay }: { className: string, label: string, value: string, color: string, delay: number }) {
  const cardRef = useRef(null);

  useGSAP(() => {
    gsap.from(cardRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      delay: 2 + delay, // Start after main anims
      ease: "back.out(1.7)"
    });
  }, { scope: cardRef });

  return (
    <div 
      ref={cardRef}
      className={cn(
        "px-4 py-2 bg-black/80 border border-white/10 backdrop-blur-md rounded-sm shadow-xl",
        "flex flex-col gap-0.5",
        "transform hover:scale-110 transition-transform cursor-crosshair hover:border-indigo-500/50 hover:bg-zinc-900",
        className
      )}
    >
      <span className="text-[9px] text-zinc-500 font-mono tracking-wider">{label}</span>
      <span className={cn("text-xs font-bold font-mono", color)}>{value}</span>
    </div>
  )
}
