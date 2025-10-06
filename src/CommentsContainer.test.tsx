import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentsContainer from "./CommentsContainer";
import type { CommentWithChildren } from "./useComments";

// Mock useComments hook
vi.mock("./useComments", () => ({
  useComments: vi.fn(),
}));

// Mock CommentInput component
vi.mock("./CommentInput", () => ({
  default: ({ parentId }: { parentId?: string }) => (
    <div data-testid={`comment-input-${parentId || "root"}`}>
      CommentInput for {parentId || "root"}
    </div>
  ),
}));

// Mock db module
vi.mock("./db", () => ({
  db: {
    comments: {
      update: vi.fn(),
    },
  },
}));

describe("CommentsContainer", async () => {
  const { useComments } = await import("./useComments");

  describe("CommentInput visibility", () => {
    it("shows no CommentInput by default", () => {
      const mockComments: CommentWithChildren[] = [
        { id: "1", text: "Comment 1", children: [] },
        { id: "2", text: "Comment 2", children: [] },
      ];

      vi.mocked(useComments).mockReturnValue(mockComments);

      render(<CommentsContainer />);

      expect(screen.queryByTestId("comment-input-1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("comment-input-2")).not.toBeInTheDocument();
    });

    it("shows CommentInput only for the clicked comment", async () => {
      const mockComments: CommentWithChildren[] = [
        { id: "1", text: "Comment 1", children: [] },
        { id: "2", text: "Comment 2", children: [] },
      ];

      vi.mocked(useComments).mockReturnValue(mockComments);

      render(<CommentsContainer />);

      // Click "Reply" button on first comment
      const commentButtons = screen.getAllByText("Reply");
      await userEvent.click(commentButtons[0]);

      // Only first comment should show CommentInput
      expect(screen.getByTestId("comment-input-1")).toBeInTheDocument();
      expect(screen.queryByTestId("comment-input-2")).not.toBeInTheDocument();
    });

    it("shows only one CommentInput at a time when switching between comments", async () => {
      const mockComments: CommentWithChildren[] = [
        { id: "1", text: "Comment 1", children: [] },
        { id: "2", text: "Comment 2", children: [] },
        { id: "3", text: "Comment 3", children: [] },
      ];

      vi.mocked(useComments).mockReturnValue(mockComments);

      render(<CommentsContainer />);

      const commentButtons = screen.getAllByText("Reply");

      // Click first comment
      await userEvent.click(commentButtons[0]);
      expect(screen.getByTestId("comment-input-1")).toBeInTheDocument();
      expect(screen.queryByTestId("comment-input-2")).not.toBeInTheDocument();
      expect(screen.queryByTestId("comment-input-3")).not.toBeInTheDocument();

      // Click second comment - only second should show input
      await userEvent.click(commentButtons[1]);
      expect(screen.queryByTestId("comment-input-1")).not.toBeInTheDocument();
      expect(screen.getByTestId("comment-input-2")).toBeInTheDocument();
      expect(screen.queryByTestId("comment-input-3")).not.toBeInTheDocument();

      // Click third comment - only third should show input
      await userEvent.click(commentButtons[2]);
      expect(screen.queryByTestId("comment-input-1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("comment-input-2")).not.toBeInTheDocument();
      expect(screen.getByTestId("comment-input-3")).toBeInTheDocument();
    });

    it("shows only one CommentInput at a time in nested comments", async () => {
      const mockComments: CommentWithChildren[] = [
        {
          id: "1",
          text: "Parent",
          children: [
            {
              id: "2",
              text: "Child 1",
              children: [],
            },
            {
              id: "3",
              text: "Child 2",
              children: [],
            },
          ],
        },
      ];

      vi.mocked(useComments).mockReturnValue(mockComments);

      render(<CommentsContainer />);

      const commentButtons = screen.getAllByText("Reply");

      // Click parent comment
      await userEvent.click(commentButtons[0]);
      expect(screen.getByTestId("comment-input-1")).toBeInTheDocument();
      expect(screen.queryByTestId("comment-input-2")).not.toBeInTheDocument();
      expect(screen.queryByTestId("comment-input-3")).not.toBeInTheDocument();

      // Click child comment - only child should show input
      await userEvent.click(commentButtons[1]);
      expect(screen.queryByTestId("comment-input-1")).not.toBeInTheDocument();
      expect(screen.getByTestId("comment-input-2")).toBeInTheDocument();
      expect(screen.queryByTestId("comment-input-3")).not.toBeInTheDocument();
    });

    it("shows only one CommentInput at a time across deeply nested comments", async () => {
      const mockComments: CommentWithChildren[] = [
        {
          id: "1",
          text: "Root 1",
          children: [
            {
              id: "2",
              text: "Child of Root 1",
              children: [
                {
                  id: "3",
                  text: "Grandchild",
                  children: [],
                },
              ],
            },
          ],
        },
        {
          id: "4",
          text: "Root 2",
          children: [],
        },
      ];

      vi.mocked(useComments).mockReturnValue(mockComments);

      render(<CommentsContainer />);

      const commentButtons = screen.getAllByText("Reply");

      // Click grandchild
      await userEvent.click(commentButtons[2]);
      expect(screen.getByTestId("comment-input-3")).toBeInTheDocument();
      expect(screen.queryByTestId("comment-input-1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("comment-input-2")).not.toBeInTheDocument();
      expect(screen.queryByTestId("comment-input-4")).not.toBeInTheDocument();

      // Click different root
      await userEvent.click(commentButtons[3]);
      expect(screen.getByTestId("comment-input-4")).toBeInTheDocument();
      expect(screen.queryByTestId("comment-input-1")).not.toBeInTheDocument();
      expect(screen.queryByTestId("comment-input-2")).not.toBeInTheDocument();
      expect(screen.queryByTestId("comment-input-3")).not.toBeInTheDocument();
    });
  });

  describe("rendering", () => {
    it("renders null when there are no comments", () => {
      vi.mocked(useComments).mockReturnValue([]);

      const { container } = render(<CommentsContainer />);

      expect(container.firstChild).toBeNull();
    });

    it("renders comments when they exist", () => {
      const mockComments: CommentWithChildren[] = [
        { id: "1", text: "Comment 1", children: [] },
      ];

      vi.mocked(useComments).mockReturnValue(mockComments);

      render(<CommentsContainer />);

      expect(screen.getByText("Comment 1")).toBeInTheDocument();
    });
  });
});
