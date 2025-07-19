import { Icon, type IconName } from './Icon';

interface TabDescriptionProps {
  title: string;
  description: string;
  icon: IconName;
  features?: string[];
  useCases?: string[];
}

export function TabDescription({
  title,
  description,
  icon,
  features,
  useCases,
}: TabDescriptionProps) {
  return (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-start space-x-3 mb-3">
        <div className="flex-shrink-0">
          <Icon
            name={icon}
            size={24}
            className="text-blue-600 dark:text-blue-400"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">
            {title}
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {(features || useCases) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {features && (
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Key Features:
              </h4>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Icon
                      name="check"
                      size={12}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {useCases && (
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Common Use Cases:
              </h4>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                {useCases.map((useCase, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Icon
                      name="arrow-right"
                      size={12}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
