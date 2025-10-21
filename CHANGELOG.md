# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-10-21

### Added

- **Multi-format export support**: CSV, TSV, and JSON formats with unified API
- **CSV/TSV parsing**: New `parseCSV()` and `parseTSV()` utilities to convert strings back to typed objects
- **Data validation**: `validateCsvData()`, `hasConsistentSchema()`, `getDataSchema()`, `detectDataIssues()` utilities
- **Advanced formatting**: `formatCsvValue()`, `formatCsvRow()`, `shouldQuoteValue()`, `formatCsvValueSmart()` utilities
- **Progress tracking**: `onProgress` callback and `generateContentWithProgress()` for monitoring large exports
- **Format auto-detection**: `detectDelimiter()` function to automatically detect CSV delimiters
- **CSV validation**: `isValidCSV()` to check CSV format validity
- **Test suite**: Comprehensive tests with >80% coverage (unit, component, and integration tests)
- **Modern tooling**: Biome linting, Vitest testing, GitHub Actions CI/CD
- **Enhanced documentation**: Badges, API reference, examples, guides, schema definitions
- **Type enhancements**: Strict TypeScript configuration and expanded type definitions
- **Performance improvements**: Optimized for large datasets with chunked processing

### Changed

- **Updated DownloadButton component**: Now supports multiple export formats based on filename extension
- **Enhanced type safety**: Stricter TypeScript compiler options (ES2020 target, moduleResolution: bundler)
- **Improved error handling**: Better error messages and validation
- **Bundle optimization**: Maintained zero dependencies while adding rich functionality

### Deprecated

- `generateCsvContent()` is still available but `generateContent()` is now preferred

### Fixed

- Better handling of special characters in CSV values
- Improved quote escaping logic
- Enhanced null/undefined value handling

## [1.0.5] - 2024-09-15

### Added

- Initial release with core CSV export functionality
- DownloadButton component with customization options
- Event hooks (onDownloadStart, onDownloadComplete, onError)
- Custom headers and value transformation support
- TypeScript support with full type definitions
- Custom UI button support
- Empty state handling

### Initial Features

- Basic CSV generation from array of objects
- Customizable delimiters and quoting
- Custom button UI or default link
- Event callbacks for download lifecycle
- Type-safe generics for data

---

## Guidelines

### Version Numbering

- **MAJOR**: Breaking changes to API
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Adding Changes

When contributing, update this file in the Unreleased section with:

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes
