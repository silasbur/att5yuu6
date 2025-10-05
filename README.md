# Nested Comments App

A React-based nested comments component with persistent storage using local-first approach.

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd react-app
```

2. Install dependencies:
```bash
npm install
```

### Running Locally

Start the development server:
```bash
npm run dev
```
## Testing

The app has comprehensive test coverage using Vitest and React Testing Library:
- **CommentItem tests**: Soft delete logic, visible children detection, nested rendering
- **CommentsContainer tests**: Single CommentInput visibility across nested comments
- **useComments tests**: Tree building from flat arrays, edge cases, orphaned comments

### Running Tests

```bash
npm run test          # Watch mode
npm test -- --run     # Single run
```

Open your browser and navigate to `http://localhost:5173`

## Component Architecture

```
App
└── CommentSection
    ├── CommentInput
    └── CommentsContainer
        └── CommentItem
            ├── CommentInput (conditional - only when replying)
            └── CommentItem (nested, recursive)
                └── ...
```

## Data Flow

```
useComments Hook
    │
    ├─→ useLiveQuery (Dexie) - reactive database queries
    │       │
    │       └─→ IndexedDB (CommentsDb)
    │               └── comments table
    │                   ├── id (primary key)
    │                   ├── text
    │                   ├── parentId (optional - for nesting)
    │                   └── isDeleted (optional - for soft delete)
    │
    └─→ buildCommentTree() - transforms flat array to nested tree
            │
            └─→ CommentsContainer renders tree structure
```

## Features

### Soft Delete
Comments are soft-deleted (marked as `isDeleted: true`) instead of being removed from the database:
- Deleted comments show as `[deleted]` placeholder
- Deleted comments with visible children remain visible to preserve thread structure
- Deleted comments with no visible children are automatically hidden
- Uses recursive `hasVisibleChildren()` logic to handle deeply nested threads

### Single Reply Input
Only one CommentInput can be active at a time across the entire comment tree:
- Managed by `commentingId` state in CommentsContainer
- Clicking "comment" on any comment closes other inputs and opens that comment's input
- Ensures clean UX without multiple simultaneous reply boxes



## Project Structure

```
src/
├── App.tsx                      # Main application component
├── CommentSection.tsx           # Comments page wrapper
├── CommentsContainer.tsx        # Container for root comments (manages commentingId state)
├── CommentItem.tsx              # Individual comment with nested children (recursive)
├── CommentInput.tsx             # Input field for adding comments
├── useComments.tsx              # Hook for fetching and transforming comment data
│   └── buildCommentTree()       # Pure function to transform flat → tree structure
├── db.ts                        # Dexie database configuration
│
├── CommentItem.test.tsx         # Tests for CommentItem (soft delete, rendering)
├── CommentsContainer.test.tsx   # Tests for CommentsContainer (single input visibility)
└── useComments.test.tsx         # Tests for buildCommentTree (tree construction)
```