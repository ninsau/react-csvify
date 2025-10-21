import type { ValidationResult } from "../types";

/**
 * Validate data array before CSV export.
 *
 * @param data - Array of objects to validate
 * @param options - Validation options
 * @returns ValidationResult with validation status and messages
 *
 * @example
 * ```typescript
 * const result = validateCsvData([{ id: 1, name: "John" }]);
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 * ```
 */
export function validateCsvData(
  data: unknown,
  options?: {
    maxRows?: number;
    maxFieldSize?: number;
    allowEmpty?: boolean;
  }
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data is an array
  if (!Array.isArray(data)) {
    errors.push("Data must be an array");
    return { valid: false, errors, warnings };
  }

  // Check if array is empty
  if (data.length === 0) {
    if (options?.allowEmpty === false) {
      errors.push("Data array cannot be empty");
    } else {
      warnings.push("Data array is empty");
    }
  }

  // Check max rows
  if (options?.maxRows && data.length > options.maxRows) {
    warnings.push(
      `Data contains ${data.length} rows, which exceeds recommended max of ${options.maxRows}`
    );
  }

  // Validate each row
  let rowsWithIssues = 0;
  data.forEach((row, index) => {
    // Check if row is an object
    if (typeof row !== "object" || row === null) {
      errors.push(`Row ${index}: Value is not an object`);
      rowsWithIssues++;
      return;
    }

    // Check if row is a plain object
    if (Array.isArray(row)) {
      errors.push(`Row ${index}: Row cannot be an array`);
      rowsWithIssues++;
      return;
    }

    // Validate field sizes
    if (options?.maxFieldSize) {
      const maxFieldSize = options.maxFieldSize;
      for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
        const stringValue = String(value ?? "");
        if (stringValue.length > maxFieldSize) {
          warnings.push(
            `Row ${index}, field "${key}": Value exceeds max field size of ${maxFieldSize}`
          );
        }
      }
    }
  });

  if (rowsWithIssues > 0) {
    errors.push(
      `${rowsWithIssues} row(s) have validation issues`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if data has consistent schema (all objects have same keys).
 *
 * @param data - Array of objects to check
 * @returns true if schema is consistent, false otherwise
 */
export function hasConsistentSchema<T extends object>(
  data: T[]
): boolean {
  if (data.length === 0) return true;

  const firstKeys = Object.keys(data[0] ?? {}).sort();

  return data.every((row) => {
    const keys = Object.keys(row ?? {}).sort();
    return keys.length === firstKeys.length &&
      keys.every((key, index) => key === firstKeys[index]);
  });
}

/**
 * Get schema information from data array.
 *
 * @param data - Array of objects to analyze
 * @returns Schema information with field names and types
 */
export function getDataSchema<T extends object>(
  data: T[]
): {
  fields: string[];
  types: Record<string, string>;
  sample: Record<string, unknown>;
} {
  if (data.length === 0) {
    return { fields: [], types: {}, sample: {} };
  }

  const firstRow = data[0];
  const fields = Object.keys(firstRow ?? {});
  const types: Record<string, string> = {};
  const sample: Record<string, unknown> = {};

  for (const field of fields) {
    const value = (firstRow as Record<string, unknown>)[field];
    types[field] = value === null ? "null" : typeof value;
    sample[field] = value;
  }

  return { fields, types, sample };
}

/**
 * Detect potential issues in data that might cause CSV export problems.
 *
 * @param data - Array of objects to analyze
 * @returns Array of potential issue messages
 */
export function detectDataIssues<T extends object>(
  data: T[]
): string[] {
  const issues: string[] = [];

  if (data.length === 0) {
    issues.push("Empty dataset");
    return issues;
  }

  // Check schema consistency
  if (!hasConsistentSchema(data)) {
    issues.push("Inconsistent schema: not all objects have the same keys");
  }

  // Check for deeply nested objects
  for (const row of data) {
    const rowIndex = data.indexOf(row);
    for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const nestedObj = value as object;
        if (Object.keys(nestedObj ?? {}).length > 0) {
          issues.push(
            `Row ${rowIndex}, field "${key}": Contains nested object (will be converted to string)`
          );
        }
      }
    }
  }

  // Check for circular references (simplified check)
  try {
    JSON.stringify(data);
  } catch {
    issues.push("Data contains circular references or non-serializable values");
  }

  return issues;
}
