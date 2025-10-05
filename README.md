# Nested Comments App

A React-based nested comments component with persistent storage using local-first approach.

## Component Architecture

```
App
├── CommentInput
└── CommentsContainer
    └── CommentItem
        ├── CommentInput 
        └── CommentItem (nested)
                └── ...
```

## Data Flow

```
useComments Hook
    │
    ├─→ useLiveQuery (Dexie)
    │       │
    │       └─→ IndexedDB (CommentsDb)
    │               └── comments table
    │                   ├── id (primary key)
    │                   ├── text
    │                   └── parentId (optional)
    │
    └─→ Build tree structure from flat array
            │
            └─→ CommentsContainer
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

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

Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── App.tsx              # Main application component
├── CommentsContainer.tsx # Container for root comments
├── CommentItem.tsx      # Individual comment with nested children
├── CommentInput.tsx     # Input field for adding comments
├── useComments.tsx      # Hook for fetching and transforming comment data
└── db.ts               # Dexie database configuration
```