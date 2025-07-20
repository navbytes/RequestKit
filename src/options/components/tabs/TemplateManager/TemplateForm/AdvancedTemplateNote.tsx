import { Icon } from '@/shared/components/Icon';

interface AdvancedTemplateNoteProps {
  templateType: string;
}

export function AdvancedTemplateNote({
  templateType,
}: Readonly<AdvancedTemplateNoteProps>) {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon name="warning" className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Advanced Template Type
          </h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p>
              You&apos;ve selected a {templateType} template. This template type
              supports advanced features beyond basic headers. For now, you can
              create the template with basic information and enhance it later
              through the rule editor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
