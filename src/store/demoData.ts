import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Board, Column, Task, User, Workspace, StatusConfig } from '../types';
import { getCurrentTimestamp } from '../utils/dateHelpers';

// Demo user
export const demoUser: User = {
  id: 'user-1',
  name: 'Demo User',
  email: 'demo@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1',
  role: 'admin',
};

// Default status configurations
export const DEFAULT_STATUS_CONFIGS: StatusConfig[] = [
  { name: 'todo', color: '#4F46E5' },    // blue
  { name: 'working', color: '#F59E0B' }, // yellow
  { name: 'stuck', color: '#EF4444' },   // red
  { name: 'done', color: '#10B981' },    // green
];

// Create default columns for a new board
export const createDefaultColumns = (boardId: string): Column[] => [
  { id: uuidv4(), title: 'Title', type: 'text', boardId, order: 0 },
  { id: uuidv4(), title: 'Status', type: 'status', boardId, order: 1 },
  { id: uuidv4(), title: 'Priority', type: 'priority', boardId, order: 2 },
  { id: uuidv4(), title: 'Assignee', type: 'person', boardId, order: 3 },
  { id: uuidv4(), title: 'Due Date', type: 'date', boardId, order: 4 },
];

// Create initial demo state
export const createDemoState = () => {
  const now = getCurrentTimestamp();
  const workspaceId = uuidv4();
  const boardId = uuidv4();
  const columns = createDefaultColumns(boardId);

  const tasks: Task[] = [
    {
      id: uuidv4(),
      title: 'Implement project dashboard',
      description: 'Create the main dashboard with project statistics and recent activity',
      status: 'working',
      priority: 'high',
      assignees: ['user-1'],
      dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      createdAt: now,
      updatedAt: now,
      columnId: columns[0].id,
      subtasks: [],
    },
    {
      id: uuidv4(),
      title: 'Design user interface',
      description: 'Create wireframes and mockups for the application',
      status: 'done',
      priority: 'medium',
      assignees: ['user-1'],
      dueDate: format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      createdAt: now,
      updatedAt: now,
      columnId: columns[0].id,
      subtasks: [],
    },
    {
      id: uuidv4(),
      title: 'Implement authentication',
      description: 'Add user login and registration functionality',
      status: 'todo',
      priority: 'high',
      assignees: ['user-1'],
      dueDate: format(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      createdAt: now,
      updatedAt: now,
      columnId: columns[0].id,
      subtasks: [],
    },
  ];

  const board: Board = {
    id: boardId,
    title: 'Product Development',
    description: 'Track the development of our product',
    createdAt: now,
    updatedAt: now,
    columns,
    tasks,
    groups: [],
    ungroupedTaskIds: tasks.map((t) => t.id),
    viewType: 'list',
  };

  const workspace: Workspace = {
    id: workspaceId,
    name: 'My Workspace',
    createdAt: now,
    members: [demoUser],
    boards: [board],
  };

  return {
    workspaces: [workspace],
    currentWorkspaceId: workspaceId,
    currentBoardId: boardId,
    currentUser: demoUser,
    boardViewType: 'list' as const,
    statuses: ['todo', 'working', 'stuck', 'done'],
    statusConfigs: DEFAULT_STATUS_CONFIGS,
  };
};
