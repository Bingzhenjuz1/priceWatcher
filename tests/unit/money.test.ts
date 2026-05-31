import { describe, expect, it } from "vitest";
import { formatCny, parsePriceToCents } from "@/lib/money";

describe("money helpers", () => {
  it("parses plain yuan prices to cents", () => {
    expect(parsePriceToCents("1299")).toBe(129900);
    expect(parsePriceToCents("1299.50")).toBe(129950);
  });

  it("parses prices with currency symbols and separators", () => {
    expect(parsePriceToCents("¥5,499.00")).toBe(549900);
    expect(parsePriceToCents("￥89.9")).toBe(8990);
  });

  it("returns null for invalid prices", () => {
    expect(parsePriceToCents("到手价咨询客服")).toBeNull();
    expect(parsePriceToCents("")).toBeNull();
  });

  it("formats cents as CNY", () => {
    expect(formatCny(549900)).toBe("¥5,499.00");
  });
});
