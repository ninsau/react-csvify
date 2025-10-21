# React CSVify

[![Maintenance](https://img.shields.io/badge/status-maintained-brightgreen)](https://github.com/ninsau/react-csvify)
[![npm version](https://img.shields.io/npm/v/react-csvify.svg)](https://www.npmjs.com/package/react-csvify)
[![npm downloads](https://img.shields.io/npm/dm/react-csvify.svg)](https://www.npmjs.com/package/react-csvify)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/react-csvify)](https://bundlephobia.com/package/react-csvify)
[![License](https://img.shields.io/npm/l/react-csvify.svg)](https://github.com/ninsau/react-csvify/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](#testing)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#installation)

A **production-ready**, composable, and fully typed React component for generating and downloading CSV, TSV, and JSON files from any dataset. Designed for advanced customization, zero dependencies, and seamless integration into modern React or Next.js applications.

## 📚 Documentation

- **[📖 API Reference](docs/API.md)** - Complete prop reference and function documentation
- **[💡 Examples & Use Cases](docs/EXAMPLES.md)** - Real-world examples and advanced patterns
- **[🛠️ Guide](docs/GUIDE.md)** - Step-by-step implementation guides
- **[🤖 Schema Reference](docs/SCHEMA.md)** - JSON schema definitions for AI/automation
- **[❓ FAQ](docs/FAQ.md)** - Frequently asked questions

## 🚀 Key Features

- **🎯 Zero Configuration** - Works out of the box with sensible defaults
- **📊 Multiple Format Support** - Export to CSV, TSV, and JSON with unified API
- **🔄 Bidirectional CSV** - Parse CSV strings back into typed objects
- **✨ Advanced Data Transformation** - Custom formatters and value transformers
- **🚀 Progress Tracking** - Monitor download progress for large datasets
- **🎨 Fully Customizable UI** - Use default link or inject your own button
- **📦 Zero Dependencies** - React-only, works everywhere
- **♿ Accessible** - Screen reader friendly and keyboard accessible
- **🌳 Tree-Shakable** - Import only what you need
- **⚡ High Performance** - Optimized for large datasets
- **🧪 Fully Tested** - Comprehensive test suite with >80% coverage
- **📝 TypeScript Ready** - 100% type-safe API

## 📦 Installation

```bash
npm install react-csvify@latest
# or
yarn add react-csvify@latest
# or
pnpm add react-csvify@latest
```

### Bundle Size Impact

- **Minified**: ~12KB
- **Minified + Gzipped**: ~4KB
- **Zero runtime dependencies**
- **Tree-shakable exports**

## ✅ Prerequisites

| Requirement | Version | Notes |
| --- | --- | --- |
| **React** | 16+ | Hooks-based components |
| **React DOM** | 16+ | Standard DOM rendering |
| **TypeScript** | 4.5+ | Recommended for best experience |
| **Node.js** | 16+ | For development and building |

> **Note**: This package has `react` and `react-dom` as peer dependencies. Ensure they're already installed in your project.

## 🚀 Quick Start

### Basic Usage

```tsx
"use client";
import React from "react";
import { DownloadButton } from "react-csvify";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function BasicExample() {
  const users: User[] = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com" },
    { id: 2, name: "Bob Smith", email: "bob@example.com" },
    { id: 3, name: "Carol Davis", email: "carol@example.com" },
  ];

  return (
    <DownloadButton
      data={users}
      filename="users.csv"
    />
  );
}
```

### Multiple Format Support

```tsx
import { DownloadButton } from "react-csvify";

export default function MultiFormatExample() {
  const data = [
    { id: 1, name: "Alice", active: true },
    { id: 2, name: "Bob", active: false },
  ];

  return (
    <div className="space-y-4">
      {/* Export as CSV */}
      <DownloadButton data={data} filename="data.csv" />

      {/* Export as TSV */}
      <DownloadButton data={data} filename="data.tsv" />

      {/* Export as JSON */}
      <DownloadButton data={data} filename="data.json" />
    </div>
  );
}
```

### Advanced Usage with Validation & Transformation

```tsx
"use client";
import React, { useState } from "react";
import {
  DownloadButton,
  validateCsvData,
  formatCsvValue,
  parseCSV,
} from "react-csvify";

export default function AdvancedExample() {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const data = [
    { id: 1, name: "Alice", joinDate: "2024-01-15", score: 95.5 },
    { id: 2, name: "Bob", joinDate: "2024-02-20", score: 88.3 },
  ];

  const handleDownload = () => {
    // Validate before download
    const validation = validateCsvData(data, {
      maxRows: 10000,
      maxFieldSize: 5000,
      allowEmpty: false,
    });

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
  };

  return (
    <div>
      {validationErrors.length > 0 && (
        <div className="error-box">
          {validationErrors.map((err, idx) => (
            <p key={idx}>{err}</p>
          ))}
        </div>
      )}

      <DownloadButton
        data={data}
        filename="users.csv"
        transformValue={(value, key) => {
          if (key === "score" && typeof value === "number") {
            return value.toFixed(1);
          }
          return String(value);
        }}
        onDownloadStart={handleDownload}
        customButton={
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Export CSV
          </button>
        }
      />
    </div>
  );
}
```

## Core Features

### Component: DownloadButton

The main React component for triggering downloads.

```tsx
<DownloadButton
  data={users}
  filename="export.csv"
  customHeaders={["ID", "Full Name", "Email"]}
  transformValue={(value, key, row) => {
    // Custom formatting
    if (key === "joinDate") {
      return new Date(value as string).toLocaleDateString();
    }
    return String(value);
  }}
  onDownloadStart={() => console.log("Starting...")}
  onProgress={(progress) => console.log(`${progress.percentage}% complete`)}
  onDownloadComplete={() => console.log("Done!")}
  onError={(error) => console.error(error)}
/>
```

### Utilities: Parse & Validate

**Parse CSV strings back to objects:**

```tsx
import { parseCSV, parseTSV, detectDelimiter } from "react-csvify";

const csvContent = `id,name,email
1,Alice,alice@example.com
2,Bob,bob@example.com`;

const result = parseCSV(csvContent);
if (result.success) {
  console.log(result.data); // Typed array of objects
}

// Auto-detect delimiter
const delimiter = detectDelimiter(csvContent);
```

**Validate data before export:**

```tsx
import { validateCsvData, detectDataIssues } from "react-csvify";

const validation = validateCsvData(data, {
  maxRows: 10000,
  allowEmpty: false,
});

if (!validation.valid) {
  console.error("Validation errors:", validation.errors);
}

// Detect potential issues
const issues = detectDataIssues(data);
```

**Format & transform values:**

```tsx
import { formatCsvValue, formatCsvRow } from "react-csvify";

const formatted = formatCsvValue("Hello, World", true);
console.log(formatted.formatted); // "Hello, World"

const row = formatCsvRow(
  ["id", "name", "active"],
  ",",
  true
);
```

### Generate Content Programmatically

```tsx
import {
  generateContent,
  generateContentWithProgress,
} from "react-csvify";

// Simple generation
const csv = generateContent(data, "csv", {
  delimiter: ",",
  quoteValues: true,
  customHeaders: ["ID", "Name"],
});

// With progress tracking
generateContentWithProgress(
  largeDataset,
  "json",
  (progress) => {
    console.log(`Processing: ${progress.percentage}%`);
  },
  { prettifyJson: true }
);
```

## Advanced Examples

See **[EXAMPLES.md](docs/EXAMPLES.md)** for:

- Filtering and sorting before export
- Batch processing multiple exports
- React Query integration
- Form data export
- Database export workflows
- Conditional column selection
- Custom styling and theming

## Prop Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `T[]` | Required | Array of objects to export |
| `filename` | `string` | Required | Output filename (extension determines format) |
| `delimiter` | `string` | `","` | Field delimiter (CSV only) |
| `quoteValues` | `boolean` | `true` | Wrap values in quotes |
| `transformValue` | `(value, key, row) => string` | – | Custom value formatter |
| `customHeaders` | `string[]` | – | Override auto-generated headers |
| `customButton` | `ReactNode` | – | Custom trigger button/component |
| `emptyDataMessage` | `string` | `"No data available."` | Message when data is empty |
| `onDownloadStart` | `() => void` | – | Called before generation |
| `onDownloadComplete` | `() => void` | – | Called after successful download |
| `onError` | `(error: Error) => void` | – | Error handler |
| `onProgress` | `(progress) => void` | – | Progress callback for large datasets |
| `chunkSize` | `number` | `1000` | Rows processed before progress update |

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

## Versioning

We use [Semantic Versioning](https://semver.org/). Current version: **1.1.0**

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

## Support

- **Issues**: [GitHub Issues](https://github.com/ninsau/react-csvify/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ninsau/react-csvify/discussions)
- **Security**: Report security issues privately to maintainers

## ⭐ Support the Project

If you find this library helpful:

- **⭐ Star the repository** - Helps others discover the project
- **🐛 Report bugs** - Help improve stability
- **💡 Request features** - Suggest improvements
- **📖 Improve docs** - Help other developers
- **🤝 Contribute code** - Join development

Your support keeps this project maintained and improved! 🚀

## Acknowledgments

- Built with React and TypeScript
- Inspired by common data export patterns
- Thanks to all contributors and users

---

Made with ❤️ by [ninsau](https://github.com/ninsau)
