const { Temporal } = window;

// 1. Initialize automatically to the current real-world Month and Year
let currentYear = Temporal.Now.plainDateISO().year;
let currentMonth = Temporal.Now.plainDateISO().month;
let dynamicEvents = [];

const MONTHS_MAP = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

document.addEventListener("DOMContentLoaded", async () => {
    await fetchEvents();
    setupDropdowns();
    updateCalendar();

    document.getElementById("prevBtn").addEventListener("click", () => navigateMonth(-1));
    document.getElementById("nextBtn").addEventListener("click", () => navigateMonth(1));
    document.getElementById("monthJump").addEventListener("change", handleJump);
    document.getElementById("yearJump").addEventListener("change", handleJump);
});

async function fetchEvents() {
    try {
        const response = await fetch('days.json');
        dynamicEvents = await response.json();
    } catch (e) {
        console.error("Could not load days.json", e);
    }
}

function setupDropdowns() {
    const monthSelect = document.getElementById("monthJump");
    for (let m = 1; m <= 12; m++) {
        monthSelect.add(new Option(MONTHS_MAP[m], m));
    }
    syncYearDropdownBounds(currentYear);
}

/**
 * Ensures previous/next buttons never crash at selector endpoints
 * by automatically adding missing options on the fly.
 */
function syncYearDropdownBounds(targetYear) {
    const yearSelect = document.getElementById("yearJump");
    let options = Array.from(yearSelect.options).map(o => parseInt(o.value, 10));

    if (!options.includes(targetYear)) {
        const start = Math.min(targetYear, 1900);
        const end = Math.max(targetYear, 2100);
        yearSelect.innerHTML = "";
        for (let y = start; y <= end; y++) {
            yearSelect.add(new Option(y, y));
        }
    }
}

function navigateMonth(direction) {
    let date = Temporal.PlainDate.from({ year: currentYear, month: currentMonth, day: 1 });
    date = direction === 1 ? date.add({ months: 1 }) : date.subtract({ months: 1 });

    currentYear = date.year;
    currentMonth = date.month;

    syncYearDropdownBounds(currentYear);
    updateCalendar();
}

function handleJump() {
    currentMonth = parseInt(document.getElementById("monthJump").value, 10);
    currentYear = parseInt(document.getElementById("yearJump").value, 10);
    updateCalendar();
}

/**
 * Calculates rule occurrences using Temporal PlainDate math
 */
function getFloatingDay(year, monthIndex, dayName, occurrence) {
    const dayMap = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 };
    const targetDayOfWeek = dayMap[dayName];

    if (occurrence === "last") {
        let date = Temporal.PlainDate.from({ year, month: monthIndex, day: 1 });
        date = date.with({ day: date.daysInMonth });
        while (date.dayOfWeek !== targetDayOfWeek) {
            date = date.subtract({ days: 1 });
        }
        return date.day;
    } else {
        let date = Temporal.PlainDate.from({ year, month: monthIndex, day: 1 });
        while (date.dayOfWeek !== targetDayOfWeek) {
            date = date.add({ days: 1 });
        }
        const occurrenceMap = { first: 1, second: 2, third: 3, fourth: 4 };
        date = date.add({ weeks: occurrenceMap[occurrence] - 1 });
        return date.day;
    }
}

function updateCalendar() {
    document.getElementById("monthJump").value = currentMonth;
    document.getElementById("yearJump").value = currentYear;

    const currentMonthName = MONTHS_MAP[currentMonth];
    document.getElementById("currentMonthYear").textContent = `${currentMonthName} ${currentYear}`;

    const container = document.getElementById("calendarContainer");
    container.innerHTML = "";

    // 1. Grid Weekday Headers
    const daysOfWeekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    daysOfWeekNames.forEach(day => {
        const header = document.createElement("div");
        header.className = "day-header";
        header.setAttribute("role", "columnheader");
        header.textContent = day;
        container.appendChild(header);
    });

    // 2. Pre-Map calculated events for this exact view
    const dayEventsMap = {};
    dynamicEvents.forEach(event => {
        if (event.monthName.trim().toLowerCase() === currentMonthName.toLowerCase()) {
            const targetDay = getFloatingDay(currentYear, currentMonth, event.dayName.trim(), event.occurrence.trim());
            if (!dayEventsMap[targetDay]) dayEventsMap[targetDay] = [];
            dayEventsMap[targetDay].push(event);
        }
    });

    // 3. Spacing Boxes Calculation (Transforms Temporal Sunday=7 to Grid Column 0)
    const firstOfMonth = Temporal.PlainDate.from({ year: currentYear, month: currentMonth, day: 1 });
    const startOffset = firstOfMonth.dayOfWeek === 7 ? 0 : firstOfMonth.dayOfWeek;

    for (let i = 0; i < startOffset; i++) {
        const emptyBox = document.createElement("div");
        emptyBox.className = "day-box empty-box";
        container.appendChild(emptyBox);
    }

    // 4. Generate Days and Append matching items dynamically
    const daysInMonth = firstOfMonth.daysInMonth;
    for (let day = 1; day <= daysInMonth; day++) {
        const dayBox = document.createElement("div");
        dayBox.className = "day-box";
        dayBox.setAttribute("role", "gridcell");

        const dayLabel = document.createElement("div");
        dayLabel.className = "day-label";
        dayLabel.textContent = day;
        dayBox.appendChild(dayLabel);

        if (dayEventsMap[day]) {
            dayEventsMap[day].forEach(event => {
                const evDiv = document.createElement("div");
                evDiv.className = "event-tag";

                const link = document.createElement("a");
                link.href = event.descriptionURL;
                link.textContent = event.name;

                evDiv.appendChild(link);
                dayBox.appendChild(evDiv);
            });
        }
        container.appendChild(dayBox);
    }
}