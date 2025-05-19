import { useNavigate } from 'react-router-dom';
import { Plus, Activity, CheckCircle2, Clock, AlertCircle, User, Settings } from 'lucide-react';
import { useStore, getCurrentWorkspace } from '../store/useStore';
import { Task } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const createBoard = useStore((state) => state.createBoard);
  const currentWorkspaceId = useStore((state) => state.currentWorkspaceId);
  const workspace = getCurrentWorkspace();
  const statuses = useStore((state) => state.statuses);
  const statusConfigs = useStore((state) => state.statusConfigs);
  const getStatusColor = useStore((state) => state.getStatusColor);
  
  const handleCreateBoard = () => {
    if (currentWorkspaceId) {
      const newBoardId = createBoard(currentWorkspaceId, 'New Board');
      navigate(`/board/${newBoardId}`);
    }
  };
  
  const completedTasks = workspace?.boards.flatMap(board => 
    board.tasks.filter(task => task.status === 'done')
  ) || [];
  
  const inProgressTasks = workspace?.boards.flatMap(board => 
    board.tasks.filter(task => task.status === 'working')
  ) || [];
  
  const stuckTasks = workspace?.boards.flatMap(board => 
    board.tasks.filter(task => task.status === 'stuck')
  ) || [];
  
  const totalTasks = workspace?.boards.flatMap(board => board.tasks) || [];

  // Get all tasks from all boards
  const allTasks = workspace?.boards.flatMap((board) => board.tasks) || [];

  // Calculate status distribution
  const statusDistribution: ChartDataPoint[] = statusConfigs.map((config) => ({
    name: config.name.charAt(0).toUpperCase() + config.name.slice(1),
    value: allTasks.filter((task) => task.status === config.name).length,
    color: config.color,
  }));

  // Calculate priority distribution
  const priorityDistribution: ChartDataPoint[] = ['low', 'medium', 'high'].map((priority) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: allTasks.filter((task) => task.priority === priority).length,
  }));

  // Calculate tasks due this week
  const today = new Date();
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);

  const tasksThisWeek = allTasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate <= endOfWeek;
  });

  // Calculate completion rate
  const completedTasksCount = allTasks.filter((task) => task.status === 'done').length;
  const completionRate = allTasks.length > 0 
    ? ((completedTasksCount / allTasks.length) * 100).toFixed(1) 
    : 0;

  // Calculate average subtasks per task
  const totalSubtasks = allTasks.reduce((sum, task) => sum + task.subtasks.length, 0);
  const avgSubtasks = allTasks.length > 0 
    ? (totalSubtasks / allTasks.length).toFixed(1) 
    : 0;

  // Define priority colors
  const PRIORITY_COLORS = {
    'Low': '#4F46E5',    // blue
    'Medium': '#F59E0B', // yellow
    'High': '#EF4444',   // red
  };

  // Define status colors to match priority colors for consistency
  const STATUS_COLORS = {
    'Todo': '#4F46E5',     // blue
    'Working': '#F59E0B',  // yellow
    'Stuck': '#EF4444',    // red
    'Done': '#10B981',     // green
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{allTasks.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{completionRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Due This Week</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{tasksThisWeek.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Avg Subtasks</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{avgSubtasks}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-900 mb-4">Task Status Distribution</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={statusDistribution}
                  nameKey="name"
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                >
                  {statusDistribution.map((entry) => (
                    <Cell 
                      key={`cell-${entry.name}`} 
                      fill={entry.color} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base font-medium text-gray-900 mb-4">Task Priority Distribution</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={priorityDistribution} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name="Tasks"
                  radius={[4, 4, 0, 0]}
                >
                  {priorityDistribution.map((entry) => (
                    <Cell 
                      key={`cell-${entry.name}`}
                      fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || '#6B7280'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent boards */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Boards</h2>
          <button 
            className="btn btn-primary"
            onClick={handleCreateBoard}
          >
            <Plus size={16} className="mr-1" />
            New Board
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspace?.boards.slice(0, 6).map((board) => (
            <div 
              key={board.id} 
              className="card group cursor-pointer p-4 hover:border-primary-300"
              onClick={() => navigate(`/board/${board.id}`)}
            >
              <h3 className="mb-1 font-semibold text-gray-900 group-hover:text-primary-600">
                {board.title}
              </h3>
              {board.description && (
                <p className="mb-3 text-sm text-gray-500 line-clamp-2">
                  {board.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {board.tasks.length} tasks
                </span>
                <div className="flex space-x-1">
                  <span className="h-2 w-2 rounded-full bg-success-500"></span>
                  <span className="h-2 w-2 rounded-full bg-warning-500"></span>
                  <span className="h-2 w-2 rounded-full bg-error-500"></span>
                </div>
              </div>
            </div>
          ))}
          
          {(!workspace?.boards || workspace.boards.length === 0) && (
            <div className="card col-span-full flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <Plus size={24} />
              </div>
              <h3 className="mb-2 text-lg font-medium">No boards yet</h3>
              <p className="mb-4 text-gray-500">
                Create your first board to start organizing tasks
              </p>
              <button 
                className="btn btn-primary"
                onClick={handleCreateBoard}
              >
                <Plus size={16} className="mr-1" />
                Create Board
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button 
            className="card flex items-center p-4 hover:border-primary-300"
            onClick={handleCreateBoard}
          >
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary-100 text-primary-600">
              <Plus size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium">New Board</h3>
              <p className="text-sm text-gray-500">Create a project board</p>
            </div>
          </button>
          
          <button className="card flex items-center p-4 hover:border-primary-300">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary-100 text-primary-600">
              <Activity size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium">View Analytics</h3>
              <p className="text-sm text-gray-500">Performance insights</p>
            </div>
          </button>
          
          <button className="card flex items-center p-4 hover:border-primary-300">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary-100 text-primary-600">
              <User size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Team Members</h3>
              <p className="text-sm text-gray-500">Manage your team</p>
            </div>
          </button>
          
          <button className="card flex items-center p-4 hover:border-primary-300">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary-100 text-primary-600">
              <Settings size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-medium">Settings</h3>
              <p className="text-sm text-gray-500">Configure workspace</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}