"use client";

import { motion } from "framer-motion";
import { ArrowRight, CreditCard, Eye, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Cta() {
  return (
    <section className="py-32 relative overflow-hidden bg-black">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-[2.5rem] overflow-hidden bg-zinc-900/50 border border-white/10 backdrop-blur-xl px-6 py-20 text-center md:px-20 md:py-32"
        >
          {/* Background Gradients */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-linear-to-b from-indigo-500/20 via-purple-500/10 to-transparent opacity-50" />
            <div className="absolute -top-100 left-1/2 -translate-x-1/2 w-200 h-200 bg-indigo-500/20 rounded-full blur-[120px] opacity-40 pointer-events-none" />
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight max-w-4xl mx-auto">
            Stop card testing <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400">
              attacks today
            </span>
          </h2>

          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Protect your Stripe account from card testing fraud.
            Visual explanations for every blocked transaction.
            Setup in 5 minutes.
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <CreditCard className="h-4 w-4 text-rose-400" />
              <span className="text-zinc-300 text-sm">Card Testing Detection</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Eye className="h-4 w-4 text-purple-400" />
              <span className="text-zinc-300 text-sm">Visual Explanations</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span className="text-zinc-300 text-sm">Auto-Refund & Blacklist</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-lg bg-white text-black hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-xl shadow-white/10"
            >
              <Link href="/sign-up" className="flex items-center space-x-2">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 py-6 text-lg bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-md transition-all duration-300"
            >
              <Link href="/contact">
                Contact Sales
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
