"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Network,
  Eye,
  Target,
  Shield,
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    id: "real-protection",
    title: "Real Protection",
    description:
      "Detect and block 95%+ of card testing attacks. Where Stripe Radar lets 30% of fraud slip through, Orylo acts with precision.",
    icon: Shield,
    stat: "95%+",
    statLabel: "detection rate",
    gradient: "from-rose-500 to-orange-500",
    bgGradient: "from-rose-500/20 via-rose-500/5 to-transparent",
    shadowColor: "shadow-rose-500/20",
    tags: ["Anti-Card Testing", "Auto-refund", "Blacklist"],
  },
  {
    id: "collective-intelligence",
    title: "Collective Intelligence",
    description:
      "A fraudster detected on one merchant is instantly blocked for everyone. Benefit from the network's protection.",
    icon: Network,
    stat: "100+",
    statLabel: "connected merchants",
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-500/20 via-violet-500/5 to-transparent",
    shadowColor: "shadow-violet-500/20",
  },
  {
    id: "explainable",
    title: "Visual Explanations",
    description:
      "No more black boxes. Every block is justified with a clear, visual explanation. Understand exactly why a transaction was declined.",
    icon: Eye,
    stat: "100%",
    statLabel: "transparency",
    gradient: "from-purple-500 to-fuchsia-500",
    bgGradient: "from-purple-500/20 via-purple-500/5 to-transparent",
    shadowColor: "shadow-purple-500/20",
    example: '"3 different cards used • fail-fail-fail-success pattern • 5 attempts in 2 minutes"',
  },
  {
    id: "custom-rules",
    title: "Empathy & Control",
    description:
      "Your business is unique. Create your own rules: whitelist your VIPs, block specific countries, set custom thresholds.",
    icon: Target,
    stat: "∞",
    statLabel: "flexibility",
    gradient: "from-indigo-500 to-blue-500",
    bgGradient: "from-indigo-500/20 via-indigo-500/5 to-transparent",
    shadowColor: "shadow-indigo-500/20",
    tags: ["Custom Rules", "Whitelist", "Geo-blocking"],
  },
  {
    id: "setup",
    title: "Live in 5 minutes",
    description:
      "One-click Stripe OAuth connection. Zero code required. Start protecting your account immediately.",
    icon: Zap,
    stat: "5",
    statLabel: "min to start",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    shadowColor: "shadow-emerald-500/20",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-32 relative overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top, var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] -translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-indigo-500/20 bg-indigo-500/10"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-400">
              Simple & Effective
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight"
          >
            Stop card testing.
            <br />
            <span className="bg-linear-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              Understand why.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto"
          >
            AI-powered detection with visual explanations.
            See exactly why every transaction was blocked.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {/* Feature 1 - Real Protection - Large */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 group"
          >
            <div className="relative h-full min-h-80 rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl overflow-hidden p-8 hover:border-rose-500/30 transition-all duration-500">
              <div
                className={`absolute inset-0 bg-linear-to-br ${features[0].bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br ${features[0].gradient} mb-6 shadow-lg shadow-rose-500/20`}
                  >
                    <Shield className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    {features[0].title}
                  </h3>
                  <p className="text-zinc-400 text-lg max-w-md">
                    {features[0].description}
                  </p>
                </div>

                <div className="flex items-end justify-between mt-8">
                  <div className="flex flex-wrap items-center gap-2">
                    {features[0].tags?.map((tag) => (
                      <div key={tag} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                        <span className="text-rose-400 font-medium text-xs">
                          {tag}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-3xl md:text-4xl font-black bg-linear-to-r ${features[0].gradient} bg-clip-text text-transparent`}
                    >
                      {features[0].stat}
                    </div>
                    <div className="text-zinc-500 text-sm font-medium">
                      {features[0].statLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 2 - Collective Intelligence - Small */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group"
          >
            <div className="relative h-full min-h-80 rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl overflow-hidden p-8 hover:border-violet-500/30 transition-all duration-500">
              <div
                className={`absolute inset-0 bg-linear-to-br ${features[1].bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br ${features[1].gradient} mb-6 shadow-lg shadow-violet-500/20`}
                  >
                    <Network className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {features[1].title}
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    {features[1].description}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <Users className="w-5 h-5 text-violet-400" />
                  <span
                    className={`text-3xl font-black bg-linear-to-r ${features[1].gradient} bg-clip-text text-transparent`}
                  >
                    {features[1].stat}
                  </span>
                  <span className="text-zinc-500 text-sm">
                    {features[1].statLabel}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 3 - Visual Explanations - Full width */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3 group"
          >
            <div className="relative h-full min-h-70 rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl overflow-hidden p-8 hover:border-purple-500/30 transition-all duration-500">
              <div
                className={`absolute inset-0 bg-linear-to-br ${features[2].bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10 h-full flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                <div className="flex-1">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br ${features[2].gradient} mb-6 shadow-lg shadow-purple-500/20`}
                  >
                    <Eye className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    {features[2].title}
                  </h3>
                  <p className="text-zinc-400 text-lg max-w-xl">
                    {features[2].description}
                  </p>
                </div>

                {/* Example explanation */}
                <div className="shrink-0 md:max-w-sm">
                  <div className="rounded-2xl bg-black/50 border border-purple-500/10 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                        Card Testing Blocked
                      </span>
                    </div>
                    <p className="text-white font-mono text-sm leading-relaxed">
                      {features[2].example}
                    </p>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                      <div
                        className={`text-xs font-bold bg-linear-to-r ${features[2].gradient} bg-clip-text text-transparent`}
                      >
                        Score: 85/100 → Auto-refund
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 4 - Custom Rules - Medium */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2 group"
          >
            <div className="relative h-full min-h-70 rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl overflow-hidden p-8 hover:border-indigo-500/30 transition-all duration-500">
              <div
                className={`absolute inset-0 bg-linear-to-br ${features[3].bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br ${features[3].gradient} mb-6 shadow-lg shadow-indigo-500/20`}
                  >
                    <Target className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">
                    {features[3].title}
                  </h3>
                  <p className="text-zinc-400 text-lg max-w-md">
                    {features[3].description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-6">
                  {features[3].tags?.map((tag) => (
                    <div key={tag} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                      <span className="text-indigo-400 font-medium text-xs">
                        {tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 5 - Setup - Small */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="group"
          >
            <div className="relative h-full min-h-70 rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl overflow-hidden p-8 hover:border-emerald-500/30 transition-all duration-500">
              <div
                className={`absolute inset-0 bg-linear-to-br ${features[4].bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br ${features[4].gradient} mb-6 shadow-lg shadow-emerald-500/20`}
                  >
                    <Zap className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {features[4].title}
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    {features[4].description}
                  </p>
                </div>

                <div className="mt-6">
                  <div
                    className={`text-3xl font-black bg-linear-to-r ${features[4].gradient} bg-clip-text text-transparent`}
                  >
                    {features[4].stat}
                  </div>
                  <div className="text-zinc-500 text-sm">
                    {features[4].statLabel}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-16"
        >
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-colors group"
          >
            View Pricing
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
