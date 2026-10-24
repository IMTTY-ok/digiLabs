"use client";

import { useEffect, useState } from "react";

/**
 * Detects WebGL support on the client. Returns `null` while the check runs so
 * callers can render a stable skeleton rather than flashing a fallback.
 */
export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      const canvas = document.createElement("canvas");
      const context =
        canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl");
      if (!cancelled) setSupported(Boolean(context));
    } catch {
      if (!cancelled) setSupported(false);
    }
    return () => {
      cancelled = true;
    };
  }, []);

  return supported;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}
