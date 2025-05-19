import { useParams } from 'react-router-dom';
import { BoardHeader } from '../components/board/BoardHeader';
import { BoardView } from '../components/board/BoardView';
import { useStore } from '../store/useStore';

export function Board() {
  const { boardId } = useParams<{ boardId: string }>();
  const board = useStore((state) => 
    state.workspaces
      .flatMap(ws => ws.boards)
      .find(b => b.id === boardId)
  );
  
  if (!board) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Board not found</h2>
          <p className="mt-2 text-gray-500">The board you're looking for doesn't exist or has been deleted.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <BoardHeader />
      <BoardView />
    </div>
  );
}