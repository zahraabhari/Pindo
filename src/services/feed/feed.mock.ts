import { enrichVideoWithProduct } from "@/services/commerce/enrich-product";
import { buildNextCursor } from "@/services/feed/feed.cursor";
import type { FeedSlice, FeedVideo } from "@/types/feed";

const MOCK_SOURCES: Pick<FeedVideo, "src" | "poster" | "title" | "author">[] = [
  {
    src: "https://videos.pexels.com/video-files/3571264/3571264-hd_1280_720_30fps.mp4",
    poster:
      "https://images.pexels.com/videos/3571264/pictures/preview-0.jpg?auto=compress&cs=tinysrgb&w=720",
    title: "Ocean waves",
    author: "Pexels",
  },
  {
    src: "https://videos.pexels.com/video-files/2491284/2491284-hd_720_1366_30fps.mp4",
    poster:
      "https://images.pexels.com/videos/2491284/pictures/preview-0.jpg?auto=compress&cs=tinysrgb&w=720",
    title: "City at night",
    author: "Pexels",
  },
  {
    src: "https://videos.pexels.com/video-files/4769638/4769638-hd_720_1366_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/4769638/pictures/preview-0.jpg?auto=compress&cs=tinysrgb&w=720",
    title: "Vertical street",
    author: "Pexels",
  },
  {
    src: "https://videos.pexels.com/video-files/3195394/3195394-hd_720_1280_30fps.mp4",
    poster:
      "https://images.pexels.com/videos/3195394/pictures/preview-0.jpg?auto=compress&cs=tinysrgb&w=720",
    title: "Nature walk",
    author: "Pexels",
  },
  {
    src: "https://videos.pexels.com/video-files/4057252/4057252-hd_720_1366_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/4057252/pictures/preview-0.jpg?auto=compress&cs=tinysrgb&w=720",
    title: "Coffee shop",
    author: "Pexels",
  },
];

const PER_PAGE = 5;
const MAX_PAGE = 10;

function buildMockVideo(globalIndex: number): FeedVideo {
  const template = MOCK_SOURCES[globalIndex % MOCK_SOURCES.length]!;
  const chunk = Math.floor(globalIndex / MOCK_SOURCES.length);
  const id = `mock-${globalIndex}`;

  return enrichVideoWithProduct({
    id,
    key: id,
    title: `${template.title} · ${chunk + 1}`,
    author: template.author,
    src: template.src,
    poster: template.poster,
    width: 720,
    height: 1280,
    duration: 30,
  });
}

function sliceFromPage(page: number, query: string): FeedSlice {
  const start = (page - 1) * PER_PAGE;
  const items = Array.from({ length: PER_PAGE }, (_, i) =>
    buildMockVideo(start + i),
  );
  const hasMore = page < MAX_PAGE;

  return {
    items,
    nextCursor: buildNextCursor(page, hasMore, query),
    hasMore,
    source: "mock",
    searchQuery: query,
  };
}

export async function fetchMockFeedSlice(
  page: number,
  query: string,
): Promise<FeedSlice> {
  await delay(80);
  return sliceFromPage(page, query);
}

/** Fresh upstream head (always stream start) for SWR merge */
export async function fetchMockFeedHead(query: string): Promise<FeedSlice> {
  await delay(60);
  return sliceFromPage(1, query);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
