interface GenerateCsvOptions<T extends Record<string, unknown>> {
  data: T[];
  delimiter: string;
  quoteValues: boolean;
  transformValue?: (value: unknown, key: keyof T, row: T) => string;
  customHeaders?: string[];
}

export function generateCsvContent<T extends Record<string, unknown>>(
  options: GenerateCsvOptions<T>
): string {
  const { data, delimiter, quoteValues, transformValue, customHeaders } =
    options;

  if (data.length === 0) return "";

  const keys = Object.keys(data[0]) as (keyof T)[];
  const headers =
    customHeaders && customHeaders.length === keys.length
      ? customHeaders
      : keys.map(String);

  const headerRow = headers.join(delimiter) + "\n";

  const rows = data
    .map((row) =>
      keys
        .map((key, index) => {
          const rawValue = row[key];
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
