import type { RuleFormData } from '../utils/ruleValidation';

interface URLPatternSectionProps {
  pattern: RuleFormData['pattern'];
  onPatternChange: (updates: Partial<RuleFormData['pattern']>) => void;
}

export function URLPatternSection({
  pattern,
  onPatternChange,
}: URLPatternSectionProps) {
  return (
    <div className="mb-4">
      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
        URL Pattern
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="url-protocol" className="form-label">
            Protocol
          </label>
          <select
            id="url-protocol"
            className="input"
            value={pattern.protocol}
            onChange={e => onPatternChange({ protocol: e.currentTarget.value })}
          >
            <option value="*">Any Protocol</option>
            <option value="http">HTTP</option>
            <option value="https">HTTPS</option>
          </select>
        </div>
        <div>
          <label htmlFor="url-domain" className="form-label">
            Domain *
          </label>
          <input
            id="url-domain"
            type="text"
            className="input"
            value={pattern.domain}
            onInput={e => onPatternChange({ domain: e.currentTarget.value })}
            placeholder="example.com or *.example.com"
          />
        </div>
        <div>
          <label htmlFor="url-path" className="form-label">
            Path
          </label>
          <input
            id="url-path"
            type="text"
            className="input"
            value={pattern.path}
            onInput={e => onPatternChange({ path: e.currentTarget.value })}
            placeholder="/api/* or /*"
          />
        </div>
      </div>
    </div>
  );
}
