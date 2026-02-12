"use client";

import { useState, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Terminal } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function RoiCalculator() {
  const container = useRef<HTMLDivElement>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(50000);
  const [chargebackRate, setChargebackRate] = useState(1.5);

  const lostRevenue = (monthlyRevenue * chargebackRate) / 100;
  const savings = lostRevenue * 0.8;

  useGSAP(
    () => {
      gsap.fromTo(
        ".calculator-container",
        { opacity: 0, y: 30, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container.current,
            start: "top 75%",
          },
        },
      );
    },
    { scope: container },
  );

  return (
    <section
      id="roi"
      ref={container}
      className="py-12 bg-black border-t border-white/5 relative overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="roi-content opacity-1">
          <div className="flex items-center gap-3 mb-12 justify-center">
            <Terminal className="text-indigo-500 h-6 w-6" />
            <h2 className="text-2xl font-mono text-white tracking-tight">
              REVENUE_RECOVERY_ESTIMATOR
            </h2>
          </div>

          <div className="calculator-container opacity-0 max-w-4xl mx-auto bg-zinc-900/30 border border-white/10 rounded-lg p-1 backdrop-blur-md">
            <div className="bg-black border border-white/5 rounded p-8 md:p-12 relative overflow-hidden">
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-size-[100%_4px] opacity-20 pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                {/* Input Side */}
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      Input: Monthly Revenue
                    </label>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-mono text-white">
                        {monthlyRevenue.toLocaleString()}
                      </span>
                      <span className="text-zinc-600 font-mono mb-1">EUR</span>
                    </div>
                    <Slider
                      value={[monthlyRevenue]}
                      onValueChange={(value) =>
                        setMonthlyRevenue(value[0] as number)
                      }
                      min={5000}
                      max={500000}
                      step={1000}
                      className="py-2"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      Input: Chargeback Rate
                    </label>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-mono text-red-400">
                        {chargebackRate}%
                      </span>
                    </div>
                    <Slider
                      value={[chargebackRate]}
                      onValueChange={(value) =>
                        setChargebackRate(value[0] as number)
                      }
                      min={0.1}
                      max={5}
                      step={0.1}
                      className="py-2"
                    />
                  </div>
                </div>

                {/* Output Side */}
                <div className="flex flex-col justify-center border-l border-white/10 pl-0 md:pl-16 space-y-8">
                  <div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                      Current Loss / Year
                    </div>
                    <div className="text-2xl font-mono text-red-500/70 line-through">
                      {(lostRevenue * 12).toLocaleString()} EUR
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                      Projected Savings
                    </div>

                    <div className="text-5xl md:text-6xl font-mono font-bold text-white text-glow">
                      0
                    </div>

                    <div className="text-zinc-500 font-mono text-xs mt-2">
                      EUR / YEAR RECOVERED
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
