import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatLocaleDate, formatLocaleNumber } from "./format";

describe("formatLocaleDate", () => {
  it("formats using Filipino locale rules", () => {
    const value = formatLocaleDate("fil", "2026-01-05T00:00:00.000Z", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
    assert.equal(value, "01/05/2026");
  });

  it("formats using English locale rules", () => {
    const value = formatLocaleDate("en", "2026-01-05T00:00:00.000Z", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
    assert.equal(value, "01/05/2026");
  });
});

describe("formatLocaleNumber", () => {
  it("formats numbers in Filipino locale", () => {
    const value = formatLocaleNumber("fil", 1234567.89, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    assert.equal(value, "1,234,567.89");
  });

  it("formats numbers in English locale", () => {
    const value = formatLocaleNumber("en", 1234567.89, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    assert.equal(value, "1,234,567.89");
  });
});
