"use client";

import React, { useCallback } from "react";
import { DownloadButtonProps } from "../types";
import { generateCsvContent } from "../utils/generateCSV";

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
  } = props;

  const handleDownload = useCallback(() => {
    if (!data || data.length === 0) {
      if (onError) onError(new Error("No data available"));
      return;
    }

    try {
      if (onDownloadStart) onDownloadStart();
      const csvContent = generateCsvContent({
        data,
        delimiter,
        quoteValues,
        transformValue,
        customHeaders,
      });

      if (!csvContent) {
        throw new Error("Failed to generate CSV content");
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
      if (error instanceof Error && onError) onError(error);
    }
  }, [
    data,
    delimiter,
    quoteValues,
    transformValue,
    customHeaders,
    filename,
    onDownloadStart,
    onDownloadComplete,
    onError,
  ]);

  if (!data || data.length === 0) {
    return <span>{emptyDataMessage}</span>;
  }

  return customButton ? (
    <div onClick={handleDownload} style={{ cursor: "pointer" }}>
      {customButton}
    </div>
  ) : (
    <a
      onClick={handleDownload}
      style={{ cursor: "pointer" }}
      className="text-indigo-500 text-sm hover:text-indigo-700 transition-colors duration-200 underline"
    >
      Download CSV
    </a>
  );
}

export default React.memo(DownloadButton);
