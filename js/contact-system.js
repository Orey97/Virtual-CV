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
    auth: {
        clientId: '732652071804-mlo3vo636rhuvae8pig3q49e1bdnrkn6.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/calendar.events',
        mode: 'OFFLINE' 
    },
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
 * MockCalendarAdapter V2.1
 * Implements deterministic time-slot availability logic.
 * Ensures "Monday blocks Monday" bug is DEAD by using full date hashes.
 */
class MockCalendarAdapter extends ICalendarAdapter {
    constructor() {
        super();
        this.latencyBase = 600; 
    }

    async initialize() {
        console.log('[System] Initializing Adapter: MockCalendarAdapter V2.1');
        return true;
    }

    // Helper: Deterministic Hash from Date String
    _getDateHash(dateStr) {
        let hash = 0;
        for (let i = 0; i < dateStr.length; i++) {
            const char = dateStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    async getAvailability(year, month) {
        await new Promise(resolve => setTimeout(resolve, this.latencyBase));

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const availability = [];

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dayOfWeek = date.getDay();
            const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            
            let status = 'AVAILABLE';
            
            // 1. Structural constraints (Weekends)
            if (SYSTEM_CONFIG.calendar.daysOff.includes(dayOfWeek)) {
                status = 'UNAVAILABLE'; // Gray out
            } else {
                // 2. Logic: Deterministic "Busy" Days
                // If hash % 7 == 0, the WHOLE DAY is busy/booked
                const hash = this._getDateHash(dateStr);
                if (hash % 7 === 0) {
                    status = 'FULLY_BOOKED'; 
                }
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
        // Simulate fetch
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const slots = [];
        const { businessStart, businessEnd } = SYSTEM_CONFIG.calendar;
        const dateHash = this._getDateHash(dateStr);

        for (let hour = businessStart; hour < businessEnd; hour++) {
            const timeStr = `${hour}:00`;
            // Deterministic Slot Availability
            // Combining date hash and hour ensures unique pattern per day
            // e.g. 10:00 might be free on Monday 1st but busy Monday 8th
            const slotEntropy = (dateHash + hour) % 10;
            
            // 30% chance of being busy if day is generaly available
            const isBusy = slotEntropy < 3; 

            slots.push({
                time: timeStr,
                status: isBusy ? 'BUSY' : 'AVAILABLE'
            });
        }
        
        return slots;
    }

    async createBooking(payload) {
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (!payload.time.start || !payload.time.slot) {
            return { error: 'INVALID_TIME_SLOT', status: 400 };
        }

        console.group('%c[SYSTEM AUDIT] OUTBOUND BOOKING REQUEST', 'color: #00f0ff; background: #000; padding: 4px;');
        console.log('Target: [MOCK] /api/v1/calendar/events');
        console.log('Payload:', payload);
        console.log('Strategy: TIME_SLOT_RESERVATION');
        console.groupEnd();

        return {
            id: `evt_${Date.now()}`,
            status: 'CONFIRMED',
            timestamp: new Date().toISOString()
        };
    }
}

class CalendarService {
    constructor(adapter) {
        this.adapter = adapter;
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
        
        this.service = new CalendarService(new MockCalendarAdapter());
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedSlot = null;

        this.init();
    }

    async init() {
        if (!this.container) return;
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
                     <div class="status-item"><span class="status-dot green"></span><span>READY</span></div>
                     <div class="status-item"><span class="status-dot gray"></span><span>OFFLINE (INTENTIONAL)</span></div>
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
                <span style="font-size:0.7rem; margin-top:10px">RETRIEVING TIME SLOTS...</span>
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
            slotsHtml += `<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--c-text-muted)">NO AVAILABILITY</div>`;
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
                <span class="slot-label">TARGET_SLOT:</span>
                <span class="slot-value active">${this.selectedDate} @ ${this.selectedSlot}</span>
            `;
            this.slotDisplay.style.borderColor = 'var(--c-success)';
        } else if (this.selectedDate) {
            this.slotDisplay.innerHTML = `
                <span class="slot-label">TARGET_SLOT:</span>
                <span class="slot-value" style="color:var(--c-warning)">SELECT_TIME...</span>
            `;
            this.slotDisplay.style.borderColor = 'var(--c-warning)';
        } else {
             this.slotDisplay.innerHTML = `
                <span class="slot-label">TARGET_SLOT:</span>
                <span class="slot-value">PENDING_SELECTION</span>
            `;
            this.slotDisplay.style.borderColor = '';
        }
    }

    bindFormEvents() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.selectedDate || !this.selectedSlot) {
                alert('SYSTEM ERROR: Complete booking coordinates (Date & Time) required.');
                return;
            }

            const btn = this.form.querySelector('.scheduler-submit');
            const originalText = btn.innerHTML;
            btn.innerHTML = `<span class="btn-text">SECURING UPLINK...</span>`;
            
            const payload = {
                identity: document.getElementById('s-name').value,
                contact: document.getElementById('s-email').value,
                briefing: document.getElementById('s-message').value,
                time: {
                    start: this.selectedDate,
                    slot: this.selectedSlot,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            };

            const result = await this.service.createBooking(payload);

            if (result.status === 'CONFIRMED') {
                btn.innerHTML = `<span class="btn-text" style="color:var(--c-success)">ALIGNMENT SECURED</span>`;
                
                alert(
                    `[SYSTEM NOTIFICATION]\n\n` +
                    `ALIGNMENT CONFIRMED.\n` +
                    `--------------------------------\n` +
                    `DATE:       ${this.selectedDate}\n` +
                    `TIME:       ${this.selectedSlot}\n` +
                    `STATUS:     SYNCED_LOCALLY\n` +
                    `\n` +
                    `NOTE: Time slot reserved in local state. No external Google Calendar API write occurred.`
                );
            }

            setTimeout(() => {
                btn.innerHTML = originalText;
                this.form.reset();
                this.renderCalendar(this.currentDate);
            }, 3000);
        });
    }
}

window.contactInterface = null;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.contactInterface = new ContactInterface();
    }, 100);
});
