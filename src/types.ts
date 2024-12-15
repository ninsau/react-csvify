import React from "react";

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
}

export interface GenerateCsvOptions<T extends object> {
  data: T[];
  delimiter: string;
  quoteValues: boolean;
  transformValue?: (value: unknown, key: string, row: T) => string;
  customHeaders?: string[];
}
