import { format } from 'date-fns';

/**
 * Generate a timestamp in the format used throughout the application
 */
export function getCurrentTimestamp(): string {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
}

/**
 * Format a date for display
 */
export function formatDate(date: string | Date, formatString = 'MMM d'): string {
  try {
    return format(new Date(date), formatString);
  } catch {
    return '';
  }
}
