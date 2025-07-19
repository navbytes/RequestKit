# GitHub Actions Workflows

This directory contains comprehensive GitHub Actions workflows for the RequestKit Chrome extension project. These workflows ensure code quality, security, and proper functionality through automated checks on every pull request and push.

## Workflows Overview

### 1. CI Workflow (`ci.yml`)

**Triggers:** Push to `main`/`develop`, Pull requests to `main`/`develop`

**Jobs:**

- **Lint**: ESLint code analysis and Prettier formatting checks
- **Type Check**: TypeScript compilation and type checking
- **Test**: Unit tests with coverage reporting to Codecov
- **Localization**: Validates locale files and runs i18n tests
- **Build**: Creates production build and uploads artifacts
- **Security**: npm audit and CodeQL security analysis

### 2. PR Checks Workflow (`pr-checks.yml`)

**Triggers:** Pull request events (opened, synchronize, reopened)

**Jobs:**

- **PR Validation**:
  - Semantic PR title validation
  - Breaking changes detection
  - Conventional commit message validation
- **Size Check**: Bundle size analysis and warnings
- **Dependency Check**:
  - Outdated dependencies scan
  - Unused dependencies detection
  - License compliance verification
- **Performance Check**: Test execution time monitoring
- **Accessibility Check**: Basic accessibility validation
- **Manifest Validation**: Chrome extension manifest verification

### 3. Code Quality Workflow (`code-quality.yml`)

**Triggers:** Push and Pull requests to `main`/`develop`

**Jobs:**

- **ESLint Analysis**: Advanced linting with SARIF output for GitHub Security tab
- **Prettier**: Formatting validation with detailed reports
- **SonarCloud**: Comprehensive code quality analysis (requires `SONAR_TOKEN`)
- **Complexity Analysis**: Code complexity metrics and duplication detection
- **Dependency Vulnerability**: Security scanning with Snyk (requires `SNYK_TOKEN`)
- **Type Coverage**: TypeScript coverage analysis
- **Performance Budget**: Bundle size monitoring with budget enforcement

### 4. Localization Workflow (`localization.yml`)

**Triggers:** Changes to locale files or source code

**Jobs:**

- **Validate Locales**: Chrome extension locale file validation
- **Check Missing Translations**: Scans for hardcoded strings needing localization
- **Test Localization**: Runs i18n-specific tests
- **Check Translation Quality**: PR-specific translation change analysis

## Required Secrets

To fully utilize all workflows, configure these secrets in your GitHub repository:

```bash
# Code coverage (optional)
CODECOV_TOKEN=your_codecov_token

# Code quality analysis (optional)
SONAR_TOKEN=your_sonarcloud_token

# Security scanning (optional)
SNYK_TOKEN=your_snyk_token
```

## Workflow Features

### 🔍 **Comprehensive Validation**

- TypeScript type checking
- ESLint code analysis with security rules
- Prettier formatting enforcement
- Chrome extension manifest validation
- Localization completeness checks

### 🛡️ **Security & Quality**

- CodeQL security analysis
- Dependency vulnerability scanning
- License compliance checking
- Code complexity analysis
- Performance budget monitoring

### 🌐 **Localization Support**

- Locale file structure validation
- Translation completeness tracking
- Missing localization key detection
- Chrome extension i18n compatibility

### 📊 **Detailed Reporting**

- GitHub Step Summaries with rich formatting
- SARIF uploads for security findings
- Coverage reports to Codecov
- Bundle size analysis
- Performance metrics

### ⚡ **Performance Optimized**

- Parallel job execution
- npm cache utilization
- Conditional job execution based on file changes
- Artifact caching for build outputs

## Status Badges

Add these badges to your main README.md:

```markdown
[![CI](https://github.com/navbytes/RequestKit/workflows/CI/badge.svg)](https://github.com/navbytes/RequestKit/actions/workflows/ci.yml)
[![Code Quality](https://github.com/navbytes/RequestKit/workflows/Code%20Quality/badge.svg)](https://github.com/navbytes/RequestKit/actions/workflows/code-quality.yml)
[![Localization](https://github.com/navbytes/RequestKit/workflows/Localization/badge.svg)](https://github.com/navbytes/RequestKit/actions/workflows/localization.yml)
```

## Local Development

Run the same checks locally before pushing:

```bash
# Code quality checks
npm run lint
npm run format:check
npm run type-check

# Testing
npm test
npm run test:coverage
npm run test:i18n

# Localization validation
npm run validate-messages
npm run check-missing-keys

# Build verification
npm run build
```

## Workflow Customization

### Adding New Checks

1. Create a new job in the appropriate workflow file
2. Follow the existing pattern for Node.js setup and dependency installation
3. Add meaningful step summaries for GitHub UI integration

### Modifying Triggers

- **Path-based triggers**: Use `paths` to run workflows only when specific files change
- **Branch protection**: Adjust `branches` arrays to match your branching strategy
- **Event types**: Modify `types` for pull request workflows to control when they run

### Performance Tuning

- Use `needs` to create job dependencies and optimize parallel execution
- Implement `continue-on-error` for non-critical checks
- Cache dependencies and build outputs where appropriate

## Troubleshooting

### Common Issues

1. **Missing Dependencies**: Ensure all required packages are in `package.json`
2. **Permission Errors**: Check repository settings for Actions permissions
3. **Secret Access**: Verify secrets are configured correctly for external services
4. **Path Issues**: Use relative paths and ensure file existence before operations

### Debug Mode

Enable debug logging by setting the `ACTIONS_STEP_DEBUG` secret to `true` in your repository.

## Contributing

When modifying workflows:

1. Test changes in a fork first
2. Use descriptive commit messages
3. Update this documentation for significant changes
4. Consider backward compatibility for existing PRs
