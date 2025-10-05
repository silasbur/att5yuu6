import CommentInput from "./CommentInput";
import { db } from "./db";
import type { CommentWithChildren } from "./useComments";

interface CommentItemProps {
  comment: CommentWithChildren;
  commentingId: string;
  updateCommentingId: (id: string) => void;
}

function CommentItem({
  comment,
  commentingId,
  updateCommentingId,
}: CommentItemProps) {
  function deleteComment() {
    db.comments.update(comment.id, { isDeleted: true });
  }

  function hasVisibleChildren(comment: CommentWithChildren): boolean {
    return comment.children.some(child =>
      !child.isDeleted || hasVisibleChildren(child)
    );
  }

  if (comment.isDeleted && !hasVisibleChildren(comment)) {
    return null;
  }

  return (
    <div className="pl-2">
      <div className="font-medium p-2 bg-white relative">
        <div className="pr-8 break-words">
          {comment.isDeleted ? '[deleted]' : comment.text}
        </div>
        {!comment.isDeleted && (
          <button
            onClick={deleteComment}
            className="absolute top-2 right-2"
          >
            X
          </button>
        )}
      </div>
      {commentingId !== comment.id && (
        <div className="flex justify-end">
          <button onClick={() => updateCommentingId(comment.id)}>comment</button>
        </div>
      )}
      {commentingId === comment.id && (
        <CommentInput
          onComment={() => updateCommentingId("")}
          parentId={comment.id}
        />
      )}
      {comment.children.length > 0 && (
        <div className="border-l-2 border-gray-300 pl-2 space-y-2">
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              commentingId={commentingId}
              updateCommentingId={updateCommentingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentItem;
