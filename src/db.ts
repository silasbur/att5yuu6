// db.ts
import Dexie, { type EntityTable } from 'dexie';

export interface Comment {
  text: string;
  id: string;
  parentId?: string;
  isDeleted?: boolean;
}

const db = new Dexie('CommentsDb') as Dexie & {
  comments: EntityTable<
    Comment,
    'id' // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(2).stores({
  comments: '++id, text, parentId, isDeleted' // primary key "id" (for the runtime!)
});

export { db };
