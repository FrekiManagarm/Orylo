"use client";

import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: "HOW_DOES_INTEGRATION_WORK?",
    answer: "Orylo connects via Stripe Connect (OAuth). No code changes required. We listen to payment webhooks in read-only mode to analyze transactions.",
  },
  {
    question: "LATENCY_IMPACT?",
    answer: "Zero. Analysis happens asynchronously via webhooks. Your customer's checkout experience remains untouched.",
  },
  {
    question: "DATA_PRIVACY?",
    answer: "We never store raw card numbers. All data is encrypted AES-256 and stored in EU regions. GDPR compliant by design.",
  },
  {
    question: "BETA_PRICING?",
    answer: "Full access is 100% free during the private beta period. Early adopters lock in a discount for the Pro plan later.",
  },
  {
    question: "CANCELLATION_POLICY?",
    answer: "Revoke access anytime via the dashboard or your Stripe settings. No lock-in.",
  },
];

export default function FAQSection() {
  const container = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>(".faq-item");

      gsap.fromTo(
        items,
        {
          y: 20,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          scrollTrigger: {
            trigger: container.current,
            start: "top 80%",
          },
        }
      );
    },
    { scope: container }
  );

  return (
    <section className="py-12 bg-black border-t border-white/5">
      <div ref={container} className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-16 text-center tracking-tighter">
          SYSTEM <span className="text-zinc-600">FAQ</span>
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="faq-item rounded border border-white/10 bg-zinc-900/30 overflow-hidden opacity-0"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex items-center justify-between w-full p-6 text-left hover:bg-white/5 transition-colors group"
              >
                <span className="text-base md:text-lg font-mono text-zinc-300 group-hover:text-white transition-colors">
                  <span className="text-indigo-500 mr-4">0{i + 1}.</span>
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-zinc-500 transition-transform duration-300",
                    openIndex === i && "rotate-180 text-indigo-400"
                  )}
                />
              </button>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out bg-black/50",
                  openIndex === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="p-6 pt-2 border-t border-white/5">
                  <div className="font-mono text-xs text-zinc-600 mb-2">{">"} RESPONSE_LOG:</div>
                  <p className="text-zinc-400 leading-relaxed text-sm">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
