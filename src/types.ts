import React from "react";

export interface DownloadButtonProps<
  T extends Record<string, string | number | boolean | null | undefined>
> {
  data: T[];
  filename: string;
  delimiter?: string;
  quoteValues?: boolean;
  transformValue?: (value: T[keyof T], key: keyof T, row: T) => string;
  customHeaders?: string[];
  customButton?: React.ReactNode;
  emptyDataMessage?: string;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onError?: (error: Error) => void;
}
