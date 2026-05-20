"use client";

import { VirtualizedFeed } from "@/components/features/feed/VirtualizedFeed";

export function FeedShell() {
  return (
    <main className="relative h-full w-full overflow-hidden bg-black">
      <VirtualizedFeed />
    </main>
  );
}
