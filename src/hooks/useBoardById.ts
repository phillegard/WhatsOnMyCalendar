import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Board } from '../types';

/**
 * Optimized hook to get a board by ID without flatMapping on every render
 */
export function useBoardById(boardId: string | undefined): Board | null {
  const workspaces = useStore((state) => state.workspaces);

  return useMemo(() => {
    if (!boardId) return null;

    for (const workspace of workspaces) {
      const board = workspace.boards.find((b) => b.id === boardId);
      if (board) return board;
    }
    return null;
  }, [workspaces, boardId]);
}
