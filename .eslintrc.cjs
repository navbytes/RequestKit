module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
    webextensions: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'sonarjs',
  ],
  settings: {
    react: {
      pragma: 'h',
      version: '18.0',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // React/Preact specific rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prefer-read-only-props': 'warn',

    // Import rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-unresolved': 'error',
    'import/no-cycle': 'error',

    // General rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',

    // Accessibility rules
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',

    // SonarJS rules - Code quality and bug detection
    'sonarjs/no-all-duplicated-branches': 'error',
    'sonarjs/no-element-overwrite': 'error',
    'sonarjs/no-empty-collection': 'error',
    'sonarjs/no-extra-arguments': 'error',
    'sonarjs/no-identical-conditions': 'error',
    'sonarjs/no-identical-expressions': 'error',
    'sonarjs/no-ignored-return': 'error',
    'sonarjs/no-one-iteration-loop': 'error',
    'sonarjs/no-use-of-empty-return-value': 'error',
    'sonarjs/non-existent-operator': 'error',

    // SonarJS rules - Code smells and maintainability
    'sonarjs/cognitive-complexity': ['warn', 20],
    'sonarjs/elseif-without-else': 'warn',
    'sonarjs/max-switch-cases': ['warn', 15],
    'sonarjs/no-collapsible-if': 'warn',
    'sonarjs/no-collection-size-mischeck': 'warn',
    'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
    'sonarjs/no-duplicated-branches': 'warn',
    'sonarjs/no-gratuitous-expressions': 'warn',
    'sonarjs/no-identical-functions': 'warn',
    'sonarjs/no-inverted-boolean-check': 'warn',
    'sonarjs/no-nested-switch': 'warn',
    'sonarjs/no-nested-template-literals': 'warn',
    'sonarjs/no-redundant-boolean': 'warn',
    'sonarjs/no-redundant-jump': 'warn',
    'sonarjs/no-same-line-conditional': 'warn',
    'sonarjs/no-small-switch': 'warn',
    'sonarjs/no-unused-collection': 'warn',
    'sonarjs/no-useless-catch': 'warn',
    'sonarjs/prefer-immediate-return': 'warn',
    'sonarjs/prefer-object-literal': 'warn',
    'sonarjs/prefer-single-boolean-return': 'warn',
    'sonarjs/prefer-while': 'warn',
  },
  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx', '**/__tests__/**/*'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
        // Relax SonarJS rules for test files
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/no-identical-functions': 'off',
        'sonarjs/cognitive-complexity': 'off',
        'sonarjs/no-duplicated-branches': 'off',
        'sonarjs/prefer-immediate-return': 'off',
        'sonarjs/no-gratuitous-expressions': 'off',
      },
    },
    {
      files: [
        'vite.config.ts',
        'vite.dev.config.ts',
        'tailwind.config.js',
        'postcss.config.js',
      ],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
  ignorePatterns: ['dist/', 'dev-dist/', 'node_modules/', '*.min.js'],
};
