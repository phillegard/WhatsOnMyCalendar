# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a project management web application built with React, TypeScript, Vite, and Tailwind CSS. It provides a task tracking system similar to Monday.com with support for multiple views (List, Kanban, Calendar), workspaces, boards, and Supabase authentication.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Environment Setup

Copy `.env.example` to `.env` and configure Supabase credentials:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Architecture

### State Management

The application uses **Zustand** for state management with two primary stores:

1. **`useStore`** (`src/store/useStore.ts`): Main application state store with persistence
   - Manages workspaces, boards, columns, tasks, groups, and status configurations
   - Uses `zustand/middleware` persist to save state to localStorage under `taskhub-storage`
   - Contains the full hierarchical data structure: Workspaces → Boards → Tasks
   - All CRUD operations for workspaces, boards, tasks, columns, groups, and statuses are defined here

2. **`useAuthStore`** (`src/store/authStore.ts`): Authentication state
   - Manages user authentication state via Supabase
   - Handles sign up, sign in, and sign out operations

### Data Model Hierarchy

```
Workspace
├── boards: Board[]
└── members: User[]

Board
├── columns: Column[]
├── tasks: Task[]
├── groups: Group[]
├── ungroupedTaskIds: string[]
└── viewType: 'list' | 'kanban' | 'calendar'

Task
├── columnId: string (reference to which column)
├── status: string (dynamic, configured via statusConfigs)
├── priority: 'low' | 'medium' | 'high'
├── assignees: string[] (user IDs)
└── subtasks: Subtask[]

Group
└── taskIds: string[] (tasks belonging to this group)
```

### Key Concepts

**Boards and Views:**
- Each board has a `viewType` property that determines how tasks are displayed
- Three view types: `list`, `kanban`, `calendar`
- View components: `ListView`, `KanbanView`, `CalendarView` (in `src/components/board/`)
- View type is persisted per board and can be switched via `setBoardViewType()`

**Task Organization:**
- Tasks can be organized into **Groups** (collapsible sections within a board)
- Tasks not in a group are tracked in `board.ungroupedTaskIds`
- Groups are managed via `createGroup()`, `updateGroup()`, `deleteGroup()`, `moveTaskToGroup()`

**Columns:**
- Boards have configurable columns with different types: `text`, `status`, `priority`, `person`, `date`, `checkbox`
- Default columns are created via `createDefaultColumns()` when a new board is created
- Columns represent the table structure in list view but don't dictate data storage

**Status Management:**
- Statuses are dynamically configurable (not hardcoded)
- Managed via `statusConfigs` array in the store (name + color pairs)
- Default statuses: `todo`, `working`, `stuck`, `done`
- When a status is renamed via `updateStatus()`, all tasks using that status are automatically updated

### Routing Structure

- `/` - Landing page (public)
- `/login` - Login page (public)
- `/signup` - Sign up page (public)
- `/app` - Protected route with Layout wrapper
  - `/app` - Dashboard (shows all boards)
  - `/app/board/:boardId` - Individual board view
  - `/app/calendar` - Calendar view across all boards
  - `/app/settings` - Application settings

### Authentication Flow

- Supabase handles authentication (configured in `src/lib/supabase.ts`)
- Auth state is monitored in `App.tsx` via `supabase.auth.onAuthStateChange()`
- `ProtectedRoute` component wraps authenticated routes and redirects to `/login` if not authenticated
- Auth UI components use `@supabase/auth-ui-react` for consistent styling

### Component Organization

```
src/
├── components/
│   ├── auth/          # Authentication components (Login, SignUp, ProtectedRoute)
│   ├── board/         # Board-related components (views, headers, task groups)
│   ├── layout/        # Layout components (Layout, Header, Sidebar)
│   ├── settings/      # Settings components (Settings, StatusSettings)
│   └── task/          # Task components (TaskModal)
├── pages/             # Top-level route pages
├── store/             # Zustand stores
├── lib/               # Third-party library configurations (Supabase)
└── types/             # TypeScript type definitions
```

### Drag and Drop

- Uses `@hello-pangea/dnd` library for drag-and-drop functionality
- Primary use case is Kanban view for dragging tasks between columns
- Task reordering handled by `moveTask()` action in the store

### Date Handling

- Uses `date-fns` library for date formatting and manipulation
- Format: ISO 8601 strings (`"yyyy-MM-dd'T'HH:mm:ss"`)
- All timestamps use `format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")`

### Styling

- Tailwind CSS for all styling
- Configuration in `tailwind.config.js`
- Icons from `lucide-react` library
- No custom CSS files; all styles are utility classes

## Important Implementation Notes

1. **Store Updates**: When updating nested data (tasks within boards within workspaces), always map through the entire hierarchy to maintain immutability.

2. **Board ID from Route**: Most board-related components get `boardId` from React Router params via `useParams<{ boardId: string }>()` and then find the board in the store.

3. **Current Board/Workspace**: The store tracks `currentWorkspaceId` and `currentBoardId` for convenience. Helper functions `getCurrentWorkspace()` and `getCurrentBoard()` retrieve them.

4. **Demo Data**: Initial demo data is created in `createInitialState()` with a default workspace, board, and sample tasks.

5. **Type Safety**: All types are defined in `src/types/index.ts`. Status is a string type (dynamic), not an enum.
