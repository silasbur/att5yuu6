import "./App.css";
import CommentSection from "./CommentSection";

function App() {
  return (
    <div className="h-full w-full relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2">
        <CommentSection />
      </div>
    </div>
  );
}

export default App;
