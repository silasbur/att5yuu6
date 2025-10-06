import { describe, it, expect } from "vitest";
import { buildCommentTree } from "./useComments";
import type { Comment } from "./db";

describe("buildCommentTree", () => {
  describe("basic functionality", () => {
    it("returns empty array for empty input", () => {
      const result = buildCommentTree([]);
      expect(result).toEqual([]);
    });

    it("builds tree with single root comment", () => {
      const flat: Comment[] = [{ id: "1", text: "Root comment" }];

      const tree = buildCommentTree(flat);

      expect(tree).toEqual([
        {
          id: "1",
          text: "Root comment",
          children: [],
          hasVisibleChildren: false,
        },
      ]);
    });

    it("builds tree with multiple root comments", () => {
      const flat: Comment[] = [
        { id: "1", text: "Root 1" },
        { id: "2", text: "Root 2" },
        { id: "3", text: "Root 3" },
      ];

      const tree = buildCommentTree(flat);

      expect(tree).toHaveLength(3);
      expect(tree[0]).toEqual({
        id: "1",
        text: "Root 1",
        children: [],
        hasVisibleChildren: false,
      });
      expect(tree[1]).toEqual({
        id: "2",
        text: "Root 2",
        children: [],
        hasVisibleChildren: false,
      });
      expect(tree[2]).toEqual({
        id: "3",
        text: "Root 3",
        children: [],
        hasVisibleChildren: false,
      });
    });
  });

  describe("nested comments", () => {
    it("builds tree with one level of nesting", () => {
      const flat: Comment[] = [
        { id: "1", text: "Parent" },
        { id: "2", text: "Child 1", parentId: "1" },
        { id: "3", text: "Child 2", parentId: "1" },
      ];

      const tree = buildCommentTree(flat);

      expect(tree).toHaveLength(1);
      expect(tree[0]).toEqual({
        id: "1",
        text: "Parent",
        children: [
          {
            id: "2",
            text: "Child 1",
            parentId: "1",
            children: [],
            hasVisibleChildren: false,
          },
          {
            id: "3",
            text: "Child 2",
            parentId: "1",
            children: [],
            hasVisibleChildren: false,
          },
        ],
        hasVisibleChildren: true,
      });
    });

    it("builds tree with multiple levels of nesting", () => {
      const flat: Comment[] = [
        { id: "1", text: "Root" },
        { id: "2", text: "Child", parentId: "1" },
        { id: "3", text: "Grandchild", parentId: "2" },
        { id: "4", text: "Great-grandchild", parentId: "3" },
      ];

      const tree = buildCommentTree(flat);

      expect(tree).toEqual([
        {
          id: "1",
          text: "Root",
          children: [
            {
              id: "2",
              text: "Child",
              parentId: "1",
              children: [
                {
                  id: "3",
                  text: "Grandchild",
                  parentId: "2",
                  children: [
                    {
                      id: "4",
                      text: "Great-grandchild",
                      parentId: "3",
                      children: [],
                      hasVisibleChildren: false,
                    },
                  ],
                  hasVisibleChildren: true,
                },
              ],
              hasVisibleChildren: true,
            },
          ],
          hasVisibleChildren: true,
        },
      ]);
    });

    it("builds complex tree with multiple branches", () => {
      const flat: Comment[] = [
        { id: "1", text: "Root 1" },
        { id: "2", text: "Root 2" },
        { id: "3", text: "Child of Root 1", parentId: "1" },
        { id: "4", text: "Child of Root 2", parentId: "2" },
        { id: "5", text: "Grandchild of Root 1", parentId: "3" },
      ];

      const tree = buildCommentTree(flat);

      expect(tree).toHaveLength(2);

      // Check Root 1 branch
      expect(tree[0].id).toBe("1");
      expect(tree[0].children).toHaveLength(1);
      expect(tree[0].children[0].id).toBe("3");
      expect(tree[0].children[0].children).toHaveLength(1);
      expect(tree[0].children[0].children[0].id).toBe("5");

      // Check Root 2 branch
      expect(tree[1].id).toBe("2");
      expect(tree[1].children).toHaveLength(1);
      expect(tree[1].children[0].id).toBe("4");
    });
  });

  describe("edge cases", () => {
    it("handles orphaned comments (parent does not exist)", () => {
      const flat: Comment[] = [
        { id: "1", text: "Root" },
        { id: "2", text: "Orphan", parentId: "nonexistent" },
        { id: "3", text: "Another orphan", parentId: "also-nonexistent" },
      ];

      const tree = buildCommentTree(flat);

      // Only root should be in tree, orphans are ignored
      expect(tree).toHaveLength(1);
      expect(tree[0]).toEqual({
        id: "1",
        text: "Root",
        children: [],
        hasVisibleChildren: false,
      });
    });

    it("handles comments in any order", () => {
      // Children appear before parents in the array
      const flat: Comment[] = [
        { id: "3", text: "Grandchild", parentId: "2" },
        { id: "1", text: "Root" },
        { id: "2", text: "Child", parentId: "1" },
      ];

      const tree = buildCommentTree(flat);

      expect(tree).toEqual([
        {
          id: "1",
          text: "Root",
          children: [
            {
              id: "2",
              text: "Child",
              parentId: "1",
              children: [
                {
                  id: "3",
                  text: "Grandchild",
                  parentId: "2",
                  children: [],
                  hasVisibleChildren: false,
                },
              ],
              hasVisibleChildren: true,
            },
          ],
          hasVisibleChildren: true,
        },
      ]);
    });

    it("handles comments with isDeleted flag", () => {
      const flat: Comment[] = [
        { id: "1", text: "Root", isDeleted: true },
        { id: "2", text: "Child", parentId: "1", isDeleted: false },
      ];

      const tree = buildCommentTree(flat);

      expect(tree).toEqual([
        {
          id: "1",
          text: "Root",
          isDeleted: true,
          children: [
            {
              id: "2",
              text: "Child",
              parentId: "1",
              isDeleted: false,
              children: [],
              hasVisibleChildren: false,
            },
          ],
          hasVisibleChildren: true,
        },
      ]);
    });

    it("preserves all comment properties", () => {
      const flat: Comment[] = [
        {
          id: "1",
          text: "Root with properties",
          isDeleted: false,
        },
        {
          id: "2",
          text: "Child with properties",
          parentId: "1",
          isDeleted: true,
        },
      ];

      const tree = buildCommentTree(flat);

      expect(tree[0].isDeleted).toBe(false);
      expect(tree[0].children[0].isDeleted).toBe(true);
      expect(tree[0].children[0].parentId).toBe("1");
    });
  });

  describe("real-world scenarios", () => {
    it("builds Reddit-style comment thread", () => {
      const flat: Comment[] = [
        { id: "1", text: "Original post comment" },
        { id: "2", text: "First reply", parentId: "1" },
        { id: "3", text: "Second reply", parentId: "1" },
        { id: "4", text: "Reply to first reply", parentId: "2" },
        { id: "5", text: "Reply to second reply", parentId: "3" },
        { id: "6", text: "Deep nested reply", parentId: "4" },
      ];

      const tree = buildCommentTree(flat);

      expect(tree).toHaveLength(1);
      expect(tree[0].children).toHaveLength(2); // Two direct replies
      expect(tree[0].children[0].children).toHaveLength(1); // First reply has one reply
      expect(tree[0].children[0].children[0].children).toHaveLength(1); // Deep nesting
      expect(tree[0].children[1].children).toHaveLength(1); // Second reply has one reply
    });

    it("handles mixed deleted and active comments", () => {
      const flat: Comment[] = [
        { id: "1", text: "Active root", isDeleted: false },
        { id: "2", text: "Deleted parent", parentId: "1", isDeleted: true },
        {
          id: "3",
          text: "Active child of deleted",
          parentId: "2",
          isDeleted: false,
        },
        { id: "4", text: "Another root", isDeleted: false },
      ];

      const tree = buildCommentTree(flat);

      expect(tree).toHaveLength(2);
      expect(tree[0].isDeleted).toBe(false);
      expect(tree[0].children[0].isDeleted).toBe(true);
      expect(tree[0].children[0].children[0].isDeleted).toBe(false);
    });
  });
});
