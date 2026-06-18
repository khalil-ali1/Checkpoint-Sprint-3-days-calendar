import { getFloatingDay } from "./common.mjs";
import assert from "node:assert";
import test from "node:test";

import { Temporal } from "@js-temporal/polyfill";
globalThis.Temporal = Temporal;

test("the 'last' Thursday in Leap Year is different from 'last' Thursday in the next Year", () => {
  // In February 2024 (Leap Year - 29 days), the last Thursday is Feb 29.
  const leapYearDay = getFloatingDay(2024, "February", "Thursday", "last");
  assert.equal(leapYearDay, 29, "Should accurately identify Feb 29 as the last Thursday of a leap year");

  // In February 2025 (Standard Year - 28 days), the last Thursday is Feb 27.
  const standardYearDay = getFloatingDay(2025, "February", "Thursday", "last");
  assert.equal(standardYearDay, 27, "Should accurately identify Feb 27 as the last Thursday of a standard year");

  
test("getFloatingDay finds a numbered occurrence (Ada Lovelace Day, 2024)", () => {
  const day = getFloatingDay(2024, "October", "Tuesday", "second");
  assert.equal(day, 8);
});

test("getFloatingDay finds the last occurrence (World Lemur Day, 2024)", () => {
  const day = getFloatingDay(2024, "October", "Friday", "last");
  assert.equal(day, 25);
});