import { describe, it, expect } from "vitest";
import {
  generateCsvContent,
  generateTsvContent,
  generateJsonContent,
  generateContent,
  generateContentWithProgress,
} from "../../src/utils/generateCSV";

describe("generateCsvContent", () => {
  it("should generate CSV with headers", () => {
    const data = [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
    ];
    const csv = generateCsvContent({
      data,
      delimiter: ",",
      quoteValues: true,
    });
    expect(csv).toContain('"1","John"');
    expect(csv).toContain('"2","Jane"');
  });

  it("should quote values when quoteValues is true", () => {
    const data = [{ id: 1, name: "John" }];
    const csv = generateCsvContent({
      data,
      delimiter: ",",
      quoteValues: true,
    });
    expect(csv).toContain('"1"');
    expect(csv).toContain('"John"');
  });

  it("should not quote values when quoteValues is false", () => {
    const data = [{ id: 1, name: "John" }];
    const csv = generateCsvContent({
      data,
      delimiter: ",",
      quoteValues: false,
    });
    expect(csv).not.toContain('"1"');
  });

  it("should use custom headers", () => {
    const data = [{ id: 1, name: "John" }];
    const csv = generateCsvContent({
      data,
      delimiter: ",",
      quoteValues: true,
      customHeaders: ["ID", "Name"],
    });
    expect(csv).toContain("ID,Name");
    expect(csv).toContain('"1","John"');
  });

  it("should transform values", () => {
    const data = [{ id: 1, score: 95.567 }];
    const csv = generateCsvContent({
      data,
      delimiter: ",",
      quoteValues: true,
      transformValue: (value, key) => {
        if (key === "score" && typeof value === "number") {
          return value.toFixed(2);
        }
        return String(value);
      },
    });
    expect(csv).toContain("95.57");
  });

  it("should return empty string for empty data", () => {
    const csv = generateCsvContent({
      data: [],
      delimiter: ",",
      quoteValues: true,
    });
    expect(csv).toBe("");
  });

  it("should escape quotes in values", () => {
    const data = [{ id: 1, name: 'John "Johnny" Doe' }];
    const csv = generateCsvContent({
      data,
      delimiter: ",",
      quoteValues: true,
    });
    expect(csv).toContain('John ""Johnny"" Doe');
  });
});

describe("generateTsvContent", () => {
  it("should generate TSV format", () => {
    const data = [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
    ];
    const tsv = generateTsvContent(data);
    expect(tsv).toContain("\t");
    expect(tsv).not.toContain('",');
  });

  it("should support custom transform", () => {
    const data = [{ id: 1, value: 42 }];
    const tsv = generateTsvContent(data, (val) => String(val).toUpperCase());
    expect(tsv).toContain("1");
  });
});

describe("generateJsonContent", () => {
  it("should generate pretty JSON by default", () => {
    const data = [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
    ];
    const json = generateJsonContent(data);
    expect(json).toContain("  ");
    expect(json).toContain('  "id"');
  });

  it("should generate minified JSON when pretty is false", () => {
    const data = [{ id: 1, name: "John" }];
    const json = generateJsonContent(data, false);
    expect(json).toBe('[{"id":1,"name":"John"}]');
  });

  it("should preserve data structure", () => {
    const data = [
      { id: 1, name: "John", active: true },
      { id: 2, name: "Jane", active: false },
    ];
    const json = generateJsonContent(data);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(data);
  });
});

describe("generateContent", () => {
  const data = [
    { id: 1, name: "John" },
    { id: 2, name: "Jane" },
  ];

  it("should generate CSV format", () => {
    const content = generateContent(data, "csv");
    expect(content).toContain(",");
  });

  it("should generate TSV format", () => {
    const content = generateContent(data, "tsv");
    expect(content).toContain("\t");
  });

  it("should generate JSON format", () => {
    const content = generateContent(data, "json");
    const parsed = JSON.parse(content);
    expect(parsed).toEqual(data);
  });

  it("should throw error for unsupported format", () => {
    // @ts-expect-error Testing invalid format
    expect(() => generateContent(data, "xml")).toThrow();
  });

  it("should respect custom options", () => {
    const content = generateContent(data, "csv", {
      delimiter: ";",
      quoteValues: false,
    });
    expect(content).toContain(";");
    expect(content).not.toContain('"1"');
  });
});

describe("generateContentWithProgress", () => {
  it("should call progress callback", () => {
    const data = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
    }));

    const progressCalls: Array<{
      current: number;
      total: number;
      percentage: number;
    }> = [];

    generateContentWithProgress(data, "csv", (progress) => {
      progressCalls.push(progress);
    });

    expect(progressCalls.length).toBeGreaterThan(0);
    expect(progressCalls[progressCalls.length - 1].percentage).toBe(100);
  });

  it("should handle JSON format quickly", () => {
    const data = [{ id: 1, name: "John" }];
    const progressCalls: Array<{
      current: number;
      total: number;
      percentage: number;
    }> = [];

    const json = generateContentWithProgress(data, "json", (progress) => {
      progressCalls.push(progress);
    });

    expect(progressCalls.length).toBeGreaterThan(0);
    expect(progressCalls[0].percentage).toBe(100);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(data);
  });

  it("should generate correct content while tracking progress", () => {
    const data = [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
    ];

    const content = generateContentWithProgress(data, "csv");
    expect(content).toContain("1");
    expect(content).toContain("John");
  });
});
