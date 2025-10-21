# API Reference

## Table of Contents

- [Components](#components)
- [Utilities](#utilities)
- [Types](#types)

## Components

### DownloadButton

Main React component for triggering data exports.

```tsx
<DownloadButton<T> {...props} />
```

#### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `data` | `T[]` | – | Yes | Array of objects to export |
| `filename` | `string` | – | Yes | Output filename (extension determines format: .csv, .tsv, .json) |
| `delimiter` | `string` | `","` | No | Field delimiter for CSV |
| `quoteValues` | `boolean` | `true` | No | Wrap all values in quotes |
| `transformValue` | `(value, key, row) => string` | – | No | Custom value transformer |
| `customHeaders` | `string[]` | – | No | Override auto-generated headers |
| `customButton` | `React.ReactNode` | – | No | Custom trigger button/component |
| `emptyDataMessage` | `string` | `"No data available."` | No | Message when data is empty |
| `onDownloadStart` | `() => void` | – | No | Called before generation |
| `onDownloadComplete` | `() => void` | – | No | Called after successful download |
| `onError` | `(error: Error) => void` | – | No | Error handler |
| `onProgress` | `(progress) => void` | – | No | Progress callback for large datasets |
| `chunkSize` | `number` | `1000` | No | Rows per progress update |

#### Example

```tsx
import { DownloadButton } from "react-csvify";

<DownloadButton
  data={users}
  filename="users.csv"
  customHeaders={["ID", "Name", "Email"]}
  onDownloadComplete={() => alert("Done!")}
/>
```

## Utilities

### CSV/TSV Generation

#### `generateCsvContent(options)`

Generate CSV content from data.

```typescript
function generateCsvContent<T extends object>(
  options: GenerateCsvOptions<T>
): string
```

#### `generateTsvContent(data, transformValue?, customHeaders?)`

Generate TSV content from data.

```typescript
function generateTsvContent<T extends object>(
  data: T[],
  transformValue?: (value: unknown, key: string, row: T) => string,
  customHeaders?: string[]
): string
```

#### `generateJsonContent(data, pretty?)`

Generate JSON content from data.

```typescript
function generateJsonContent<T extends object>(
  data: T[],
  pretty?: boolean
): string
```

#### `generateContent(data, format, options?)`

Generate content in specified format.

```typescript
function generateContent<T extends object>(
  data: T[],
  format: "csv" | "tsv" | "json",
  options?: {
    delimiter?: string;
    quoteValues?: boolean;
    transformValue?: (value, key, row) => string;
    customHeaders?: string[];
    prettifyJson?: boolean;
  }
): string
```

#### `generateContentWithProgress(data, format, onProgress?, options?)`

Generate content with progress tracking.

```typescript
function generateContentWithProgress<T extends object>(
  data: T[],
  format: ExportFormat,
  onProgress?: (progress: {
    current: number;
    total: number;
    percentage: number;
  }) => void,
  options?: {...}
): string
```

### CSV/TSV Parsing

#### `parseCSV(csvContent, options?)`

Parse CSV string into typed objects.

```typescript
function parseCSV<T extends object = Record<string, unknown>>(
  csvContent: string,
  options?: {
    delimiter?: string;
    hasHeaders?: boolean;
    headers?: string[];
    trimValues?: boolean;
    skipEmptyRows?: boolean;
  }
): CsvParseResult<T>
```

Returns `{ success: boolean; data?: T[]; error?: string; rowsProcessed: number }`

#### `parseCSVLine(line, delimiter?, trim?)`

Parse single CSV line.

```typescript
function parseCSVLine(
  line: string,
  delimiter?: string,
  trim?: boolean
): string[]
```

#### `parseTSV(tsvContent, options?)`

Parse TSV format (convenience wrapper for `parseCSV` with tab delimiter).

```typescript
function parseTSV<T extends object = Record<string, unknown>>(
  tsvContent: string,
  options?: {...}
): CsvParseResult<T>
```

#### `detectDelimiter(csvContent, sampleRows?)`

Auto-detect CSV delimiter.

```typescript
function detectDelimiter(csvContent: string, sampleRows?: number): string
```

#### `isValidCSV(csvContent, delimiter?)`

Validate CSV format.

```typescript
function isValidCSV(csvContent: string, delimiter?: string): boolean
```

### Data Validation

#### `validateCsvData(data, options?)`

Validate data before export.

```typescript
function validateCsvData<T extends object>(
  data: unknown,
  options?: {
    maxRows?: number;
    maxFieldSize?: number;
    allowEmpty?: boolean;
  }
): ValidationResult
```

Returns `{ valid: boolean; errors: string[]; warnings: string[] }`

#### `hasConsistentSchema(data)`

Check if all objects have same keys.

```typescript
function hasConsistentSchema<T extends object>(data: T[]): boolean
```

#### `getDataSchema(data)`

Get schema information.

```typescript
function getDataSchema<T extends object>(
  data: T[]
): {
  fields: string[];
  types: Record<string, string>;
  sample: Record<string, unknown>;
}
```

#### `detectDataIssues(data)`

Detect potential export issues.

```typescript
function detectDataIssues<T extends object>(data: T[]): string[]
```

### Value Formatting

#### `formatCsvValue(value, quote?)`

Format and escape a CSV value.

```typescript
function formatCsvValue(
  value: unknown,
  quote?: boolean
): FormattedValue
```

Returns `{ original: unknown; formatted: string; escaped: string }`

#### `formatCsvRow(values, delimiter?, quote?)`

Format array of values into CSV row.

```typescript
function formatCsvRow(
  values: unknown[],
  delimiter?: string,
  quote?: boolean
): string
```

#### `shouldQuoteValue(value, delimiter)`

Determine if value needs quoting.

```typescript
function shouldQuoteValue(value: unknown, delimiter: string): boolean
```

#### `formatCsvValueSmart(value, delimiter?)`

Format value with smart quoting (only when needed).

```typescript
function formatCsvValueSmart(
  value: unknown,
  delimiter?: string
): FormattedValue
```

## Types

### Core Types

```typescript
// Export format options
type ExportFormat = "csv" | "tsv" | "json";

// Download button props
interface DownloadButtonProps<T extends object> {
  data: T[];
  filename: string;
  delimiter?: string;
  quoteValues?: boolean;
  transformValue?: (value: unknown, key: string, row: T) => string;
  customHeaders?: string[];
  customButton?: React.ReactNode;
  emptyDataMessage?: string;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: {
    current: number;
    total: number;
    percentage: number;
  }) => void;
  chunkSize?: number;
}

// CSV generation options
interface GenerateCsvOptions<T extends object> {
  data: T[];
  delimiter: string;
  quoteValues: boolean;
  transformValue?: (value: unknown, key: string, row: T) => string;
  customHeaders?: string[];
}

// Export data options
interface ExportDataOptions<T extends object> {
  data: T[];
  format: ExportFormat;
  filename: string;
  customHeaders?: string[];
  transformValue?: (value: unknown, key: string, row: T) => string;
  onProgress?: (progress: {
    current: number;
    total: number;
    percentage: number;
  }) => void;
  chunkSize?: number;
}

// CSV parse result
interface CsvParseResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
  rowsProcessed: number;
}

// Validation result
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Formatted value
interface FormattedValue {
  original: unknown;
  formatted: string;
  escaped: string;
}
```

## Complete Example

```tsx
import React, { useState } from "react";
import {
  DownloadButton,
  validateCsvData,
  formatCsvValue,
  parseCSV,
  generateContent,
} from "react-csvify";

interface User {
  id: number;
  name: string;
  email: string;
  joinDate: string;
  score: number;
}

export default function CompleteExample() {
  const [downloadFormat, setDownloadFormat] = useState<"csv" | "tsv" | "json">("csv");

  const users: User[] = [
    {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      joinDate: "2024-01-15",
      score: 95.5,
    },
    {
      id: 2,
      name: "Bob",
      email: "bob@example.com",
      joinDate: "2024-02-20",
      score: 88.3,
    },
  ];

  const handleExport = () => {
    // Validate
    const validation = validateCsvData(users);
    if (!validation.valid) {
      console.error("Validation errors:", validation.errors);
      return;
    }

    // Generate
    const format = downloadFormat as ExportFormat;
    const content = generateContent(users, format, {
      customHeaders: ["ID", "Full Name", "Email", "Join Date", "Score"],
      transformValue: (value, key) => {
        if (key === "score" && typeof value === "number") {
          return value.toFixed(2);
        }
        return String(value);
      },
    });

    console.log(content);
  };

  return (
    <div>
      <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value as any)}>
        <option value="csv">CSV</option>
        <option value="tsv">TSV</option>
        <option value="json">JSON</option>
      </select>

      <DownloadButton
        data={users}
        filename={`users.${downloadFormat}`}
        customHeaders={["ID", "Full Name", "Email", "Join Date", "Score"]}
        transformValue={(value, key) => {
          if (key === "score" && typeof value === "number") {
            return value.toFixed(2);
          }
          return String(value);
        }}
        onDownloadStart={handleExport}
      />
    </div>
  );
}
```
