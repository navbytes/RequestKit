// File interception engine for upload/download modification
import type { FileInterception, HeaderEntry } from '@/shared/types/rules';
import { loggers } from '@/shared/utils/debug';

// Get logger for this module
const logger = loggers.shared;

export interface FileInterceptionContext {
  url: string;
  method: string;
  headers: Record<string, string>;
  filename?: string;
  fileSize?: number;
  mimeType?: string;
  timestamp: Date;
  requestId: string;
}

export interface FileInterceptionResult {
  action: 'allow' | 'block' | 'redirect' | 'modify' | 'log';
  success: boolean;
  modifiedFilename?: string;
  modifiedContent?: string | ArrayBuffer;
  modifiedHeaders?: Record<string, string>;
  redirectUrl?: string;
  errors: string[];
  warnings: string[];
  appliedInterceptions: string[];
}

export class FileInterceptionEngine {
  private static instance: FileInterceptionEngine;

  static getInstance(): FileInterceptionEngine {
    if (!FileInterceptionEngine.instance) {
      FileInterceptionEngine.instance = new FileInterceptionEngine();
    }
    return FileInterceptionEngine.instance;
  }

  /**
   * Apply file interceptions to uploads or downloads
   */
  async applyInterceptions(
    interceptions: FileInterception[],
    context: FileInterceptionContext
  ): Promise<FileInterceptionResult> {
    const result: FileInterceptionResult = {
      action: 'allow',
      success: true,
      errors: [],
      warnings: [],
      appliedInterceptions: [],
    };

    try {
      for (const interception of interceptions) {
        if (!interception.enabled) continue;

        // Check if interception pattern matches
        if (!this.matchesPattern(interception, context)) {
          continue;
        }

        // Check file type restrictions
        if (!this.matchesFileType(interception, context)) {
          continue;
        }

        // Check file size restrictions
        if (!this.matchesFileSize(interception, context)) {
          continue;
        }

        // Apply interception
        const interceptionResult = await this.applyInterception(
          interception,
          context
        );

        if (interceptionResult.success) {
          result.action = interceptionResult.action;
          result.appliedInterceptions.push(interception.id);

          if (interceptionResult.modifiedFilename) {
            result.modifiedFilename = interceptionResult.modifiedFilename;
          }

          if (interceptionResult.modifiedContent) {
            result.modifiedContent = interceptionResult.modifiedContent;
          }

          if (interceptionResult.modifiedHeaders) {
            result.modifiedHeaders = {
              ...result.modifiedHeaders,
              ...interceptionResult.modifiedHeaders,
            };
          }

          if (interceptionResult.redirectUrl) {
            result.redirectUrl = interceptionResult.redirectUrl;
          }
        } else {
          result.errors.push(...interceptionResult.errors);
          result.warnings.push(...interceptionResult.warnings);
        }

        // If blocking or redirecting, stop processing further interceptions
        if (result.action === 'block' || result.action === 'redirect') {
          break;
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(
        `File interception failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return result;
  }

  /**
   * Apply a single file interception
   */
  private async applyInterception(
    interception: FileInterception,
    context: FileInterceptionContext
  ): Promise<FileInterceptionResult> {
    const result: FileInterceptionResult = {
      action: interception.operation,
      success: true,
      errors: [],
      warnings: [],
      appliedInterceptions: [],
    };

    try {
      switch (interception.operation) {
        case 'block':
          result.action = 'block';
          break;

        case 'redirect':
          result.action = 'redirect';
          result.redirectUrl = this.generateRedirectUrl(interception, context);
          break;

        case 'modify':
          result.action = 'modify';
          await this.applyFileModifications(interception, context, result);
          break;

        case 'log':
          result.action = 'allow';
          this.logFileAccess(interception, context);
          break;

        default:
          result.action = 'allow';
      }
    } catch (error) {
      result.success = false;
      result.errors.push(
        `Interception failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return result;
  }

  /**
   * Apply file modifications
   */
  private async applyFileModifications(
    interception: FileInterception,
    context: FileInterceptionContext,
    result: FileInterceptionResult
  ): Promise<void> {
    if (!interception.modifications) return;

    // Apply filename modification
    if (interception.modifications.filename) {
      result.modifiedFilename = this.processTemplate(
        interception.modifications.filename,
        context
      );
    }

    // Apply content modification
    if (interception.modifications.content) {
      result.modifiedContent = this.processTemplate(
        interception.modifications.content,
        context
      );
    }

    // Apply header modifications
    if (interception.modifications.headers) {
      result.modifiedHeaders = this.processHeaders(
        interception.modifications.headers,
        context
      );
    }
  }

  /**
   * Check if interception pattern matches the request
   */
  private matchesPattern(
    interception: FileInterception,
    context: FileInterceptionContext
  ): boolean {
    const pattern = interception.pattern;

    // Check protocol
    if (pattern.protocol && pattern.protocol !== '*') {
      const urlProtocol = new URL(context.url).protocol.slice(0, -1); // Remove trailing ':'
      if (pattern.protocol !== urlProtocol) {
        return false;
      }
    }

    // Check domain
    const urlDomain = new URL(context.url).hostname;
    if (!this.matchesDomain(pattern.domain, urlDomain)) {
      return false;
    }

    // Check path
    if (pattern.path) {
      const urlPath = new URL(context.url).pathname;
      if (!this.matchesPath(pattern.path, urlPath)) {
        return false;
      }
    }

    // Check port
    if (pattern.port) {
      const urlPort =
        new URL(context.url).port ||
        (new URL(context.url).protocol === 'https:' ? '443' : '80');
      if (pattern.port !== urlPort) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if file type matches interception criteria
   */
  private matchesFileType(
    interception: FileInterception,
    context: FileInterceptionContext
  ): boolean {
    if (!interception.fileTypes || interception.fileTypes.length === 0) {
      return true; // No restrictions
    }

    const mimeType = context.mimeType;
    const filename = context.filename;

    for (const fileType of interception.fileTypes) {
      // Check MIME type
      if (mimeType && mimeType.includes(fileType)) {
        return true;
      }

      // Check file extension
      if (
        filename &&
        fileType.startsWith('.') &&
        filename.toLowerCase().endsWith(fileType.toLowerCase())
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if file size matches interception criteria
   */
  private matchesFileSize(
    interception: FileInterception,
    context: FileInterceptionContext
  ): boolean {
    if (!interception.maxSize || !context.fileSize) {
      return true; // No size restrictions or size unknown
    }

    return context.fileSize <= interception.maxSize;
  }

  /**
   * Match domain with wildcard support
   */
  private matchesDomain(pattern: string, domain: string): boolean {
    if (pattern === '*') return true;
    if (pattern === domain) return true;

    // Wildcard subdomain matching
    if (pattern.startsWith('*.')) {
      const baseDomain = pattern.substring(2);
      return domain === baseDomain || domain.endsWith(`.${baseDomain}`);
    }

    return false;
  }

  /**
   * Match path with wildcard support
   */
  private matchesPath(pattern: string, path: string): boolean {
    if (pattern === '*') return true;
    if (pattern === path) return true;

    // Wildcard path matching
    if (pattern.includes('*')) {
      const regexPattern = pattern.replace(/\*/g, '.*');
      return new RegExp(`^${regexPattern}$`).test(path);
    }

    return false;
  }

  /**
   * Generate redirect URL
   */
  private generateRedirectUrl(
    _interception: FileInterception,
    _context: FileInterceptionContext
  ): string {
    // For now, return a simple blocked page
    // In production, this could be configurable
    return 'data:text/html,<html><body><h1>File Access Blocked</h1><p>This file has been blocked by RequestKit.</p></body></html>';
  }

  /**
   * Process template strings with context variables
   */
  private processTemplate(
    template: string,
    context: FileInterceptionContext
  ): string {
    return template
      .replace(/\{url\}/g, context.url)
      .replace(/\{filename\}/g, context.filename || '')
      .replace(/\{timestamp\}/g, context.timestamp.toISOString())
      .replace(/\{requestId\}/g, context.requestId);
  }

  /**
   * Process header modifications
   */
  private processHeaders(
    headers: HeaderEntry[],
    context: FileInterceptionContext
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const header of headers) {
      const value = this.processTemplate(header.value, context);

      switch (header.operation) {
        case 'set':
          result[header.name] = value;
          break;
        case 'append': {
          const existing = result[header.name] || '';
          result[header.name] = existing ? `${existing}, ${value}` : value;
          break;
        }
        case 'remove':
          delete result[header.name];
          break;
      }
    }

    return result;
  }

  /**
   * Log file access for monitoring
   */
  private logFileAccess(
    interception: FileInterception,
    context: FileInterceptionContext
  ): void {
    logger.info('File access logged:', {
      interceptionId: interception.id,
      url: context.url,
      filename: context.filename,
      fileSize: context.fileSize,
      mimeType: context.mimeType,
      timestamp: context.timestamp,
    });
  }

  /**
   * Validate file interception configuration
   */
  validateInterception(interception: FileInterception): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!interception.id) {
      errors.push('Interception ID is required');
    }

    if (!interception.pattern) {
      errors.push('URL pattern is required');
    }

    if (!interception.pattern.domain) {
      errors.push('Domain pattern is required');
    }

    if (!interception.operation) {
      errors.push('Operation is required');
    }

    if (
      !['block', 'redirect', 'modify', 'log'].includes(interception.operation)
    ) {
      errors.push('Invalid operation type');
    }

    if (!interception.target) {
      errors.push('Target is required');
    }

    if (!['upload', 'download', 'both'].includes(interception.target)) {
      errors.push('Invalid target type');
    }

    if (interception.maxSize && interception.maxSize < 0) {
      errors.push('Max size must be positive');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get file interception statistics
   */
  getStatistics(): {
    totalInterceptions: number;
    blockedFiles: number;
    modifiedFiles: number;
    redirectedFiles: number;
  } {
    // In production, this would track actual statistics
    return {
      totalInterceptions: 0,
      blockedFiles: 0,
      modifiedFiles: 0,
      redirectedFiles: 0,
    };
  }
}
