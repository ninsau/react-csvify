import { describe, it, expect } from "vitest";
import {
  generateContent,
  generateCsvContent,
  generateTsvContent,
  generateJsonContent,
} from "../../src/utils/generateCSV";
import { parseCSV, parseTSV } from "../../src/utils/parseCSV";

describe("Format Integration Tests", () => {
  const testData = [
    { id: 1, name: "Alice", email: "alice@example.com", score: 95.5 },
    { id: 2, name: "Bob", email: "bob@example.com", score: 87.3 },
    { id: 3, name: "Charlie", email: "charlie@example.com", score: 92.1 },
  ];

  describe("CSV Round-Trip", () => {
    it("should generate CSV and parse it back to original data", () => {
      const csv = generateContent(testData, "csv");
      const parseResult = parseCSV(csv);

      expect(parseResult.success).toBe(true);
      expect(parseResult.data).toHaveLength(testData.length);

      parseResult.data?.forEach((row, index) => {
        expect(row.id).toBe(String(testData[index].id));
        expect(row.name).toBe(testData[index].name);
        expect(row.email).toBe(testData[index].email);
      });
    });

    it("should preserve special characters in CSV round-trip", () => {
      const dataWithSpecialChars = [
        { id: 1, name: 'John "Johnny" Doe', notes: "Line 1\nLine 2" },
      ];

      const csv = generateContent(dataWithSpecialChars, "csv");
      const parseResult = parseCSV(csv);

      expect(parseResult.success).toBe(true);
      expect(parseResult.data?.[0].name).toBe('John "Johnny" Doe');
    });
  });

  describe("TSV Round-Trip", () => {
    it("should generate TSV and parse it back", () => {
      const tsv = generateContent(testData, "tsv");
      const parseResult = parseTSV(tsv);

      expect(parseResult.success).toBe(true);
      expect(parseResult.data).toHaveLength(testData.length);
    });
  });

  describe("JSON Round-Trip", () => {
    it("should generate JSON and parse it back to original data", () => {
      const json = generateContent(testData, "json");
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(testData.length);
      expect(parsed[0].name).toBe(testData[0].name);
    });

    it("should preserve data types in JSON", () => {
      const json = generateContent(testData, "json");
      const parsed = JSON.parse(json);

      expect(typeof parsed[0].id).toBe("number");
      expect(typeof parsed[0].name).toBe("string");
      expect(typeof parsed[0].score).toBe("number");
    });
  });

  describe("Format Switching", () => {
    it("should generate consistent headers across formats", () => {
      const csv = generateContent(testData, "csv");
      const tsv = generateContent(testData, "tsv");
      const json = generateContent(testData, "json");

      const csvHeaders = csv.split("\n")[0];
      const tsvHeaders = tsv.split("\n")[0];
      const jsonData = JSON.parse(json);
      const jsonKeys = Object.keys(jsonData[0]);

      expect(csvHeaders).toContain("id");
      expect(tsvHeaders).toContain("id");
      expect(jsonKeys).toContain("id");
    });

    it("should handle custom headers in all formats", () => {
      const customHeaders = ["ID", "Name", "Email", "Score"];

      const csv = generateContent(testData, "csv", { customHeaders });
      const tsv = generateContent(testData, "tsv", { customHeaders });

      expect(csv).toContain("ID,Name,Email,Score");
      expect(tsv).toContain("ID\tName\tEmail\tScore");
    });
  });

  describe("Data Transformation Integration", () => {
    it("should apply transforms consistently across formats", () => {
      const transform = (value: unknown) => {
        if (typeof value === "number") {
          return String(value * 2);
        }
        return String(value);
      };

      const csv = generateContent(testData, "csv", { transformValue: transform });
      const tsv = generateContent(testData, "tsv", { transformValue: transform });

      expect(csv).toContain("2"); // 1 * 2
      expect(tsv).toContain("2");
    });
  });

  describe("Large Dataset Handling", () => {
    it("should handle large datasets efficiently", () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
      }));

      const startTime = performance.now();
      const csv = generateContent(largeData, "csv");
      const endTime = performance.now();

      expect(csv).toBeTruthy();
      expect(csv.split("\n").length).toBe(1001); // headers + 1000 rows
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });

  describe("Empty Data Handling", () => {
    it("should handle empty arrays across formats", () => {
      expect(() => generateContent([], "csv")).not.toThrow();
      expect(() => generateContent([], "tsv")).not.toThrow();
      expect(generateContent([], "json")).toBe("[]");
    });
  });

  describe("Special Cases", () => {
    it("should handle data with null values", () => {
      const dataWithNulls = [{ id: 1, name: null, email: "test@example.com" }];

      const csv = generateContent(dataWithNulls, "csv");
      expect(csv).toBeTruthy();

      const json = generateContent(dataWithNulls, "json");
      const parsed = JSON.parse(json);
      expect(parsed[0].name).toBeNull();
    });

    it("should handle data with undefined values", () => {
      const dataWithUndefined = [{ id: 1, name: undefined, email: "test@example.com" }];

      const csv = generateContent(dataWithUndefined, "csv");
      expect(csv).toBeTruthy();
    });

    it("should handle data with boolean values", () => {
      const dataWithBooleans = [
        { id: 1, active: true },
        { id: 2, active: false },
      ];

      const csv = generateContent(dataWithBooleans, "csv");
      expect(csv).toContain("true");
      expect(csv).toContain("false");
    });

    it("should handle data with arrays as values", () => {
      const dataWithArrays = [
        { id: 1, tags: ["tag1", "tag2"] },
      ];

      const csv = generateContent(dataWithArrays, "csv");
      expect(csv).toBeTruthy();

      const json = generateContent(dataWithArrays, "json");
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed[0].tags)).toBe(true);
    });
  });

  describe("Delimiter Consistency", () => {
    it("should respect custom delimiters in CSV", () => {
      const csv = generateContent(testData, "csv", { delimiter: ";" });
      expect(csv).toContain(";");
      expect(csv).not.toContain('"id","name"');
    });

    it("should always use tab for TSV", () => {
      const tsv = generateContent(testData, "tsv");
      expect(tsv).toContain("\t");
      expect(tsv).not.toContain(",");
    });
  });

  describe("Quote Handling", () => {
    it("should quote values when specified in CSV", () => {
      const csv = generateContent(testData, "csv", { quoteValues: true });
      expect(csv).toContain('"');
    });

    it("should not quote values when specified in CSV", () => {
      const csv = generateContent(testData, "csv", { quoteValues: false });
      const lines = csv.split("\n");
      const dataLines = lines.slice(1);
      // At least one line should not be fully quoted
      expect(dataLines.some((line) => !line.startsWith('"'))).toBe(true);
    });
  });
});
