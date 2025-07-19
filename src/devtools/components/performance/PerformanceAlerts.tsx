// Performance alerts component
import { useState } from 'preact/hooks';

import { Icon, IconName } from '@/shared/components/Icon';

import type { PerformanceAlert } from '../../types/performance';

interface PerformanceAlertsProps {
  alerts: PerformanceAlert[];
  onAcknowledge: (alertId: string) => void;
  className?: string;
}

export function PerformanceAlerts({
  alerts,
  onAcknowledge,
  className = '',
}: PerformanceAlertsProps) {
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const getSeverityColor = (severity: PerformanceAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getSeverityIcon = (
    severity: PerformanceAlert['severity']
  ): { name: IconName; color: string } => {
    switch (severity) {
      case 'critical':
        return {
          name: 'alert-circle',
          color: 'text-red-600 dark:text-red-400',
        };
      case 'high':
        return {
          name: 'alert-triangle',
          color: 'text-orange-600 dark:text-orange-400',
        };
      case 'medium':
        return {
          name: 'alert-triangle',
          color: 'text-yellow-600 dark:text-yellow-400',
        };
      case 'low':
        return { name: 'info', color: 'text-blue-600 dark:text-blue-400' };
      default:
        return { name: 'info', color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  const getTypeIcon = (type: PerformanceAlert['type']) => {
    switch (type) {
      case 'slow_rule':
        return 'clock';
      case 'high_memory':
        return 'cpu';
      case 'high_error_rate':
        return 'alert-circle';
      case 'cache_miss':
        return 'database';
      default:
        return 'alert-triangle';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleExpanded = (alertId: string) => {
    setExpandedAlert(expandedAlert === alertId ? null : alertId);
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500 dark:text-gray-400">
          <Icon
            name="check-circle"
            className="w-12 h-12 mx-auto mb-3 opacity-50 text-green-500"
          />
          <div className="text-lg font-medium">No Performance Alerts</div>
          <div className="text-sm mt-1">All systems are running smoothly</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {alerts.map(alert => {
        const severityIcon = getSeverityIcon(alert.severity);
        const isExpanded = expandedAlert === alert.id;

        return (
          <div
            key={alert.id}
            className={`border-l-4 rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {/* Severity Icon */}
                <div className={`flex-shrink-0 ${severityIcon.color}`}>
                  <Icon name={severityIcon.name} className="w-5 h-5" />
                </div>

                {/* Alert Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon
                      name={getTypeIcon(alert.type) as IconName}
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {alert.type.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        alert.severity === 'critical'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : alert.severity === 'high'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            : alert.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {alert.message}
                  </p>

                  {/* Alert Details */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatTimestamp(alert.timestamp)}</span>
                    {alert.ruleId && (
                      <span className="font-mono">Rule: {alert.ruleId}</span>
                    )}
                    <span>
                      Value: {alert.value.toFixed(2)} (threshold:{' '}
                      {alert.threshold})
                    </span>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && alert.suggestions.length > 0 && (
                    <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Suggested Actions:
                      </h4>
                      <ul className="space-y-1">
                        {alert.suggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400"
                          >
                            <Icon
                              name="chevron-right"
                              className="w-3 h-3 mt-0.5 flex-shrink-0"
                            />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                {alert.suggestions.length > 0 && (
                  <button
                    onClick={() => toggleExpanded(alert.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title={isExpanded ? 'Hide suggestions' : 'Show suggestions'}
                  >
                    <Icon
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      className="w-4 h-4"
                    />
                  </button>
                )}

                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Alert Summary */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{alerts.length}</span> active alert
            {alerts.length !== 1 ? 's' : ''}
          </div>

          <div className="flex items-center space-x-4 text-xs">
            {['critical', 'high', 'medium', 'low'].map(severity => {
              const count = alerts.filter(
                alert => alert.severity === severity
              ).length;
              if (count === 0) return null;

              const colors = {
                critical: 'text-red-600 dark:text-red-400',
                high: 'text-orange-600 dark:text-orange-400',
                medium: 'text-yellow-600 dark:text-yellow-400',
                low: 'text-blue-600 dark:text-blue-400',
              };

              return (
                <div
                  key={severity}
                  className={`flex items-center space-x-1 ${colors[severity as keyof typeof colors]}`}
                >
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                  <span>
                    {count} {severity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
