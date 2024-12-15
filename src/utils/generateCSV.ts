import { GenerateCsvOptions } from "../types";

export function generateCsvContent<T extends object>(
  options: GenerateCsvOptions<T>
): string {
  const { data, delimiter, quoteValues, transformValue, customHeaders } =
    options;

  if (data.length === 0) return "";

  const keys = Object.keys(data[0]);
  const headers =
    customHeaders && customHeaders.length === keys.length
      ? customHeaders
      : keys;

  const headerRow = headers.join(delimiter) + "\n";

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
