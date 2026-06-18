import { Temporal } from "@js-temporal/polyfill";
globalThis.Temporal = Temporal;
import fs from "node:fs";
import { getFloatingDay } from "./common.mjs";
// 3. Parse JSON using stable methods to prevent terminal warnings
const daysData = JSON.parse(fs.readFileSync("./days.json", "utf-8"));

/**
 * Helper function to pad numbers to 2 digits (e.g., 5 -> "05")
 */
function pad(num) {
  return String(num).padStart(2, "0");
}

/**
 * Generates an RFC 5545 compliant iCalendar string for whole-day events
 */
function generateICal() {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CodeYourFuture//Commemorative Calendar Project//EN",
    "CALSCALE:GREGORIAN",
  ];

  const START_YEAR = 2020;
  const END_YEAR = 2030;

  const monthMap = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  // Iterate through every year in the required range
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    // Iterate through each commemorative day type in days.json
    for (const event of daysData) {
      const monthNum = monthMap[event.monthName.trim()];

      // Re-using the exact shared logic from common.mjs
      const dayNum = getFloatingDay(year, event.monthName, event.dayName, event.occurrence);

      // Constructing ISO strings for consecutive days to frame an all-day event duration
      // Whole-day events: DTSTART is inclusive, DTEND is exclusive (the next day)
      const dateStr = `${year}${pad(monthNum)}${pad(dayNum)}`;

      // Safely calculate the day following the event using Node's standard Date capabilities
      const eventDate = new Date(year, monthNum - 1, dayNum);
      const nextDayDate = new Date(eventDate);
      nextDayDate.setDate(eventDate.getDate() + 1);

      const nextDayStr = `${nextDayDate.getFullYear()}${pad(nextDayDate.getMonth() + 1)}${pad(nextDayDate.getDate())}`;

      // Unique ID per event slot to satisfy Google Calendar uniqueness demands
      const uid = `${event.name.replace(/\s+/g, "-").toLowerCase()}-${year}@cyf-calendar`;

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      // DTSTAMP is required by standard protocol to show when the entry was compiled
      lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`);
      // VALUE=DATE specifies this as a full-day block, omitting hours/minutes entirely
      lines.push(`DTSTART;VALUE=DATE:${dateStr}`);
      lines.push(`DTEND;VALUE=DATE:${nextDayStr}`);
      lines.push(`SUMMARY:${event.name}`);
      lines.push("END:VEVENT");
    }
  }

  lines.push("END:VCALENDAR");

  // Join with CRLF line breaks to safely conform to iCal specifications
  return lines.join("\r\n");
}

// Generate the string data
const icsContent = generateICal();

// Write the file to disk
fs.writeFileSync("days.ics", icsContent, "utf-8");
console.log("Successfully generated 'days.ics' containing events from 2020 to 2030!");
