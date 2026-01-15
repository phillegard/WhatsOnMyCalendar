import { Status, Priority } from '../types';

/**
 * Get style object for status badges with dynamic colors
 */
export const getStatusStyle = (status: Status, getColorFn: (status: Status) => string) => {
  const color = getColorFn(status);
  return {
    backgroundColor: `${color}20`, // 20% opacity
    color: color,
    borderColor: color,
  };
};

/**
 * Get Tailwind CSS classes for priority badges
 */
export const getPriorityClass = (priority: Priority): string => {
  switch (priority) {
    case 'low':
      return 'bg-gray-100 text-gray-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get task priority class name for task cards (used in KanbanView)
 */
export const getTaskPriorityClass = (priority: Priority): string => {
  switch (priority) {
    case 'low':
      return 'task-priority-low';
    case 'medium':
      return 'task-priority-medium';
    case 'high':
      return 'task-priority-high';
    default:
      return 'task-priority-medium';
  }
};
