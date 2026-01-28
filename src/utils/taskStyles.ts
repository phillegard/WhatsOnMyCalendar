import { Status, Priority } from '../types';
import { PRIORITY_BADGE_CLASSES } from './colors';

/**
 * Get style object for status badges with dynamic colors
 */
export function getStatusStyle(status: Status, getColorFn: (status: Status) => string): {
  backgroundColor: string;
  color: string;
  borderColor: string;
} {
  const color = getColorFn(status);
  return {
    backgroundColor: `${color}20`,
    color: color,
    borderColor: color,
  };
}

/**
 * Get Tailwind CSS classes for priority badges
 */
export function getPriorityClass(priority: Priority): string {
  return PRIORITY_BADGE_CLASSES[priority] ?? PRIORITY_BADGE_CLASSES.low;
}

const TASK_PRIORITY_CLASSES: Record<Priority, string> = {
  low: 'task-priority-low',
  medium: 'task-priority-medium',
  high: 'task-priority-high',
};

/**
 * Get task priority class name for task cards (used in KanbanView)
 */
export function getTaskPriorityClass(priority: Priority): string {
  return TASK_PRIORITY_CLASSES[priority] ?? TASK_PRIORITY_CLASSES.medium;
}
