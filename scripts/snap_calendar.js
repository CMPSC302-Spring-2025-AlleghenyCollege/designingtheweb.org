/* Days of the Week */
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* Months */
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

/* Special Event Days */
const specialEventDays = [
    { day: 15, type: "Activity" },
    { day: 24, type: "Sprint 2" }
];

/* Current Date Setup */
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();
const firstDay = new Date(year, month, 1);
const lastDay = new Date(year, month + 1, 0);

/* Render Month-Year */
document.querySelector("#month-year").innerText = `${months[month]} ${year}`;

/* Render Weekday Headers */
const weekdayRow = daysOfWeek.map(day => `<div class="weekday">${day}</div>`).join("");
document.querySelector("#date-grid").innerHTML = weekdayRow;

/* Generate Date Grid */
let dateCells = "";
for (let i = 0; i < firstDay.getDay(); i++) {
    dateCells += `<div class="empty"></div>`; // Empty slots
}

for (let i = 1; i <= lastDay.getDate(); i++) {
    const isToday = i === today.getDate();
    const specialEvent = specialEventDays.find(event => event.day === i);
    const classes = [
        "day",
        isToday ? "today" : "",
        specialEvent ? "special" : ""
    ].join(" ").trim();

    const eventTag = specialEvent ? `<span class="event-type">${specialEvent.type}</span>` : "";

    dateCells += `<div class="${classes}" data-date="${i}">
        <span class="date-number">${i}</span>
        ${eventTag}
    </div>`;
}

document.querySelector("#date-grid").innerHTML += dateCells;
