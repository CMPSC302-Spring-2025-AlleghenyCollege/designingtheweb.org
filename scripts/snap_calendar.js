document.addEventListener('DOMContentLoaded', function () {
    const monthYearElement = document.getElementById('month-year');
    const dateGridElement = document.getElementById('date-grid');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');

    let currentDate = new Date();
    let eventsData = [];
    const CSV_FILENAME = "SemesterYear_Class_Schedule.csv";

    async function loadCalendarData() {
        try {
            const response = await fetch(CSV_FILENAME);
            if (!response.ok) throw new Error('Schedule file not found');
            const csvText = await response.text();
            eventsData = parseCSV(csvText);
            renderCalendar();
        } catch (error) {
            console.error('Error loading schedule:', error);
            dateGridElement.innerHTML = `<div class="loading-message">Error loading schedule data. Please ensure ${CSV_FILENAME} exists.</div>`;
        }
    }

    function parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const dateIndex = headers.indexOf('date');
        const titleIndex = headers.indexOf('title');
        const colorIndex = headers.indexOf('color');

        if (dateIndex === -1 || titleIndex === -1) {
            throw new Error('CSV must contain "date" and "title" columns');
        }

        return lines.slice(1).map(line => {
            const values = line.split(',');
            const event = {
                date: values[dateIndex].trim(),
                title: values[titleIndex].trim()
            };

            if (colorIndex !== -1 && values[colorIndex]) {
                event.color = values[colorIndex].trim();
            }

            return event;
        });
    }

    function renderCalendar() {
        dateGridElement.innerHTML = '';


        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        monthYearElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;


        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();


        for (let i = 0; i < startingDay; i++) {
            dateGridElement.appendChild(document.createElement('div')).className = 'day';
        }


        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';


            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);


            const currentDateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;


            const dayEvents = eventsData.filter(event => event.date === currentDateStr);


            if (dayEvents.length > 0) {
                const eventsContainer = document.createElement('div');
                eventsContainer.className = 'events-container';

                dayEvents.forEach(event => {
                    const eventElement = document.createElement('div');
                    eventElement.className = 'event';
                    eventElement.textContent = event.title;
                    if (event.color) {
                        eventElement.style.backgroundColor = event.color;
                    }
                    eventsContainer.appendChild(eventElement);
                });

                dayElement.appendChild(eventsContainer);
            }


            const today = new Date();
            if (day === today.getDate() &&
                currentDate.getMonth() === today.getMonth() &&
                currentDate.getFullYear() === today.getFullYear()) {
                dayElement.classList.add('today');
            }

            dateGridElement.appendChild(dayElement);
        }
    }


    prevMonthButton.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthButton.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });


    loadCalendarData();
});