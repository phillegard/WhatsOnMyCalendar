import { Priority, Status } from '../types';

// Priority colors - static, used for charts and badges
export const PRIORITY_COLORS = {
  low: '#4F46E5',    // blue
  medium: '#F59E0B', // yellow
  high: '#EF4444',   // red
} as const;

// Priority colors with capitalized keys for chart labels
export const PRIORITY_COLORS_DISPLAY = {
  Low: '#4F46E5',
  Medium: '#F59E0B',
  High: '#EF4444',
} as const;

// Default fallback color
export const DEFAULT_COLOR = '#6B7280';

// Tailwind class mappings for priority badges
export const PRIORITY_BADGE_CLASSES = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
} as const;

// Kanban column background classes
export const STATUS_BACKGROUND_CLASSES = {
  todo: 'bg-gray-100',
  working: 'bg-warning-100',
  stuck: 'bg-error-100',
  done: 'bg-success-100',
} as const;

// Helper to get status background class with fallback
export const getStatusBackgroundClass = (status: Status): string => {
  return STATUS_BACKGROUND_CLASSES[status as keyof typeof STATUS_BACKGROUND_CLASSES] || 'bg-gray-100';
};

// Helper to get priority color by key
export const getPriorityColor = (priority: Priority): string => {
  return PRIORITY_COLORS[priority] || DEFAULT_COLOR;
};
