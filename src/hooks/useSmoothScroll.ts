"use client";
import { useRef } from "react";

// Returns the lenis instance ref (initialized in layout)
export function useSmoothScroll() {
  const lenisRef = useRef<unknown>(null);
  return lenisRef;
}
