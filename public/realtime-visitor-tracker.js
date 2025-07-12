// Real-time Visitor Tracking System
// Bu dosya gerçek zamanlı ziyaretçi takibi için kullanılır

class RealtimeVisitorTracker {
  constructor() {
    this.sessionId = null;
    this.currentPage = null;
    this.pageStartTime = null;
    this.heartbeatInterval = null;
    this.visitorFingerprint = null;
    this.isTracking = false;
    this.clickCount = 0;
    this.mouseMovements = 0;
    this.scrollPercentage = 0;
    this.isPageVisible = true;
    
    // Initialize tracking
    this.init();
  }

  async init() {
    try {
      // Check if this is an admin page - don't track admin pages
      if (this.isAdminPage()) {
        console.log('Admin sayfası tespit edildi - tracking devre dışı');
        return;
      }

      // Generate unique session ID
      this.sessionId = this.generateSessionId();
      
      // Generate visitor fingerprint
      this.visitorFingerprint = await this.generateFingerprint();
      
      // Detect device, browser, location
      const deviceInfo = this.getDeviceInfo();
      
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      
      // Start session
      await this.startSession({
        session_id: this.sessionId,
        visitor_fingerprint: this.visitorFingerprint,
        current_page: window.location.pathname,
        page_title: document.title,
        referrer: document.referrer,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        ...deviceInfo
      });
      
      // Start heartbeat
      this.startHeartbeat();
      
      // Setup event listeners
      this.setupEventListeners();
      
      this.isTracking = true;
      console.log('Real-time visitor tracking started:', this.sessionId);
    } catch (error) {
      console.error('Failed to initialize visitor tracking:', error);
    }
  }

  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${random}_${timestamp}`;
  }

  // Check if current page is admin page
  isAdminPage() {
    const currentPath = window.location.pathname.toLowerCase();
    const currentUrl = window.location.href.toLowerCase();
    
    // Admin page patterns to exclude from tracking
    const adminPatterns = [
      '/admin',
      '#admin',
      'admin-dashboard',
      'admin_dashboard',
      'adminpanel',
      'admin-panel',
      '/dashboard',
      'management',
      'control-panel'
    ];
    
    // Check if any admin pattern matches
    const isAdmin = adminPatterns.some(pattern => 
      currentPath.includes(pattern) || currentUrl.includes(pattern)
    );
    
    // Also check for admin-like query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const hasAdminParams = urlParams.has('admin') || urlParams.has('dashboard');
    
    // Check for admin-like hash fragments
    const hasAdminHash = window.location.hash.toLowerCase().includes('admin');
    
    return isAdmin || hasAdminParams || hasAdminHash;
  }

  async generateFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Visitor fingerprint', 2, 2);
    
    const fingerprint = {
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      canvas: canvas.toDataURL(),
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency || 0
    };
    
    // Create hash from fingerprint data
    const fingerprintString = JSON.stringify(fingerprint);
    const hash = await this.hashString(fingerprintString);
    return hash.substring(0, 32);
  }

  async hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  getDeviceInfo() {
    const userAgent = navigator.userAgent;
    let deviceType = 'desktop';
    let browser = 'Unknown';
    let operatingSystem = 'Unknown';

    // Device type detection
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      deviceType = 'tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      deviceType = 'mobile';
    }

    // Browser detection
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
    } else if (userAgent.includes('Edg')) {
      browser = 'Edge';
    } else if (userAgent.includes('Opera')) {
      browser = 'Opera';
    }

    // OS detection
    if (userAgent.includes('Windows')) {
      operatingSystem = 'Windows';
    } else if (userAgent.includes('Mac')) {
      operatingSystem = 'macOS';
    } else if (userAgent.includes('Linux')) {
      operatingSystem = 'Linux';
    } else if (userAgent.includes('Android')) {
      operatingSystem = 'Android';
    } else if (userAgent.includes('iOS')) {
      operatingSystem = 'iOS';
    }

    return {
      device_type: deviceType,
      browser: browser,
      operating_system: operatingSystem,
      user_agent: userAgent
    };
  }

  async startSession(sessionData) {
    try {
      const response = await fetch('http://localhost:3003/api/analytics/realtime/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      const result = await response.json();
      this.currentPage = sessionData.current_page;
      this.pageStartTime = Date.now();
      
      return result;
    } catch (error) {
      console.error('Start session error:', error);
    }
  }

  startHeartbeat() {
    // Send heartbeat every 5 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.isPageVisible && this.isTracking) {
        this.sendHeartbeat();
      }
    }, 5000);
  }

  async sendHeartbeat() {
    try {
      const timeOnPage = this.pageStartTime ? Math.floor((Date.now() - this.pageStartTime) / 1000) : 0;
      
      const heartbeatData = {
        session_id: this.sessionId,
        current_page: window.location.pathname,
        page_title: document.title,
        time_on_page: timeOnPage,
        scroll_percentage: this.scrollPercentage,
        clicks_count: this.clickCount,
        mouse_movements: this.mouseMovements
      };

      // Use sendBeacon for better reliability
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(heartbeatData)], {
          type: 'application/json'
        });
        navigator.sendBeacon('http://localhost:3003/api/analytics/realtime/heartbeat', blob);
      } else {
        await fetch('http://localhost:3003/api/analytics/realtime/heartbeat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(heartbeatData)
        });
      }
    } catch (error) {
      console.error('Heartbeat error:', error);
    }
  }

  async trackPageChange(newPath, pageTitle) {
    if (!this.isTracking || newPath === this.currentPage) {
      return;
    }

    // Don't track admin pages - check newPath directly
    const isAdminPath = this.isAdminPagePath(newPath);
    
    if (isAdminPath) {
      console.log('Admin sayfasına geçiş - tracking atlanıyor:', newPath);
      return;
    }

    try {
      const timeOnPreviousPage = this.pageStartTime ? Math.floor((Date.now() - this.pageStartTime) / 1000) : 0;
      
      await fetch('http://localhost:3003/api/analytics/realtime/page-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          previous_page: this.currentPage,
          new_page: newPath,
          page_title: pageTitle || document.title,
          time_on_previous_page: timeOnPreviousPage
        })
      });

      // Reset tracking for new page
      this.currentPage = newPath;
      this.pageStartTime = Date.now();
      this.clickCount = 0;
      this.mouseMovements = 0;
      this.scrollPercentage = 0;
    } catch (error) {
      console.error('Page change tracking error:', error);
    }
  }

  async endSession() {
    if (!this.isTracking) {
      return;
    }

    try {
      const timeOnFinalPage = this.pageStartTime ? Math.floor((Date.now() - this.pageStartTime) / 1000) : 0;
      
      const endData = {
        session_id: this.sessionId,
        final_page: this.currentPage,
        time_on_final_page: timeOnFinalPage
      };

      // Use sendBeacon for page unload
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(endData)], {
          type: 'application/json'
        });
        navigator.sendBeacon('http://localhost:3003/api/analytics/realtime/end-session', blob);
      } else {
        await fetch('http://localhost:3003/api/analytics/realtime/end-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(endData)
        });
      }

      // Stop heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }

      this.isTracking = false;
    } catch (error) {
      console.error('End session error:', error);
    }
  }

  setupEventListeners() {
    // Track clicks
    document.addEventListener('click', () => {
      this.clickCount++;
    });

    // Track mouse movements (throttled)
    let mouseMoveTimeout;
    document.addEventListener('mousemove', () => {
      if (!mouseMoveTimeout) {
        mouseMoveTimeout = setTimeout(() => {
          this.mouseMovements++;
          mouseMoveTimeout = null;
        }, 100);
      }
    });

    // Track scroll percentage
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          this.scrollPercentage = Math.round((scrollTop / scrollHeight) * 100) || 0;
          scrollTimeout = null;
        }, 100);
      }
    });

    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      this.isPageVisible = !document.hidden;
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Track page changes (for SPA)
    let currentPath = window.location.pathname;
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        this.trackPageChange(window.location.pathname, document.title);
        currentPath = window.location.pathname;
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Handle popstate for browser navigation
    window.addEventListener('popstate', () => {
      this.trackPageChange(window.location.pathname, document.title);
    });

    // Handle pushstate/replacestate for programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => {
        window.realtimeTracker?.trackPageChange(window.location.pathname, document.title);
      }, 0);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => {
        window.realtimeTracker?.trackPageChange(window.location.pathname, document.title);
      }, 0);
    };
  }

  // Public methods for manual tracking
  static getInstance() {
    if (!window.realtimeTracker) {
      window.realtimeTracker = new RealtimeVisitorTracker();
    }
    return window.realtimeTracker;
  }

  static trackEvent(eventName, eventData = {}) {
    const tracker = this.getInstance();
    if (tracker.isTracking) {
      // Custom event tracking can be added here
      console.log('Custom event tracked:', eventName, eventData);
    }
  }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.realtimeTracker = new RealtimeVisitorTracker();
    });
  } else {
    window.realtimeTracker = new RealtimeVisitorTracker();
  }

  // Make class available globally
  window.RealtimeVisitorTracker = RealtimeVisitorTracker;
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RealtimeVisitorTracker;
}
