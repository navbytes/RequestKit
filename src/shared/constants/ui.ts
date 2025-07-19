import type { IconName } from '@/shared/components/Icon';

// UI Constants for better organization and reusability

interface ButtonGroupOption {
  value: string;
  label: string;
  icon?: IconName;
  color?: string;
}

export const THEME_OPTIONS: ButtonGroupOption[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'auto', label: 'Auto', icon: 'monitor' },
];

export const LOG_LEVELS = [
  {
    value: 'error',
    label: 'Error',
    color: 'text-red-600 dark:text-red-400',
  },
  {
    value: 'warn',
    label: 'Warning',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    value: 'info',
    label: 'Info',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    value: 'debug',
    label: 'Debug',
    color: 'text-gray-600 dark:text-gray-400',
  },
] satisfies readonly {
  readonly value: 'error' | 'warn' | 'info' | 'debug';
  readonly label: string;
  readonly color: string;
}[];

export const REFRESH_INTERVALS = {
  ANALYTICS: 30000, // 30 seconds
  PERFORMANCE: 60000, // 1 minute
  RULES: 5000, // 5 seconds
} satisfies Record<string, number>;

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_DOMAIN: 'Please enter a valid domain',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
  PATTERN_MISMATCH: 'Invalid format',
} satisfies Record<string, string | ((arg: number) => string)>;

export const PRIORITY_LEVELS = [
  { value: 1, label: 'Low', color: 'text-green-600' },
  { value: 2, label: 'Medium', color: 'text-yellow-600' },
  { value: 3, label: 'High', color: 'text-orange-600' },
  { value: 4, label: 'Critical', color: 'text-red-600' },
] satisfies readonly {
  readonly value: number;
  readonly label: string;
  readonly color: string;
}[];

export const OPERATION_TYPES = [
  { value: 'set', label: 'Set', description: 'Set or replace header value' },
  {
    value: 'append',
    label: 'Append',
    description: 'Append to existing header value',
  },
  { value: 'remove', label: 'Remove', description: 'Remove header completely' },
] satisfies readonly {
  readonly value: string;
  readonly label: string;
  readonly description: string;
}[];

export const TARGET_TYPES = [
  {
    value: 'request',
    label: 'Request',
    description: 'Modify outgoing request headers',
  },
  {
    value: 'response',
    label: 'Response',
    description: 'Modify incoming response headers',
  },
] satisfies readonly {
  readonly value: string;
  readonly label: string;
  readonly description: string;
}[];

export const PROTOCOL_OPTIONS = [
  { value: '*', label: 'Any Protocol' },
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
] satisfies readonly {
  readonly value: string;
  readonly label: string;
}[];
