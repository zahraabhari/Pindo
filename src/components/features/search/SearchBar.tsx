"use client";

import { CartIconButton } from "@/components/features/commerce/cart/CartIconButton";
import { Button, Icon, Input } from "@/components/ui";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  return (
    <div className="search-bar-wrap sticky top-0 z-30 px-3 pb-1.5 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-2">
        <label className="search-bar-inner flex min-w-0 flex-1 items-center gap-2 rounded-2xl px-3 py-2.5 transition-shadow focus-within:ring-1 focus-within:ring-emerald-500/40">
          <Icon name="search" size="md" className="shrink-0 text-white/60" />
          <Input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search products, nature…"
            className="min-w-0 flex-1 focus-visible:ring-0"
            autoComplete="off"
            enterKeyHint="search"
          />
          {value.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              aria-label="Clear search"
              className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-white/70"
            >
              <Icon name="x" size="sm" />
            </Button>
          )}
        </label>
        <div className="shrink-0">
          <CartIconButton />
        </div>
      </div>
    </div>
  );
}
