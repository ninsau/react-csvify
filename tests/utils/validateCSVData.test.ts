import { describe, it, expect } from "vitest";
import {
  validateCsvData,
  hasConsistentSchema,
  getDataSchema,
  detectDataIssues,
} from "../../src/utils/validateCSVData";

describe("validateCsvData", () => {
  it("should validate a valid data array", () => {
    const data = [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
    ];
    const result = validateCsvData(data);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject non-array input", () => {
    const result = validateCsvData("not an array");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Data must be an array");
  });

  it("should warn on empty array", () => {
    const result = validateCsvData([]);
    expect(result.warnings).toContain("Data array is empty");
  });

  it("should error on empty array when allowEmpty is false", () => {
    const result = validateCsvData([], { allowEmpty: false });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Data array cannot be empty");
  });

  it("should warn on exceeding maxRows", () => {
    const data = Array.from({ length: 150 }, (_, i) => ({ id: i }));
    const result = validateCsvData(data, { maxRows: 100 });
    expect(result.warnings.some((w) => w.includes("exceeds recommended max")));
  });

  it("should reject non-object rows", () => {
    const data = [1, 2, 3] as unknown as object[];
    const result = validateCsvData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("not an object")));
  });

  it("should reject array rows", () => {
    const data = [[1, 2], [3, 4]] as unknown as object[];
    const result = validateCsvData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("cannot be an array")));
  });

  it("should warn on exceeding maxFieldSize", () => {
    const longString = "a".repeat(1000);
    const data = [{ id: 1, text: longString }];
    const result = validateCsvData(data, { maxFieldSize: 500 });
    expect(result.warnings.some((w) => w.includes("exceeds max field size")));
  });
});

describe("hasConsistentSchema", () => {
  it("should return true for consistent schema", () => {
    const data = [
      { id: 1, name: "John", email: "john@example.com" },
      { id: 2, name: "Jane", email: "jane@example.com" },
    ];
    expect(hasConsistentSchema(data)).toBe(true);
  });

  it("should return false for inconsistent schema", () => {
    const data = [
      { id: 1, name: "John" },
      { id: 2, name: "Jane", email: "jane@example.com" },
    ];
    expect(hasConsistentSchema(data)).toBe(false);
  });

  it("should return true for empty array", () => {
    expect(hasConsistentSchema([])).toBe(true);
  });

  it("should return true for single row", () => {
    const data = [{ id: 1, name: "John" }];
    expect(hasConsistentSchema(data)).toBe(true);
  });
});

describe("getDataSchema", () => {
  it("should return schema information", () => {
    const data = [
      { id: 1, name: "John", active: true },
      { id: 2, name: "Jane", active: false },
    ];
    const schema = getDataSchema(data);
    expect(schema.fields).toEqual(["id", "name", "active"]);
    expect(schema.types.id).toBe("number");
    expect(schema.types.name).toBe("string");
    expect(schema.types.active).toBe("boolean");
  });

  it("should return empty schema for empty data", () => {
    const schema = getDataSchema([]);
    expect(schema.fields).toEqual([]);
    expect(schema.types).toEqual({});
    expect(schema.sample).toEqual({});
  });

  it("should detect null field types", () => {
    const data = [{ id: 1, value: null }];
    const schema = getDataSchema(data);
    expect(schema.types.value).toBe("null");
  });
});

describe("detectDataIssues", () => {
  it("should return empty array for valid data", () => {
    const data = [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
    ];
    expect(detectDataIssues(data)).toHaveLength(0);
  });

  it("should detect empty dataset", () => {
    const issues = detectDataIssues([]);
    expect(issues).toContain("Empty dataset");
  });

  it("should detect inconsistent schema", () => {
    const data = [
      { id: 1, name: "John" },
      { id: 2, name: "Jane", email: "jane@example.com" },
    ];
    const issues = detectDataIssues(data);
    expect(issues.some((i) => i.includes("Inconsistent schema")));
  });

  it("should detect nested objects", () => {
    const data = [
      { id: 1, details: { name: "John" } },
      { id: 2, details: {} },
    ];
    const issues = detectDataIssues(data);
    expect(issues.some((i) => i.includes("nested object")));
  });

  it("should detect circular references", () => {
    const data = [{ id: 1 }] as unknown as Record<string, unknown>[];
    const objData = data[0] as unknown as Record<string, unknown>;
    objData.self = data[0];
    const issues = detectDataIssues(data);
    expect(issues.some((i) => i.includes("circular")));
  });
});
