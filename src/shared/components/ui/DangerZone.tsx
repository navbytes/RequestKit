import type { ComponentChildren } from 'preact';

import { useI18n } from '@/shared/hooks/useI18n';

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
  title,
  description,
  children,
  actionLabel,
  onAction,
  actionLoading = false,
}: Readonly<DangerZoneProps>) {
  const { t } = useI18n();
  return (
    <Card variant="error" padding="lg">
      <h3 className="text-lg font-semibold text-error-900 dark:text-error-100 mb-4">
        {title || t('ui_danger_zone_title')}
      </h3>
      <p className="text-error-700 dark:text-error-300 mb-4">
        {description || t('ui_danger_zone_description')}
      </p>

      {children && <div className="mb-4">{children}</div>}

      <Button variant="error" onClick={onAction} loading={actionLoading}>
        {actionLabel}
      </Button>
    </Card>
  );
}
