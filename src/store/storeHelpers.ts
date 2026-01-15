import { Workspace, Board, Task, Group, Column } from '../types';
import { getCurrentTimestamp } from '../utils/dateHelpers';

/**
 * Helper to update a specific board within workspaces
 */
export const updateBoardInWorkspaces = (
  workspaces: Workspace[],
  boardId: string,
  updater: (board: Board) => Board
): Workspace[] => {
  return workspaces.map((workspace) => ({
    ...workspace,
    boards: workspace.boards.map((board) =>
      board.id === boardId ? updater(board) : board
    ),
  }));
};

/**
 * Helper to update all boards (for global operations like status rename)
 */
export const updateAllBoards = (
  workspaces: Workspace[],
  updater: (board: Board) => Board
): Workspace[] => {
  return workspaces.map((workspace) => ({
    ...workspace,
    boards: workspace.boards.map(updater),
  }));
};

/**
 * Helper to update a task within a specific board
 */
export const updateTaskInBoard = (
  board: Board,
  taskId: string,
  updater: (task: Task) => Task
): Board => {
  return {
    ...board,
    tasks: board.tasks.map((task) =>
      task.id === taskId ? updater(task) : task
    ),
    updatedAt: getCurrentTimestamp(),
  };
};

/**
 * Helper to update a group within a specific board
 */
export const updateGroupInBoard = (
  board: Board,
  groupId: string,
  updater: (group: Group) => Group
): Board => {
  return {
    ...board,
    groups: board.groups.map((group) =>
      group.id === groupId ? updater(group) : group
    ),
    updatedAt: getCurrentTimestamp(),
  };
};

/**
 * Helper to update a column within a specific board
 */
export const updateColumnInBoard = (
  board: Board,
  columnId: string,
  updater: (column: Column) => Column
): Board => {
  return {
    ...board,
    columns: board.columns.map((column) =>
      column.id === columnId ? updater(column) : column
    ),
    updatedAt: getCurrentTimestamp(),
  };
};

/**
 * Find board and its workspace
 */
export const findBoardWithWorkspace = (
  workspaces: Workspace[],
  boardId: string
): { workspace: Workspace; board: Board } | null => {
  for (const workspace of workspaces) {
    const board = workspace.boards.find((b) => b.id === boardId);
    if (board) return { workspace, board };
  }
  return null;
};

/**
 * Find a task across all workspaces
 */
export const findTaskWithBoard = (
  workspaces: Workspace[],
  taskId: string
): { board: Board; task: Task } | null => {
  for (const workspace of workspaces) {
    for (const board of workspace.boards) {
      const task = board.tasks.find((t) => t.id === taskId);
      if (task) return { board, task };
    }
  }
  return null;
};

/**
 * Update board with automatic timestamp
 */
export const withUpdatedAt = <T extends { updatedAt?: string }>(obj: T): T => ({
  ...obj,
  updatedAt: getCurrentTimestamp(),
});
