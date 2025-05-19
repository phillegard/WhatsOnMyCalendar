import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, Plus, LayoutGrid, List, Calendar } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ViewType } from '../../types';

export function BoardHeader() {
  const [isEditing, setIsEditing] = useState(false);
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const board = useStore((state) => 
    state.workspaces
      .flatMap(ws => ws.boards)
      .find(b => b.id === boardId)
  );
  const updateBoard = useStore((state) => state.updateBoard);
  const deleteBoard = useStore((state) => state.deleteBoard);
  const setBoardViewType = useStore((state) => state.setBoardViewType);
  const [title, setTitle] = useState(board?.title || '');
  
  useEffect(() => {
    if (board?.title) {
      setTitle(board.title);
    }
  }, [board?.title]);

  const handleUpdateTitle = () => {
    if (boardId && title.trim()) {
      updateBoard(boardId, { title });
      setIsEditing(false);
    }
  };

  const handleDeleteBoard = () => {
    if (boardId && window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      deleteBoard(boardId);
      navigate('/');
    }
  };
  
  const handleViewChange = (viewType: ViewType) => {
    if (boardId) {
      setBoardViewType(boardId, viewType);
    }
  };
  
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
            <button
              className={`flex items-center rounded px-2 py-1 text-sm ${
                board.viewType === 'list' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => handleViewChange('list')}
            >
              <List size={16} className="mr-1" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              className={`flex items-center rounded px-2 py-1 text-sm ${
                board.viewType === 'kanban' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => handleViewChange('kanban')}
            >
              <LayoutGrid size={16} className="mr-1" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              className={`flex items-center rounded px-2 py-1 text-sm ${
                board.viewType === 'calendar' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => handleViewChange('calendar')}
            >
              <Calendar size={16} className="mr-1" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
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