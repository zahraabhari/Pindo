"use client";

import { CartIconButton } from "@/components/features/commerce/cart/CartIconButton";
import { usePathname } from "next/navigation";

/** Feed-only floating cart — search page embeds cart in SearchBar */
export function AppTopBar() {
  const pathname = usePathname();

  if (pathname === "/search") {
    return null;
  }

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-[70]">
      <div className="mx-auto flex w-full max-w-md items-center justify-end px-4 md:px-6 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto">
          <CartIconButton />
        </div>
      </div>
    </header>
  );
}
