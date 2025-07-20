interface TemplateUrlPatternProps {
  pattern: {
    protocol?: string;
    domain?: string;
    path?: string;
  };
}

export function TemplateUrlPattern({
  pattern,
}: Readonly<TemplateUrlPatternProps>) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        URL Pattern
      </h3>
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {pattern.protocol && (
            <div>
              <label
                htmlFor="template-url-protocol"
                className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
              >
                Protocol
              </label>
              <code
                id="template-url-protocol"
                className="text-sm font-mono text-gray-900 dark:text-white"
              >
                {pattern.protocol}
              </code>
            </div>
          )}
          {pattern.domain && (
            <div>
              <label
                htmlFor="template-url-domain"
                className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
              >
                Domain
              </label>
              <code
                id="template-url-domain"
                className="text-sm font-mono text-gray-900 dark:text-white"
              >
                {pattern.domain}
              </code>
            </div>
          )}
          {pattern.path && (
            <div>
              <label
                htmlFor="template-url-path"
                className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
              >
                Path
              </label>
              <code
                id="template-url-path"
                className="text-sm font-mono text-gray-900 dark:text-white"
              >
                {pattern.path}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
