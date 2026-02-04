"use client";

import { useScroll } from "framer-motion";
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
    <header
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
              width={24}
              height={24}
              className="rounded-lg"
            />
            Orylo
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Fonctionnalités", href: "/#features" },
              { label: "Tarifs", href: "/#pricing" },
              { label: "À propos", href: "/about" },
              { label: "Blog", href: "/blog" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block"
            >
              Connexion
            </Link>
            <Button
              className="rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg shadow-white/10"
              asChild
            >
              <Link href="/sign-up">Essayer gratuitement</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
