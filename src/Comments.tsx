import CommentsContainer from "./CommentsContainer";
import CommentInput from "./CommentInput";

function Comments() {

  return (
    <div className="h-full w-full bg-gray-100 relative flex justify-center items-center">
      <div className="flex flex-col justify-left">
        <div className="w-160">
          <CommentInput />
        </div>
        <CommentsContainer />
      </div>
    </div>
  );
}

export default Comments;
