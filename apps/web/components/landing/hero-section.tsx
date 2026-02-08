"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function HeroSection() {
  const container = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Entrance
      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8 }
      )
        .fromTo(
          titleRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 1 },
          "-=0.6"
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.8"
        )
        .fromTo(
          btnRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.6"
        )
        .fromTo(
          tiltRef.current,
          { opacity: 0, rotateX: 20, z: -100 },
          { opacity: 1, rotateX: 0, z: 0, duration: 1.2, ease: "back.out(1.2)" },
          "-=0.8"
        );

      // Mouse Tilt Effect
      const handleMouseMove = (e: MouseEvent) => {
        if (!tiltRef.current) return;

        const rect = container.current?.getBoundingClientRect();
        if (!rect) return;

        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(tiltRef.current, {
          rotateY: x * 15,
          rotateX: -y * 15,
          duration: 0.5,
          ease: "power1.out",
          transformPerspective: 1000,
        });
      };

      const handleMouseLeave = () => {
        gsap.to(tiltRef.current, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.5,
          ease: "power1.out",
        });
      };

      container.current?.addEventListener("mousemove", handleMouseMove);
      container.current?.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        container.current?.removeEventListener("mousemove", handleMouseMove);
        container.current?.removeEventListener("mouseleave", handleMouseLeave);
      };
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="relative min-h-[110vh] flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden bg-black selection:bg-indigo-500/30"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-grid-white/[0.02] mask-image-radial-gradient-ellipse-at-center-transparent-20%-black" />
      <div className="absolute inset-0 bg-noise pointer-events-none opacity-20" />

      {/* Spotlight Effect behind text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none animate-pulse" />

      <div className="container relative z-10 mx-auto px-4 text-center perspective-[1000px]">
        {/* Floating Badge */}
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/50 border border-white/10 text-xs font-medium text-indigo-300 mb-8 backdrop-blur-md shadow-lg shadow-indigo-500/10 opacity-0"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span className="font-mono tracking-wider">SYSTEM_STATUS: NOMINAL</span>
        </div>

        {/* Massive Typography */}
        <h1
          ref={titleRef}
          className="text-7xl md:text-9xl lg:text-[10rem] font-extrabold tracking-tighter text-white mb-8 leading-[0.85] text-glow select-none opacity-0"
        >
          FRAUD <br />
          <span className="text-transparent bg-clip-text bg-linear-to-b from-white via-zinc-200 to-zinc-600 relative">
            ZERO
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-zinc-400 mb-12 max-w-xl mx-auto font-light opacity-0 leading-relaxed"
        >
          The <span className="text-indigo-400 font-semibold">latency-free</span>{" "}
          protection layer for modern commerce. Stop card testing and chargebacks
          before they hit your balance.
        </p>

        {/* Buttons */}
        <div
          ref={btnRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24 opacity-0"
        >
          <Button
            render={<Link href="/auth/register">Deploy Protection</Link>}
            size="lg"
            className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 h-12 text-sm font-bold uppercase tracking-wide shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-transform hover:scale-105"
          />
          <div className="text-xs text-zinc-500 font-mono flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            SYSTEM OPERATIONAL
          </div>
        </div>

        {/* 3D Tilted Interface */}
        <div
          ref={tiltRef}
          className="relative max-w-5xl mx-auto opacity-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden aspect-video md:aspect-[2.35/1] group">
            {/* Glossy Reflection */}
            <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent pointer-events-none z-20" />

            {/* UI Content - Abstract Radar */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Grid Lines moving */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[40px_40px] opacity-20 animate-grid-flow" />

              {/* Scanning Line */}
              <div className="absolute inset-0 w-full h-[2px] bg-indigo-500/30 blur-sm animate-[scan_4s_linear_infinite]" />

              {/* Central Radar */}
              <div className="relative w-64 h-64 z-10">
                <div className="absolute inset-0 border border-indigo-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-4 border border-indigo-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-xl" />

                {/* Inner Data Rings */}
                <div className="absolute inset-12 border border-dashed border-indigo-500/20 rounded-full opacity-50" />
                <div className="absolute inset-20 border border-indigo-500/40 rounded-full opacity-30" />

                {/* Scanning Beam */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-indigo-500/20 to-transparent w-[2px] h-full left-1/2 -translate-x-1/2 animate-[spin_2s_linear_infinite]" />

                {/* Center Icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-indigo-500 text-indigo-400 p-4 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.4)] z-20">
                  <ShieldCheck className="h-8 w-8" />
                </div>
              </div>

              {/* Floating Data Points */}
              <FloatingCard
                className="absolute left-[10%] top-[20%]"
                label="THREAT BLOCKED"
                value="IP MISMATCH [CN]"
                color="text-red-500"
                delay={0}
              />
              <FloatingCard
                className="absolute right-[10%] bottom-[20%]"
                label="TRUST SCORE"
                value="98/100 [HIGH]"
                color="text-green-500"
                delay={1}
              />
              <FloatingCard
                className="absolute left-[20%] bottom-[10%]"
                label="VELOCITY"
                value="NORMAL [12tx/h]"
                color="text-indigo-400"
                delay={2}
              />
              <FloatingCard
                className="absolute right-[15%] top-[15%]"
                label="DEVICE FINGERPRINT"
                value="MATCHED [iOS]"
                color="text-indigo-300"
                delay={3}
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
          <div className="absolute -bottom-10 left-10 right-10 h-20 bg-indigo-500/20 blur-[60px] -z-10 rounded-full" />
        </div>
      </div>
    </section>
  );
}
function FloatingCard({
  className,
  label,
  value,
  color,
  delay,
}: {
  className: string;
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, delay: 1.5 + delay * 0.2, duration: 0.5 }
    )
  }, { scope: cardRef });

  return (
    <div
      ref={cardRef}
      className={cn(
        "px-4 py-2 bg-black/90 border border-white/10 backdrop-blur-md rounded-sm shadow-2xl",
        "flex flex-col gap-1 opacity-0 min-w-[140px]",
        "transform hover:scale-105 transition-all duration-300 cursor-crosshair hover:border-indigo-500/50",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", color.replace('text-', 'bg-'))} />
        <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">
          {label}
        </span>
      </div>
      <span className={cn("text-xs font-bold font-mono tracking-tight", color)}>{value}</span>
    </div>
  );
}

