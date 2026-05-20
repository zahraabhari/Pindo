import type { DiscoveryItem } from "@/types/discovery";

export function dedupeDiscoveryItems(items: DiscoveryItem[]): DiscoveryItem[] {
  const seen = new Set<string>();
  const out: DiscoveryItem[] = [];

  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }

  return out;
}
