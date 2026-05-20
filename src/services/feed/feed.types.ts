export type { FeedPage, FeedVideo } from "@/types/feed";

export class FeedApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "FeedApiError";
  }
}
