// hooks/useComments.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Comment } from './db';
import {useMemo } from "react"

export interface CommentWithChildren extends Comment {
  children: CommentWithChildren[];
  hasVisibleChildren?: boolean;
}

export function buildCommentTree(flatComments: Comment[]): CommentWithChildren[] {
  const commentsMap = new Map<string, CommentWithChildren>()

  flatComments.forEach((comment) => {
    commentsMap.set(comment.id, {...comment, children: []})
  })

  const roots: CommentWithChildren[] = []
  flatComments.forEach((comment) => {
    const commentWithChildren = commentsMap.get(comment.id)!

    // Check if has parentId, if not then it is a root, otherwise update item in map
    if (comment.parentId) {
      const commentParent = commentsMap.get(comment.parentId)
      if (commentParent) {
        commentParent.children.push(commentWithChildren)
      }
    } else {
      roots.push(commentWithChildren)
    }
  })

  // Compute visibility bottom-up
  function computeVisibility(comment: CommentWithChildren): boolean {
    // First, recursively compute for all children
    comment.children.forEach(child => computeVisibility(child));

    // Then compute for this node
    const hasVisible = comment.children.some(child =>
      !child.isDeleted || child.hasVisibleChildren
    );
    comment.hasVisibleChildren = hasVisible;
    return hasVisible;
  }

  roots.forEach(computeVisibility);

  return roots;
}

export function useComments() {
  const flatComments = useLiveQuery(() => db.comments.toArray())

  const commentTree = useMemo(() => {
    if (!flatComments) return []
    return buildCommentTree(flatComments)
  }, [flatComments]);

  return commentTree;
}
