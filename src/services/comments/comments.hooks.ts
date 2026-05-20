"use client";

import { fetchComments, postComment } from "@/services/comments/comments.api";
import {
  commentsLiveQueryKey,
  commentsQueryKey,
} from "@/services/comments/comments.keys";
import type { Comment } from "@/services/comments/comments.types";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export { commentsQueryKey, commentsLiveQueryKey } from "@/services/comments/comments.keys";
export type { Comment } from "@/services/comments/comments.types";

export function useComments(videoId: string | null) {
  return useQuery({
    queryKey: commentsQueryKey(videoId ?? ""),
    queryFn: () => fetchComments(videoId!),
    enabled: Boolean(videoId),
    staleTime: 30_000,
  });
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

/** Simulates live comments arriving while sheet is open */
export function useLiveCommentSimulation(
  videoId: string | null,
  enabled: boolean,
) {
  const queryClient = useQueryClient();

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
    enabled: Boolean(videoId) && enabled,
    refetchInterval: 12_000,
    staleTime: 0,
  });
}

export function useCommentCount(videoId: string) {
  const queryClient = useQueryClient();
  const comments = queryClient.getQueryData<Comment[]>(commentsQueryKey(videoId));

  return {
    count: comments?.length ?? 0,
    isLoading: false,
    hasData: comments !== undefined,
  };
}
