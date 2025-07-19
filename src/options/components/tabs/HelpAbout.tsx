import { Icon } from '@/shared/components/Icon';
import { TabDescription } from '@/shared/components/TabDescription';
import { ThemeIcon } from '@/shared/components/ThemeIcon';

export function HelpAbout() {
  return (
    <div className="p-6">
      <TabDescription
        title="Help & About"
        description="Find comprehensive documentation, troubleshooting guides, and support resources for RequestKit. Learn about URL patterns, common use cases, and get help with any issues you might encounter."
        icon="help-circle"
        features={[
          'Quick start guide and tutorials',
          'URL pattern examples and syntax',
          'Common use cases and scenarios',
          'Troubleshooting and FAQ',
          'Extension information and version details',
        ]}
        useCases={[
          'Learn how to create your first rule',
          'Understand URL pattern matching',
          'Find solutions to common problems',
          'Get inspiration for rule configurations',
          'Access support and community resources',
        ]}
      />

      <div className="space-y-6">
        {/* About Section */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center p-2">
              <ThemeIcon
                lightSrc="/assets/icons/icon-48.png"
                darkSrc="/assets/icons/icon-white-48.png"
                alt="RequestKit"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                RequestKit
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Version 1.0.0</p>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            A sophisticated Chrome extension for injecting custom headers on
            network requests using wildcard patterns. Perfect for development,
            testing, and debugging web applications.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-primary">Manifest V3</span>
            <span className="badge badge-secondary">TypeScript</span>
            <span className="badge badge-secondary">Preact</span>
            <span className="badge badge-secondary">Tailwind CSS</span>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Icon name="rocket" className="w-5 h-5 mr-2" />
            Quick Start Guide
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Create Your First Rule
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Go to Rule Management and click &quot;Create New Rule&quot; to set up
                  header injection for specific URLs.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Configure URL Patterns
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use wildcards like *.example.com or /api/* to match multiple
                  URLs with a single rule.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Add Custom Headers
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Define the headers you want to inject, such as Authorization,
                  X-API-Key, or custom headers.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Test and Monitor
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use the DevTools panel to monitor header injection and verify
                  your rules are working correctly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pattern Examples */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Icon name="file-text" className="w-5 h-5 mr-2" />
            URL Pattern Examples
          </h3>
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                *.example.com
              </code>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Matches all subdomains of example.com (api.example.com,
                www.example.com, etc.)
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                https://api.github.com/*
              </code>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Matches all HTTPS requests to GitHub API endpoints
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                */api/v1/*
              </code>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Matches any domain with /api/v1/ in the path
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                localhost:3000
              </code>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Matches local development server on port 3000
              </p>
            </div>
          </div>
        </div>

        {/* Common Use Cases */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Icon name="lightbulb" className="w-5 h-5 mr-2" />
            Common Use Cases
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  API Authentication
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add Authorization headers for testing APIs without modifying
                  your application code.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  CORS Testing
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add custom CORS headers to test cross-origin requests during
                  development.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Feature Flags
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Inject headers to enable/disable features without changing
                  your codebase.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  User Agent Override
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Test how your application behaves with different user agents.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Cache Control
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add cache control headers to test caching behavior.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Custom Headers
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add any custom headers required by your application or API.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Icon name="wrench" className="w-5 h-5 mr-2" />
            Troubleshooting
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Headers not being injected?
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                <li>• Check that the extension is enabled in the popup</li>
                <li>• Verify your URL pattern matches the target website</li>
                <li>
                  • Ensure the rule is enabled and has the correct priority
                </li>
                <li>• Check the DevTools panel for error messages</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Pattern not matching?
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                <li>• Use * for wildcards, not regex patterns</li>
                <li>• Include protocol (http/https) if needed</li>
                <li>• Check for typos in domain names</li>
                <li>• Test with simpler patterns first</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Performance issues?
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                <li>• Reduce the number of active rules</li>
                <li>
                  • Use more specific patterns to avoid unnecessary matching
                </li>
                <li>• Disable debug mode in production</li>
                <li>• Check performance settings in General Settings</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Icon name="help-circle" className="w-5 h-5 mr-2" />
            Support & Feedback
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Need help or have suggestions? We&apos;d love to hear from you!
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Documentation:</strong> Check the built-in help and
              examples above
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Issues:</strong> Report bugs or request features on our
              GitHub repository
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Community:</strong> Join discussions and share your use
              cases
            </p>
          </div>
        </div>

        {/* License */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            RequestKit is open source software released under the MIT License.
            <br />
            Built with{' '}
            <Icon
              name="heart"
              className="w-4 h-4 inline mx-1 text-red-500"
            />{' '}
            for developers by developers.
          </p>
        </div>
      </div>
    </div>
  );
}
