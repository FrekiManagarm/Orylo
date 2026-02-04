"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-2xl font-bold tracking-tighter mb-6 text-white flex items-center gap-2">
              <Image
                src="/orylo-logo.png"
                alt="Orylo Logo"
                width={24}
                height={24}
                className="rounded-lg"
              />
              Orylo
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-xs">
              La détection de fraude nouvelle génération pour Stripe. Protégez votre business et économisez sur les chargebacks.
            </p>
            <div className="flex items-center gap-4">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {[
            {
              title: "Produit",
              links: [
                { label: "Fonctionnalités", href: "/#features" },
                { label: "Tarifs", href: "/#pricing" },
                { label: "Documentation", href: "#" },
                { label: "Changelog", href: "#" }
              ]
            },
            {
              title: "Entreprise",
              links: [
                { label: "À propos", href: "/about" },
                { label: "Carrières", href: "#" },
                { label: "Blog", href: "#" },
                { label: "Contact", href: "/contact" }
              ]
            },
            {
              title: "Légal",
              links: [
                { label: "Confidentialité", href: "/privacy" },
                { label: "CGU", href: "/cgu" },
                { label: "Cookies", href: "#" }
              ]
            }
          ].map((column, idx) => (
            <div key={idx}>
              <h3 className="font-semibold text-white mb-6">{column.title}</h3>
              <ul className="space-y-4 text-sm text-zinc-400">
                {column.links.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="hover:text-indigo-400 transition-colors flex items-center gap-2 group">
                      {link.label}
                      <span className="w-0 h-0.5 bg-indigo-400 transition-all duration-300 group-hover:w-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Orylo Inc. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <span className="text-xs font-medium">Systèmes opérationnels</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
