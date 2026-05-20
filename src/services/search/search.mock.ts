import type { DiscoveryItem, DiscoveryPage } from "@/types/discovery";

const SEEDS: Omit<DiscoveryItem, "id">[] = [
  {
    type: "image",
    title: "Forest light",
    thumbnail:
      "https://images.pexels.com/photos/957024/pexels-photo-957024.jpeg?auto=compress&cs=tinysrgb&w=400",
    width: 800,
    height: 1200,
    aspectRatio: 1.5,
  },
  {
    type: "video",
    title: "Ocean clip",
    thumbnail: "https://images.pexels.com/videos/3571264/pictures/preview-0.jpg",
    width: 720,
    height: 1280,
    aspectRatio: 1.78,
    videoSrc:
      "https://videos.pexels.com/video-files/3571264/3571264-hd_1280_720_30fps.mp4",
  },
  {
    type: "product",
    title: "Eco Serum",
    thumbnail:
      "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=400",
    width: 600,
    height: 900,
    aspectRatio: 1.5,
  },
];

export async function fetchMockDiscoveryPage(
  query: string,
  page: number,
): Promise<DiscoveryPage> {
  await new Promise((r) => setTimeout(r, 200));

  const start = (page - 1) * 10;
  const items: DiscoveryItem[] = Array.from({ length: 10 }, (_, i) => {
    const seed = SEEDS[(start + i) % SEEDS.length]!;
    return {
      ...seed,
      id: `mock-${query}-${start + i}`,
      title: `${seed.title} · ${query}`,
    };
  });

  return {
    items,
    nextPage: page < 8 ? page + 1 : null,
    query,
    source: "mock",
  };
}
