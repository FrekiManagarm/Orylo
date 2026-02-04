"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

const partners = [
  "Stripe",
  "Shopify",
  "WooCommerce",
  "PrestaShop",
  "Adyen",
  "Magento",
  "Salesforce",
  "BigCommerce",
];

export default function InfiniteTicker() {
  const container = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!scroller.current) return;

      const scrollerContent = Array.from(scroller.current.children);

      // Duplicate content for infinite loop
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        scroller.current?.appendChild(duplicatedItem);
      });

      gsap.to(scroller.current, {
        x: "-50%",
        duration: 20,
        ease: "none",
        repeat: -1,
      });
    },
    { scope: container }
  );

  return (
    <div ref={container} className="w-full py-12 bg-black border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
        <p className="text-sm text-zinc-500 uppercase tracking-widest font-medium">S'intègre parfaitement avec</p>
      </div>
      <div className="relative w-full overflow-hidden mask-fade-sides">
        <div ref={scroller} className="flex gap-16 w-max items-center whitespace-nowrap px-4">
          {partners.map((partner, i) => (
            <span
              key={i}
              className="text-2xl font-bold text-zinc-700 uppercase tracking-tight hover:text-indigo-500/50 transition-colors cursor-default"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>
      <style jsx>{`
        .mask-fade-sides {
          mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
        }
      `}</style>
    </div>
  );
}
