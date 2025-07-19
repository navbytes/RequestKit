import { useI18n } from '@/shared/hooks/useI18n';
import type { HeaderEntry } from '@/shared/types/rules';

interface HeadersSectionProps {
  headers: HeaderEntry[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof HeaderEntry, value: string) => void;
}

export function HeadersSection({
  headers,
  onAdd,
  onRemove,
  onUpdate,
}: Readonly<HeadersSectionProps>) {
  const { t } = useI18n();

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('ui_label_headers')}
        </h4>
        <button
          type="button"
          onClick={onAdd}
          className="btn btn-sm btn-primary"
        >
          {t('forms_add_header')}
        </button>
      </div>

      <div className="space-y-2">
        {headers.map((header, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-3">
              <input
                type="text"
                value={header.name}
                onChange={e =>
                  onUpdate(index, 'name', (e.target as HTMLInputElement).value)
                }
                placeholder={t('forms_header_name_placeholder')}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="col-span-3">
              <input
                type="text"
                value={header.value}
                onChange={e =>
                  onUpdate(index, 'value', (e.target as HTMLInputElement).value)
                }
                placeholder={t('forms_header_value_placeholder')}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="col-span-2">
              <select
                value={header.operation}
                onChange={e =>
                  onUpdate(
                    index,
                    'operation',
                    (e.target as HTMLSelectElement).value
                  )
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="set">{t('rules_header_operations_set')}</option>
                <option value="append">
                  {t('rules_header_operations_append')}
                </option>
                <option value="remove">
                  {t('rules_header_operations_remove')}
                </option>
              </select>
            </div>

            <div className="col-span-2">
              <select
                value={header.target}
                onChange={e =>
                  onUpdate(
                    index,
                    'target',
                    (e.target as HTMLSelectElement).value
                  )
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="request">{t('popup_request')}</option>
                <option value="response">{t('popup_response')}</option>
              </select>
            </div>

            <div className="col-span-2">
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="w-full btn btn-sm btn-error"
                disabled={headers.length === 1}
              >
                {t('ui_button_remove')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
