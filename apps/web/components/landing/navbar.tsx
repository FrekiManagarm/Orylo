"use client";

import { motion, useScroll } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "py-4" : "py-6",
      )}
    >
      <div className="container mx-auto px-4">
        <nav
          className={cn(
            "mx-auto max-w-5xl rounded-full border transition-all duration-300 px-6 py-3 flex items-center justify-between backdrop-blur-xl",
            isScrolled
              ? "bg-zinc-900/70 border-white/10 shadow-lg shadow-black/20"
              : "bg-transparent border-transparent",
          )}
        >
          <Link
            href="/"
            className="text-xl font-bold tracking-tighter text-white flex items-center gap-3"
          >
            <Image
              src="/orylo-logo.png"
              alt="Orylo Logo"
              width={100}
              height={100}
              className="rounded-lg flex items-center justify-center w-6 h-6"
            />
            Orylo
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Features", href: "/#features" },
              { label: "Pricing", href: "/#pricing" },
              { label: "About", href: "/about" },
              { label: "Blog", href: "/blog" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block"
            >
              Log in
            </Link>
            <Button
              className="rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg shadow-white/10"
            >
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
