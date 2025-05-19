import { useState } from 'react';
import { MoreHorizontal, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../../store/useStore';
import { Board, Task, Status } from '../../types';
import { TaskModal } from '../task/TaskModal';

interface KanbanViewProps {
  board: Board;
}

export function KanbanView({ board }: KanbanViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const updateTask = useStore((state) => state.updateTask);
  const createTask = useStore((state) => state.createTask);
  const deleteTask = useStore((state) => state.deleteTask);
  const statuses = useStore((state) => state.statuses);
  
  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };
  
  const handleCreateTask = (status: Status) => {
    const newTaskId = createTask(board.id, board.columns[0].id, {
      title: 'New Task',
      description: '',
      status,
      priority: 'medium',
      assignees: [],
    });
    
    // Find the new task and open it
    const newTask = board.tasks.find(t => t.id === newTaskId);
    if (newTask) {
      handleOpenTask(newTask);
    }
  };
  
  const handleSaveTask = (task: Task) => {
    updateTask(task.id, task);
    setIsModalOpen(false);
    setSelectedTask(null);
  };
  
  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    setIsModalOpen(false);
    setSelectedTask(null);
  };
  
  const getTasksByStatus = (status: Status) => {
    return board.tasks.filter(task => task.status === status);
  };
  
  const getPriorityClass = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'task-priority-low';
      case 'medium': return 'task-priority-medium';
      case 'high': return 'task-priority-high';
      default: return 'task-priority-medium';
    }
  };
  
  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'todo': return 'bg-gray-100';
      case 'working': return 'bg-warning-100';
      case 'stuck': return 'bg-error-100';
      case 'done': return 'bg-success-100';
      default: return 'bg-gray-100';
    }
  };
  
  return (
    <div className="flex h-[calc(100vh-16rem)] overflow-x-auto p-4">
      {statuses.map((status) => (
        <div 
          key={status} 
          className={`mr-4 flex h-full w-72 flex-shrink-0 flex-col rounded-md ${getStatusColor(status)} p-2`}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium capitalize">{status}</h3>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs">
              {getTasksByStatus(status).length}
            </span>
          </div>
          
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {getTasksByStatus(status).map((task) => (
              <div
                key={task.id}
                className={`card cursor-pointer p-3 ${getPriorityClass(task.priority)}`}
                onClick={() => handleOpenTask(task)}
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <button 
                    className="text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle action menu
                    }}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
                
                {task.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                    {task.description}
                  </p>
                )}
                
                <div className="mt-3 flex items-center justify-between">
                  {task.assignees.length > 0 ? (
                    <div className="flex -space-x-2">
                      {task.assignees.map((assigneeId) => (
                        <div 
                          key={assigneeId} 
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-800"
                        >
                          U
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">Unassigned</span>
                  )}
                  
                  {task.dueDate && (
                    <div className="flex items-center text-xs text-gray-500">
                      <CalendarIcon size={12} className="mr-1" />
                      <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button
            className="group mt-2 flex w-full items-center justify-center rounded-md border border-dashed border-gray-300 py-2 hover:border-gray-400"
            onClick={() => handleCreateTask(status)}
          >
            <Plus size={14} className="mr-1 text-gray-400 group-hover:text-primary-500" />
            <span className="text-sm text-gray-500 group-hover:text-gray-900">Add Task</span>
          </button>
        </div>
      ))}
      
      {isModalOpen && selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}