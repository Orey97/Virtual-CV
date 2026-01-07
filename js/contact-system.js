/**
 * ============================================
 * CONTACT ARCHITECTURE V2.1 (TIME-SLOT ENGINE)
 * Strategy: Granular Availability & Deterministic Simulation
 * Status: BACKEND_READY
 * ============================================
 */

/**
 * CONFIGURATION & CONSTANTS
 * Defines specific operational hours and slot duration for precise scheduling.
 */
const SYSTEM_CONFIG = {
    calendar: {
        businessStart: 10, // 10:00 AM
        businessEnd: 18,   // 06:00 PM
        slotDuration: 60,  // minutes
        daysOff: [0, 6]    // Sun, Sat
    }
};

/**
 * ============================================
 * SERVICE ABSTRACTION LAYER
 * ============================================
 */

class ICalendarAdapter {
    async initialize() { throw new Error('Method not implemented'); }
    async getAvailability(year, month) { throw new Error('Method not implemented'); }
    async getSlots(dateStr) { throw new Error('Method not implemented'); }
    async createBooking(payload) { throw new Error('Method not implemented'); }
}

/**
 * GoogleLiveAdapter V3.0 (Service Account Uplink)
 * 
 * Replaces the previous client-side specific logic.
 * Now connects to /api/calendar to fetch REAL busy slots from the Service Account.
 */
class GoogleLiveAdapter extends ICalendarAdapter {
    constructor() {
        super();
        this.busyCache = null;
        this.lastFetch = 0;
    }

    async initialize() {
        console.log('[System] Initializing Adapter: GoogleLiveAdapter (Service Account Uplink)');
        return true;
    }

    // Helper: Fetch busy slots from our secure backend
    async _fetchBusySlots() {
        // Simple caching (1 minute) to prevent spamming the API on every click
        if (this.busyCache && (Date.now() - this.lastFetch < 60000)) {
            return this.busyCache;
        }

        try {
            const response = await fetch('/api/calendar');
            if (!response.ok) throw new Error('Sync Failed');
            
            const data = await response.json();
            this.busyCache = data.busySlots || [];
            this.lastFetch = Date.now();
            return this.busyCache;
        } catch (error) {
            console.error('[System] Calendar Sync Error:', error);
            return []; // Fail gracefully (show all open) or handle error UI
        }
    }

    async getAvailability(year, month) {
        // 1. Fetch Real Busy Data
        const busySlots = await this._fetchBusySlots();
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const availability = [];
        const { daysOff } = SYSTEM_CONFIG.calendar;

        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const dayOfWeek = dateObj.getDay();
            
            let status = 'AVAILABLE';

            // A. Structural Constraints (Weekends)
            if (daysOff.includes(dayOfWeek)) {
                status = 'UNAVAILABLE';
            } else {
                // B. Real Calendar Constraints
                // Check if any "Busy Slot" covers the ENTIRE business day (simplification)
                // Or if the day has varying degrees of busyness.
                // For V3.0, let's mark the day as FULLY_BOOKED if it has > 4 hours of meetings
                // or keep it AVAILABLE but let getSlots handle the specific times.
                
                // Let's check generally if there are slots on this day
                const daysEvents = busySlots.filter(slot => slot.start.startsWith(dateStr));
                
                if (daysEvents.length > 3) { // Arbitrary heuristic for "Heavy Day"
                     // status = 'HEAVY'; // Could use a different color
                }
                
                // For now, we leave the day clickable (AVAILABLE) 
                // so the user can see which specific slots are open in the next view.
            }

            availability.push({
                date: d,
                fullDate: dateStr,
                status: status
            });
        }
        return availability;
    }

    async getSlots(dateStr) {
        // 1. Fetch Real Busy Data
        const busySlots = await this._fetchBusySlots();
        
        // 2. Filter for this specific day
        // Google timestamps are ISO: 2023-10-25T14:30:00+01:00
        const daysBusyness = busySlots.filter(slot => {
            return slot.start.startsWith(dateStr) || slot.end.startsWith(dateStr);
        });

        const slots = [];
        const { businessStart, businessEnd } = SYSTEM_CONFIG.calendar;

        for (let hour = businessStart; hour < businessEnd; hour++) {
            const timeStr = `${hour}:00`;
            const slotStart = new Date(`${dateStr}T${String(hour).padStart(2,'0')}:00:00`);
            const slotEnd = new Date(`${dateStr}T${String(hour+1).padStart(2,'0')}:00:00`);
            
            // Check overlap with any real busy slot
            const isBusy = daysBusyness.some(busy => {
                const bStart = new Date(busy.start);
                const bEnd = new Date(busy.end);
                
                // Overlap logic: (StartA < EndB) and (EndA > StartB)
                return (slotStart < bEnd) && (slotEnd > bStart);
            });

            slots.push({
                time: timeStr,
                status: isBusy ? 'BUSY' : 'AVAILABLE'
            });
        }
        
        return slots;
    }

    // Write to Booking API (V4.0 Service Account Logic)
    async createBooking(payload) {
        console.group('%c[UPLINK] TRANSMITTING BOOKING REQUEST', 'color: #00f0ff; background: #000; padding: 4px;');
        console.log('Endpoint: POST /api/calendar');
        console.log('Payload:', payload);
        console.groupEnd();
        
        try {
            // Construct the payload with exact key names expected by backend
            const requestBody = {
                name: payload.identity,
                email: payload.contact,
                briefing: payload.briefing,
                date: payload.time.start,      // Format: "YYYY-MM-DD"
                startTime: payload.time.slot,  // Format: "HH:00" or "H:00"
                timezone: payload.time.timezone
            };
            
            console.log('[UPLINK] Request Body:', JSON.stringify(requestBody, null, 2));
            
            const response = await fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            
            console.group('%c[UPLINK] RESPONSE RECEIVED', response.ok ? 'color: #00ff88;' : 'color: #ff4444;');
            console.log('Status:', response.status);
            console.log('Data:', data);
            console.groupEnd();
            
            if (!response.ok) {
                // Specific Handling for different error codes
                if (response.status === 503) {
                    console.warn('[UPLINK] Backend 503: Service Account Missing');
                    return { status: 'OFFLINE_MODE', error: 'Service credentials not active', isFallback: true };
                }
                if (response.status === 403) {
                    console.error('[UPLINK] 403 FORBIDDEN: Service Account lacks calendar write permission');
                    return { status: 'PERMISSION_DENIED', error: data.error || 'Calendar write access denied' };
                }
                if (response.status === 400) {
                    console.error('[UPLINK] 400 BAD REQUEST:', data.error);
                    return { status: 'VALIDATION_ERROR', error: data.error || 'Invalid request data' };
                }
                throw new Error(data.error || 'Uplink Error');
            }

            // SUCCESS: Event was created
            console.log('%c[UPLINK] EVENT CREATED SUCCESSFULLY', 'color: #00ff88; font-weight: bold;');
            console.log('Event ID:', data.eventId);
            console.log('Calendar Link:', data.link);
            
            return {
                id: data.eventId,
                status: 'CONFIRMED',
                calendar: 'GOOGLE_LIVE',
                link: data.link,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('%c[UPLINK] CRITICAL FAILURE', 'color: #ff4444; font-weight: bold;');
            console.error('Error:', error.message);
            return { status: 'FAILED', error: error.message };
        }
    }
}

class CalendarService {
    constructor() {
        // Direct connection to Google Calendar via Service Account
        this.adapter = new GoogleLiveAdapter();
    }
    async initialize() { return this.adapter.initialize(); }
    async getAvailability(y, m) { return this.adapter.getAvailability(y, m); }
    async getSlots(date) { return this.adapter.getSlots(date); }
    async createBooking(p) { return this.adapter.createBooking(p); }
}

/**
 * ============================================
 * UI ORCHESTRATOR
 * ============================================
 */
class ContactInterface {
    constructor() {
        this.container = document.querySelector('.calendar-widget');
        this.form = document.getElementById('scheduler-form');
        this.slotDisplay = document.getElementById('slot-display');
        
        this.service = new CalendarService(); // Factory handles injection
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedSlot = null;

        this.init();
    }

    async init() {
        if (!this.container) return;
        
        // Update Console Title
        const consoleTitle = document.querySelector('.console-column.right .console-title');
        if (consoleTitle) {
            consoleTitle.innerHTML = 'My Availability';
        }

        await this.service.initialize();
        this.renderCalendar(this.currentDate);
        this.bindFormEvents();
    }

    // STATE 1: CALENDAR VIEW
    async renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth(); 
        const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
        
        // Reset View State
        this.selectedDate = null;
        this.selectedSlot = null;
        this.updateSlotDisplay();

        this.container.innerHTML = `
            <div class="calendar-view">
                <div class="cal-header">
                    <button class="cal-nav prev" id="cal-prev"><i class="fa-solid fa-chevron-left"></i></button>
                    <span class="cal-title">${monthNames[month]} ${year}</span>
                    <button class="cal-nav next" id="cal-next"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
                <div class="cal-loading-overlay" id="cal-loader" style="display:none; position:absolute; inset:0; background:rgba(0,0,0,0.8); z-index:10; align-items:center; justify-content:center;">
                    <i class="fa-solid fa-circle-notch fa-spin" style="color:var(--c-signal)"></i>
                </div>
                <div class="cal-grid" id="cal-grid">
                    <!-- Days Injected Here -->
                </div>
                <div class="cal-footer-status">
                     <div class="status-item">
                        <span class="status-dot green"></span>
                        <span>Live</span>
                     </div>
                     <div class="status-item">
                        <span class="status-dot green"></span>
                        <span>Synced with Calendar</span>
                     </div>
                </div>
            </div>
            <div class="slots-view" id="slots-view">
                <!-- Slots Injected Here -->
            </div>
        `;

        // Render Grid
        const grid = document.getElementById('cal-grid');
        const loader = document.getElementById('cal-loader');
        
        loader.style.display = 'flex';
        const availability = await this.service.getAvailability(year, month);
        loader.style.display = 'none';

        grid.innerHTML = `
            <div class="cal-day-name">S</div><div class="cal-day-name">M</div><div class="cal-day-name">T</div>
            <div class="cal-day-name">W</div><div class="cal-day-name">T</div><div class="cal-day-name">F</div>
            <div class="cal-day-name">S</div>
        `;

        const firstDay = new Date(year, month, 1).getDay();
        for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div class="cal-day empty"></div>`;

        availability.forEach(day => {
            const isToday = (day.date === new Date().getDate() && month === new Date().getMonth()) ? 'today' : '';
            const statusClass = day.status === 'FULLY_BOOKED' ? 'busy' : day.status.toLowerCase();
            const action = day.status === 'AVAILABLE' ? `onclick="window.contactInterface.selectDate('${day.fullDate}')"` : '';
            
            grid.innerHTML += `
                <button class="cal-day ${statusClass} ${isToday}" ${action}>
                    ${day.date}
                </button>
            `;
        });

        // Listeners
        document.getElementById('cal-prev').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar(this.currentDate);
        });
        document.getElementById('cal-next').addEventListener('click', () => {
             this.currentDate.setMonth(this.currentDate.getMonth() + 1);
             this.renderCalendar(this.currentDate);
        });
    }

    // STATE 2: SLOTS VIEW
    async selectDate(dateStr) {
        this.selectedDate = dateStr;
        this.updateSlotDisplay(); // Show date, pending time

        const calendarView = document.querySelector('.calendar-view');
        const slotsView = document.getElementById('slots-view');
        
        // Render Skeleton
        slotsView.innerHTML = `
            <div class="cal-header">
                <button class="cal-nav back" id="slots-back"><i class="fa-solid fa-arrow-left"></i></button>
                <span class="cal-title">${dateStr}</span>
                <div style="width:30px"></div>
            </div>
            <div class="cal-loading" style="height:200px">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <span style="font-size:0.7rem; margin-top:10px">Loading time slots...</span>
            </div>
        `;

        // Transition
        calendarView.classList.add('hidden');
        slotsView.classList.add('active');

        // Fetch
        const slots = await this.service.getSlots(dateStr);
        
        // Render Slots
        let slotsHtml = `<div class="slots-grid">`;
        if (slots.length === 0) {
            slotsHtml += `<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--c-text-muted)">No available slots</div>`;
        } else {
            slots.forEach(slot => {
                const action = slot.status === 'AVAILABLE' ? `onclick="window.contactInterface.selectSlot('${slot.time}', this)"` : '';
                slotsHtml += `
                    <button class="time-slot ${slot.status.toLowerCase()}" ${action}>
                        ${slot.time}
                    </button>
                `;
            });
        }
        slotsHtml += `</div>`;

        // Inject Content (maintaining header)
        slotsView.innerHTML = `
            <div class="cal-header">
                <button class="cal-nav back" id="slots-back"><i class="fa-solid fa-arrow-left"></i></button>
                <span class="cal-title">${dateStr}</span>
                <div style="width:30px"></div> <!-- Spacer for balance -->
            </div>
            ${slotsHtml}
        `;

        document.getElementById('slots-back').addEventListener('click', () => {
             slotsView.classList.remove('active');
             calendarView.classList.remove('hidden');
             this.selectedDate = null;
             this.selectedSlot = null;
             this.updateSlotDisplay();
        });
    }

    selectSlot(timeStr, btnEl) {
        document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
        btnEl.classList.add('selected');
        
        this.selectedSlot = timeStr;
        this.updateSlotDisplay();
    }

    updateSlotDisplay() {
        if (!this.slotDisplay) return;
        
        if (this.selectedDate && this.selectedSlot) {
            this.slotDisplay.innerHTML = `
                <span class="slot-label">Selected Time:</span>
                <span class="slot-value active">${this.selectedDate} @ ${this.selectedSlot}</span>
            `;
            this.slotDisplay.style.borderColor = 'var(--c-success)';
        } else if (this.selectedDate) {
            this.slotDisplay.innerHTML = `
                <span class="slot-label">Selected Time:</span>
                <span class="slot-value" style="color:var(--c-warning)">Pick a time...</span>
            `;
            this.slotDisplay.style.borderColor = 'var(--c-warning)';
        } else {
             this.slotDisplay.innerHTML = `
                <span class="slot-label">Selected Time:</span>
                <span class="slot-value">Choose a slot</span>
            `;
            this.slotDisplay.style.borderColor = '';
        }
    }

    bindFormEvents() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // VALIDATION: Ensure date & time are selected
            if (!this.selectedDate || !this.selectedSlot) {
                alert('Please select both a date and time slot to schedule your meeting.');
                return;
            }

            const btn = this.form.querySelector('.scheduler-submit');
            const originalText = btn.innerHTML;
            
            // STATE: SUBMITTING
            btn.innerHTML = `<span class="btn-text"><i class="fa-solid fa-circle-notch fa-spin"></i> Scheduling...</span>`;
            btn.disabled = true;
            btn.style.opacity = '0.7';
            
            // CONSTRUCT PAYLOAD
            const payload = {
                identity: document.getElementById('s-name').value,
                contact: document.getElementById('s-email').value,
                briefing: document.getElementById('s-message').value,
                time: {
                    start: this.selectedDate,  // "YYYY-MM-DD"
                    slot: this.selectedSlot,   // "HH:00"
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            };

            // EXECUTE BOOKING
            const result = await this.service.createBooking(payload);

            // HANDLE RESPONSE STATES
            if (result.status === 'CONFIRMED') {
                // SUCCESS: Event was created on Google Calendar
                btn.innerHTML = `<span class="btn-text" style="color:var(--c-success)"><i class="fa-solid fa-check-circle"></i> Meeting Scheduled!</span>`;
                btn.style.borderColor = 'var(--c-success)';
                
                alert(
                    `Meeting Confirmed!\n\n` +
                    `✓ Your meeting has been scheduled\n` +
                    `================================\n` +
                    `Date: ${this.selectedDate}\n` +
                    `Time: ${this.selectedSlot}\n` +
                    `\n` +
                    `A calendar invitation has been sent to your email.`
                );
                
                // Reset after success
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.style.opacity = '';
                    btn.style.borderColor = '';
                    this.form.reset();
                    this.selectedDate = null;
                    this.selectedSlot = null;
                    this.renderCalendar(this.currentDate);
                }, 3000);
                
            } else if (result.status === 'OFFLINE_MODE' || result.isFallback) {
                // OFFLINE: Service Account not configured
                btn.innerHTML = `<span class="btn-text" style="color:var(--c-warning)"><i class="fa-solid fa-exclamation-triangle"></i> Demo Mode</span>`;
                btn.style.borderColor = 'var(--c-warning)';
                
                console.warn('[UI] Operating in OFFLINE mode - Backend credentials not configured');
                
                alert(
                    `Demo Mode\n\n` +
                    `⚠ The booking system is currently in demo mode.\n` +
                    `Your request was not synced to the calendar.\n` +
                    `\n` +
                    `Please contact me directly via email.`
                );
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.style.opacity = '';
                    btn.style.borderColor = '';
                }, 3000);
                
            } else {
                // FAILURE: Backend error
                btn.innerHTML = `<span class="btn-text" style="color:var(--c-danger)"><i class="fa-solid fa-times-circle"></i> Booking Failed</span>`;
                btn.style.borderColor = 'var(--c-danger)';
                
                console.error('[UI] Booking failed:', result.error);
                
                alert(
                    `Booking Error\n\n` +
                    `Unable to schedule your meeting.\n` +
                    `Error: ${result.error || 'Unknown error'}\n` +
                    `\n` +
                    `Please try again or contact me directly.`
                );
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.style.opacity = '';
                    btn.style.borderColor = '';
                }, 3000);
            }
        });
    }
}

window.contactInterface = null;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.contactInterface = new ContactInterface();
    }, 100);
});
