"use client";

import {
  isEmptyCommentsVideo,
  seedCommentsForVideo,
} from "@/services/commerce/comment-seed";
import { fetchComments, postComment } from "@/services/comments/comments.api";
import {
  commentsLiveQueryKey,
  commentsQueryKey,
} from "@/services/comments/comments.keys";
import type { Comment } from "@/services/comments/comments.types";
import { useOnlineStatus } from "@/hooks/use-online-status";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useMemo } from "react";

export { commentsQueryKey, commentsLiveQueryKey } from "@/services/comments/comments.keys";
export type { Comment } from "@/services/comments/comments.types";

function resolveCommentCount(
  seed: Comment[],
  cached: Comment[] | undefined,
): number {
  if (!cached) return seed.length;
  if (seed.length === 0 && cached.length > 0) return 0;
  return cached.length;
}

function commentsQueryOptions(
  videoId: string,
  enabled: boolean,
): UseQueryOptions<Comment[], Error, Comment[], ReturnType<typeof commentsQueryKey>> {
  const seed = seedCommentsForVideo(videoId);

  return {
    queryKey: commentsQueryKey(videoId),
    queryFn: () => fetchComments(videoId),
    enabled,
    placeholderData: seed,
    staleTime: 30_000,
    retry: (failureCount) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return false;
      }
      return failureCount < 1;
    },
  };
}

export function useComments(
  videoId: string | null,
  options?: { enabled?: boolean },
) {
  const queryEnabled = (options?.enabled ?? true) && Boolean(videoId);

  return useQuery(
    videoId
      ? commentsQueryOptions(videoId, queryEnabled)
      : {
          queryKey: commentsQueryKey(""),
          queryFn: () => Promise.resolve([] as Comment[]),
          enabled: false,
        },
  );
}

export function useAddComment(videoId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => postComment(videoId!, text),
    onMutate: async (text) => {
      if (!videoId) return;
      const key = commentsQueryKey(videoId);
      await queryClient.cancelQueries({ queryKey: key });

      const prev = queryClient.getQueryData<Comment[]>(key) ?? [];
      const optimistic: Comment = {
        id: `opt-${Date.now()}`,
        videoId,
        username: "you",
        text,
        createdAt: new Date().toISOString(),
        likes: 0,
      };

      queryClient.setQueryData<Comment[]>(key, [optimistic, ...prev]);
      return { prev, optimisticId: optimistic.id };
    },
    onSuccess: (comment, _text, ctx) => {
      if (!videoId || !ctx) return;
      const key = commentsQueryKey(videoId);
      queryClient.setQueryData<Comment[]>(key, (old) => {
        const list = old ?? [];
        return [
          comment,
          ...list.filter((c) => c.id !== ctx.optimisticId),
        ];
      });
    },
    onError: (_err, _text, ctx) => {
      if (!videoId || !ctx) return;
      queryClient.setQueryData(commentsQueryKey(videoId), ctx.prev);
    },
  });
}

export function useLiveCommentSimulation(
  videoId: string | null,
  enabled: boolean,
) {
  const queryClient = useQueryClient();
  const { isOnline } = useOnlineStatus();

  return useQuery({
    queryKey: commentsLiveQueryKey(videoId),
    queryFn: async () => {
      if (!videoId || !enabled) return null;
      const live: Comment = {
        id: `live-${Date.now()}`,
        videoId,
        username: "live_user",
        text: "Just saw this — ordering now! 🔥",
        createdAt: new Date().toISOString(),
        likes: 0,
      };
      const key = commentsQueryKey(videoId);
      queryClient.setQueryData<Comment[]>(key, (old) => {
        const list = old ?? [];
        if (list.some((c) => c.id.startsWith("live-"))) return list;
        return [live, ...list];
      });
      return live;
    },
    enabled:
      videoId != null &&
      enabled &&
      isOnline &&
      !isEmptyCommentsVideo(videoId),
    refetchInterval: isOnline ? 12_000 : false,
    staleTime: 0,
  });
}

export function useCommentCount(videoId: string) {
  const seedList = useMemo(() => seedCommentsForVideo(videoId), [videoId]);
  const { data, isFetching, isFetched } = useQuery({
    ...commentsQueryOptions(videoId, false),
    placeholderData: seedList,
  });

  return {
    count: resolveCommentCount(seedList, data),
    isLoading: !isFetched && isFetching,
    hasData: isFetched,
  };
}
