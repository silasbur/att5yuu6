import { useState } from "react";
import { db, type Comment } from "./db";

interface CommentInputProps {
  parentId?: string;
  onComment?: () => void;
}

function CommentInput({ parentId, onComment }: CommentInputProps) {
  const [text, setText] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
  }

  function handleAddComment() {
    if (text.length > 1) {
      db.comments.add({ text, parentId });
      setText("");
    }
    onComment && onComment();
  }

  return (
    <div className="flex items-center gap-2 py-2">
      <input
        onChange={handleChange}
        value={text}
        className="flex-1 border-0 border-b-2 border-gray-300 focus:border-blue-500 outline-none px-2 py-2 bg-transparent"
        placeholder="Add a comment..."
      />
      <button
        onClick={handleAddComment}
        className="px-4 py-2 text-sm font-medium"
      >
        Submit
      </button>
    </div>
  );
}

export default CommentInput;
