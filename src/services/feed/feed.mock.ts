import { enrichVideoWithProduct } from "@/services/commerce/enrich-product";
import type { FeedPage, FeedVideo } from "@/types/feed";

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

function buildMockVideo(globalIndex: number): FeedVideo {
  const template = MOCK_SOURCES[globalIndex % MOCK_SOURCES.length]!;
  const pageChunk = Math.floor(globalIndex / MOCK_SOURCES.length);
  const id = `mock-${globalIndex}`;

  return enrichVideoWithProduct({
    id,
    key: id,
    title: `${template.title} #${pageChunk + 1}`,
    author: template.author,
    src: template.src,
    poster: template.poster,
    width: 720,
    height: 1280,
    duration: 30,
  });
}

export async function fetchMockFeedPage(page: number): Promise<FeedPage> {
  await delay(80);

  const start = (page - 1) * PER_PAGE;
  const videos = Array.from({ length: PER_PAGE }, (_, i) =>
    buildMockVideo(start + i),
  );

  return {
    videos,
    nextPage: page < 10 ? page + 1 : null,
    source: "mock",
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
