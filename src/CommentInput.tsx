import { useState } from "react";
import { db } from "./db";

interface CommentInputProps {
  parentId?: string;
  updateCommentingId?: (id: string) => void;
}

function CommentInput({ parentId, updateCommentingId }: CommentInputProps) {
  const [text, setText] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
  }

  function handleAddComment() {
    if (text.length > 1) {
      db.comments.add({ text, parentId });
      setText("");
    }

    // Hides reply input when comment is submitted
    updateCommentingId && updateCommentingId("");
  }

  function handleCancel() {
    setText("");

    // Hides reply input when comment is cancelled
    updateCommentingId && updateCommentingId("");
  }

  return (
    <>
      <input
        onChange={handleChange}
        value={text}
        className="flex-1 border-0 border-b-2 border-gray-300 focus:border-blue-500 outline-none px-2 py-2 bg-transparent w-full"
        placeholder="Add a comment..."
      />
      <div className="flex justify-end">
        <button
          onClick={handleCancel}
          className="px-2 text-sm font-medium text-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={handleAddComment}
          className="px-2 text-sm font-medium text-gray-500"
        >
          Submit
        </button>
      </div>
    </>
  );
}

export default CommentInput;
