import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { Group } from '../types';

/**
 * Hook for group CRUD operations scoped to a specific board
 */
export function useGroupActions(boardId: string) {
  const createGroup = useStore((state) => state.createGroup);
  const updateGroup = useStore((state) => state.updateGroup);
  const deleteGroup = useStore((state) => state.deleteGroup);
  const toggleGroupExpanded = useStore((state) => state.toggleGroupExpanded);

  return {
    createGroup: useCallback(
      (title: string) => createGroup(boardId, title),
      [boardId, createGroup]
    ),
    updateGroup: useCallback(
      (groupId: string, data: Partial<Group>) => updateGroup(boardId, groupId, data),
      [boardId, updateGroup]
    ),
    deleteGroup: useCallback(
      (groupId: string) => deleteGroup(boardId, groupId),
      [boardId, deleteGroup]
    ),
    toggleGroupExpanded: useCallback(
      (groupId: string) => toggleGroupExpanded(boardId, groupId),
      [boardId, toggleGroupExpanded]
    ),
  };
}
