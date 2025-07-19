import type { ComponentChildren } from 'preact';

import { Button } from './Button';
import { Card } from './Card';

interface DangerZoneProps {
  title?: string;
  description?: string;
  children?: ComponentChildren;
  actionLabel: string;
  onAction: () => void;
  actionLoading?: boolean;
}

export function DangerZone({
  title = 'Danger Zone',
  description = 'These actions are permanent and cannot be undone.',
  children,
  actionLabel,
  onAction,
  actionLoading = false,
}: DangerZoneProps) {
  return (
    <Card variant="error" padding="lg">
      <h3 className="text-lg font-semibold text-error-900 dark:text-error-100 mb-4">
        {title}
      </h3>
      <p className="text-error-700 dark:text-error-300 mb-4">{description}</p>

      {children && <div className="mb-4">{children}</div>}

      <Button variant="error" onClick={onAction} loading={actionLoading}>
        {actionLabel}
      </Button>
    </Card>
  );
}
