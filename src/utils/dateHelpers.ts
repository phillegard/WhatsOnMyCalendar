import { format } from 'date-fns';

/**
 * Generate a timestamp in the format used throughout the application
 * @returns ISO 8601 timestamp string
 */
export const getCurrentTimestamp = (): string => {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
};

/**
 * Format a date for display
 * @param date Date string or Date object
 * @param formatString Format string for date-fns (default: 'MMM d')
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date, formatString: string = 'MMM d'): string => {
  try {
    return format(new Date(date), formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};
