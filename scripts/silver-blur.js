// Silver Price Blur System JavaScript
// Handles market hours detection and price blurring for Bangkok timezone

class SilverPriceBlur {
    constructor() {
        this.isInitialized = false;
        this.blurCheckInterval = null;
        this.currentBlurState = false;
        
        // Market hours in Bangkok timezone (08:30 - 17:30)
        this.marketOpenHour = 8;
        this.marketOpenMinute = 30;
        this.marketCloseHour = 17;
        this.marketCloseMinute = 30;
        
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
    
    // Check if current time is within market hours
    isMarketOpen() {
        const bangkokTime = this.getBangkokTime();
        const dayOfWeek = bangkokTime.getDay(); // 0 = Sunday, 6 = Saturday
        const currentHour = bangkokTime.getHours();
        const currentMinute = bangkokTime.getMinutes();
        
        // Weekend check (Saturday = 6, Sunday = 0)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            console.log(`Silver Blur: Weekend detected (${dayOfWeek === 0 ? 'Sunday' : 'Saturday'}), price not available`);
            return false;
        }
        
        // Convert current time to minutes since midnight for easier comparison
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        const marketOpenMinutes = this.marketOpenHour * 60 + this.marketOpenMinute;
        const marketCloseMinutes = this.marketCloseHour * 60 + this.marketCloseMinute;
        
        const isOpen = currentTotalMinutes >= marketOpenMinutes && currentTotalMinutes <= marketCloseMinutes;
        
        console.log(`Silver Blur: Bangkok time ${bangkokTime.toLocaleTimeString('th-TH')}, Price ${isOpen ? 'AVAILABLE' : 'NOT AVAILABLE'}`);
        return isOpen;
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
    init() {
        if (this.isInitialized) {
            console.log('Silver Blur: Already initialized');
            return;
        }
        
        console.log('Silver Blur: Starting initialization...');
        
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
    
    // Manual test function for debugging
    testTimeRange() {
        const bangkokTime = this.getBangkokTime();
        console.log('=== Silver Blur Time Test ===');
        console.log('Current Bangkok Time:', bangkokTime.toLocaleString('th-TH', {timeZone: 'Asia/Bangkok'}));
        console.log('Day of Week:', ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][bangkokTime.getDay()]);
        console.log('Market Hours: 08:30 - 17:30 (Mon-Fri)');
        console.log('Market Status:', this.isMarketOpen() ? 'OPEN' : 'CLOSED');
        console.log('Current Blur State:', this.currentBlurState ? 'BLURRED' : 'VISIBLE');
        console.log('=== End Test ===');
    }
}

// Global instance
window.silverBlur = new SilverPriceBlur();

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the main silver price system to initialize
    setTimeout(() => {
        window.silverBlur.init();
    }, 1000);
});

// Expose test function globally for console testing
window.testSilverBlur = () => {
    window.silverBlur.testTimeRange();
};