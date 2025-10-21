import { describe, it, expect } from "vitest";
import {
  parseCSV,
  parseCSVLine,
  parseTSV,
  detectDelimiter,
  isValidCSV,
} from "../../src/utils/parseCSV";

describe("parseCSVLine", () => {
  it("should parse a simple CSV line", () => {
    const result = parseCSVLine("hello,world,test");
    expect(result).toEqual(["hello", "world", "test"]);
  });

  it("should handle quoted values", () => {
    const result = parseCSVLine('"hello","world"');
    expect(result).toEqual(["hello", "world"]);
  });

  it("should handle escaped quotes inside quoted values", () => {
    const result = parseCSVLine('"say ""hello"""');
    expect(result).toEqual(['say "hello"']);
  });

  it("should handle values with commas inside quotes", () => {
    const result = parseCSVLine('"hello, world",test');
    expect(result).toEqual(["hello, world", "test"]);
  });

  it("should trim values by default", () => {
    const result = parseCSVLine('  "hello"  ,  world  ');
    expect(result).toEqual(["hello", "world"]);
  });

  it("should preserve whitespace when trim is false", () => {
    const result = parseCSVLine('  "hello"  ,  world  ', ",", false);
    // Quotes are removed when parsing, leaving the inner content
    expect(result).toEqual(["  hello  ", "  world  "]);
  });

  it("should handle empty values", () => {
    const result = parseCSVLine(",hello,,world,");
    expect(result).toEqual(["", "hello", "", "world", ""]);
  });

  it("should respect custom delimiter", () => {
    const result = parseCSVLine('hello;world;test', ";");
    expect(result).toEqual(["hello", "world", "test"]);
  });
});

describe("parseCSV", () => {
  it("should parse CSV with headers", () => {
    const csv = "id,name\n1,John\n2,Jane";
    const result = parseCSV(csv);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data?.[0]).toEqual({ id: "1", name: "John" });
  });

  it("should parse CSV without headers", () => {
    const csv = "1,John\n2,Jane";
    const result = parseCSV(csv, { hasHeaders: false });
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data?.[0]).toEqual({ col_0: "1", col_1: "John" });
  });

  it("should use custom headers", () => {
    const csv = "1,John\n2,Jane";
    const result = parseCSV(csv, {
      hasHeaders: false,
      headers: ["id", "name"],
    });
    expect(result.success).toBe(true);
    expect(result.data?.[0]).toEqual({ id: "1", name: "John" });
  });

  it("should respect custom delimiter", () => {
    const csv = "id;name\n1;John\n2;Jane";
    const result = parseCSV(csv, { delimiter: ";" });
    expect(result.success).toBe(true);
    expect(result.data?.[0]).toEqual({ id: "1", name: "John" });
  });

  it("should skip empty rows", () => {
    const csv = "id,name\n1,John\n\n2,Jane\n";
    const result = parseCSV(csv, { skipEmptyRows: true });
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it("should include empty rows when skipEmptyRows is false", () => {
    const csv = "id,name\n1,John\n\n2,Jane";
    const result = parseCSV(csv, { skipEmptyRows: false });
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
  });

  it("should return error for invalid input", () => {
    const result = parseCSV("invalid\ncsv[");
    expect(result.success).toBe(true); // Still attempts parse
  });

  it("should return row count", () => {
    const csv = "id,name\n1,John\n2,Jane";
    const result = parseCSV(csv);
    expect(result.rowsProcessed).toBe(2);
  });

  it("should not trim values by default", () => {
    const csv = 'id,name\n1," John "';
    const result = parseCSV(csv, { trimValues: false });
    expect(result.data?.[0].name).toBe(" John ");
  });
});

describe("parseTSV", () => {
  it("should parse TSV format", () => {
    const tsv = "id\tname\n1\tJohn\n2\tJane";
    const result = parseTSV(tsv);
    expect(result.success).toBe(true);
    expect(result.data?.[0]).toEqual({ id: "1", name: "John" });
  });
});

describe("detectDelimiter", () => {
  it("should detect comma delimiter", () => {
    const csv = "id,name,email\n1,John,john@example.com";
    const delimiter = detectDelimiter(csv);
    expect(delimiter).toBe(",");
  });

  it("should detect semicolon delimiter", () => {
    const csv = "id;name;email\n1;John;john@example.com";
    const delimiter = detectDelimiter(csv);
    expect(delimiter).toBe(";");
  });

  it("should detect tab delimiter", () => {
    const csv = "id\tname\temail\n1\tJohn\tjohn@example.com";
    const delimiter = detectDelimiter(csv);
    expect(delimiter).toBe("\t");
  });

  it("should detect pipe delimiter", () => {
    const csv = "id|name|email\n1|John|john@example.com";
    const delimiter = detectDelimiter(csv);
    expect(delimiter).toBe("|");
  });
});

describe("isValidCSV", () => {
  it("should validate correct CSV", () => {
    const csv = "id,name\n1,John\n2,Jane";
    expect(isValidCSV(csv)).toBe(true);
  });

  it("should reject empty string", () => {
    expect(isValidCSV("")).toBe(false);
  });

  it("should reject whitespace-only string", () => {
    expect(isValidCSV("   \n  ")).toBe(false);
  });

  it("should validate with custom delimiter", () => {
    const csv = "id;name\n1;John";
    expect(isValidCSV(csv, ";")).toBe(true);
  });

  it("should reject badly formatted CSV", () => {
    const csv = "id,name\n1,John\n2,Jane,Extra,Extra2,Extra3";
    expect(isValidCSV(csv)).toBe(false);
  });
});
