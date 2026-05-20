"use client";

import { getCommentAvatarUrl } from "@/services/commerce/comment-avatar";
import type { Comment } from "@/types/commerce";
import { memo } from "react";

const AVATAR_SIZE = 32;

interface CommentRowProps {
  comment: Comment;
}

function CommentRowInner({ comment }: CommentRowProps) {
  const avatarUrl = getCommentAvatarUrl(comment.username);

  return (
    <li className="flex gap-2 px-3 py-1">
      <img
        src={avatarUrl}
        alt=""
        width={AVATAR_SIZE}
        height={AVATAR_SIZE}
        loading="lazy"
        decoding="async"
        className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-zinc-800 object-cover ring-1 ring-white/10"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold leading-tight text-white">
          {comment.username}
        </p>
        <p className="mt-0.5 text-[13px] font-normal leading-snug text-white/88">
          {comment.text}
        </p>
      </div>
    </li>
  );
}

export const CommentRow = memo(CommentRowInner, (prev, next) => {
  return (
    prev.comment.id === next.comment.id &&
    prev.comment.text === next.comment.text &&
    prev.comment.username === next.comment.username
  );
});
