// This component has been removed as body modification functionality
// is not supported by Chrome's declarativeNetRequest API

import { TabDescription } from '@/shared/components/TabDescription';

export function BodyModificationManager() {
  return (
    <div className="p-6">
      <TabDescription
        title="Body Modification Not Available"
        description="Body modification functionality has been removed because Chrome's declarativeNetRequest API does not support modifying request or response bodies. Only header modifications are supported."
        icon="info"
        features={[
          'Chrome extensions cannot modify request/response bodies using declarativeNetRequest',
          'Only header modifications are supported by the Chrome extension APIs',
          'This limitation is imposed by Chrome for security and performance reasons',
        ]}
        useCases={[
          'Use header modifications instead of body modifications',
          'Consider server-side solutions for body transformations',
          'Use content scripts for limited DOM modifications (not network bodies)',
        ]}
      />

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          Alternative Solutions
        </h3>
        <p className="text-yellow-700 dark:text-yellow-300 mb-4">
          If you need to modify request or response bodies, consider these
          alternatives:
        </p>
        <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>Use a proxy server or middleware to modify requests/responses</li>
          <li>Implement server-side transformations</li>
          <li>Use browser developer tools for testing purposes</li>
          <li>
            Consider using a different tool designed for API
            testing/modification
          </li>
        </ul>
      </div>
    </div>
  );
}
