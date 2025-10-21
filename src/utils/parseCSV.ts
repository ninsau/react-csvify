import type { CsvParseResult } from "../types";

/**
 * Parse a CSV string into an array of objects.
 *
 * @param csvContent - The CSV content as a string
 * @param options - Parsing options
 * @returns CsvParseResult with parsed data or error
 *
 * @example
 * ```typescript
 * const csv = "id,name\n1,John\n2,Jane";
 * const result = parseCSV(csv);
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 */
export function parseCSV<T extends object = Record<string, unknown>>(
  csvContent: string,
  options?: {
    delimiter?: string;
    hasHeaders?: boolean;
    headers?: string[];
    trimValues?: boolean;
    skipEmptyRows?: boolean;
  }
): CsvParseResult<T> {
  const delimiter = options?.delimiter ?? ",";
  const hasHeaders = options?.hasHeaders ?? true;
  const trimValues = options?.trimValues ?? true;
  const skipEmptyRows = options?.skipEmptyRows ?? true;

  try {
    const lines = csvContent.split(/\r?\n/);
    const data: T[] = [];
    let currentRowIndex = 0;

    // Get headers
    let headers: string[];
    let dataStartIndex = 0;

    if (options?.headers) {
      headers = options.headers;
      dataStartIndex = 0;
    } else if (hasHeaders && lines.length > 0) {
      headers = parseCSVLine(lines[0] ?? "", delimiter, trimValues);
      dataStartIndex = 1;
    } else {
      // No headers - use column indices
      if (lines.length > 0) {
        const firstLine = parseCSVLine(lines[0] ?? "", delimiter, trimValues);
        headers = firstLine.map((_, i) => `col_${i}`);
      } else {
        return { success: true, data: [], rowsProcessed: 0 };
      }
    }

    // Parse data rows
    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i];

      // Skip empty rows if requested
      if (skipEmptyRows && (line?.trim() === "")) {
        continue;
      }

      try {
        const values = parseCSVLine(line ?? "", delimiter, trimValues);

        // Create object from headers and values
        const row: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] ?? "";
        });

        data.push(row as T);
        currentRowIndex++;
      } catch (error) {
        throw new Error(
          `Error parsing row ${i}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    return { success: true, data, rowsProcessed: currentRowIndex };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      rowsProcessed: 0,
    };
  }
}

/**
 * Parse a single CSV line into an array of values.
 *
 * @param line - The CSV line to parse
 * @param delimiter - Field delimiter
 * @param trim - Whether to trim whitespace
 * @returns Array of parsed values
 */
export function parseCSVLine(
  line: string,
  delimiter = ",",
  trim = true
): string[] {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      // End of field
      values.push(trim ? current.trim() : current);
      current = "";
    } else {
      current += char;
    }
  }

  // Add last field
  values.push(trim ? current.trim() : current);

  return values;
}

/**
 * Parse TSV (Tab-Separated Values) format.
 *
 * @param tsvContent - The TSV content as a string
 * @param options - Parsing options
 * @returns CsvParseResult with parsed data or error
 */
export function parseTSV<T extends object = Record<string, unknown>>(
  tsvContent: string,
  options?: Parameters<typeof parseCSV<T>>[1]
): CsvParseResult<T> {
  return parseCSV<T>(tsvContent, { ...options, delimiter: "\t" });
}

/**
 * Detect delimiter in CSV content.
 *
 * @param csvContent - The CSV content
 * @param sampleRows - Number of rows to sample for detection
 * @returns Detected delimiter or default comma
 */
export function detectDelimiter(
  csvContent: string,
  sampleRows = 5
): string {
  const lines = csvContent.split(/\r?\n/).slice(0, sampleRows);
  const delimiters = [",", "\t", ";", "|"];
  const counts: Record<string, number> = {};

  for (const delimiter of delimiters) {
    counts[delimiter] = 0;

    for (const line of lines) {
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          counts[delimiter]++;
        }
      }
    }
  }

  // Return delimiter with highest count
  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
  return sorted[0]?.[0] ?? ",";
}

/**
 * Validate if a string is valid CSV format.
 *
 * @param csvContent - The CSV content
 * @param delimiter - Field delimiter
 * @returns true if valid CSV, false otherwise
 */
export function isValidCSV(csvContent: string, delimiter = ","): boolean {
  try {
    if (!csvContent || csvContent.trim() === "") {
      return false;
    }

    const lines = csvContent.split(/\r?\n/);
    if (lines.length === 0) {
      return false;
    }

    // Try to parse first line
    parseCSVLine(lines[0] ?? "", delimiter);

    // Check if all lines have similar structure (optional)
    const firstLineFields = parseCSVLine(lines[0] ?? "", delimiter).length;
    for (let i = 1; i < Math.min(lines.length, 10); i++) {
      const currentLine = lines[i];
      if (currentLine?.trim() === "") continue;
      const fieldCount = parseCSVLine(currentLine ?? "", delimiter).length;
      // Allow some variance but not huge differences
      if (Math.abs(fieldCount - firstLineFields) > 2) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}
