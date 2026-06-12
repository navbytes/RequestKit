# Changelog

All notable changes to the RequestKit Chrome extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0](https://github.com/navbytes/RequestKit/compare/v1.0.2...v1.1.0) (2026-06-12)


### Features

* adoption roadmap phase 1 — trust & footprint ([#8](https://github.com/navbytes/RequestKit/issues/8)) ([e37ebc0](https://github.com/navbytes/RequestKit/commit/e37ebc0d3263730ff5d1ddee052221cfa3d81f40))
* adoption roadmap phase 2 — first-run & popup ux ([#9](https://github.com/navbytes/RequestKit/issues/9)) ([277eaa3](https://github.com/navbytes/RequestKit/commit/277eaa3e05544cdd3b6c4bc8624589a3dd51f174))
* adoption roadmap phase 3 — modheader migration magnet ([#10](https://github.com/navbytes/RequestKit/issues/10)) ([494fb44](https://github.com/navbytes/RequestKit/commit/494fb44371c40b89d9e8d59cf59f903bf2e8f9e6))
* adoption roadmap phase 4 — focus the options surface ([#11](https://github.com/navbytes/RequestKit/issues/11)) ([3c68692](https://github.com/navbytes/RequestKit/commit/3c68692f9021e8ff0bbcef9bb04b8bedc96581e5))
* adoption roadmap phase 5 — reliability visible & launch kit ([#12](https://github.com/navbytes/RequestKit/issues/12)) ([6a9b156](https://github.com/navbytes/RequestKit/commit/6a9b156c1f52b8f39fbb05cb5fd144b318d2424d))


### Bug Fixes

* localization ([#6](https://github.com/navbytes/RequestKit/issues/6)) ([a43df2f](https://github.com/navbytes/RequestKit/commit/a43df2fd15cd0d0daa713f07beb24278446aa457))

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
