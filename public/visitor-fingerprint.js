// Client-side Visitor Fingerprinting Utility
// Bu kod frontend'de kullanılacak

class VisitorFingerprint {
  static async generate() {
    const fingerprint = {
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      language: navigator.language,
      userAgent: navigator.userAgent,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
      touchSupport: 'ontouchstart' in window,
      sessionStorage: typeof sessionStorage !== 'undefined',
      localStorage: typeof localStorage !== 'undefined',
      indexedDB: typeof indexedDB !== 'undefined',
      webGL: this.getWebGLInfo(),
      canvas: this.getCanvasFingerprint(),
      fonts: await this.getFontList(),
      audioContext: this.getAudioFingerprint()
    };

    return fingerprint;
  }

  static getWebGLInfo() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return null;

      return {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
      };
    } catch (e) {
      return null;
    }
  }

  static getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Draw text with various fonts and colors
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Visitor Fingerprint 🔍', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Visitor Fingerprint 🔍', 4, 17);

      return canvas.toDataURL();
    } catch (e) {
      return null;
    }
  }

  static async getFontList() {
    if (!('fonts' in document)) return [];
    
    try {
      const fontList = [];
      const fonts = ['Arial', 'Times', 'Courier', 'Helvetica', 'Georgia', 'Verdana', 'Times New Roman'];
      
      for (const font of fonts) {
        if (document.fonts.check(`12px "${font}"`)) {
          fontList.push(font);
        }
      }
      
      return fontList;
    } catch (e) {
      return [];
    }
  }

  static getAudioFingerprint() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.value = 1000;
      gainNode.gain.value = 0;
      
      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      
      oscillator.stop();
      audioContext.close();
      
      return Array.from(dataArray).slice(0, 30).join(',');
    } catch (e) {
      return null;
    }
  }

  // Generate a unique session ID
  static generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `session_${random}_${timestamp}`;
  }

  // Check if visitor has returned (using localStorage)
  static checkReturnVisitor() {
    try {
      const lastVisit = localStorage.getItem('akaydin_last_visit');
      const visitorId = localStorage.getItem('akaydin_visitor_id');
      
      if (!visitorId) {
        // First time visitor
        const newVisitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substring(2);
        localStorage.setItem('akaydin_visitor_id', newVisitorId);
        localStorage.setItem('akaydin_last_visit', Date.now().toString());
        return { isReturning: false, visitorId: newVisitorId, lastVisit: null };
      } else {
        // Returning visitor
        const lastVisitTime = lastVisit ? parseInt(lastVisit) : null;
        localStorage.setItem('akaydin_last_visit', Date.now().toString());
        return { isReturning: true, visitorId, lastVisit: lastVisitTime };
      }
    } catch (e) {
      // localStorage not available
      return { isReturning: false, visitorId: null, lastVisit: null };
    }
  }

  // Initialize visitor tracking
  static async initVisitorTracking() {
    try {
      const fingerprint = await this.generate();
      const sessionId = this.generateSessionId();
      const returnVisitorInfo = this.checkReturnVisitor();
      
      // Send to analytics API
      const response = await fetch('/api/analytics/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_agent: navigator.userAgent,
          device_type: this.getDeviceType(),
          browser: this.getBrowserName(),
          operating_system: this.getOperatingSystem(),
          referrer: document.referrer,
          screenResolution: fingerprint.screenResolution,
          timezone: fingerprint.timezone,
          platform: fingerprint.platform,
          cookieEnabled: fingerprint.cookieEnabled,
          language: fingerprint.language,
          // Add UTM parameters if available
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign')
        })
      });

      const result = await response.json();
      
      // Store session info
      sessionStorage.setItem('akaydin_session_id', sessionId);
      sessionStorage.setItem('akaydin_fingerprint', JSON.stringify(fingerprint));
      
      return {
        sessionId,
        fingerprint,
        isUniqueVisitor: result.isUniqueVisitor,
        isReturnVisitor: result.isReturnVisitor,
        ...returnVisitorInfo
      };
    } catch (error) {
      console.error('Visitor tracking initialization failed:', error);
      return null;
    }
  }

  static getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  static getBrowserName() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  static getOperatingSystem() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  // Track page view with unique visitor context
  static async trackPageView(pagePath, pageTitle) {
    try {
      const sessionId = sessionStorage.getItem('akaydin_session_id');
      if (!sessionId) return;

      await fetch('/api/analytics/page-views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          page_path: pagePath,
          page_title: pageTitle,
          referrer: document.referrer
        })
      });
    } catch (error) {
      console.error('Page view tracking failed:', error);
    }
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisitorFingerprint;
}

// Auto-initialize when script loads (optional)
if (typeof window !== 'undefined') {
  window.VisitorFingerprint = VisitorFingerprint;
  
  // Auto-track page view on load
  document.addEventListener('DOMContentLoaded', async () => {
    await VisitorFingerprint.initVisitorTracking();
    await VisitorFingerprint.trackPageView(window.location.pathname, document.title);
  });
}
