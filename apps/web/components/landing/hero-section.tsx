"use client";

import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import React, { useRef } from "react";
import { cn } from "@/lib/utils";

export default function HeroSection() {
  // 3D Tilt Logic
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section
      className="relative min-h-[110vh] flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden bg-black selection:bg-indigo-500/30"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={ref}
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="absolute inset-0 bg-noise pointer-events-none opacity-20" />

      {/* Spotlight Effect behind text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none animate-pulse" />

      <div className="container relative z-10 mx-auto px-4 text-center perspective-[1000px]">
        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/50 border border-white/10 text-xs font-medium text-indigo-300 mb-8 backdrop-blur-md shadow-lg shadow-indigo-500/10"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Stripe Shield Active
        </motion.div>

        {/* Massive Typography */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-white mb-6 leading-[0.9] text-glow select-none"
        >
          FRAUD <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-200 to-zinc-600">
            ZERO.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 mb-10 max-w-xl mx-auto font-light"
        >
          The{" "}
          <span className="text-indigo-400 font-semibold">latency-free</span>{" "}
          protection layer for modern commerce. Stop card testing before it hits
          your balance.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
        >
          <Button
            render={<Link href="/auth/sign-up">Deploy Protection</Link>}
            size="lg"
            className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 h-12 text-sm font-bold uppercase tracking-wide shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-transform hover:scale-105"
          />
          <div className="text-xs text-zinc-500 font-mono flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            SYSTEM OPERATIONAL
          </div>
        </motion.div>

        {/* 3D Tilted Interface */}
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[2.35/1] group">
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
                delay={0}
              />
              <FloatingCard
                className="absolute right-[10%] bottom-[20%]"
                label="TRUST SCORE"
                value="98/100"
                color="text-green-500"
                delay={1}
              />
              <FloatingCard
                className="absolute left-[20%] bottom-[10%]"
                label="VELOCITY"
                value="NORMAL"
                color="text-indigo-400"
                delay={2}
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
        </motion.div>
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + delay * 0.2, duration: 0.5 }}
      className={cn(
        "px-4 py-2 bg-black/80 border border-white/10 backdrop-blur-md rounded-sm shadow-xl",
        "flex flex-col gap-0.5",
        "transform hover:scale-110 transition-transform cursor-crosshair",
        className,
      )}
    >
      <span className="text-[9px] text-zinc-500 font-mono tracking-wider">
        {label}
      </span>
      <span className={cn("text-xs font-bold font-mono", color)}>{value}</span>
    </motion.div>
  );
}
