// hooks/useComments.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Comment } from './db';
import {useMemo } from "react"

export interface CommentWithChildren extends Comment {
  children: CommentWithChildren[];
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
