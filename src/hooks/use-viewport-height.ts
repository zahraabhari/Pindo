"use client";

import { useEffect, useState } from "react";

/** Stable item height for Virtuoso fixed-size virtualization */
export function useViewportHeight() {
  const [height, setHeight] = useState(800);

  useEffect(() => {
    const measure = () => setHeight(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return height;
}
