/**
 * Security-related rule templates
 */

import type { RuleTemplate } from '@/shared/types/templates';

export const SECURITY_TEMPLATES: RuleTemplate[] = [
  {
    id: 'security-headers-basic',
    name: 'Basic Security Headers',
    description: 'Essential security headers for web applications',
    category: 'security',
    templateType: 'headers',
    headers: [
      {
        name: 'X-Content-Type-Options',
        value: 'nosniff',
        operation: 'set',
        target: 'response',
      },
      {
        name: 'X-Frame-Options',
        value: 'DENY',
        operation: 'set',
        target: 'response',
      },
      {
        name: 'X-XSS-Protection',
        value: '1; mode=block',
        operation: 'set',
        target: 'response',
      },
      {
        name: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
        operation: 'set',
        target: 'response',
      },
    ],
    tags: ['security', 'xss', 'clickjacking', 'headers'],
    popularity: 78,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
  {
    id: 'csp-strict',
    name: 'Strict Content Security Policy',
    description: 'Strict CSP header for enhanced security',
    category: 'security',
    templateType: 'headers',
    headers: [
      {
        name: 'Content-Security-Policy',
        value:
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
        operation: 'set',
        target: 'response',
      },
    ],
    tags: ['security', 'csp', 'content-security-policy'],
    popularity: 65,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
  {
    id: 'hsts-header',
    name: 'HTTP Strict Transport Security',
    description: 'Force HTTPS connections with HSTS header',
    category: 'security',
    templateType: 'headers',
    headers: [
      {
        name: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
        operation: 'set',
        target: 'response',
      },
    ],
    pattern: {
      domain: '*',
      path: '/*',
      protocol: 'https',
    },
    tags: ['security', 'hsts', 'https', 'ssl'],
    popularity: 72,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
  {
    id: 'file-upload-security',
    name: 'File Upload Security',
    description: 'Block dangerous file uploads and add security headers',
    category: 'security',
    templateType: 'file',
    fileInterceptions: [
      {
        id: 'file-security-1',
        enabled: true,
        pattern: {
          domain: '*',
          path: '/upload/*',
        },
        operation: 'block',
        target: 'upload',
        fileTypes: ['exe', 'bat', 'cmd', 'scr', 'application/x-executable'],
        maxSize: 10485760, // 10MB
      },
    ],
    headers: [
      {
        name: 'X-File-Security',
        value: 'enabled',
        operation: 'set',
        target: 'response',
      },
    ],
    tags: ['file', 'security', 'upload', 'block'],
    popularity: 70,
    author: 'RequestKit',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    isBuiltIn: true,
  },
];
