// This is a placeholder file which shows how you can access functions and data defined in other files.
// It can be loaded into index.html.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.

import { getGreeting } from "./common.mjs";
import daysData from "./days.json" with { type: "json" };

// window.onload = function() {
//     document.querySelector("body").innerText = `${getGreeting()} - there are ${daysData.length} known days`;
// }
// Map for converting text occurrences to indices
const OCCURRENCE_MAP = { first: 1, second: 2, third: 3, fourth: 4 };

/**
 * Calculates the day of the month for a specific dynamic event rule using Temporal.
 * @param {number} year - e.g., 2024
 * @param {string} monthName - e.g., "October"
 * @param {string} dayName - e.g., "Tuesday"
 * @param {string} occurrence - "first", "second", "third", "fourth", or "last"
 * @returns {number} The day of the month (1-31)
 */
function getFloatingDay(year, monthName, dayName, occurrence) {
    const monthMap = {
        January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
        July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
    };
    const dayMap = {
        Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7
    };

    const month = monthMap[monthName];
    const targetDayOfWeek = dayMap[dayName];

    if (occurrence === "last") {
        // Start at the last day of the month
        let date = Temporal.PlainDate.from({ year, month, day: 1 });
        date = date.with({ day: date.daysInMonth }); // Safely get last day (e.g., 31, 30, or 28/29)

        // Step backwards until we hit the correct weekday
        while (date.dayOfWeek !== targetDayOfWeek) {
            date = date.subtract({ days: 1 });
        }
        return date.day;
    } else {
        // Start exactly at the 1st day of the month
        let date = Temporal.PlainDate.from({ year, month, day: 1 });

        // Find the VERY FIRST occurrence of that weekday in the month
        // If the 1st IS already that day, this loop correctly runs 0 times.
        while (date.dayOfWeek !== targetDayOfWeek) {
            date = date.add({ days: 1 });
        }

        const occurrenceMap = { first: 1, second: 2, third: 3, fourth: 4 };
        const targetOccurrence = occurrenceMap[occurrence];

        // Add the remaining weeks (e.g., for "second", add exactly 1 week to the first occurrence)
        date = date.add({ weeks: targetOccurrence - 1 });
        return date.day;
    }
}