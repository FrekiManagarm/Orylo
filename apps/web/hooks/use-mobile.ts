"use client";

import { useEffect, useState, useRef } from "react";

/**
 * Hook to detect if the current viewport is mobile
 * Uses window.matchMedia to detect screen size < 768px
 */
export function useIsMobile() {
  // Initialize with a function to avoid SSR mismatch
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px)").matches;
  });

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    
    // Create event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isMobile;
}
