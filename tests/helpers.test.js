import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError } from "../lib/errors.js";
import { safeNextPath } from "../lib/paths.js";
import {
  optionalInteger,
  requiredEmail,
  requiredPassword,
  requiredString,
  toMysqlDateTime,
} from "../lib/validation.js";
import { formatEventDate, initials, pluralize, truncate } from "../lib/format.js";

describe("safeNextPath", () => {
  it("allows internal paths", () => {
    assert.equal(safeNextPath("/clubs/3"), "/clubs/3");
  });

  it("rejects protocol-relative and backslash paths", () => {
    assert.equal(safeNextPath("//evil.example"), "/dashboard");
    assert.equal(safeNextPath("/\\evil"), "/dashboard");
    assert.equal(safeNextPath("https://evil.example"), "/dashboard");
  });
});

describe("validation", () => {
  it("normalizes email", () => {
    assert.equal(requiredEmail(" Student@Example.COM "), "student@example.com");
  });

  it("rejects invalid email", () => {
    assert.throws(() => requiredEmail("not-an-email"), ApiError);
  });

  it("requires an 8 character password", () => {
    assert.throws(() => requiredPassword("short"), ApiError);
    assert.equal(requiredPassword("long-enough"), "long-enough");
  });

  it("trims strings and enforces maximum length", () => {
    assert.equal(requiredString("  IEEE  ", "Name", { max: 10 }), "IEEE");
    assert.throws(() => requiredString("abcdefghijk", "Name", { max: 10 }), ApiError);
  });

  it("parses optional integers", () => {
    assert.equal(optionalInteger("", "Year"), null);
    assert.equal(optionalInteger("3", "Year", { min: 1, max: 5 }), 3);
    assert.throws(() => optionalInteger("9", "Year", { min: 1, max: 5 }), ApiError);
  });

  it("formats MySQL datetimes without timezone conversion", () => {
    assert.equal(toMysqlDateTime(new Date(2026, 10, 6, 9, 5, 0)), "2026-11-06 09:05:00");
  });
});

describe("format", () => {
  it("builds initials", () => {
    assert.equal(initials("Priya Sharma"), "PS");
    assert.equal(initials("Aarav"), "A");
  });

  it("truncates long copy", () => {
    assert.equal(truncate("hello world", 5), "hello…");
  });

  it("pluralizes counts", () => {
    assert.equal(pluralize(1, "member"), "1 member");
    assert.equal(pluralize(2, "member"), "2 members");
  });

  it("formats event date cards", () => {
    const date = formatEventDate("2026-11-06 09:00:00");
    assert.equal(date.day, "06");
    assert.equal(date.month, "NOV");
  });
});
