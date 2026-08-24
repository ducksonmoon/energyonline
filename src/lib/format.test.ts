import { describe, it, expect } from "vitest";
import { toFa, formatToman } from "./format";

describe("toFa", () => {
  it("converts each ASCII digit to its Persian equivalent", () => {
    expect(toFa(0)).toBe("۰");
    expect(toFa("1234567890")).toBe("۱۲۳۴۵۶۷۸۹۰");
  });
  it("leaves non-digit characters untouched", () => {
    expect(toFa("M-42")).toBe("M-۴۲");
  });
});

describe("formatToman", () => {
  it("adds thousands separators and the toman suffix, in Persian digits", () => {
    expect(formatToman(1250000)).toBe("۱,۲۵۰,۰۰۰ تومان");
  });
  it("formats small numbers without separators", () => {
    expect(formatToman(500)).toBe("۵۰۰ تومان");
  });
});
