// Rule template types for RequestKit

import type { ResourceType } from '@/config/constants';

import { IconName } from '../components/Icon';

import type {
  HeaderEntry,
  URLPattern,
  RuleCondition,
  FileInterception,
  RuleSchedule,
  RuleLimits,
  ConditionalLogic,
} from './rules';

export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category:
    | 'cors'
    | 'auth'
    | 'security'
    | 'debugging'
    | 'api'
    | 'performance'
    | 'conditional'
    | 'file'
    | 'advanced'
    | 'custom';

  // Core rule properties (all optional to support different template types)
  headers?: HeaderEntry[];
  pattern?: URLPattern;
  conditions?: RuleCondition[];
  conditionalLogic?: ConditionalLogic;

  // Advanced features
  fileInterceptions?: FileInterception[];
  resourceTypes?: ResourceType[];
  schedule?: RuleSchedule;
  limits?: RuleLimits;

  // Template metadata
  tags: string[];
  popularity?: number;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
  isBuiltIn: boolean;
  priority?: number;
  version?: string;

  // Template type for UI organization
  templateType: 'headers' | 'conditional' | 'file' | 'advanced' | 'complete';

  // Usage examples and documentation
  examples?: TemplateExample[];
  documentation?: string;
  useCases?: string[];
}

export interface TemplateExample {
  title: string;
  description: string;
  url: string;
  expectedResult: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  color: string;
}

export interface AdvancedPattern extends URLPattern {
  includes?: string[];
  excludes?: string[];
  regex?: string;
  methods?: string[];
  ports?: number[];
  schemes?: string[];
  caseSensitive?: boolean;
}

export const TEMPLATE_CATEGORIES: Record<string, TemplateCategory> = {
  cors: {
    id: 'cors',
    name: 'CORS & Cross-Origin',
    description: 'Headers for handling cross-origin requests',
    icon: 'globe',
    color: '#3b82f6',
  },
  auth: {
    id: 'auth',
    name: 'Authentication',
    description: 'API keys, tokens, and authentication headers',
    icon: 'lock',
    color: '#10b981',
  },
  security: {
    id: 'security',
    name: 'Security',
    description: 'Security headers and policies',
    icon: 'shield',
    color: '#ef4444',
  },
  debugging: {
    id: 'debugging',
    name: 'Debugging',
    description: 'Headers for debugging and development',
    icon: 'bug',
    color: '#f59e0b',
  },
  api: {
    id: 'api',
    name: 'API Testing',
    description: 'Headers for API development and testing',
    icon: 'wrench',
    color: '#8b5cf6',
  },
  performance: {
    id: 'performance',
    name: 'Performance',
    description: 'Caching and performance optimization headers',
    icon: 'zap',
    color: '#06b6d4',
  },
  conditional: {
    id: 'conditional',
    name: 'Conditional Rules',
    description: 'Rules with conditions and complex logic',
    icon: 'git-branch',
    color: '#14b8a6',
  },
  file: {
    id: 'file',
    name: 'File Interception',
    description: 'File upload/download interception and modification',
    icon: 'folder',
    color: '#f97316',
  },
  advanced: {
    id: 'advanced',
    name: 'Advanced Features',
    description: 'Scheduling, limits, and complex rule configurations',
    icon: 'settings',
    color: '#6366f1',
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    description: 'User-created custom templates',
    icon: 'sparkles',
    color: '#6b7280',
  },
} satisfies Record<string, TemplateCategory>;

export type TemplateCategoryId = keyof typeof TEMPLATE_CATEGORIES;
