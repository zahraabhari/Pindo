import { enrichVideoWithProduct } from "@/services/commerce/enrich-product";
import { pexelsVideoToFeedVideo } from "@/services/pexels/pexels.mapper";
import type { DiscoveryItem } from "@/types/discovery";
import type { PexelsPhoto } from "@/types/pexels-photos";
import type { PexelsVideo } from "@/types/pexels";

export function photoToDiscoveryItem(photo: PexelsPhoto): DiscoveryItem {
  const asProduct = photo.id % 4 === 0;
  const base: DiscoveryItem = {
    id: `photo-${photo.id}`,
    type: asProduct ? "product" : "image",
    title: photo.photographer,
    thumbnail: photo.src.medium,
    width: photo.width,
    height: photo.height,
    aspectRatio: photo.height / photo.width,
  };

  if (asProduct) {
    const enriched = enrichVideoWithProduct({
      id: base.id,
      key: base.id,
      title: base.title,
      author: photo.photographer,
      src: photo.src.large,
      poster: photo.src.medium,
      width: photo.width,
      height: photo.height,
      duration: 0,
    });
    return { ...base, type: "product", product: enriched.product };
  }

  return base;
}

export function videoToDiscoveryItem(video: PexelsVideo): DiscoveryItem | null {
  const feed = pexelsVideoToFeedVideo(video);
  if (!feed) return null;

  const enriched = enrichVideoWithProduct(feed);
  const file = video.video_files.find((f) => f.file_type === "video/mp4");

  return {
    id: `video-${video.id}`,
    type: "video",
    title: enriched.product?.productTitle ?? enriched.title,
    thumbnail: video.image,
    width: video.width,
    height: video.height,
    aspectRatio: video.height / video.width,
    videoSrc: file?.link,
    product: enriched.product,
  };
}

export function interleaveDiscovery(
  photos: DiscoveryItem[],
  videos: DiscoveryItem[],
): DiscoveryItem[] {
  const out: DiscoveryItem[] = [];
  const max = Math.max(photos.length, videos.length);
  for (let i = 0; i < max; i++) {
    if (photos[i]) out.push(photos[i]);
    if (videos[i]) out.push(videos[i]);
  }
  return out;
}
