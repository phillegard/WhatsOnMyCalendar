import { useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ListView } from './ListView';
import { KanbanView } from './KanbanView';
import { CalendarView } from './CalendarView';

export function BoardView() {
  const { boardId } = useParams<{ boardId: string }>();
  console.log('BoardView rendering with boardId:', boardId);
  
  const board = useStore((state) => 
    state.workspaces
      .flatMap(ws => ws.boards)
      .find(b => b.id === boardId)
  );
  
  console.log('Found board:', board);
  
  if (!board) return <div>Board not found</div>;
  
  return (
    <div className="rounded-md bg-white border border-gray-200 shadow-sm">
      {board.viewType === 'list' && <ListView board={board} />}
      {board.viewType === 'kanban' && <KanbanView board={board} />}
      {board.viewType === 'calendar' && <CalendarView board={board} />}
    </div>
  );
}