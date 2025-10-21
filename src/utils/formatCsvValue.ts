import type { FormattedValue } from "../types";

/**
 * Format a CSV value with escaping and quoting.
 *
 * @param value - The raw value to format
 * @param quote - Whether to wrap the value in quotes
 * @returns FormattedValue object with original, formatted, and escaped values
 *
 * @example
 * ```typescript
 * const result = formatCsvValue("Hello, World", true);
 * console.log(result.formatted); // "Hello, World"
 * ```
 */
export function formatCsvValue(
  value: unknown,
  quote = true
): FormattedValue {
  const stringValue = String(value ?? "");

  // Escape double quotes by doubling them
  const escaped = stringValue.replace(/"/g, '""');

  // Apply quoting if needed
  const formatted = quote ? `"${escaped}"` : escaped;

  return {
    original: value,
    formatted,
    escaped,
  };
}

/**
 * Format an array of values for CSV output.
 *
 * @param values - Array of values to format
 * @param delimiter - Character to use as field separator
 * @param quote - Whether to quote individual values
 * @returns Formatted CSV row string
 */
export function formatCsvRow(
  values: unknown[],
  delimiter = ",",
  quote = true
): string {
  return values
    .map((value) => {
      const formatted = formatCsvValue(value, quote);
      return formatted.formatted;
    })
    .join(delimiter);
}

/**
 * Determine if a value needs quoting in CSV format.
 *
 * @param value - The value to check
 * @param delimiter - The delimiter character
 * @returns True if the value should be quoted
 */
export function shouldQuoteValue(value: unknown, delimiter: string): boolean {
  const stringValue = String(value ?? "");
  return (
    stringValue.includes(delimiter) ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  );
}

/**
 * Smart format that only quotes when necessary.
 *
 * @param value - The value to format
 * @param delimiter - The delimiter character
 * @returns FormattedValue with smart quoting
 */
export function formatCsvValueSmart(
  value: unknown,
  delimiter = ","
): FormattedValue {
  const needsQuoting = shouldQuoteValue(value, delimiter);
  return formatCsvValue(value, needsQuoting);
}
