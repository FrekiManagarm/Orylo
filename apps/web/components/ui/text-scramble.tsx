"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface TextScrambleProps {
  children: string;
  className?: string;
  duration?: number;
  speed?: number;
  characterSet?: string;
  trigger?: boolean;
}

const DEFAULT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?";

export function TextScramble({
  children,
  className,
  duration = 1,
  speed = 0.05,
  characterSet = DEFAULT_CHARS,
  trigger = true,
}: TextScrambleProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(children);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (!trigger || !elementRef.current || isAnimating.current) return;

    isAnimating.current = true;
    const originalText = children;
    const length = originalText.length;
    const scrambleDuration = duration;
    
    let startTime = Date.now();
    
    // Create a GSAP ticker for performant animation loop
    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / scrambleDuration, 1);
      
      // Calculate how many characters should be revealed based on progress
      // We use a easeOutQuart equivalent for the reveal curve
      const revealProgress = 1 - Math.pow(1 - progress, 4); 
      const charsRevealed = Math.floor(revealProgress * length);
      
      let newText = "";
      
      for (let i = 0; i < length; i++) {
        if (i < charsRevealed) {
          newText += originalText[i];
        } else {
          // Random character for the rest
          newText += characterSet[Math.floor(Math.random() * characterSet.length)];
        }
      }
      
      setText(newText);
      
      if (progress < 1) {
        gsap.ticker.add(tick);
      } else {
        setText(originalText);
        gsap.ticker.remove(tick);
        isAnimating.current = false;
      }
    };

    // Use GSAP's ticker instead of requestAnimationFrame for better sync
    // But we need to throttle the update to create that "digital" feel, not too smooth
    const tl = gsap.timeline();
    tl.to({}, {
      duration: scrambleDuration,
      onUpdate: () => {
        // Only update text every few frames to simulate "computing" lag if needed
        // For now we update every frame but the reveal logic handles the pacing
        const elapsed = tl.time();
        const progress = elapsed / scrambleDuration;
        const revealIndex = Math.floor(progress * length);
        
        let output = "";
        for(let i = 0; i < length; i++) {
            if (i <= revealIndex) {
                output += originalText[i];
            } else {
                // Random char
                output += characterSet[Math.floor(Math.random() * characterSet.length)];
            }
        }
        setText(output);
      }
    });

  }, [children, duration, trigger, characterSet]);

  return (
    <span ref={elementRef} className={className}>
      {text}
    </span>
  );
}
