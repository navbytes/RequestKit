import type { HeaderRule } from '@/shared/types/rules';

import { RuleItem } from './RuleItem';

interface RuleListProps {
  rules: HeaderRule[];
  onEditRule: (rule: HeaderRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onToggleRule: (ruleId: string) => void;
  onDuplicateRule: (rule: HeaderRule) => void;
}

export function RuleList({
  rules,
  onEditRule,
  onDeleteRule,
  onToggleRule,
  onDuplicateRule,
}: RuleListProps) {
  return (
    <div className="space-y-4">
      {rules.map(rule => (
        <RuleItem
          key={rule.id}
          rule={rule}
          onEdit={() => onEditRule(rule)}
          onDelete={() => onDeleteRule(rule.id)}
          onToggle={() => onToggleRule(rule.id)}
          onDuplicate={() => onDuplicateRule(rule)}
        />
      ))}
    </div>
  );
}
