import type { NewHeaderEntry } from '../utils/ruleValidation';

import { HeaderEntry } from './HeaderEntry';

interface HeadersSectionProps {
  headers: NewHeaderEntry[];
  onAddHeader: () => void;
  onUpdateHeader: (
    index: number,
    field: keyof NewHeaderEntry,
    value: string
  ) => void;
  onRemoveHeader: (index: number) => void;
}

export function HeadersSection({
  headers,
  onAddHeader,
  onUpdateHeader,
  onRemoveHeader,
}: Readonly<HeadersSectionProps>) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="headers-section" className="form-label">
          Headers
        </label>
        <button onClick={onAddHeader} className="btn btn-sm btn-secondary">
          + Add Header
        </button>
      </div>

      {headers.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          No headers configured. Add headers to modify requests or responses.
        </p>
      ) : (
        <div className="space-y-3">
          {headers.map((header, index) => (
            <HeaderEntry
              key={index}
              header={header}
              onUpdate={(field, value) => onUpdateHeader(index, field, value)}
              onRemove={() => onRemoveHeader(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
