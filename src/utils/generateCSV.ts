import type { GenerateCsvOptions, ExportFormat } from "../types";

export function generateCsvContent<T extends object>(
  options: GenerateCsvOptions<T>
): string {
  const { data, delimiter, quoteValues, transformValue, customHeaders } =
    options;

  if (data.length === 0) return "";

  const keys = Object.keys(data[0] ?? {});
  const headers =
    customHeaders && customHeaders.length === keys.length
      ? customHeaders
      : keys;

  const headerRow = `${headers.join(delimiter)}\n`;

  const rows = data
    .map((row) =>
      keys
        .map((key) => {
          const rawValue = (row as Record<string, unknown>)[key];
          const transformed = transformValue
            ? transformValue(rawValue, key, row)
            : String(rawValue ?? "");
          const safeValue = transformed.replace(/"/g, '""');
          return quoteValues ? `"${safeValue}"` : safeValue;
        })
        .join(delimiter)
    )
    .join("\n");

  return headerRow + rows;
}

/**
 * Generate TSV (Tab-Separated Values) content from data.
 *
 * @param data - Array of objects to convert
 * @param transformValue - Optional transform function for values
 * @param customHeaders - Optional custom headers
 * @returns TSV content as string
 */
export function generateTsvContent<T extends object>(
  data: T[],
  transformValue?: (value: unknown, key: string, row: T) => string,
  customHeaders?: string[]
): string {
  return generateCsvContent({
    data,
    delimiter: "\t",
    quoteValues: false,
    transformValue,
    customHeaders,
  });
}

/**
 * Generate JSON content from data.
 *
 * @param data - Array of objects to convert
 * @param pretty - Whether to format with indentation
 * @returns JSON content as string
 */
export function generateJsonContent<T extends object>(
  data: T[],
  pretty = true
): string {
  if (pretty) {
    return JSON.stringify(data, null, 2);
  }
  return JSON.stringify(data);
}

/**
 * Generate content in specified format.
 *
 * @param data - Array of objects to convert
 * @param format - Export format (csv, tsv, or json)
 * @param options - Format-specific options
 * @returns Formatted content as string
 */
export function generateContent<T extends object>(
  data: T[],
  format: ExportFormat,
  options?: {
    delimiter?: string;
    quoteValues?: boolean;
    transformValue?: (value: unknown, key: string, row: T) => string;
    customHeaders?: string[];
    prettifyJson?: boolean;
  }
): string {
  switch (format) {
    case "csv":
      return generateCsvContent({
        data,
        delimiter: options?.delimiter ?? ",",
        quoteValues: options?.quoteValues ?? true,
        transformValue: options?.transformValue,
        customHeaders: options?.customHeaders,
      });

    case "tsv":
      return generateTsvContent(data, options?.transformValue, options?.customHeaders);

    case "json":
      return generateJsonContent(data, options?.prettifyJson ?? true);

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Generate content with progress tracking for large datasets.
 *
 * @param data - Array of objects to convert
 * @param format - Export format
 * @param onProgress - Callback with progress information
 * @param options - Format-specific options
 * @returns Formatted content as string
 */
export function generateContentWithProgress<T extends object>(
  data: T[],
  format: ExportFormat,
  onProgress?: (progress: {
    current: number;
    total: number;
    percentage: number;
  }) => void,
  options?: Parameters<typeof generateContent<T>>[2]
): string {
  const total = data.length;

  if (format === "json") {
    // JSON generation is fast, report completion quickly
    onProgress?.({ current: total, total, percentage: 100 });
    return generateJsonContent(data, options?.prettifyJson ?? true);
  }

  // For CSV/TSV, process in chunks and report progress
  const delimiter = format === "csv" ? (options?.delimiter ?? ",") : "\t";
  const quoteValues = format === "csv" ? (options?.quoteValues ?? true) : false;
  const transformValue = options?.transformValue;
  const customHeaders = options?.customHeaders;

  if (data.length === 0) return "";

  const keys = Object.keys(data[0] ?? {});
  const headers =
    customHeaders && customHeaders.length === keys.length
      ? customHeaders
      : keys;

  const headerRow = `${headers.join(delimiter)}\n`;
  const rows: string[] = [];

  // Process rows and track progress
  const chunkSize = Math.max(100, Math.floor(total / 100)); // At least 100 rows per update

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;
    
    const rowContent = keys
      .map((key) => {
        const rawValue = (row as Record<string, unknown>)[key];
        const transformed = transformValue
          ? transformValue(rawValue, key, row)
          : String(rawValue ?? "");
        const safeValue = transformed.replace(/"/g, '""');
        return quoteValues ? `"${safeValue}"` : safeValue;
      })
      .join(delimiter);

    rows.push(rowContent);

    // Report progress at intervals
    if ((i + 1) % chunkSize === 0 || i === data.length - 1) {
      onProgress?.({
        current: i + 1,
        total,
        percentage: Math.round(((i + 1) / total) * 100),
      });
    }
  }

  return headerRow + rows.join("\n");
}
