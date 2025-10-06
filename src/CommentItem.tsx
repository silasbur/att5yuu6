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
  const isReplying = commentingId === comment.id;
  const hasChildren = comment.children.length > 0;
  const commentText = comment.isDeleted ? "[deleted]" : comment.text;

  const handleDelete = () => {
    db.comments.update(comment.id, { isDeleted: true });
  };

  const handleReplyClick = () => {
    updateCommentingId(comment.id);
  };

  const handleHideInput = () => {
    updateCommentingId("");
  };

  // Don't render deleted comments with no visible children
  if (comment.isDeleted && !comment.hasVisibleChildren) {
    return null;
  }

  return (
    <>
      <div className="pb-2">
        {/* Comment box */}
        <div className="font-medium p-2 bg-gray-200 relative rounded-md">
          <div className="px-2 break-words text-gray-900">
            {commentText}
          </div>
          {!comment.isDeleted && (
            <button
              onClick={handleDelete}
              className="absolute top-2 right-2 text-sm font-medium text-gray-500"
            >
              x
            </button>
          )}
        </div>

        {/* Reply button */}
        {!isReplying && (
          <div className="flex justify-end">
            <button
              onClick={handleReplyClick}
              className="text-sm font-medium text-gray-500"
            >
              Reply
            </button>
          </div>
        )}

        {/* Reply input */}
        {isReplying && (
          <CommentInput
            hideInput={handleHideInput}
            parentId={comment.id}
          />
        )}
      </div>

      {/* Nested children */}
      {hasChildren && (
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
