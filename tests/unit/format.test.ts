import { describe, expect, it } from "vitest";
import { formatDate, formatDayLabel } from "../../src/lib/format";

describe("date formatters", () => {
  it.each([
    ["2026-11-05", "quinta-feira, 5 de novembro"],
    ["2026-03-08", "domingo, 8 de março"],
    ["2026-11-01", "domingo, 1 de novembro"],
  ])("formats the calendar day %s without timezone drift", (date, label) => {
    expect(formatDayLabel(date)).toBe(label);
  });

  it("returns a safe fallback for malformed calendar dates", () => {
    expect(formatDayLabel("2026-02-30")).toBe("Data indisponível");
    expect(formatDate("not-a-date")).toBe("Data indisponível");
  });
});