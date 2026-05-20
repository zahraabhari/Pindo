"use client";

import { Button, Icon, Input } from "@/components/ui";
import { memo } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

function SearchBarInner({ value, onChange, onClear }: SearchBarProps) {
  return (
    <div className="search-bar-wrap sticky top-0 z-30 px-3 pb-1.5 pt-2">
      <label className="search-bar-inner flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-shadow focus-within:ring-1 focus-within:ring-emerald-500/40">
        <Icon name="search" size="lg" className="text-white/60" />
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search products, nature, style…"
          className="flex-1 focus-visible:ring-0"
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
            className="rounded-full bg-white/10 px-2.5 py-1 text-white/70"
          >
            <Icon name="x" size="sm" />
          </Button>
        )}
      </label>
    </div>
  );
}

export const SearchBar = memo(SearchBarInner);
