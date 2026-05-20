import type { CartItem } from "@/types/cart";
import type { FeedVideo } from "@/types/feed";

/** Parse display price like "$42.00" → 42 */
export function parsePriceLabel(priceLabel: string): number {
  const match = priceLabel.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number.parseFloat(match[1]!) : 0;
}

export function feedVideoToCartItem(video: FeedVideo): CartItem | null {
  const product = video.product;
  if (!product) return null;

  return {
    id: video.id,
    name: product.productTitle,
    price: parsePriceLabel(product.priceLabel),
    image: video.poster,
    quantity: 1,
  };
}
