import { describe, it, expect } from "vitest";
import {
  formatCsvValue,
  formatCsvRow,
  shouldQuoteValue,
  formatCsvValueSmart,
} from "../../src/utils/formatCsvValue";

describe("formatCsvValue", () => {
  it("should format a simple value with quotes", () => {
    const result = formatCsvValue("hello", true);
    expect(result.original).toBe("hello");
    expect(result.formatted).toBe('"hello"');
    expect(result.escaped).toBe("hello");
  });

  it("should format a value without quotes when quote is false", () => {
    const result = formatCsvValue("hello", false);
    expect(result.formatted).toBe("hello");
  });

  it("should escape double quotes", () => {
    const result = formatCsvValue('say "hello"', true);
    expect(result.formatted).toBe('"say ""hello"""');
  });

  it("should handle null values", () => {
    const result = formatCsvValue(null, true);
    expect(result.formatted).toBe('""');
  });

  it("should handle undefined values", () => {
    const result = formatCsvValue(undefined, true);
    expect(result.formatted).toBe('""');
  });

  it("should handle numbers", () => {
    const result = formatCsvValue(42, true);
    expect(result.original).toBe(42);
    expect(result.formatted).toBe('"42"');
  });

  it("should handle boolean values", () => {
    const result = formatCsvValue(true, true);
    expect(result.formatted).toBe('"true"');
  });
});

describe("formatCsvRow", () => {
  it("should format multiple values into a CSV row", () => {
    const result = formatCsvRow(["hello", "world", "test"], ",", true);
    expect(result).toBe('"hello","world","test"');
  });

  it("should use custom delimiter", () => {
    const result = formatCsvRow(["hello", "world"], ";", true);
    expect(result).toBe('"hello";"world"');
  });

  it("should handle unquoted values", () => {
    const result = formatCsvRow(["hello", "world"], ",", false);
    expect(result).toBe("hello,world");
  });

  it("should handle empty arrays", () => {
    const result = formatCsvRow([], ",", true);
    expect(result).toBe("");
  });
});

describe("shouldQuoteValue", () => {
  it("should return true for values containing delimiter", () => {
    expect(shouldQuoteValue("hello,world", ",")).toBe(true);
  });

  it("should return true for values containing quotes", () => {
    expect(shouldQuoteValue('say "hello"', ",")).toBe(true);
  });

  it("should return true for values containing newlines", () => {
    expect(shouldQuoteValue("hello\nworld", ",")).toBe(true);
  });

  it("should return true for values containing carriage returns", () => {
    expect(shouldQuoteValue("hello\rworld", ",")).toBe(true);
  });

  it("should return false for safe values", () => {
    expect(shouldQuoteValue("hello", ",")).toBe(false);
  });

  it("should respect different delimiters", () => {
    expect(shouldQuoteValue("hello;world", ";")).toBe(true);
    expect(shouldQuoteValue("hello;world", ",")).toBe(false);
  });
});

describe("formatCsvValueSmart", () => {
  it("should quote values that need quoting", () => {
    const result = formatCsvValueSmart("hello,world", ",");
    expect(result.formatted).toBe('"hello,world"');
  });

  it("should not quote safe values", () => {
    const result = formatCsvValueSmart("hello", ",");
    expect(result.formatted).toBe("hello");
  });

  it("should respect custom delimiter", () => {
    const result = formatCsvValueSmart("hello;world", ";");
    expect(result.formatted).toBe('"hello;world"');
  });
});
