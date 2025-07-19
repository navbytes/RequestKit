import { Badge } from '@/shared/components/ui';

interface TemplateTagsProps {
  tags: string[];
}

export function TemplateTags({ tags }: TemplateTagsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Badge key={tag} size="sm">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
