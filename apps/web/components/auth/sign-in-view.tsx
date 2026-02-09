"use client";

import { SignInForm } from "@/components/auth/sign-in-form";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, ChevronLeft } from "lucide-react";

export function SignInView() {
  return (
    <div className="relative min-h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
      
      {/* Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none translate-y-1/2" />

      {/* Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-8 left-8 z-20"
      >
        <Link 
          href="/" 
          className="group flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono uppercase tracking-wider">Retour</span>
        </Link>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Logo / Brand Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-zinc-900/50 border border-white/10 backdrop-blur-md shadow-lg shadow-indigo-500/10">
            <div className="w-6 h-6 bg-indigo-500 rounded-sm" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Orylo<span className="text-zinc-600">.Terminal</span>
          </h1>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-2">
            Secure Access Portal
          </p>
        </div>

        {/* The Form */}
        <SignInForm />

        {/* Footer Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-zinc-600">
          <ShieldCheck className="w-4 h-4 text-indigo-500/50" />
          <span className="text-[10px] font-mono uppercase tracking-widest">
            End-to-end encrypted
          </span>
        </div>
      </motion.div>
    </div>
  );
}
