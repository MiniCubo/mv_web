// Available image options
const imageOptions = [
    { value: '', label: 'Select Image', src: '' },
    { value: 'grenn.png', label: 'Green Block', src: 'img/green.png' },
    { value: 'i.png', label: 'Green I Block', src: 'img/i.png' },
    { value: 'greenbaby.png', label: 'Green Baby Block', src: 'img/greenbaby.png' },
    { value: 'white.png', label: 'White Baby Block', src: 'img/white.png' },
    { value: 'yellow.png', label: 'Yellow Baby Block', src: 'img/yellow.png' },
    { value: "baby1.png", label: "Baby 1 Block", src: "img/baby1.png"},
    { value: "baby2.png", label: "Baby 2 Block", src: "img/baby2.png"},
    { value: "baby3.png", label: "Baby 3 Block", src: "img/baby3.png"},
    { value: "babyP.png", label: "Baby P Block", src: "img/babyP.png"}
];

// Mobile detection
const isMobile = window.innerWidth <= 767;
const isTouch = 'ontouchstart' in window;

// Track current schedule state
let currentSchedule = {
    startDate: null,
    totalDays: 0,
    dayBoxes: []
};

// DOM elements
const domElements = {
    startDate: document.getElementById('startDate'),
    numDays: document.getElementById('numDays'),
    scheduler: document.getElementById('scheduler'),
    addDaysSection: document.getElementById('addDaysSection'),
    additionalDays: document.getElementById('additionalDays'),
    removeDays: document.getElementById('removeDays'),
    currentDayCount: document.getElementById('currentDayCount'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    scheduleName: document.getElementById('scheduleName'),
    savedSchedules: document.getElementById('savedSchedules'),
    imagePreview: document.getElementById('imagePreview')
};

// Initialize flatpickr with mobile-friendly options
if (domElements.startDate) {
    flatpickr(domElements.startDate, { 
        dateFormat: "Y-m-d",
        defaultDate: new Date(),
        enableTime: false,
        clickOpens: true,
        allowInput: !isMobile, // Disable manual input on mobile
        disableMobile: false // Use native picker when available
    });
}

// Load image previews
function loadImagePreviews() {
    if (!domElements.imagePreview) return;
    
    domElements.imagePreview.innerHTML = '';
    
    imageOptions.forEach(option => {
        if (option.value) { // Skip empty option
            const img = document.createElement('img');
            img.className = 'sample-image';
            img.src = option.src;
            img.alt = option.label;
            img.title = option.label;
            img.dataset.value = option.value;
            
            // Add click/touch event
            img.addEventListener('click', () => {
                // Handle image selection if needed
            });
            
            // Add touch events for mobile
            if (isTouch) {
                img.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    img.style.transform = 'scale(1.1)';
                });
                
                img.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    img.style.transform = 'scale(1.0)';
                });
            }
            
            domElements.imagePreview.appendChild(img);
        }
    });
}

// Load previews on page load
document.addEventListener('DOMContentLoaded', () => {
    loadImagePreviews();
});

function generateSchedule() {
    const startDate = domElements.startDate.value;
    const numDays = parseInt(domElements.numDays.value);

    if (currentSchedule.totalDays > 0) {
        if (!confirm('A schedule is already loaded. Do you want to replace it?')) {
            return;
        }
    }

    if (!startDate || !numDays || numDays < 1) {
        alert('Please select a valid start date and number of days!');
        return;
    }

    showLoading(true);

    // Clear existing schedule
    domElements.scheduler.innerHTML = '';
    
    // Initialize the schedule state
    initializeScheduleState(startDate, numDays);
    
    // Create day boxes
    createDayBoxes(currentSchedule.startDate, numDays, 0);

    domElements.addDaysSection.style.display = 'block';
    updateDayCount();

    if (isMobile) {
        setTimeout(() => {
            domElements.scheduler.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 600);
    }
    
    showLoading(false);
}

function createDayBoxes(startDate, numDays, startIndex) {
    if (!domElements.scheduler) return;

    for (let i = 0; i < numDays; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i);

        const dayStr = dayDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let optionsHtml = '';
        imageOptions.forEach(option => {
            optionsHtml += `<option value="${option.value}">${option.label}</option>`;
        });

        const dayIndex = startIndex + i;
        const box = document.createElement('div');
        box.className = 'day-box';
        box.dataset.date = dayDate.toISOString().split('T')[0];
        box.innerHTML = `
            <h6 class="date-header">Day ${dayIndex + 1}</h6>
            <div class="full-date" style="font-size: 11px; color: #666; margin-bottom: 10px;">${dayStr}</div>
            <div class="image-container" id="container-${dayIndex}">
                <div>
                    <img class = "selected-image">
                </div>
            </div>
            <div class="image-selector">
                <select class="form-select form-select-sm" onchange="updateImage(${dayIndex}, this.value)">
                    ${optionsHtml}
                </select>
            </div>
            <div class="comment-section">
                <label for="comment-${dayIndex}">Comments:</label>
                <textarea class="comment-textarea" id="comment-${dayIndex}" placeholder="Add your notes here..."></textarea>
            </div>
        `;
        domElements.scheduler.appendChild(box);
        
        // Update or add to currentSchedule.dayBoxes
        if (dayIndex < currentSchedule.dayBoxes.length) {
            currentSchedule.dayBoxes[dayIndex] = {
                date: dayDate,
                index: dayIndex
            };
        } else {
            currentSchedule.dayBoxes.push({
                date: dayDate,
                index: dayIndex
            });
        }
    }
}

function addMoreDays() {
    const additionalDays = parseInt(domElements.additionalDays.value);
    
    if (!additionalDays || additionalDays < 1) {
        alert('Please enter a valid number of days to add!');
        return;
    }

    showLoading(true);

    // Calculate the start date for new days (day after the last day)
    const lastDate = new Date(currentSchedule.startDate);
    lastDate.setDate(currentSchedule.startDate.getDate() + currentSchedule.totalDays);

    // Create new day boxes starting from the current total
    createDayBoxes(lastDate, additionalDays, currentSchedule.totalDays);

    // Update the total days count
    currentSchedule.totalDays += additionalDays;
    updateDayCount();

    domElements.additionalDays.value = '1';
    
    // Scroll to new days on mobile
    if (isMobile) {
        setTimeout(() => {
            const lastBox = document.querySelector('.day-box:last-child');
            if (lastBox) {
                lastBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 400);
    }
    
    showLoading(false);
}

function removeLatestDays() {
    const removeDaysCount = parseInt(domElements.removeDays.value);
    
    if (!removeDaysCount || removeDaysCount < 1) {
        alert('Please enter a valid number of days to remove!');
        return;
    }

    if (currentSchedule.totalDays === 0) {
        alert('No days to remove!');
        return;
    }

    if (removeDaysCount > currentSchedule.totalDays) {
        alert(`You can't remove more days (${removeDaysCount}) than exist in the schedule (${currentSchedule.totalDays})!`);
        return;
    }

    showLoading(true);

    const dayBoxes = Array.from(domElements.scheduler.children);

    // Remove the specified number of days from the end
    for (let i = 0; i < removeDaysCount; i++) {
        if (dayBoxes.length > 0) {
            domElements.scheduler.removeChild(dayBoxes[dayBoxes.length - 1 - i]);
        }
    }

    // Update the schedule state
    currentSchedule.totalDays = Math.max(0, currentSchedule.totalDays - removeDaysCount);
    currentSchedule.dayBoxes = currentSchedule.dayBoxes.slice(0, -removeDaysCount);
    updateDayCount();

    domElements.removeDays.value = '1';
    showLoading(false);
}

function updateDayCount() {
    if (domElements.currentDayCount) {
        domElements.currentDayCount.textContent = currentSchedule.totalDays;
    }
}

function updateImage(dayIndex, imageValue) {
    const container = document.getElementById(`container-${dayIndex}`);
    if (!container) return;
    
    const imgElement = container.querySelector('img');
    if (!imgElement) return;
    
    if (!imageValue) {
        imgElement.style.display = 'none';
        return;
    }

    const imageOption = imageOptions.find(opt => opt.value === imageValue);
    if (imageOption?.src) {
        imgElement.src = imageOption.src;
        imgElement.alt = imageOption.label;
        imgElement.style.display = 'block';
    } else {
        imgElement.style.display = 'none';
    }
}

function showLoading(show) {
    if (!domElements.loadingIndicator) return;
    
    domElements.loadingIndicator.style.display = show ? 'block' : 'none';
    
    // Disable/enable buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.classList.toggle('loading', show);
        btn.disabled = show;
    });
}

function clearAll() {
    if (domElements.scheduler) domElements.scheduler.innerHTML = '';
    if (domElements.startDate) domElements.startDate.value = '';
    if (domElements.numDays) domElements.numDays.value = '7';
    if (domElements.additionalDays) domElements.additionalDays.value = '1';
    if (domElements.addDaysSection) domElements.addDaysSection.style.display = 'none';
    
    // Reset schedule state
    currentSchedule = {
        startDate: null,
        totalDays: 0,
        dayBoxes: []
    };
}

// Handle orientation changes on mobile
if (isMobile) {
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            loadImagePreviews();
        }, 500);
    });
}

// Prevent double-tap zoom on iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Save schedule
async function saveSchedule() {
    if (!domElements.scheduleName) return;
    
    const scheduleName = domElements.scheduleName.value.trim();
    if (!scheduleName) {
        alert('Please enter a schedule name');
        return;
    }

    const scheduleData = {
        startDate: domElements.startDate?.value || '',
        days: []
    };

    // Collect data from each day box
    document.querySelectorAll('.day-box').forEach((box, index) => {
        const select = box.querySelector('select');
        const textarea = box.querySelector('textarea');
        
        const dayData = {
            dayNumber: index + 1,
            date: box.dataset.date || '',
            image: select?.value || '',
            comment: textarea?.value || ''
        };
        scheduleData.days.push(dayData);
    });

    try {
        const response = await fetch('/save-schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: scheduleName,
                scheduleData: scheduleData
            })
        });

        const result = await response.json();
        if (result.success) {
            alert('Schedule saved successfully');
            window.location.reload();
        } else {
            alert('Error saving schedule: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving schedule');
    }
}

// Load schedule
async function loadSchedule() {
    if (!domElements.savedSchedules) return;
    
    const scheduleId = domElements.savedSchedules.value;
    if (!scheduleId) return;

    // Check if there's already a loaded schedule
    if (currentSchedule.totalDays > 0) {
        if (!confirm('A schedule is already loaded. Do you want to replace it?')) {
            return;
        }
    }

    try {
        showLoading(true);
        
        const response = await fetch(`/load-schedule/${scheduleId}`);
        const result = await response.json();

        if (result.success) {
            const schedule = result.schedule;
            
            // Clear current schedule state
            clearAll();
            
            // Set the new schedule data
            if (domElements.startDate) {
                domElements.startDate.value = schedule.startDate;
            }
            currentSchedule.startDate = new Date(schedule.startDate);
            currentSchedule.totalDays = schedule.days.length;
            
            // Create day boxes
            createDayBoxes(currentSchedule.startDate, schedule.days.length, 0);
            
            // Populate each day box
            schedule.days.forEach((day, index) => {
                const box = document.querySelector(`.day-box:nth-child(${index + 1})`);
                if (box) {
                    const select = box.querySelector('select');
                    const textarea = box.querySelector('textarea');
                    
                    if (select) select.value = day.image;
                    updateImage(index, day.image);
                    if (textarea) textarea.value = day.comment;
                    
                    // Store in currentSchedule
                    currentSchedule.dayBoxes[index] = {
                        date: new Date(day.date),
                        index: index
                    };
                }
            });
            
            // Update UI
            if (domElements.addDaysSection) {
                domElements.addDaysSection.style.display = 'block';
            }
            updateDayCount();
        } else {
            alert('Error loading schedule: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading schedule');
    } finally {
        showLoading(false);
    }
}

function initializeScheduleState(startDate, totalDays) {
    currentSchedule = {
        startDate: new Date(startDate),
        totalDays: totalDays,
        dayBoxes: []
    };
    
    // Initialize dayBoxes array
    for (let i = 0; i < totalDays; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + i);
        currentSchedule.dayBoxes.push({
            date: dayDate,
            index: i
        });
    }
}

// Delete schedule
async function deleteSchedule() {
    if (!domElements.savedSchedules) return;
    
    const scheduleId = domElements.savedSchedules.value;
    if (!scheduleId) return;

    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
        const response = await fetch(`/delete-schedule/${scheduleId}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (result.success) {
            alert('Schedule deleted successfully');
            window.location.reload();
        } else {
            alert('Error deleting schedule: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting schedule');
    }
}