"use client";

import { useEffect, useState } from "react";

/** True only after the component has mounted on the client (safe for SSR/hydration). */
export function useClientMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
