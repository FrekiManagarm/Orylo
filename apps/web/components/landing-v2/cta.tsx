"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);
import { ArrowRight } from "lucide-react";

export default function CTA() {
  const container = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
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
    <section ref={container} className="py-32 px-6 bg-black relative overflow-hidden flex flex-col items-center text-center border-t border-white/5">

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-8">
        <h2 ref={titleRef} className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
          Arrêtez de perdre de l'argent. <br />
          <span className="text-indigo-400">Commencez maintenant.</span>
        </h2>

        <p className="text-xl text-zinc-400">
          Rejoignez les e-commerçants qui sécurisent leur chiffre d'affaires avec Orylo.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link
            href="/auth/register"
            className="group inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-lg font-bold text-black transition-transform hover:scale-105"
          >
            Créer un compte gratuit
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <p className="text-sm text-zinc-500 pt-4">
          Aucune carte bancaire requise pour le test. Intégration en 5 minutes.
        </p>
      </div>
    </section>
  );
}
