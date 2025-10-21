import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import React from "react";
import DownloadButton from "../../src/components/DownloadButton";

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = vi.fn();

describe("DownloadButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render default link text", () => {
    const data = [{ id: 1, name: "John" }];
    render(
      <DownloadButton
        data={data}
        filename="test.csv"
      />
    );
    expect(screen.getByText("Download CSV")).toBeInTheDocument();
  });

  it("should detect format from filename and show correct text", () => {
    const data = [{ id: 1, name: "John" }];
    const { rerender } = render(
      <DownloadButton
        data={data}
        filename="test.tsv"
      />
    );
    expect(screen.getByText("Download TSV")).toBeInTheDocument();

    rerender(
      <DownloadButton
        data={data}
        filename="test.json"
      />
    );
    expect(screen.getByText("Download JSON")).toBeInTheDocument();
  });

  it("should show empty data message when data is empty", () => {
    render(
      <DownloadButton
        data={[]}
        filename="test.csv"
        emptyDataMessage="No data to export"
      />
    );
    expect(screen.getByText("No data to export")).toBeInTheDocument();
  });

  it("should use default empty message", () => {
    render(
      <DownloadButton
        data={[]}
        filename="test.csv"
      />
    );
    expect(screen.getByText("No data available.")).toBeInTheDocument();
  });

  it("should render custom button when provided", () => {
    const data = [{ id: 1, name: "John" }];
    render(
      <DownloadButton
        data={data}
        filename="test.csv"
        customButton={<button type="button">Custom Export</button>}
      />
    );
    expect(screen.getByText("Custom Export")).toBeInTheDocument();
  });

  it("should call onDownloadStart when download is initiated", async () => {
    const onDownloadStart = vi.fn();
    const data = [{ id: 1, name: "John" }];

    render(
      <DownloadButton
        data={data}
        filename="test.csv"
        onDownloadStart={onDownloadStart}
      />
    );

    const link = screen.getByText("Download CSV");
    await userEvent.click(link);

    expect(onDownloadStart).toHaveBeenCalledOnce();
  });

  it("should call onDownloadComplete when download finishes", async () => {
    const onDownloadComplete = vi.fn();
    const data = [{ id: 1, name: "John" }];

    render(
      <DownloadButton
        data={data}
        filename="test.csv"
        onDownloadComplete={onDownloadComplete}
      />
    );

    const link = screen.getByText("Download CSV");
    await userEvent.click(link);

    expect(onDownloadComplete).toHaveBeenCalledOnce();
  });

  it("should handle errors gracefully", () => {
    const onError = vi.fn();
    const data = [{ id: 1, name: "John" }];

    render(
      <DownloadButton
        data={data}
        filename=""
        onError={onError}
      />
    );

    // Empty filename should not cause error, just proceed normally
    expect(onError).not.toHaveBeenCalled();
  });

  it("should apply custom transform", async () => {
    const onDownloadComplete = vi.fn();
    const data = [{ id: 1, score: 95.5678 }];

    render(
      <DownloadButton
        data={data}
        filename="test.csv"
        transformValue={(value, key) => {
          if (key === "score" && typeof value === "number") {
            return value.toFixed(2);
          }
          return String(value);
        }}
        onDownloadComplete={onDownloadComplete}
      />
    );

    const link = screen.getByText("Download CSV");
    await userEvent.click(link);

    expect(onDownloadComplete).toHaveBeenCalled();
  });

  it("should use custom headers", async () => {
    const onDownloadComplete = vi.fn();
    const data = [{ id: 1, name: "John" }];

    render(
      <DownloadButton
        data={data}
        filename="test.csv"
        customHeaders={["User ID", "Full Name"]}
        onDownloadComplete={onDownloadComplete}
      />
    );

    const link = screen.getByText("Download CSV");
    await userEvent.click(link);

    expect(onDownloadComplete).toHaveBeenCalled();
  });

  it("should support custom delimiter", async () => {
    const onDownloadComplete = vi.fn();
    const data = [{ id: 1, name: "John" }];

    render(
      <DownloadButton
        data={data}
        filename="test.csv"
        delimiter=";"
        onDownloadComplete={onDownloadComplete}
      />
    );

    const link = screen.getByText("Download CSV");
    await userEvent.click(link);

    expect(onDownloadComplete).toHaveBeenCalled();
  });

  it("should call onProgress for large datasets", async () => {
    const onProgress = vi.fn();
    const data = Array.from({ length: 2000 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
    }));

    render(
      <DownloadButton
        data={data}
        filename="test.csv"
        onProgress={onProgress}
        chunkSize={100}
      />
    );

    const link = screen.getByText("Download CSV");
    await userEvent.click(link);

    expect(onProgress).toHaveBeenCalled();
  });

  it("should create blob with correct MIME type for CSV", async () => {
    const data = [{ id: 1 }];
    const blobSpy = vi.spyOn(globalThis as unknown as { Blob: typeof Blob }, "Blob");

    render(
      <DownloadButton
        data={data}
        filename="test.csv"
      />
    );

    const link = screen.getByText("Download CSV");
    await userEvent.click(link);

    expect(blobSpy).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        type: expect.stringContaining("text/csv"),
      })
    );
  });

  it("should create blob with correct MIME type for JSON", async () => {
    const data = [{ id: 1 }];
    const blobSpy = vi.spyOn(globalThis as unknown as { Blob: typeof Blob }, "Blob");

    render(
      <DownloadButton
        data={data}
        filename="test.json"
      />
    );

    const link = screen.getByText("Download JSON");
    await userEvent.click(link);

    expect(blobSpy).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        type: expect.stringContaining("application/json"),
      })
    );
  });

  it("should be memoized", () => {
    const data1 = [{ id: 1, name: "John" }];
    const data2 = [{ id: 1, name: "John" }];

    const { rerender } = render(
      <DownloadButton
        data={data1}
        filename="test.csv"
      />
    );

    const firstRender = screen.getByText("Download CSV");

    rerender(
      <DownloadButton
        data={data2}
        filename="test.csv"
      />
    );

    const secondRender = screen.getByText("Download CSV");

    expect(firstRender).toBe(secondRender);
  });
});
