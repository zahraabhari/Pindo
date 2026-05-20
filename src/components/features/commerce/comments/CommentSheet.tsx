"use client";

import { CommentRow } from "@/components/features/commerce/comments/CommentRow";
import { CommentRowSkeleton } from "@/components/features/commerce/comments/CommentRowSkeleton";
import { BottomSheet } from "@/components/features/commerce/shared/BottomSheet";
import { Button, Input, Typography } from "@/components/ui";
import {
  useAddComment,
  useComments,
  useLiveCommentSimulation,
} from "@/services/comments/comments.hooks";
import { useUiStore } from "@/store/ui-store";
import { memo, useCallback, useMemo, useState } from "react";

function CommentSheetInner() {
  const sheet = useUiStore((s) => s.sheet);
  const videoId = useUiStore((s) => s.activeVideoId);
  const closeSheet = useUiStore((s) => s.closeSheet);
  const open = sheet === "comments" && Boolean(videoId);

  const {
    data: comments,
    isPending,
    isError,
    refetch,
    isFetching,
  } = useComments(open ? videoId : null);
  const addComment = useAddComment(open ? videoId : null);
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

  const showLoading = isPending && list.length === 0;

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
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 px-4 py-8">
              <Typography variant="body-muted">Could not load comments.</Typography>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void refetch()}
              >
                Retry
              </Button>
            </div>
          ) : list.length === 0 ? (
            <Typography variant="body-muted" className="px-4 py-8 text-center text-[13px]">
              No comments yet. Be the first!
            </Typography>
          ) : (
            <ul className="list-none" role="list">
              {list.map((comment) => (
                <CommentRow key={comment.id} comment={comment} />
              ))}
            </ul>
          )}
          {isFetching && list.length > 0 && (
            <p className="py-1.5 text-center text-[10px] text-white/35">
              Updating…
            </p>
          )}
        </div>

        <div className="shrink-0 bg-zinc-900/95 px-3 py-2.5 pb-8 pt-2">
          <div className="flex items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              placeholder="Add a comment…"
              className="flex-1 bg-white/10 px-3 py-2 text-[13px] focus-visible:ring-emerald-500/40"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!draft.trim() || addComment.isPending}
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

export const CommentSheet = memo(CommentSheetInner);
