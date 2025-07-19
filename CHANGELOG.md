# Changelog

All notable changes to the RequestKit Chrome extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive localization system with support for multiple languages
- Advanced GitHub Actions workflows for CI/CD
- Automated release workflow with ZIP packaging
- Specialized npm scripts for localization validation
- Chrome extension manifest validation
- Performance monitoring and bundle size checks

### Changed

- Updated build process to include locale files
- Enhanced TypeScript configuration for better IDE support
- Improved test coverage with Vitest integration

### Fixed

- Chrome extension manifest compatibility issues
- TypeScript path resolution for configuration files
- Locale file validation for Chrome extension requirements

## [1.0.0] - 2024-01-01

### Added

- Initial release of RequestKit Chrome extension
- Custom header injection with wildcard pattern matching
- Advanced Variable System with hierarchical scoping
- DevTools integration for network request monitoring
- Profile management for different environments
- Rule-based header modification
- Testing tools for header validation
- Dark/light theme support
- Comprehensive settings management

### Features

- **Header Injection**: Inject custom headers on network requests using powerful pattern matching
- **Variable System**: Dynamic variable resolution with global, profile, and rule-level scoping
- **Pattern Matching**: Flexible URL pattern matching with wildcard support
- **DevTools Integration**: Monitor and analyze network requests directly in Chrome DevTools
- **Profile Management**: Organize rules into profiles for different environments
- **Testing Tools**: Built-in tools to test and validate header modifications
- **Theme Support**: Automatic dark/light theme detection and manual override
- **Settings Sync**: Synchronize settings across Chrome instances

### Technical Details

- Manifest V3 compatibility
- TypeScript implementation with strict type checking
- Preact-based UI components
- Vite build system with hot module replacement
- Comprehensive test suite with Vitest
- ESLint and Prettier for code quality
- Chrome Storage API integration
- Background service worker architecture

---

## Release Notes Format

Each release includes:

- **Added**: New features and capabilities
- **Changed**: Modifications to existing functionality
- **Deprecated**: Features that will be removed in future versions
- **Removed**: Features that have been removed
- **Fixed**: Bug fixes and issue resolutions
- **Security**: Security-related improvements

## Version Numbering

RequestKit follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

## Contributing

When contributing to RequestKit:

1. Update this CHANGELOG.md with your changes
2. Follow the established format for consistency
3. Include relevant details about new features or fixes
4. Reference issue numbers when applicable

## Links

- [GitHub Repository](https://github.com/navbytes/RequestKit)
- [Chrome Web Store](https://chrome.google.com/webstore/detail/requestkit)
- [Documentation](https://github.com/navbytes/RequestKit/wiki)
- [Issue Tracker](https://github.com/navbytes/RequestKit/issues)
