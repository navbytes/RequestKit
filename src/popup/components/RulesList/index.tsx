import { RuleItem } from '@/shared/components/rules';
import { EmptyState } from '@/shared/components/ui';
import { useI18n } from '@/shared/hooks/useI18n';
import type { HeaderRule } from '@/shared/types/rules';

import { useRulesList } from './hooks/useRulesList';
import { RulesListHeader } from './RulesListHeader';

interface RulesListProps {
  rules: HeaderRule[];
  currentUrl?: string | undefined;
  onToggleRule: (ruleId: string) => void;
  onEditRule: (ruleId: string) => void;
  onDeleteRule: (ruleId: string) => void;
  compact?: boolean;
}

export function RulesList({
  rules,
  currentUrl,
  onToggleRule,
  onEditRule,
  onDeleteRule,
  compact = false,
}: Readonly<RulesListProps>) {
  const { t } = useI18n();
  const { matchingRules, activeRules, otherRules } = useRulesList(
    rules,
    currentUrl
  );

  if (rules.length === 0) {
    return (
      <EmptyState
        icon="file-text"
        title={t('rules_empty_state_title')}
        description={t('rules_empty_description')}
        className="py-6"
      />
    );
  }

  return (
    <div className="space-y-3">
      <RulesListHeader
        rulesCount={rules.length}
        activeRulesCount={activeRules.length}
        currentUrl={currentUrl}
      />

      <div className="space-y-2">
        {/* Matching rules first */}
        {matchingRules.map(rule => (
          <RuleItem
            key={rule.id}
            rule={rule}
            isMatching={true}
            onToggle={() => onToggleRule(rule.id)}
            onEdit={() => onEditRule(rule.id)}
            onDelete={() => onDeleteRule(rule.id)}
            compact={compact}
          />
        ))}

        {/* Other rules */}
        {otherRules.map(rule => (
          <RuleItem
            key={rule.id}
            rule={rule}
            isMatching={false}
            onToggle={() => onToggleRule(rule.id)}
            onEdit={() => onEditRule(rule.id)}
            onDelete={() => onDeleteRule(rule.id)}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}
