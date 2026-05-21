"use client";

import { CommentRow } from "@/components/features/commerce/comments/CommentRow";
import { CommentRowSkeleton } from "@/components/features/commerce/comments/CommentRowSkeleton";
import { BottomSheet } from "@/components/features/commerce/shared/BottomSheet";
import { EmptyState } from "@/components/features/shared/EmptyState";
import { Button, Input } from "@/components/ui";
import {
  useAddComment,
  useComments,
  useLiveCommentSimulation,
} from "@/services/comments/comments.hooks";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useUiStore } from "@/store/ui-store";
import { useCallback, useMemo, useRef, useState } from "react";

export function CommentSheet() {
  const sheet = useUiStore((s) => s.sheet);
  const videoId = useUiStore((s) => s.activeVideoId);
  const closeSheet = useUiStore((s) => s.closeSheet);
  const open = sheet === "comments" && Boolean(videoId);

 
  const lastVideoIdRef = useRef<string | null>(null);
  if (open && videoId) {
    lastVideoIdRef.current = videoId;
  }
  const queryVideoId = open ? videoId : lastVideoIdRef.current;

  const {
    data: comments,
    isPending,
    isError,
    refetch,
    isFetching,
  } = useComments(queryVideoId, { enabled: open });
  const addComment = useAddComment(open ? videoId : null);
  const { isOffline } = useOnlineStatus();
  const [draft, setDraft] = useState("");

  useLiveCommentSimulation(open ? videoId : null, open);

  const list = comments ?? [];

  const countLabel = useMemo(() => {
    if (isPending && list.length === 0) return "Comments";
    if (list.length === 0) return "Comments";
    return `${list.length} comment${list.length === 1 ? "" : "s"}`;
  }, [list.length, isPending]);

  const onSubmit = useCallback(() => {
    const text = draft.trim();
    if (!text || addComment.isPending) return;
    addComment.mutate(text);
    setDraft("");
  }, [draft, addComment]);

  const showLoading = open && isPending && list.length === 0;
  const showError = open && isError && list.length === 0;

  return (
    <BottomSheet open={open} onClose={closeSheet} title={countLabel}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
          {showLoading ? (
            <ul className="list-none" aria-busy>
              {Array.from({ length: 6 }, (_, i) => (
                <CommentRowSkeleton key={i} />
              ))}
            </ul>
          ) : showError ? (
            <EmptyState
              icon="error"
              title="Could not load comments"
              description="Check your connection and try again."
              actionLabel="Retry"
              onAction={() => void refetch()}
              compact
            />
          ) : list.length === 0 ? (
            <EmptyState
              icon="comments"
              title="No comments yet"
              description="Be the first to share your thoughts on this reel."
              compact
            />
          ) : (
            <ul className="list-none" role="list">
              {list.map((comment) => (
                <CommentRow key={comment.id} comment={comment} />
              ))}
            </ul>
          )}
          {isFetching && list.length > 0 && !isOffline && (
            <p className="py-1.5 text-center text-[10px] text-white/35">
              Updating…
            </p>
          )}
          {isOffline && list.length > 0 && (
            <p className="py-1.5 text-center text-[10px] text-white/35">
              Offline — showing saved comments
            </p>
          )}
        </div>

        <div className="shrink-0 bg-zinc-900/95 px-3 py-2.5 pb-8 pt-2">
          <div className="flex items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              placeholder={
                isOffline ? "Comments post when you're online" : "Add a comment…"
              }
              disabled={isOffline}
              className="flex-1 bg-white/10 px-3 py-2 text-[13px] focus-visible:ring-emerald-500/40"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!draft.trim() || addComment.isPending || isOffline}
              onClick={onSubmit}
              className="shrink-0 px-3.5"
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
