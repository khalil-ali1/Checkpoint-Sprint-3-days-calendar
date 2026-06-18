import { getFloatingDay } from "./common.mjs";
import assert from "node:assert";
import test from "node:test";

import { Temporal } from "@js-temporal/polyfill";
globalThis.Temporal = Temporal;

test("getFloatingDay finds a numbered occurrence (Ada Lovelace Day, 2024)", () => {
  const day = getFloatingDay(2024, "October", "Tuesday", "second");
  assert.equal(day, 8);
});

test("getFloatingDay finds the last occurrence (World Lemur Day, 2024)", () => {
  const day = getFloatingDay(2024, "October", "Friday", "last");
  assert.equal(day, 25);
});