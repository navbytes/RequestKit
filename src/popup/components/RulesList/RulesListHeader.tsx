import { Badge } from '@/shared/components/ui';
import { useI18n } from '@/shared/hooks/useI18n';

interface RulesListHeaderProps {
  rulesCount: number;
  activeRulesCount: number;
  currentUrl?: string | undefined;
}

export function RulesListHeader({
  rulesCount,
  activeRulesCount,
  currentUrl,
}: Readonly<RulesListHeaderProps>) {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('tab_rules')} ({rulesCount})
      </h3>
      {currentUrl && activeRulesCount > 0 && (
        <Badge variant="primary" size="sm">
          {activeRulesCount} {t('status_active')}
        </Badge>
      )}
    </div>
  );
}
