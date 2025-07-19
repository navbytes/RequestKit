import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
 * Format a date for display in the UI
 */
export function formatDate(
  date: Date | string,
  formatString = 'MMM dd, yyyy HH:mm'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(dateObj)) {
    return 'Invalid date';
  }

  return format(dateObj, formatString);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(dateObj)) {
    return 'Invalid date';
  }

  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Get current timestamp as ISO string
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Check if a date is within a time range
 */
export function isWithinTimeRange(
  date: Date,
  startTime: string,
  endTime: string,
  allowedDays: number[]
): boolean {
  const dayOfWeek = date.getDay();

  // Check if current day is allowed
  if (!allowedDays.includes(dayOfWeek)) {
    return false;
  }

  const currentTime = format(date, 'HH:mm');

  // Handle time range that crosses midnight
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }

  return currentTime >= startTime && currentTime <= endTime;
}

/**
 * Check if current time is within schedule
 */
export function isWithinSchedule(schedule: {
  enabled: boolean;
  startDate?: Date;
  endDate?: Date;
  timeRanges?: Array<{
    start: string;
    end: string;
    days: number[];
  }>;
}): boolean {
  if (!schedule.enabled) {
    return false;
  }

  const now = new Date();

  // Check date range
  if (schedule.startDate && now < schedule.startDate) {
    return false;
  }

  if (schedule.endDate && now > schedule.endDate) {
    return false;
  }

  // Check time ranges
  if (schedule.timeRanges && schedule.timeRanges.length > 0) {
    return schedule.timeRanges.some(range =>
      isWithinTimeRange(now, range.start, range.end, range.days)
    );
  }

  return true;
}

/**
 * Parse time string to minutes since midnight
 */
export function parseTimeToMinutes(timeString: string): number {
  const [hoursStr, minutesStr] = timeString.split(':');
  const hours = parseInt(hoursStr || '0', 10) || 0;
  const minutes = parseInt(minutesStr || '0', 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string
 */
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}

/**
 * Convert date to specific timezone
 */
export function convertToTimezone(date: Date, timezone: string): Date {
  try {
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  } catch {
    return date; // Fallback to original date if timezone is invalid
  }
}

/**
 * Validate time string format (HH:MM)
 */
export function isValidTimeString(timeString: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

/**
 * Get day names for display
 */
export function getDayNames(): string[] {
  return [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
}

/**
 * Get short day names for display
 */
export function getShortDayNames(): string[] {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

/**
 * Calculate duration between two dates in milliseconds
 */
export function calculateDuration(startDate: Date, endDate: Date): number {
  return endDate.getTime() - startDate.getTime();
}

/**
 * Format duration in human readable format
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
