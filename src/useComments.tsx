// hooks/useComments.ts
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Comment } from "./db";
import { useMemo } from "react";

export interface CommentWithChildren extends Comment {
  children: CommentWithChildren[];
  hasVisibleChildren?: boolean;
}

export function buildCommentTree(
  flatComments: Comment[]
): CommentWithChildren[] {
  // Initialize all comments with empty children arrays
  const commentsMap = new Map<string, CommentWithChildren>();
  flatComments.forEach((comment) => {
    commentsMap.set(comment.id, { ...comment, children: [] });
  });

  // Build tree structure by linking children to parents
  const roots: CommentWithChildren[] = [];
  flatComments.forEach((comment) => {
    const commentWithChildren = commentsMap.get(comment.id)!;

    if (comment.parentId) {
      const commentParent = commentsMap.get(comment.parentId);
      if (commentParent) {
        commentParent.children.push(commentWithChildren);
      }
    } else {
      roots.push(commentWithChildren);
    }
  });

  // Compute visibility for soft-deleted comments (post-order traversal)
  function computeVisibility(comment: CommentWithChildren): boolean {
    comment.children.forEach((child) => computeVisibility(child));

    const hasVisible = comment.children.some(
      (child) => !child.isDeleted || child.hasVisibleChildren
    );
    comment.hasVisibleChildren = hasVisible;
    return hasVisible;
  }

  roots.forEach(computeVisibility);

  return roots;
}

export function useComments() {
  const flatComments = useLiveQuery(() => db.comments.toArray());

  const commentTree = useMemo(() => {
    if (!flatComments) return [];
    return buildCommentTree(flatComments);
  }, [flatComments]);

  return commentTree;
}
