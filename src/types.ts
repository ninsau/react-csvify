import type React from "react";

// Download Button Props
export interface DownloadButtonProps<T extends object> {
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

// CSV Generation Options
export interface GenerateCsvOptions<T extends object> {
  data: T[];
  delimiter: string;
  quoteValues: boolean;
  transformValue?: (value: unknown, key: string, row: T) => string;
  customHeaders?: string[];
}

// Export Format Type
export type ExportFormat = "csv" | "tsv" | "json";

// Export Data Options
export interface ExportDataOptions<T extends object> {
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

// CSV Parsing Result
export interface CsvParseResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
  rowsProcessed: number;
}

// Validation Result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// CSV Value Formatting Result
export interface FormattedValue {
  original: unknown;
  formatted: string;
  escaped: string;
}
