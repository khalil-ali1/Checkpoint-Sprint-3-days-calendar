import { getFloatingDay } from "./common.mjs";
import { Temporal } from "@js-temporal/polyfill";
import assert from "node:assert";
import test from "node:test";

// Inject Temporal globally since common.mjs relies on it being in scope under Node
globalThis.Temporal = Temporal;


test("the 'last' Thursday in Leap Year is different from 'last' Thursday in the next Year", () => {
  // In February 2024 (Leap Year - 29 days), the last Thursday is Feb 29.
  const leapYearDay = getFloatingDay(2024, "February", "Thursday", "last");
  assert.equal(leapYearDay, 29, "Should accurately identify Feb 29 as the last Thursday of a leap year");

  // In February 2025 (Standard Year - 28 days), the last Thursday is Feb 27.
  const standardYearDay = getFloatingDay(2025, "February", "Thursday", "last");
  assert.equal(standardYearDay, 27, "Should accurately identify Feb 27 as the last Thursday of a standard year");
});