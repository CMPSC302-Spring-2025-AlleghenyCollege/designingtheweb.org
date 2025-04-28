document.addEventListener('DOMContentLoaded', function () {
    // Main calendar elements
    const monthYearElement = document.getElementById('month-year');
    const dateGridElement = document.getElementById('date-grid');
    const calendarElement = document.getElementById('snap_calendar');
    
    // Navigation buttons
    const prevButton = document.createElement('button');
    prevButton.id = 'prev-button';
    prevButton.innerHTML = '&laquo; Previous';
    prevButton.className = 'calendar-nav-button';
    
    const nextButton = document.createElement('button');
    nextButton.id = 'next-button';
    nextButton.innerHTML = 'Next &raquo;';
    nextButton.className = 'calendar-nav-button';
    
    const viewToggleButton = document.createElement('button');
    viewToggleButton.id = 'view-toggle';
    viewToggleButton.innerText = 'Month View';
    viewToggleButton.className = 'calendar-nav-button view-toggle';
    
    // Create navigation container
    const navContainer = document.createElement('div');
    navContainer.className = 'calendar-nav';
    navContainer.appendChild(prevButton);
    navContainer.appendChild(viewToggleButton);
    navContainer.appendChild(nextButton);
    
    // Add navigation after month/year heading
    if (monthYearElement) {
        monthYearElement.innerText = 'Loading calendar...';
        monthYearElement.insertAdjacentElement('afterend', navContainer);
    }

    // State variables
    let currentDate = new Date();
    let isWeekView = true; // Default to week view, but allow toggle
    let eventsData = [];
    const CSV_FILENAME = "SemesterYear_Class_Schedule.csv";
    
    // Initialize with minimum UI for faster loading perception
    renderEmptyCalendar();

    // Load calendar data from CSV
    async function loadCalendarData() {
        try {
            // Add a timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timed out')), 5000);
            });
            
            const fetchPromise = fetch(CSV_FILENAME);
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            if (!response.ok) throw new Error('Schedule file not found');
            const csvText = await response.text();
            
            // Parse the data and check if we actually got valid entries
            const parsedData = parseCSV(csvText);
            if (parsedData.length === 0) {
                throw new Error('No events found in schedule file');
            }
            
            eventsData = parsedData;
            
            // Set the current date to match first event if all events are in the future
            if (eventsData.length > 0) {
                const firstEventDate = new Date(eventsData[0].date);
                if (!isNaN(firstEventDate.getTime())) {
                    currentDate = new Date(firstEventDate);
                }
            }
            
            renderCalendar();
        } catch (error) {
            console.error('Error loading schedule:', error);
            if (dateGridElement) {
                dateGridElement.innerHTML = `<div class="loading-error">Error: ${error.message}. Please check that ${CSV_FILENAME} exists and is properly formatted.</div>`;
                if (monthYearElement) {
                    monthYearElement.innerText = 'Calendar';
                }
            }
        }
    }

    // Render an empty calendar structure while data is loading
    function renderEmptyCalendar() {
        if (!dateGridElement) return;
        
        if (isWeekView) {
            dateGridElement.innerHTML = '';
            // Create empty week structure
            for (let i = 0; i < 7; i++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'day week-day loading';
                
                const loadingIndicator = document.createElement('div');
                loadingIndicator.className = 'loading-indicator';
                loadingIndicator.innerHTML = '<div class="loading-spinner"></div>';
                
                dayElement.appendChild(loadingIndicator);
                dateGridElement.appendChild(dayElement);
            }
        }
    }

    // Parse CSV data
    function parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
            throw new Error('CSV file does not contain data rows');
        }
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const dateIndex = headers.indexOf('date');
        const titleIndex = headers.indexOf('title');
        const colorIndex = headers.indexOf('color');

        if (dateIndex === -1 || titleIndex === -1) {
            throw new Error('CSV must contain "date" and "title" columns');
        }

        return lines.slice(1).map(line => {
            const values = line.split(',');
            // Skip incomplete entries
            if (values.length < 2 || !values[dateIndex] || !values[titleIndex]) {
                return null;
            }
            
            const event = {
                date: values[dateIndex].trim(),
                title: values[titleIndex].trim()
            };

            if (colorIndex !== -1 && values[colorIndex]) {
                event.color = values[colorIndex].trim();
            }

            return event;
        }).filter(event => event !== null); // Remove any null entries
    }

    // Render calendar based on current view mode
    function renderCalendar() {
        if (!dateGridElement || !monthYearElement) return;
        
        dateGridElement.innerHTML = '';
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        
        // Update calendar title and view
        if (isWeekView) {
            // For week view, calculate the start and end dates of the week
            const weekStart = getStartOfWeek(currentDate);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            // Format as "Month DD - Month DD, YYYY" or "Month DD - DD, YYYY" if same month
            if (weekStart.getMonth() === weekEnd.getMonth()) {
                monthYearElement.textContent = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
            } else {
                monthYearElement.textContent = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${monthNames[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
            }
            
            // Toggle button text
            viewToggleButton.innerText = 'Month View';
            prevButton.innerHTML = '&laquo; Previous Week';
            nextButton.innerHTML = 'Next Week &raquo;';
            
            // Apply week view styles
            if (calendarElement) {
                calendarElement.classList.add('week-view');
                calendarElement.classList.remove('month-view');
            }
            
            renderWeekView(weekStart);
        } else {
            // Standard month view
            monthYearElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
            viewToggleButton.innerText = 'Week View';
            prevButton.innerHTML = '&laquo; Previous Month';
            nextButton.innerHTML = 'Next Month &raquo;';
            
            // Apply month view styles
            if (calendarElement) {
                calendarElement.classList.remove('week-view');
                calendarElement.classList.add('month-view');
            }
            
            renderMonthView();
        }
    }

    // Get the first day of the week containing the given date
    function getStartOfWeek(date) {
        const result = new Date(date);
        const day = result.getDay();
        result.setDate(result.getDate() - day); // Go back to Sunday
        return result;
    }

    // Render week view (7 days starting from weekStart)
    function renderWeekView(weekStart) {
        // Create a copy of the week start date to manipulate
        const currentDay = new Date(weekStart);
        
        // Loop through 7 days of the week
        for (let i = 0; i < 7; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day week-day';
            
            // Add day number and name
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            
            const dayNameEl = document.createElement('div');
            dayNameEl.className = 'day-name';
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            dayNameEl.textContent = dayNames[i];
            
            const dayNumberEl = document.createElement('div');
            dayNumberEl.className = 'day-number';
            dayNumberEl.textContent = currentDay.getDate();
            
            dayHeader.appendChild(dayNameEl);
            dayHeader.appendChild(dayNumberEl);
            dayElement.appendChild(dayHeader);
            
            // Format date string for event comparison
            const currentDateStr = `${currentDay.getFullYear()}-${(currentDay.getMonth() + 1).toString().padStart(2, '0')}-${currentDay.getDate().toString().padStart(2, '0')}`;
            
            // Add events for this day
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
            } else {
                // Add a "No events" message to empty days
                const noEventsContainer = document.createElement('div');
                noEventsContainer.className = 'no-events';
                noEventsContainer.textContent = 'No events';
                dayElement.appendChild(noEventsContainer);
            }
            
            // Highlight today
            const today = new Date();
            if (currentDay.getDate() === today.getDate() &&
                currentDay.getMonth() === today.getMonth() &&
                currentDay.getFullYear() === today.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            dateGridElement.appendChild(dayElement);
            
            // Move to next day
            currentDay.setDate(currentDay.getDate() + 1);
        }
    }

    // Render standard month view
    function renderMonthView() {
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        // Fill empty cells for days before the 1st of month
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            dateGridElement.appendChild(emptyDay);
        }
        
        // Create actual date cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);
            
            // Format date for event comparison
            const currentDateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            
            // Add events for this day
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
            
            // Highlight today
            const today = new Date();
            if (day === today.getDate() &&
                currentDate.getMonth() === today.getMonth() &&
                currentDate.getFullYear() === today.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            dateGridElement.appendChild(dayElement);
        }
        
        // Fill empty cells after the last day of month to complete the grid
        const totalCells = startingDay + daysInMonth;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        
        for (let i = 0; i < remainingCells; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            dateGridElement.appendChild(emptyDay);
        }
    }

    // Navigation and view toggle event handlers
    if (prevButton) {
        prevButton.addEventListener('click', function () {
            if (isWeekView) {
                // Move back one week in week view
                currentDate.setDate(currentDate.getDate() - 7);
            } else {
                // Move back one month in month view
                currentDate.setMonth(currentDate.getMonth() - 1);
            }
            renderCalendar();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            if (isWeekView) {
                // Move forward one week in week view
                currentDate.setDate(currentDate.getDate() + 7);
            } else {
                // Move forward one month in month view
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            renderCalendar();
        });
    }

    if (viewToggleButton) {
        viewToggleButton.addEventListener('click', function() {
            isWeekView = !isWeekView;
            renderCalendar();
        });
    }

    // Initialize the calendar
    loadCalendarData();
});