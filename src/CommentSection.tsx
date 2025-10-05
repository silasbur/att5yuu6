import CommentsContainer from "./CommentsContainer";
import CommentInput from "./CommentInput";

function CommentSection() {
  return (
    <div className="w-180 flex flex-col justify-left bg-gray-100 p-10 rounded-xl">
      <div className="py-8">
        <CommentInput />
      </div>
      <CommentsContainer />
    </div>
  );
}

export default CommentSection;
