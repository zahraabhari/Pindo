"use client";

import { Button, Icon, Typography } from "@/components/ui";
import { TRENDING_QUERIES, useSearchStore } from "@/store/search-store";
import { memo, useEffect, useState } from "react";

interface SearchExploreStripProps {
  onSelect: (query: string) => void;
}

function SearchExploreStripInner({ onSelect }: SearchExploreStripProps) {
  const history = useSearchStore((s) => s.history);
  const clearHistory = useSearchStore((s) => s.clearHistory);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const recent = mounted ? history.slice(0, 6) : [];

  return (
    <div className="shrink-0 overflow-hidden border-b border-white/5">
      <div className="explore-strip-scroll flex items-center gap-2 px-3 py-2">
        {recent.length > 0 && (
          <>
            <Typography variant="caption" as="span" className="shrink-0 font-medium">
              Recent
            </Typography>
            {recent.map((q) => (
              <Button
                key={`r-${q}`}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onSelect(q)}
                className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/75 active:scale-95"
              >
                {q}
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              aria-label="Clear recent"
              className="shrink-0 p-1 text-white/30 hover:text-white/55"
            >
              <Icon name="x" size="sm" />
            </Button>
            <span className="h-4 w-px shrink-0 bg-white/15" aria-hidden />
          </>
        )}

        <Typography variant="caption" as="span" className="shrink-0 font-medium">
          Trending
        </Typography>
        {TRENDING_QUERIES.map((q) => (
          <Button
            key={`t-${q}`}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelect(q)}
            className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/70 active:scale-95"
          >
            #{q}
          </Button>
        ))}
      </div>
    </div>
  );
}

export const SearchExploreStrip = memo(SearchExploreStripInner);
