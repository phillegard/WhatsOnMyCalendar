import { Priority, Status } from '../types';

export const DEFAULT_COLOR = '#6B7280';

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: '#4F46E5',
  medium: '#F59E0B',
  high: '#EF4444',
};

export const PRIORITY_COLORS_DISPLAY = {
  Low: '#4F46E5',
  Medium: '#F59E0B',
  High: '#EF4444',
} as const;

export const PRIORITY_BADGE_CLASSES: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export const STATUS_BACKGROUND_CLASSES: Record<string, string> = {
  todo: 'bg-gray-100',
  working: 'bg-warning-100',
  stuck: 'bg-error-100',
  done: 'bg-success-100',
};

export function getStatusBackgroundClass(status: Status): string {
  return STATUS_BACKGROUND_CLASSES[status] ?? 'bg-gray-100';
}

export function getPriorityColor(priority: Priority): string {
  return PRIORITY_COLORS[priority] ?? DEFAULT_COLOR;
}
