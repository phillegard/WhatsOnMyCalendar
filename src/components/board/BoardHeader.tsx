import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Filter, LayoutGrid, List, Calendar, LucideIcon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useBoardById } from '../../hooks/useBoardById';
import { ViewType } from '../../types';

interface ViewOption {
  type: ViewType;
  icon: LucideIcon;
  label: string;
}

const VIEW_OPTIONS: ViewOption[] = [
  { type: 'list', icon: List, label: 'List' },
  { type: 'kanban', icon: LayoutGrid, label: 'Board' },
  { type: 'calendar', icon: Calendar, label: 'Calendar' },
];

export function BoardHeader(): React.ReactElement | null {
  const [isEditing, setIsEditing] = useState(false);
  const { boardId } = useParams<{ boardId: string }>();
  const board = useBoardById(boardId);
  const updateBoard = useStore((state) => state.updateBoard);
  const setBoardViewType = useStore((state) => state.setBoardViewType);
  const [title, setTitle] = useState(board?.title || '');

  useEffect(() => {
    if (board?.title) {
      setTitle(board.title);
    }
  }, [board?.title]);

  function handleUpdateTitle(): void {
    if (boardId && title.trim()) {
      updateBoard(boardId, { title });
      setIsEditing(false);
    }
  }

  function handleViewChange(viewType: ViewType): void {
    if (boardId) {
      setBoardViewType(boardId, viewType);
    }
  }

  function getViewButtonClass(viewType: ViewType): string {
    const baseClass = 'flex items-center rounded px-2 py-1 text-sm';
    const isActive = board?.viewType === viewType;
    return isActive
      ? `${baseClass} bg-gray-100 text-gray-900`
      : `${baseClass} text-gray-600 hover:text-gray-900`;
  }
  
  if (!board) return null;
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateTitle();
              }}
              className="flex items-center"
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input !py-1 !text-xl"
                autoFocus
                onBlur={handleUpdateTitle}
              />
            </form>
          ) : (
            <h1
              className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-gray-600"
              onClick={() => setIsEditing(true)}
            >
              {board.title}
            </h1>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center rounded-md bg-white border border-gray-300 p-1">
            {VIEW_OPTIONS.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                className={getViewButtonClass(type)}
                onClick={() => handleViewChange(type)}
              >
                <Icon size={16} className="mr-1" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          
          <button className="btn btn-secondary">
            <Filter size={16} className="mr-1" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>
    </div>
  );
}