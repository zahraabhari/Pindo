import type { ProductMeta } from "@/types/commerce";
import type { FeedVideo } from "@/types/feed";

const NATURE_PRODUCTS = [
  { title: "Organic Face Serum", tag: "#skincare #nature #organic" },
  { title: "Bamboo Water Bottle", tag: "#eco #sustainable #nature" },
  { title: "Wild Herb Tea Set", tag: "#wellness #tea #natural" },
  { title: "Recycled Tote Bag", tag: "#fashion #eco #zerowaste" },
  { title: "Mountain Trail Boots", tag: "#outdoor #hiking #adventure" },
  { title: "Plant-Based Protein", tag: "#fitness #vegan #health" },
  { title: "Natural Soy Candle", tag: "#home #cozy #handmade" },
  { title: "Solar Power Bank", tag: "#tech #green #travel" },
];

const CAPTIONS = [
  "Harvested at dawn — limited drop this week only.",
  "Sustainable materials, designed for everyday adventures.",
  "Your skin deserves clean ingredients from the wild.",
  "Pair with our bestseller bundle and save 15%.",
  "Ships in 24h · 30-day easy returns.",
];

const TRACKS = [
  "Nature Vibes · Pindo Audio",
  "Forest Echo · Chill Lab",
  "Morning Dew · Soft Beats",
];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 9973;
  return h;
}

function shortLine(text: string, max = 96): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

export function enrichVideoWithProduct(video: FeedVideo): FeedVideo {
  if (video.product) return video;

  const h = hashId(video.id);
  const product = NATURE_PRODUCTS[h % NATURE_PRODUCTS.length]!;
  const caption = CAPTIONS[h % CAPTIONS.length]!;
  const track = TRACKS[h % TRACKS.length]!;
  const username = video.author.replace(/\s+/g, "").toLowerCase() || "pindo.shop";
  const fullCaption = `${caption} ${product.tag}`;

  const productMeta: ProductMeta = {
    username: `@${username}`,
    productTitle: product.title,
    shortDescription: shortLine(caption, 88),
    caption: fullCaption,
    hashtags: product.tag.split(" ").filter((t) => t.startsWith("#")),
    musicTrack: track,
    priceLabel: `$${(19 + (h % 80))}.00`,
  };

  return { ...video, product: productMeta };
}

export function enrichFeedVideos(videos: FeedVideo[]): FeedVideo[] {
  return videos.map(enrichVideoWithProduct);
}
