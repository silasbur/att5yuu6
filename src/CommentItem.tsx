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
    return comment.children.some(
      (child) => !child.isDeleted || hasVisibleChildren(child)
    );
  }

  function hideInput() {
    updateCommentingId("")
  }

  if (comment.isDeleted && !hasVisibleChildren(comment)) {
    return null;
  }

  return (
    <>
      <div className="pb-2">
        <div className="font-medium p-2 bg-gray-200 relative rounded-md">
          <div className="px-2 break-words text-gray-900">
            {comment.isDeleted ? "[deleted]" : comment.text}
          </div>
          {!comment.isDeleted && (
            <button onClick={deleteComment} className="absolute top-2 right-2 text-sm font-medium text-gray-500">
              x
            </button>
          )}
        </div>
        {commentingId !== comment.id && (
          <div className="flex justify-end">
            <button onClick={() => updateCommentingId(comment.id)} className="text-sm font-medium text-gray-500">
              Reply
            </button>
          </div>
        )}

        {commentingId === comment.id && (
          <CommentInput
            hideInput={hideInput}
            parentId={comment.id}
          />
        )}
      </div>

      {comment.children.length > 0 && (
        <div className="border-l-2 border-gray-300 border-dotted pl-2 ml-8 space-y-2">
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
    </>
  );
}

export default CommentItem;
