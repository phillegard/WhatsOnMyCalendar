import { useParams } from 'react-router-dom';
import { useBoardById } from '../../hooks/useBoardById';
import { ListView } from './ListView';
import { KanbanView } from './KanbanView';
import { CalendarView } from './CalendarView';
import { Board } from '../../types';

function renderBoardView(board: Board): React.ReactNode {
  switch (board.viewType) {
    case 'list':
      return <ListView board={board} />;
    case 'kanban':
      return <KanbanView board={board} />;
    case 'calendar':
      return <CalendarView board={board} />;
    default:
      return <ListView board={board} />;
  }
}

export function BoardView(): React.ReactElement | null {
  const { boardId } = useParams<{ boardId: string }>();
  const board = useBoardById(boardId);

  if (!board) {
    return <div>Board not found</div>;
  }

  return (
    <div className="rounded-md bg-white border border-gray-200 shadow-sm">
      {renderBoardView(board)}
    </div>
  );
}