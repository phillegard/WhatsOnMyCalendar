import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isSameMonth, isToday, parseISO, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Board, Task } from '../../types';
import { TaskModal } from '../task/TaskModal';

interface CalendarViewProps {
  board: Board;
}

export function CalendarView({ board }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const updateTask = useStore((state) => state.updateTask);
  const deleteTask = useStore((state) => state.deleteTask);
  
  const handlePreviousMonth = () => {
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    setCurrentMonth(previousMonth);
  };
  
  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
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
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add leading and trailing days for a complete calendar view
  let startDay = new Date(monthStart);
  while (startDay.getDay() !== 0) {
    startDay = addDays(startDay, -1);
  }
  
  let endDay = new Date(monthEnd);
  while (endDay.getDay() !== 6) {
    endDay = addDays(endDay, 1);
  }
  
  const calendarDays = eachDayOfInterval({ start: startDay, end: endDay });
  
  const getTasksForDay = (day: Date) => {
    return board.tasks.filter(task => {
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
  
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
            onClick={handleNextMonth}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day) => {
          const tasksForDay = getTasksForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);
          
          return (
            <div
              key={day.toISOString()}
              className={`relative h-32 border-t p-1 ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isCurrentDay ? 'border-primary-400' : 'border-gray-200'}`}
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                isCurrentDay ? 'bg-primary-500 text-white' : 'text-gray-700'
              } ${!isCurrentMonth && 'text-gray-400'}`}>
                {format(day, 'd')}
              </div>
              
              <div className="mt-1 space-y-1 overflow-y-auto max-h-24">
                {tasksForDay.map((task) => (
                  <div
                    key={task.id}
                    className={`cursor-pointer rounded border-l-2 px-2 py-1 text-xs ${getPriorityClass(task.priority)}`}
                    onClick={() => handleOpenTask(task)}
                  >
                    <div className="font-medium truncate">{task.title}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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