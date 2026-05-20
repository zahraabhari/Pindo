"use client";

import { Icon, type IconName } from "@/components/ui";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";

const NAV_ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: "/feed", label: "Feed", icon: "home" },
  { href: "/search", label: "Search", icon: "search" },
];

function BottomNavInner() {
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const isActive = useCallback(
    (href: string) =>
      pathname === href || (href !== "/feed" && pathname.startsWith(href)),
    [pathname],
  );

  return (
    <nav
      className="pointer-events-none fixed bottom-3 left-1/2 z-[60] w-[88px] -translate-x-1/2"
      aria-label="Main navigation"
    >
      <div className="nav-glass pointer-events-auto flex items-center justify-center gap-1 rounded-full px-1 py-1 shadow-lg">
        {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className="relative flex h-9 w-9 items-center justify-center rounded-full outline-none"
              >
                {active &&
                  (hydrated ? (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/15"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  ) : (
                    <span className="absolute inset-0 rounded-full bg-white/15" />
                  ))}
                <span className="relative z-10 transition-transform active:scale-90">
                  <Icon
                    name={item.icon}
                    size="md"
                    className={cn(active ? "text-white" : "text-white/55")}
                    fill={item.icon === "home" && active ? "currentColor" : "none"}
                  />
                </span>
              </Link>
            );
          })}
      </div>
    </nav>
  );
}

export const BottomNav = memo(BottomNavInner);
