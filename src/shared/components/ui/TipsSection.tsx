import type { ComponentChildren } from 'preact';

import { Icon } from '@/shared/components/Icon';

import { Card } from './Card';

interface TipsSectionProps {
  title?: string;
  children: ComponentChildren;
  className?: string;
}

export function TipsSection({
  title = '💡 Tips',
  children,
  className = '',
}: TipsSectionProps) {
  return (
    <Card
      variant="default"
      padding="lg"
      className={`bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 ${className}`}
    >
      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
        <Icon name="lightbulb" className="w-5 h-5 mr-2" />
        {title}
      </h3>
      <div className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
        {children}
      </div>
    </Card>
  );
}
