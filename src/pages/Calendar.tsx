import { useState } from 'react';
import { addMonths, subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addDays, isToday, parseISO, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore, getCurrentWorkspace } from '../store/useStore';
import { TaskModal } from '../components/task/TaskModal';
import { Task, Status } from '../types';

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const workspaces = useStore((state) => state.workspaces);
  const updateTask = useStore((state) => state.updateTask);
  const deleteTask = useStore((state) => state.deleteTask);
  const workspace = getCurrentWorkspace();
  const getStatusColor = useStore((state) => state.getStatusColor);
  
  const allTasks = workspaces.flatMap(workspace => 
    workspace.boards.flatMap(board => board.tasks)
  );
  
  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
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
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add leading and trailing days for a complete calendar view
  let calendarStart = new Date(monthStart);
  while (calendarStart.getDay() !== 0) {
    calendarStart = addDays(calendarStart, -1);
  }
  
  let calendarEnd = new Date(monthEnd);
  while (calendarEnd.getDay() !== 6) {
    calendarEnd = addDays(calendarEnd, 1);
  }
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const getTasksForDay = (day: Date) => {
    return allTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = parseISO(task.dueDate);
      return isSameDay(dueDate, day);
    });
  };
  
  const getPriorityClass = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'border-success-400 bg-success-50';
      case 'medium': return 'border-warning-400 bg-warning-50';
      case 'high': return 'border-error-400 bg-error-50';
      default: return 'border-gray-300 bg-white';
    }
  };
  
  const getStatusClass = (status: Status) => {
    const color = getStatusColor(status);
    return {
      backgroundColor: `${color}20`, // 20% opacity
      color: color,
      borderColor: color,
    };
  };
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <div className="flex items-center space-x-4">
            <button
              className="btn btn-secondary"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft size={16} className="mr-1" />
              Previous
            </button>
            <h2 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              className="btn btn-secondary"
              onClick={handleNextMonth}
            >
              Next
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <div key={day} className="p-4 text-center text-sm font-medium text-gray-700">
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {calendarDays.map((day) => {
            const tasksForDay = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            
            return (
              <div
                key={day.toISOString()}
                className={`min-h-32 bg-white p-2 ${
                  !isCurrentMonth ? 'opacity-40' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full font-medium ${
                    isCurrentDay ? 'bg-primary-500 text-white' : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {tasksForDay.length > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                      {tasksForDay.length}
                    </span>
                  )}
                </div>
                
                <div className="mt-2 space-y-1 overflow-y-auto max-h-24">
                  {tasksForDay.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`cursor-pointer rounded border-l-2 px-2 py-1 text-xs ${getPriorityClass(task.priority)}`}
                      onClick={() => handleOpenTask(task)}
                    >
                      <div className="font-medium truncate">{task.title}</div>
                    </div>
                  ))}
                  {tasksForDay.length > 3 && (
                    <div className="text-xs text-gray-500 pl-2">
                      +{tasksForDay.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
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