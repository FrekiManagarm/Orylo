"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <div className="fixed top-6 inset-x-0 max-w-2xl mx-auto z-50 px-4">
      <motion.nav
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: -100, opacity: 0 },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={cn(
          "relative flex items-center justify-between px-6 py-3 rounded-full",
          "bg-zinc-900/80 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/50",
          "transition-all duration-300 hover:border-indigo-500/30 hover:shadow-indigo-500/10"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-6 w-6 rounded bg-indigo-500 flex items-center justify-center group-hover:bg-indigo-400 transition-colors shadow-[0_0_10px_rgba(99,102,241,0.5)]">
            <span className="text-white font-bold text-[10px]">O</span>
          </div>
          <span className="text-white font-bold text-sm tracking-wide">
            Orylo
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6">
          {["Features", "ROI", "Pricing"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors uppercase tracking-wider"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-xs font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block"
          >
            Login
          </Link>
          <Button
            asChild
            size="sm"
            className="bg-white text-black hover:bg-zinc-200 rounded-full text-xs font-semibold px-4 h-8"
          >
            <Link href="/sign-up">Start Free</Link>
          </Button>
        </div>
      </motion.nav>
    </div>
  );
}
