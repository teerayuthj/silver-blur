// Silver Price Blur System JavaScript
// Handles market hours detection and price blurring for Bangkok timezone

class SilverPriceBlur {
    constructor(options = {}) {
        this.isInitialized = false;
        this.blurCheckInterval = null;
        this.currentBlurState = false;
        this.holidayData = null;
        
        // Configuration options
        this.config = {
            holidayJsonUrl: options.holidayJsonUrl || './config/holidays.json',
            cdnBaseUrl: options.cdnBaseUrl || null,
            ...options
        };
        
        // Holiday configuration will be loaded from external file
        
        // Price element IDs to blur
        this.priceElements = [
            'slvUsdBid',
            'slvUsdOffer', 
            'slvKgBid',
            'slvKgOffer',
            'slvKgVat',
            'slvUsdChg',
            'slvKgChg'
        ];
        
        // VAT label elements to blur
        this.vatLabelElements = [
            '.sv-vat-label'
        ];
        
        // Timer container elements for overlay
        this.timerContainers = [
            '.sv-event-timer'
        ];
        
        console.log('Silver Blur System: Initialized');
    }
    
    // Get current Bangkok time
    getBangkokTime() {
        const now = new Date();
        const bangkokTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Bangkok"}));
        return bangkokTime;
    }
    
    // Load holiday configuration from external JSON file
    async loadHolidayData() {
        const holidayUrl = this.config.cdnBaseUrl 
            ? `${this.config.cdnBaseUrl}/config/holidays.json`
            : this.config.holidayJsonUrl;
            
        try {
            console.log(`Silver Blur: Loading holidays from ${holidayUrl}`);
            const response = await fetch(holidayUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.holidayData = await response.json();
            console.log('Silver Blur: Holiday data loaded successfully');
            return true;
        } catch (error) {
            console.warn('Silver Blur: Failed to load holiday data:', error.message);
            console.warn('Silver Blur: Continuing with weekend-only blur');
            this.holidayData = { holidays: {} };
            return false;
        }
    }
    
    // Check if current date is a holiday
    isHoliday(date = null) {
        if (!this.holidayData || !this.holidayData.holidays) {
            return false;
        }
        
        const checkDate = date || this.getBangkokTime();
        const year = checkDate.getFullYear().toString();
        const month = String(checkDate.getMonth() + 1).padStart(2, '0');
        const day = String(checkDate.getDate()).padStart(2, '0');
        const dateKey = `${month}-${day}`;
        
        return this.holidayData.holidays[year] && this.holidayData.holidays[year][dateKey];
    }
    
    // Get holiday information for a specific date
    getHolidayInfo(date = null) {
        if (!this.holidayData || !this.holidayData.holidays) {
            return null;
        }
        
        const checkDate = date || this.getBangkokTime();
        const year = checkDate.getFullYear().toString();
        const month = String(checkDate.getMonth() + 1).padStart(2, '0');
        const day = String(checkDate.getDate()).padStart(2, '0');
        const dateKey = `${month}-${day}`;
        
        if (this.holidayData.holidays[year] && this.holidayData.holidays[year][dateKey]) {
            return this.holidayData.holidays[year][dateKey];
        }
        return null;
    }
    
    // Check if market is open (prices available) - Only blur on weekends and holidays
    isMarketOpen() {
        const bangkokTime = this.getBangkokTime();
        const dayOfWeek = bangkokTime.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Weekend check (Saturday = 6, Sunday = 0)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            console.log(`Silver Blur: Weekend detected (${dayOfWeek === 0 ? 'Sunday' : 'Saturday'}), price not available`);
            return false;
        }
        
        // Holiday check
        const holidayInfo = this.getHolidayInfo(bangkokTime);
        if (holidayInfo) {
            console.log(`Silver Blur: Holiday detected (${holidayInfo.name}), price not available`);
            return false;
        }
        
        // Weekdays (Monday-Friday) that are not holidays - price is always available
        console.log(`Silver Blur: Bangkok time ${bangkokTime.toLocaleTimeString('th-TH')}, Price AVAILABLE (weekday, not holiday)`);
        return true;
    }
    
    // Apply blur effect to price elements
    applyBlur() {
        if (this.currentBlurState) return; // Already blurred
        
        console.log('Silver Blur: Price not available - applying blur effect');
        
        // Blur individual price elements
        this.priceElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                element.classList.add('sv-blur-price', 'sv-price-blurred');
            }
        });
        
        // Blur VAT label elements
        this.vatLabelElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.classList.add('sv-blur-price', 'sv-price-blurred');
            });
        });
        
        // Add overlay to timer containers
        this.timerContainers.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.classList.add('sv-blur-overlay', 'sv-market-closed');
            });
        });
        
        this.currentBlurState = true;
    }
    
    // Remove blur effect from price elements
    removeBlur() {
        if (!this.currentBlurState) return; // Already unblurred
        
        console.log('Silver Blur: Price available - removing blur effect');
        
        // Remove blur from price elements
        this.priceElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                element.classList.remove('sv-blur-price', 'sv-price-blurred');
            }
        });
        
        // Remove blur from VAT label elements
        this.vatLabelElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.classList.remove('sv-blur-price', 'sv-price-blurred');
            });
        });
        
        // Remove overlay from timer containers
        this.timerContainers.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.classList.remove('sv-blur-overlay', 'sv-market-closed');
            });
        });
        
        this.currentBlurState = false;
    }
    
    // Check market status and update blur accordingly
    updateBlurStatus() {
        const marketOpen = this.isMarketOpen();
        
        if (marketOpen && this.currentBlurState) {
            this.removeBlur();
        } else if (!marketOpen && !this.currentBlurState) {
            this.applyBlur();
        }
    }
    
    // Initialize the blur system
    async init() {
        if (this.isInitialized) {
            console.log('Silver Blur: Already initialized');
            return;
        }
        
        console.log('Silver Blur: Starting initialization...');
        
        // Load holiday data first
        await this.loadHolidayData();
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startBlurSystem());
        } else {
            this.startBlurSystem();
        }
    }
    
    // Start the blur checking system
    startBlurSystem() {
        // Initial check
        this.updateBlurStatus();
        
        // Set up interval to check every 30 seconds
        this.blurCheckInterval = setInterval(() => {
            this.updateBlurStatus();
        }, 30000);
        
        this.isInitialized = true;
        console.log('Silver Blur: System started, checking every 30 seconds');
    }
    
    // Stop the blur system (cleanup)
    stop() {
        if (this.blurCheckInterval) {
            clearInterval(this.blurCheckInterval);
            this.blurCheckInterval = null;
        }
        
        this.removeBlur();
        this.isInitialized = false;
        console.log('Silver Blur: System stopped');
    }
    
    // Add a new holiday to the configuration
    addHoliday(year, month, day, name, nameEn = '', type = 'custom') {
        if (!this.holidayData || !this.holidayData.holidays) {
            console.error('Silver Blur: Holiday data not loaded');
            return false;
        }
        
        const yearStr = year.toString();
        const dateKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        if (!this.holidayData.holidays[yearStr]) {
            this.holidayData.holidays[yearStr] = {};
        }
        
        this.holidayData.holidays[yearStr][dateKey] = {
            name: name,
            name_en: nameEn || name,
            type: type
        };
        
        console.log(`Silver Blur: Added holiday - ${name} (${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')})`);
        return true;
    }
    
    // Remove a holiday from the configuration
    removeHoliday(year, month, day) {
        if (!this.holidayData || !this.holidayData.holidays) {
            console.error('Silver Blur: Holiday data not loaded');
            return false;
        }
        
        const yearStr = year.toString();
        const dateKey = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        if (this.holidayData.holidays[yearStr] && this.holidayData.holidays[yearStr][dateKey]) {
            const holidayName = this.holidayData.holidays[yearStr][dateKey].name;
            delete this.holidayData.holidays[yearStr][dateKey];
            console.log(`Silver Blur: Removed holiday - ${holidayName} (${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')})`);
            return true;
        }
        
        console.warn(`Silver Blur: Holiday not found (${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')})`);
        return false;
    }
    
    // List all holidays for a specific year
    listHolidays(year) {
        if (!this.holidayData || !this.holidayData.holidays) {
            console.error('Silver Blur: Holiday data not loaded');
            return [];
        }
        
        const yearStr = year.toString();
        const holidays = this.holidayData.holidays[yearStr] || {};
        
        console.log(`=== Holidays for ${year} ===`);
        Object.keys(holidays).sort().forEach(dateKey => {
            const holiday = holidays[dateKey];
            console.log(`${year}-${dateKey}: ${holiday.name} (${holiday.type})`);
        });
        console.log('=== End List ===');
        
        return holidays;
    }
    
    // Manual test function for debugging
    testTimeRange() {
        const bangkokTime = this.getBangkokTime();
        const holidayInfo = this.getHolidayInfo(bangkokTime);
        
        console.log('=== Silver Blur Time Test ===');
        console.log('Current Bangkok Time:', bangkokTime.toLocaleString('th-TH', {timeZone: 'Asia/Bangkok'}));
        console.log('Day of Week:', ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][bangkokTime.getDay()]);
        console.log('Is Holiday:', holidayInfo ? `Yes - ${holidayInfo.name}` : 'No');
        console.log('Blur Logic: Weekends + Holidays only');
        console.log('Market Status:', this.isMarketOpen() ? 'OPEN' : 'CLOSED');
        console.log('Current Blur State:', this.currentBlurState ? 'BLURRED' : 'VISIBLE');
        console.log('=== End Test ===');
    }
}

// Global instance - can be reconfigured if needed
window.silverBlur = window.silverBlur || new SilverPriceBlur();

// Helper function to initialize with CDN
window.initSilverBlurCDN = (cdnBaseUrl) => {
    window.silverBlur = new SilverPriceBlur({
        cdnBaseUrl: cdnBaseUrl
    });
    return window.silverBlur.init();
};

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', async () => {
    // Wait a bit for the main silver price system to initialize
    setTimeout(async () => {
        await window.silverBlur.init();
    }, 1000);
});

// Expose test function globally for console testing
window.testSilverBlur = () => {
    window.silverBlur.testTimeRange();
};

// Expose holiday management functions globally
window.addHoliday = (year, month, day, name, nameEn = '', type = 'custom') => {
    return window.silverBlur.addHoliday(year, month, day, name, nameEn, type);
};

window.removeHoliday = (year, month, day) => {
    return window.silverBlur.removeHoliday(year, month, day);
};

window.listHolidays = (year) => {
    return window.silverBlur.listHolidays(year);
};