import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { Task } from '../types';

/**
 * Hook for task CRUD operations scoped to a specific board
 */
export function useTaskActions(boardId: string) {
  const createTask = useStore((state) => state.createTask);
  const updateTask = useStore((state) => state.updateTask);
  const deleteTask = useStore((state) => state.deleteTask);
  const moveTaskToGroup = useStore((state) => state.moveTaskToGroup);

  return {
    createTask: useCallback(
      (columnId: string, taskData: Partial<Task>) => createTask(boardId, columnId, taskData),
      [boardId, createTask]
    ),
    updateTask,
    deleteTask,
    moveTaskToGroup: useCallback(
      (taskId: string, groupId: string | null) => moveTaskToGroup(boardId, taskId, groupId),
      [boardId, moveTaskToGroup]
    ),
  };
}
