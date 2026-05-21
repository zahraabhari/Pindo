"use client";

import { CartIconButton } from "@/components/features/commerce/cart/CartIconButton";
import { Icon, Input } from "@/components/ui";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  const hasValue = value.length > 0;

  return (
    <div className="search-bar-wrap sticky top-0 z-30 px-3 pb-1.5 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-2">
        <label className="search-bar-inner flex min-w-0 flex-1 items-center gap-2 rounded-2xl px-3 py-2.5">
          <Icon name="search" size="md" className="shrink-0 text-white/60" />
          <Input
            type="text"
            inputMode="search"
            role="searchbox"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search products, nature…"
            rounded="md"
            className="search-bar-input min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 py-0 shadow-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:!ring-0"
            autoComplete="off"
            enterKeyHint="search"
          />
          {hasValue ? (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear search"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <Icon name="x" size="sm" />
            </button>
          ) : null}
        </label>
        <div className="shrink-0">
          <CartIconButton />
        </div>
      </div>
    </div>
  );
}
