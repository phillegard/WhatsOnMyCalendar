export type Status = string;
export type Priority = 'low' | 'medium' | 'high';
export type ViewType = 'list' | 'kanban' | 'calendar';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  status: Status;
  priority: Priority;
  assignees: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignees: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  columnId: string;
  subtasks: Subtask[];
}

export interface Column {
  id: string;
  title: string;
  type: 'text' | 'status' | 'priority' | 'person' | 'date' | 'checkbox';
  boardId: string;
  order: number;
}

export interface Group {
  id: string;
  title: string;
  description?: string;
  isExpanded: boolean;
  taskIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  columns: Column[];
  tasks: Task[];
  groups: Group[];
  viewType: ViewType;
  ungroupedTaskIds: string[]; // Tasks that don't belong to any group
}

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  members: User[];
  boards: Board[];
}

export interface StatusConfig {
  name: string;
  color: string;
}