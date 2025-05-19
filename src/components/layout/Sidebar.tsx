import { useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  Plus, 
  Home, 
  ArrowUpRight,
  Trash2
} from 'lucide-react';
import { useStore, getCurrentWorkspace } from '../../store/useStore';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobile?: boolean;
}

export function Sidebar({ isCollapsed, toggleSidebar, isMobile = false }: SidebarProps) {
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [hoveredBoardId, setHoveredBoardId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { boardId } = useParams();
  const currentWorkspaceId = useStore((state) => state.currentWorkspaceId);
  const workspace = getCurrentWorkspace();
  const createBoard = useStore((state) => state.createBoard);
  const deleteBoard = useStore((state) => state.deleteBoard);
  
  const handleCreateBoard = () => {
    if (newBoardName.trim() && currentWorkspaceId) {
      const newBoardId = createBoard(currentWorkspaceId, newBoardName);
      setNewBoardName('');
      setShowNewBoard(false);
      navigate(`/app/board/${newBoardId}`);
    }
  };

  const handleDeleteBoard = (e: React.MouseEvent, boardIdToDelete: string) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    if (window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      deleteBoard(boardIdToDelete);
      if (boardId === boardIdToDelete) {
        navigate('/app');
      }
    }
  };
  
  return (
    <div className={`flex h-full flex-col bg-white border-r border-gray-200 ${isCollapsed ? 'items-center' : ''}`}>
      {/* Logo and collapse button */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-200 py-4 px-4`}>
        {!isCollapsed && (
          <Link to="/app" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-600 text-white">
              <Home size={18} />
            </div>
            <span className="text-lg font-semibold text-gray-900">TaskHub</span>
          </Link>
        )}
        
        {isCollapsed && (
          <Link to="/app" className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-600 text-white">
            <Home size={18} />
          </Link>
        )}
        
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>
      
      {/* Main navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Main links */}
        <nav className={`space-y-1 px-2 ${isCollapsed ? 'text-center' : ''}`}>
          <Link
            to="/app"
            className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
              location.pathname === '/app' 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard 
              size={18} 
              className={isCollapsed ? 'mx-auto' : 'mr-2'} 
            />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
          
          <Link
            to="/app/calendar"
            className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
              location.pathname === '/calendar' 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar 
              size={18} 
              className={isCollapsed ? 'mx-auto' : 'mr-2'} 
            />
            {!isCollapsed && <span>Calendar</span>}
          </Link>
        </nav>
        
        {/* Boards section */}
        <div className="mt-8">
          <div className={`mb-2 px-3 ${isCollapsed ? 'text-center' : 'flex justify-between items-center'}`}>
            {!isCollapsed && <h3 className="text-xs font-semibold uppercase text-gray-500">Boards</h3>}
            <button
              onClick={() => setShowNewBoard(true)}
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
              aria-label="Add new board"
            >
              <Plus size={16} />
            </button>
          </div>
          
          {/* New board form */}
          {showNewBoard && !isCollapsed && (
            <div className="mb-2 px-3 animate-slide-down">
              <div className="flex items-center rounded-md border border-gray-300 bg-white p-1">
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Board name"
                  className="flex-1 border-none bg-transparent px-2 py-1 text-sm focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleCreateBoard}
                  disabled={!newBoardName.trim()}
                  className="rounded-md bg-primary-600 px-2 py-1 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          )}
          
          {/* Board list */}
          <div className="space-y-1 px-2">
            {workspace?.boards.map((board) => (
              <Link
                key={board.id}
                to={`/app/board/${board.id}`}
                className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
                  boardId === board.id
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onMouseEnter={() => setHoveredBoardId(board.id)}
                onMouseLeave={() => setHoveredBoardId(null)}
              >
                <div className="flex items-center min-w-0">
                  {isCollapsed ? (
                    <span className="mx-auto">{board.title.charAt(0)}</span>
                  ) : (
                    <>
                      <span className="mr-2 flex h-2 w-2 items-center justify-center rounded-full bg-primary-500"></span>
                      <span className="truncate">{board.title}</span>
                    </>
                  )}
                </div>
                {!isCollapsed && hoveredBoardId === board.id && (
                  <button
                    onClick={(e) => handleDeleteBoard(e, board.id)}
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-error-600"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom section */}
      <div className={`border-t border-gray-200 p-4 ${isCollapsed ? 'text-center' : ''}`}>
        <div className={`mb-3 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <Link
            to="/app/settings"
            className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
              location.pathname === '/settings' 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings 
              size={18} 
              className={isCollapsed ? 'mx-auto' : 'mr-2'} 
            />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
        
        {!isCollapsed && (
          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-700">Upgrade to Pro</p>
            <p className="mt-1 text-xs text-gray-500">Get more features</p>
            <a 
              href="#" 
              className="mt-2 flex items-center text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Learn more
              <ArrowUpRight size={12} className="ml-1" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}