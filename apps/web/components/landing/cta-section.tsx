"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  const container = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container.current,
            start: "top 70%",
          },
        }
      );
    },
    { scope: container }
  );

  return (
    <section ref={container} className="py-32 px-4 bg-black relative overflow-hidden flex flex-col items-center text-center border-t border-white/5">

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div ref={contentRef} className="relative z-10 max-w-4xl space-y-8 bg-zinc-900/50 border border-white/10 p-12 rounded-3xl backdrop-blur-xl opacity-0">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
          SECURE YOUR <br />
          <span className="text-indigo-400">REVENUE STREAM</span>
        </h2>

        <p className="text-xl text-zinc-400 font-light max-w-2xl mx-auto">
          Join the private beta. Stop losing money to card testing and chargebacks today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button
            render={<Link href="/auth/register">
              INITIALIZE_PROTECTION
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>}
            size="lg"
            className="h-14 px-8 text-lg bg-white text-black hover:bg-zinc-200 rounded-none font-mono tracking-widest"
          />
        </div>

        <p className="text-xs text-zinc-600 font-mono pt-4 uppercase tracking-widest">
          No credit card required • 5 min setup
        </p>
      </div>
    </section>
  );
}
