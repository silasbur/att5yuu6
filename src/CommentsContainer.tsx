import { useState } from "react";
import CommentItem from "./CommentItem";
import { useComments } from "./useComments";

function CommentsContainer() {
  const [commentingId, setCommentingId] = useState<string>("");

  function updateCommentingId(id: string) {
    setCommentingId(id);
  }
  const commentTree = useComments();

  return commentTree.length === 0 ? null : (
    <div className="w-full space-y-2">
      {commentTree.map((comment) => (
        <CommentItem key={comment.id} comment={comment} commentingId={commentingId} updateCommentingId={updateCommentingId} />
      ))}
    </div>
  );
}

export default CommentsContainer;
