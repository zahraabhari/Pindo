import { enrichVideoWithProduct } from "@/services/commerce/enrich-product";
import type { FeedVideo } from "@/types/feed";
import type { PexelsVideo, PexelsVideoFile } from "@/types/pexels";

/** Prefer portrait MP4 ≤1920 for vertical feed + bandwidth. */
function selectVideoFile(files: PexelsVideoFile[]): PexelsVideoFile | undefined {
  const mp4s = files.filter((f) => f.file_type === "video/mp4");
  if (mp4s.length === 0) return files[0];

  const portrait = mp4s.filter((f) => f.height >= f.width);
  const capped = (portrait.length > 0 ? portrait : mp4s).filter(
    (f) => Math.max(f.width, f.height) <= 1920,
  );
  const pool = capped.length > 0 ? capped : mp4s;

  return pool.sort((a, b) => {
    const aPortrait = a.height >= a.width ? 0 : 1;
    const bPortrait = b.height >= b.width ? 0 : 1;
    if (aPortrait !== bPortrait) return aPortrait - bPortrait;
    return a.width * a.height - b.width * b.height;
  })[0];
}

export function pexelsVideoToFeedVideo(video: PexelsVideo): FeedVideo | null {
  const file = selectVideoFile(video.video_files);
  if (!file?.link) return null;

  return enrichVideoWithProduct({
    id: String(video.id),
    key: `pexels-${video.id}`,
    title: `Video by ${video.user.name}`,
    author: video.user.name,
    src: file.link,
    poster: video.image,
    width: file.width,
    height: file.height,
    duration: video.duration,
  });
}
