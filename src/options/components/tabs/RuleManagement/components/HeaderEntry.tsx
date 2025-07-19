import type { NewHeaderEntry } from '../utils/ruleValidation';

interface HeaderEntryProps {
  header: NewHeaderEntry;
  onUpdate: (field: keyof NewHeaderEntry, value: string) => void;
  onRemove: () => void;
}

export function HeaderEntry({ header, onUpdate, onRemove }: HeaderEntryProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div>
          <label
            htmlFor={`header-name-${header.name || 'new'}`}
            className="form-label text-xs"
          >
            Name
          </label>
          <input
            id={`header-name-${header.name || 'new'}`}
            type="text"
            className="input text-sm"
            value={header.name}
            onInput={e => onUpdate('name', e.currentTarget.value)}
            placeholder="Authorization"
          />
        </div>
        <div>
          <label
            htmlFor={`header-value-${header.name || 'new'}`}
            className="form-label text-xs"
          >
            Value
          </label>
          <input
            id={`header-value-${header.name || 'new'}`}
            type="text"
            className="input text-sm"
            value={header.value}
            onInput={e => onUpdate('value', e.currentTarget.value)}
            placeholder="Bearer token123"
          />
        </div>
        <div>
          <label
            htmlFor={`header-operation-${header.name || 'new'}`}
            className="form-label text-xs"
          >
            Operation
          </label>
          <select
            id={`header-operation-${header.name || 'new'}`}
            className="input text-sm"
            value={header.operation}
            onChange={e => onUpdate('operation', e.currentTarget.value)}
          >
            <option value="set">Set</option>
            <option value="append">Append</option>
            <option value="remove">Remove</option>
          </select>
        </div>
        <div>
          <label
            htmlFor={`header-target-${header.name || 'new'}`}
            className="form-label text-xs"
          >
            Target
          </label>
          <select
            id={`header-target-${header.name || 'new'}`}
            className="input text-sm"
            value={header.target}
            onChange={e => onUpdate('target', e.currentTarget.value)}
          >
            <option value="request">Request</option>
            <option value="response">Response</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={onRemove}
            className="btn btn-sm bg-error-600 text-white hover:bg-error-700 w-full"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
