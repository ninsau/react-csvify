"use client";

import React, { useCallback } from "react";
import type { DownloadButtonProps } from "../types";
import { generateContent, generateContentWithProgress } from "../utils/generateCSV";
import type { ExportFormat } from "../types";

function DownloadButton<T extends object>(props: DownloadButtonProps<T>) {
  const {
    data,
    filename,
    delimiter = ",",
    quoteValues = true,
    transformValue,
    customHeaders,
    customButton,
    emptyDataMessage = "No data available.",
    onDownloadStart,
    onDownloadComplete,
    onError,
    onProgress,
    chunkSize = 1000,
  } = props;

  // Determine export format from filename
  const getFormatFromFilename = (fname: string): ExportFormat => {
    const ext = fname.split(".").pop()?.toLowerCase();
    if (ext === "tsv") return "tsv";
    if (ext === "json") return "json";
    return "csv";
  };

  const format = getFormatFromFilename(filename);

  const handleDownload = useCallback((): void => {
    if (!data || data.length === 0) {
      if (onError) onError(new Error("No data available"));
      return;
    }

    try {
      if (onDownloadStart) onDownloadStart();

      // Generate content based on format
      let fileContent: string;
      if (onProgress && data.length > chunkSize) {
        fileContent = generateContentWithProgress(
          data,
          format,
          onProgress,
          {
            delimiter,
            quoteValues,
            transformValue,
            customHeaders,
            prettifyJson: true,
          }
        );
      } else {
        fileContent = generateContent(data, format, {
          delimiter,
          quoteValues,
          transformValue,
          customHeaders,
          prettifyJson: true,
        });
      }

      if (!fileContent) {
        throw new Error("Failed to generate content");
      }

      // Determine MIME type based on format
      const mimeTypes: Record<ExportFormat, string> = {
        csv: "text/csv;charset=utf-8;",
        tsv: "text/tab-separated-values;charset=utf-8;",
        json: "application/json;charset=utf-8;",
      };

      const blob = new Blob([fileContent], { type: mimeTypes[format] });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      if (onDownloadComplete) onDownloadComplete();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (onError) onError(err);
    }
  }, [
    data,
    delimiter,
    quoteValues,
    transformValue,
    customHeaders,
    filename,
    format,
    onDownloadStart,
    onDownloadComplete,
    onError,
    onProgress,
    chunkSize,
  ]);

  if (!data || data.length === 0) {
    return <span>{emptyDataMessage}</span>;
  }

  return customButton ? (
    <div onClick={handleDownload} style={{ cursor: "pointer" }}>
      {customButton}
    </div>
  ) : (
    <button
      onClick={handleDownload}
      style={{ cursor: "pointer" }}
      className="text-indigo-500 text-sm hover:text-indigo-700 transition-colors duration-200 underline bg-transparent border-none p-0"
      type="button"
    >
      Download {format.toUpperCase()}
    </button>
  );
}

export default React.memo(DownloadButton);
