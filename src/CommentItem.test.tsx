import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentItem from "./CommentItem";
import type { CommentWithChildren } from "./useComments";

// Mock the db module
vi.mock("./db", () => ({
  db: {
    comments: {
      update: vi.fn(),
    },
  },
}));

// Mock CommentInput component to avoid circular dependencies
vi.mock("./CommentInput", () => ({
  default: () => <div data-testid="comment-input">CommentInput</div>,
}));

describe("CommentItem", () => {
  const mockUpdateCommentingId = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering normal comments", () => {
    it("renders comment text and delete button for non-deleted comment", () => {
      const comment: CommentWithChildren = {
        id: "1",
        text: "Test comment",
        children: [],
      };

      render(
        <CommentItem
          comment={comment}
          commentingId=""
          updateCommentingId={mockUpdateCommentingId}
        />
      );

      expect(screen.getByText("Test comment")).toBeInTheDocument();
      expect(screen.getByText("x")).toBeInTheDocument();
    });

    it("shows comment button when not currently commenting", () => {
      const comment: CommentWithChildren = {
        id: "1",
        text: "Test comment",
        children: [],
      };

      render(
        <CommentItem
          comment={comment}
          commentingId=""
          updateCommentingId={mockUpdateCommentingId}
        />
      );

      expect(screen.getByText("Reply")).toBeInTheDocument();
    });

    it("shows CommentInput when commentingId matches comment id", () => {
      const comment: CommentWithChildren = {
        id: "1",
        text: "Test comment",
        children: [],
      };

      render(
        <CommentItem
          comment={comment}
          commentingId="1"
          updateCommentingId={mockUpdateCommentingId}
        />
      );

      expect(screen.getByTestId("comment-input")).toBeInTheDocument();
    });
  });

  describe("soft delete behavior", () => {
    it("renders [deleted] text for deleted comment", () => {
      const comment: CommentWithChildren = {
        id: "1",
        text: "Test comment",
        isDeleted: true,
        children: [],
      };

      const { container } = render(
        <CommentItem
          comment={comment}
          commentingId=""
          updateCommentingId={mockUpdateCommentingId}
        />
      );

      // Should return null for deleted comment with no children
      expect(container.firstChild).toBeNull();
    });

    it("hides delete button for deleted comment", () => {
      const comment: CommentWithChildren = {
        id: "1",
        text: "Test comment",
        isDeleted: true,
        hasVisibleChildren: true,
        children: [
          {
            id: "2",
            text: "Child comment",
            children: [],
            hasVisibleChildren: false,
          },
        ],
      };

      render(
        <CommentItem
          comment={comment}
          commentingId=""
          updateCommentingId={mockUpdateCommentingId}
        />
      );

      expect(screen.getByText("[deleted]")).toBeInTheDocument();
      expect(screen.getByText("Child comment")).toBeInTheDocument();
      // The child comment should have a delete button, but parent should not
      const deleteButtons = screen.getAllByText("x");
      expect(deleteButtons).toHaveLength(1); // Only child has delete button
    });

    it("calls db.comments.update when delete button is clicked", async () => {
      const { db } = await import("./db");
      const comment: CommentWithChildren = {
        id: "1",
        text: "Test comment",
        children: [],
      };

      render(
        <CommentItem
          comment={comment}
          commentingId=""
          updateCommentingId={mockUpdateCommentingId}
        />
      );

      await userEvent.click(screen.getByText("x"));

      expect(db.comments.update).toHaveBeenCalledWith("1", { isDeleted: true });
    });
  });

  describe("hasVisibleChildren logic", () => {
    it("hides deleted comment with no children", () => {
      const comment: CommentWithChildren = {
        id: "1",
        text: "Test comment",
        isDeleted: true,
        children: [],
      };

      const { container } = render(
        <CommentItem
          comment={comment}
          commentingId=""
          updateCommentingId={mockUpdateCommentingId}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("shows deleted comment with non-deleted children", () => {
      const comment: CommentWithChildren = {
        id: "1",
        text: "Parent comment",
        isDeleted: true,
        hasVisibleChildren: true,
        children: [
          {
            id: "2",
            text: "Child comment",
            isDeleted: false,
            children: [],
            hasVisibleChildren: false,
          },
        ],
      };

      render(
        <CommentItem
          comment={comment}
          commentingId=""
          updateCommentingId={mockUpdateCommentingId}
        />
      );

      expect(screen.getByText("[deleted]")).toBeInTheDocument();
      expect(screen.getByText("Child comment")).toBeInTheDocument();
    });

    it("hides deleted comment when all children are also deleted", () => {
      const comment: CommentWithChildren = {
        id: "1",
        text: "Parent comment",
        isDeleted: true,
        children: [
          {
            id: "2",
            text: "Child comment",
            isDeleted: true,
            children: [],
          },
        ],
      };

      const { container } = render(
        <CommentItem
          comment={comment}
          commentingId=""
          updateCommentingId={mockUpdateCommentingId}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("shows deleted comment when it has visible descendants (grandchildren)", () => {
      const comment: CommentWithChildren = {
        id: "1",
        text: "Grandparent",
        isDeleted: true,
        hasVisibleChildren: true,
        children: [
          {
            id: "2",
            text: "Parent",
            isDeleted: true,
            hasVisibleChildren: true,
            children: [
              {
                id: "3",
                text: "Child",
                isDeleted: false,
                children: [],
                hasVisibleChildren: false,
              },
            ],
          },
        ],
      };

      render(
        <CommentItem
          comment={comment}
          commentingId=""
          updateCommentingId={mockUpdateCommentingId}
        />
      );

      // Both grandparent and parent show as [deleted]
      const deletedElements = screen.getAllByText("[deleted]");
      expect(deletedElements).toHaveLength(2);
      expect(screen.getByText("Child")).toBeInTheDocument();
    });

    it("hides deleted comment when all descendants are deleted", () => {
      const comment: CommentWithChildren = {
        id: "1",
        text: "Grandparent",
        isDeleted: true,
        children: [
          {
            id: "2",
            text: "Parent",
            isDeleted: true,
            children: [
              {
                id: "3",
                text: "Child",
                isDeleted: true,
                children: [],
              },
            ],
          },
        ],
      };

      const { container } = render(
        <CommentItem
          comment={comment}
          commentingId=""
          updateCommentingId={mockUpdateCommentingId}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("nested rendering", () => {
    it("renders nested children correctly", () => {
      const comment: CommentWithChildren = {
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
      };

      render(
        <CommentItem
          comment={comment}
          commentingId=""
          updateCommentingId={mockUpdateCommentingId}
        />
      );

      expect(screen.getByText("Parent")).toBeInTheDocument();
      expect(screen.getByText("Child 1")).toBeInTheDocument();
      expect(screen.getByText("Child 2")).toBeInTheDocument();
    });
  });
});
