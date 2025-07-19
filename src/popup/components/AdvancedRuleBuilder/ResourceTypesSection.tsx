import { RESOURCE_TYPES } from '@/config/constants';

interface ResourceTypesSectionProps {
  resourceTypes: string[];
  onToggle: (type: string) => void;
}

export function ResourceTypesSection({
  resourceTypes,
  onToggle,
}: ResourceTypesSectionProps) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Resource Types
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {RESOURCE_TYPES.map(type => (
          <label key={type} className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={resourceTypes.includes(type)}
              onChange={() => onToggle(type)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-700 dark:text-gray-300 capitalize">
              {type.replace('_', ' ')}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
