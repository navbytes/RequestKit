# Privacy Policy for RequestKit Chrome Extension

**Last Updated: January 19, 2025**

## Introduction

RequestKit ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how our Chrome extension collects, uses, and protects your information.

## Information We Collect

### Data Stored Locally

RequestKit stores the following data locally on your device using Chrome's storage API:

- **Rule Configurations**: URL patterns, header definitions, and rule settings you create
- **Variable System Data**: Variables you create including names, values, types, and scopes (with encryption for secret variables)
- **Secret Variables**: Sensitive data like API keys and tokens (encrypted and masked in UI)
- **Extension Settings**: Your preferences for themes, notifications, and performance options
- **Performance Metrics**: Anonymous usage statistics when enabled (stored locally only)
- **User Profiles**: Named configurations for different development environments with profile-specific variables

### Data We Do NOT Collect

RequestKit does not collect, store, or transmit:

- Personal information or identifiers
- Browsing history or website content
- Network request data or responses
- Authentication credentials or sensitive headers
- Any data to external servers or third parties

## How We Use Information

### Local Processing Only

All data processing occurs locally on your device:

- **Rule Execution**: Headers are injected locally by Chrome's declarativeNetRequest API
- **Pattern Matching**: URL patterns are evaluated locally without external communication
- **Analytics**: Performance metrics are calculated and stored locally
- **Settings**: Preferences are maintained in Chrome's local storage

### No External Transmission

RequestKit operates entirely offline and does not:

- Send data to external servers
- Use third-party analytics services
- Communicate with remote APIs
- Share data with other extensions or websites

## Data Storage and Security

### Chrome Storage API

We use Chrome's built-in storage API which:

- Encrypts data at rest
- Syncs across your Chrome instances (if Chrome sync is enabled)
- Provides secure access controls
- Allows user control over data deletion

### Data Retention

- Data persists until you manually delete it
- Uninstalling the extension removes all stored data
- You can export your data at any time
- Individual rules and settings can be deleted selectively

## Permissions Explained

### Required Permissions

**declarativeNetRequest**

- **Purpose**: Modify HTTP request headers
- **Scope**: Only affects requests matching your configured rules
- **Control**: You create and control all rules

**storage**

- **Purpose**: Save your rules and settings locally
- **Scope**: Limited to extension data only
- **Control**: You can view, export, or delete all data

**activeTab**

- **Purpose**: Test rules against the current webpage
- **Scope**: Only when you actively use the testing feature
- **Control**: Triggered only by your explicit actions

**contextMenus**

- **Purpose**: Add right-click menu options
- **Scope**: Limited to extension-related menu items
- **Control**: Can be disabled in extension settings

**notifications**

- **Purpose**: Show optional status notifications
- **Scope**: Only extension-related notifications
- **Control**: Can be disabled in settings

**Host Permissions (<all_urls>)**

- **Purpose**: Apply header rules to any website
- **Scope**: Only affects requests matching your rules
- **Control**: You define which URLs are affected

## User Control and Rights

### Data Access

You can:

- View all stored rules and settings in the extension interface
- Export your data in JSON format
- Import previously exported configurations
- Monitor extension activity in real-time

### Data Deletion

You can:

- Delete individual rules or settings
- Clear all extension data
- Uninstall the extension to remove all data
- Reset to default settings

### Data Portability

You can:

- Export all rules and settings
- Import configurations from backup files
- Share rule templates with others
- Migrate between devices using export/import

## Third-Party Services

RequestKit does not use any third-party services, including:

- Analytics platforms
- Crash reporting services
- Remote configuration services
- External APIs or databases

## Children's Privacy

RequestKit is designed for developers and does not knowingly collect information from children under 13. The extension requires technical knowledge typically possessed by adult developers.

## Changes to Privacy Policy

We may update this Privacy Policy to reflect changes in our practices or for legal compliance. Updates will be posted in the extension and on our repository with a new "Last Updated" date.

## Contact Information

For privacy-related questions or concerns:

- **GitHub Issues**: Report privacy concerns on our GitHub repository
- **Chrome Web Store**: Contact through the developer contact option
- **Email**: Available through Chrome Web Store developer profile

## Compliance

This Privacy Policy complies with:

- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR) principles
- California Consumer Privacy Act (CCPA) guidelines
- Chrome Extension privacy requirements

## Data Processing Legal Basis

Under GDPR, our legal basis for processing data is:

- **Legitimate Interest**: Providing the core functionality you requested
- **Consent**: For optional features like notifications and metrics
- **Contract**: Fulfilling the service you chose to use

## Your Rights Under GDPR

If you're in the EU, you have the right to:

- Access your data (view in extension interface)
- Rectify your data (edit rules and settings)
- Erase your data (delete rules or uninstall)
- Port your data (export functionality)
- Object to processing (disable features)

## Data Minimization

RequestKit follows data minimization principles:

- We only store data necessary for functionality
- No personal identifiers are collected
- Data is processed locally when possible
- Users control what data is stored

---

**By using RequestKit, you acknowledge that you have read and understood this Privacy Policy.**
