import type { HeaderRule } from '@/shared/types/rules';

import { getUnassignedRules } from './utils';

interface UnassignedRulesProps {
  readonly rules: HeaderRule[];
}

export function UnassignedRules({ rules }: UnassignedRulesProps) {
  const unassignedRules = getUnassignedRules(rules);

  if (unassignedRules.length === 0) {
    return null;
  }

  return (
    <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
      <UnassignedRulesHeader count={unassignedRules.length} />
      <UnassignedRulesDescription />
      <UnassignedRulesList rules={unassignedRules} />
    </div>
  );
}

interface UnassignedRulesHeaderProps {
  count: number;
}

function UnassignedRulesHeader({
  count,
}: Readonly<UnassignedRulesHeaderProps>) {
  return (
    <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
      Unassigned Rules ({count})
    </h4>
  );
}

function UnassignedRulesDescription() {
  return (
    <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
      These rules are not assigned to any profile and will be active in all
      profiles:
    </p>
  );
}

interface UnassignedRulesListProps {
  readonly rules: HeaderRule[];
}

function UnassignedRulesList({ rules }: UnassignedRulesListProps) {
  return (
    <div className="space-y-1">
      {rules.map(rule => (
        <UnassignedRuleItem key={rule.id} rule={rule} />
      ))}
    </div>
  );
}

interface UnassignedRuleItemProps {
  readonly rule: HeaderRule;
}

function UnassignedRuleItem({ rule }: UnassignedRuleItemProps) {
  return (
    <div className="text-sm text-orange-800 dark:text-orange-200">
      • {rule.name}
    </div>
  );
}
