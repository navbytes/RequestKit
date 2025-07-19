interface FormData {
  protocol: 'http' | 'https' | '*';
  domain: string;
  path: string;
}

interface URLPatternSectionProps {
  formData: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
}

export function URLPatternSection({
  formData,
  onUpdate,
}: URLPatternSectionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        URL Pattern
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="url-protocol-select" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Protocol
          </label>
          <select
            id="url-protocol-select"
            value={formData.protocol}
            onChange={e =>
              onUpdate({
                protocol: (e.target as HTMLSelectElement).value as
                  | 'http'
                  | 'https'
                  | '*',
              })
            }
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="*">Any</option>
            <option value="https">HTTPS</option>
            <option value="http">HTTP</option>
          </select>
        </div>

        <div>
          <label htmlFor="url-domain-input" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Domain *
          </label>
          <input
            type="text"
            id="url-domain-input"
            value={formData.domain}
            onChange={e =>
              onUpdate({ domain: (e.target as HTMLInputElement).value })
            }
            placeholder="example.com"
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="url-path-input" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Path
          </label>
          <input
            type="text"
            id="url-path-input"
            value={formData.path}
            onChange={e =>
              onUpdate({ path: (e.target as HTMLInputElement).value })
            }
            placeholder="/api/*"
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}
