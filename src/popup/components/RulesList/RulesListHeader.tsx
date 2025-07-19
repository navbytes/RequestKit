import { Badge } from '@/shared/components/ui';

interface RulesListHeaderProps {
  rulesCount: number;
  activeRulesCount: number;
  currentUrl?: string | undefined;
}

export function RulesListHeader({
  rulesCount,
  activeRulesCount,
  currentUrl,
}: RulesListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Rules ({rulesCount})
      </h3>
      {currentUrl && activeRulesCount > 0 && (
        <Badge variant="primary" size="sm">
          {activeRulesCount} active
        </Badge>
      )}
    </div>
  );
}
