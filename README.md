# React CSVify

A composable, extensible, and fully typed React component for generating and downloading CSV files from any dataset. Designed for advanced customization and seamless integration into modern React or Next.js applications, `react-csvify` goes beyond simple CSV downloads by offering detailed control over formatting, custom headers, event hooks, and more.

## Features

- **No `any` Types**: Strictly typed with generics for safer, more predictable integrations.
- **Transform & Customize Data**: Easily manipulate values before they hit the CSV file.
- **Custom Headers & Formatting**: Define your own headers, delimiters, quoting rules, and transformations.
- **Event Hooks**: Execute callbacks before, during, and after the download process—perfect for analytics or logging.
- **Flexible UI**: Use the default link style or inject your own custom button or UI component.
- **Empty State Handling**: Gracefully handle empty datasets by showing a fallback message.
- **TypeScript Ready**: Benefit from a fully typed API, ensuring a smooth development experience.
- **Modern Architecture**: Ideal for Next.js apps, but works in any React environment.

## Installation

```bash
npm install react-csvify
```

or

```bash
yarn add react-csvify
```

## Basic Usage

```tsx
import React from "react";
import { DownloadButton } from "react-csvify";

interface User {
  id: number;
  name: string;
  score: number;
}

const data: User[] = [
  { id: 1, name: "Alice", score: 95.2 },
  { id: 2, name: "Bob", score: 88.7 },
];

export default function MyPage() {
  return (
    <div>
      <h1>Download CSV Demo</h1>
      <DownloadButton data={data} filename="my-data.csv" />
    </div>
  );
}
```

## Advanced Usage

```tsx
import React from "react";
import { DownloadButton } from "react-csvify";

interface DataRow {
  id: number;
  name: string;
  score: number;
  registered: string;
}

const data: DataRow[] = [
  { id: 1, name: "Alice", score: 95.2, registered: "2022-01-02T10:00:00Z" },
  { id: 2, name: "Bob", score: 88.7, registered: "2022-01-05T15:30:00Z" },
];

export default function AdvancedExample() {
  return (
    <DownloadButton<DataRow>
      data={data}
      filename="custom-data.csv"
      delimiter=";"
      quoteValues={false}
      transformValue={(value, key, row) => {
        if (key === "score" && typeof value === "number") {
          return value.toFixed(2);
        }
        if (key === "registered" && typeof value === "string") {
          return new Date(value).toLocaleDateString();
        }
        return String(value ?? "");
      }}
      customHeaders={["User ID", "Full Name", "Score", "Registration Date"]}
      emptyDataMessage="No data to export."
      onDownloadStart={() => console.log("Download started")}
      onDownloadComplete={() => console.log("Download complete")}
      onError={(error) => console.error("Error generating CSV:", error)}
      customButton={
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Export CSV
        </button>
      }
    />
  );
}
```

## Props

| Prop               | Type                                               | Required | Default                  | Description                                                                       |
| ------------------ | -------------------------------------------------- | -------- | ------------------------ | --------------------------------------------------------------------------------- |
| data               | `T[] where T extends Record<string, unknown>`      | Yes      |                          | The dataset to be converted into CSV.                                             |
| filename           | `string`                                           | Yes      |                          | The name of the CSV file to be downloaded.                                        |
| delimiter          | `string`                                           | No       | `","`                    | Delimiter used to separate values in the CSV.                                     |
| quoteValues        | `boolean`                                          | No       | `true`                   | Whether to quote values in the CSV file.                                          |
| transformValue     | `(value: unknown, key: keyof T, row: T) => string` | No       | `(v) => String(v ?? "")` | Function to transform each value before writing to the CSV.                       |
| customHeaders      | `string[]`                                         | No       | Derived from data keys   | Override the auto-generated headers. Must match the number of columns in data[0]. |
| customButton       | `React.ReactNode`                                  | No       | `null`                   | Use a custom React node as the trigger.                                           |
| emptyDataMessage   | `string`                                           | No       | `"No data available."`   | Message displayed if data is empty.                                               |
| onDownloadStart    | `() => void`                                       | No       | `undefined`              | Callback before the download process begins.                                      |
| onDownloadComplete | `() => void`                                       | No       | `undefined`              | Callback after the CSV is successfully generated and triggered for download.      |
| onError            | `(error: Error) => void`                           | No       | `undefined`              | Callback invoked if an error occurs during CSV generation.                        |

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started.

## Versioning

We use [Semantic Versioning](https://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/ninsau/nextjs-reusable-table/tags).

To bump the version, update the `version` field in `package.json` and follow the guidelines in the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Acknowledgments

- Inspired by common data table patterns in React and Next.js applications.
- Thanks to all contributors and users for their support.
