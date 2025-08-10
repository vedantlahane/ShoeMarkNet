// Analytics utility for ShoeMarkNet
// Provides comprehensive event tracking and user behavior analytics

// Third-party analytics services
import ReactGA from 'react-ga4';
import { hotjar } from 'react-hotjar';
import mixpanel from 'mixpanel-browser';

// Configuration
const ANALYTICS_CONFIG = {
  // Google Analytics 4
  GA4_MEASUREMENT_ID: process.env.REACT_APP_GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX',
  
  // Mixpanel
  MIXPANEL_TOKEN: process.env.REACT_APP_MIXPANEL_TOKEN || 'your_mixpanel_token',
  
  // Hotjar
  HOTJAR_ID: process.env.REACT_APP_HOTJAR_ID || 'your_hotjar_id',
  HOTJAR_VERSION: 6,
  
  // Custom analytics endpoint
  CUSTOM_ANALYTICS_ENDPOINT: process.env.REACT_APP_ANALYTICS_ENDPOINT || '/api/analytics',
  
  // Feature flags
  ENABLE_GA4: process.env.REACT_APP_ENABLE_GA4 !== 'false',
  ENABLE_MIXPANEL: process.env.REACT_APP_ENABLE_MIXPANEL !== 'false',
  ENABLE_HOTJAR: process.env.REACT_APP_ENABLE_HOTJAR !== 'false',
  ENABLE_CUSTOM_ANALYTICS: process.env.REACT_APP_ENABLE_CUSTOM_ANALYTICS !== 'false',
  ENABLE_DEBUG: process.env.NODE_ENV === 'development',
  
  // Privacy settings
  RESPECT_DO_NOT_TRACK: true,
  GDPR_COMPLIANT: true,
  COOKIE_CONSENT_REQUIRED: true
};

// Analytics instance
class Analytics {
  constructor() {
    this.initialized = false;
    this.debugMode = ANALYTICS_CONFIG.ENABLE_DEBUG;
    this.queue = [];
    this.userProperties = {};
    this.sessionId = this.generateSessionId();
    this.deviceId = this.getOrCreateDeviceId();
    this.consentGiven = false;
    
    // Check privacy settings
    this.respectPrivacy = this.shouldRespectPrivacy();
    
    if (!this.respectPrivacy) {
      this.init();
    }
  }

  // Initialize analytics services
  async init() {
    if (this.initialized) return;

    try {
      // Initialize Google Analytics 4
      if (ANALYTICS_CONFIG.ENABLE_GA4 && ANALYTICS_CONFIG.GA4_MEASUREMENT_ID) {
        ReactGA.initialize(ANALYTICS_CONFIG.GA4_MEASUREMENT_ID, {
          debug: this.debugMode,
          testMode: this.debugMode,
          gtagOptions: {
            anonymize_ip: true,
            cookie_expires: 63072000, // 2 years
            cookie_update: true,
            cookie_flags: 'SameSite=None;Secure'
          }
        });
        
        if (this.debugMode) {
          console.log('📊 Google Analytics 4 initialized');
        }
      }

      // Initialize Mixpanel
      if (ANALYTICS_CONFIG.ENABLE_MIXPANEL && ANALYTICS_CONFIG.MIXPANEL_TOKEN) {
        mixpanel.init(ANALYTICS_CONFIG.MIXPANEL_TOKEN, {
          debug: this.debugMode,
          track_pageview: false, // We'll handle this manually
          persistence: 'localStorage',
          secure_cookie: true,
          ip: false, // Don't track IP for privacy
          ignore_dnt: false // Respect Do Not Track
        });
        
        if (this.debugMode) {
          console.log('📊 Mixpanel initialized');
        }
      }

      // Initialize Hotjar
      if (ANALYTICS_CONFIG.ENABLE_HOTJAR && ANALYTICS_CONFIG.HOTJAR_ID) {
        hotjar.initialize(
          parseInt(ANALYTICS_CONFIG.HOTJAR_ID), 
          ANALYTICS_CONFIG.HOTJAR_VERSION
        );
        
        if (this.debugMode) {
          console.log('📊 Hotjar initialized');
        }
      }

      this.initialized = true;
      
      // Process queued events
      this.processQueue();
      
      if (this.debugMode) {
        console.log('📊 Analytics system fully initialized');
      }

    } catch (error) {
      console.error('❌ Analytics initialization failed:', error);
    }
  }

  // Check if we should respect privacy settings
  shouldRespectPrivacy() {
    // Check Do Not Track header
    if (ANALYTICS_CONFIG.RESPECT_DO_NOT_TRACK && navigator.doNotTrack === '1') {
      return true;
    }

    // Check GDPR consent (you can implement your own consent logic)
    if (ANALYTICS_CONFIG.GDPR_COMPLIANT && !this.hasValidConsent()) {
      return true;
    }

    return false;
  }

  // Check for valid user consent
  hasValidConsent() {
    // Implement your consent logic here
    // This could check localStorage, cookies, or a consent management platform
    const consent = localStorage.getItem('analytics_consent');
    return consent === 'true';
  }

  // Grant consent and initialize analytics
  grantConsent() {
    this.consentGiven = true;
    this.respectPrivacy = false;
    localStorage.setItem('analytics_consent', 'true');
    
    if (!this.initialized) {
      this.init();
    }
  }

  // Revoke consent and disable tracking
  revokeConsent() {
    this.consentGiven = false;
    this.respectPrivacy = true;
    localStorage.removeItem('analytics_consent');
    
    // Clear any existing data
    this.clearUserData();
  }

  // Generate unique session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get or create device ID
  getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  // Process queued events
  processQueue() {
    while (this.queue.length > 0) {
      const { method, args } = this.queue.shift();
      this[method](...args);
    }
  }

  // Queue events if not initialized
  queueEvent(method, ...args) {
    if (!this.initialized && !this.respectPrivacy) {
      this.queue.push({ method, args });
      return;
    }
    
    if (this.respectPrivacy) {
      if (this.debugMode) {
        console.log('🔒 Analytics event blocked due to privacy settings:', method, args);
      }
      return;
    }
    
    return this[method](...args);
  }

  // Enhanced page tracking
  page(pageName, properties = {}) {
    if (this.respectPrivacy) return;

    const pageData = {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_search: window.location.search,
      session_id: this.sessionId,
      device_id: this.deviceId,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      ...properties
    };

    // Google Analytics 4
    if (ANALYTICS_CONFIG.ENABLE_GA4) {
      ReactGA.send({
        hitType: 'pageview',
        page: pageData.page_path,
        title: pageData.page_title,
        custom_map: {
          session_id: pageData.session_id
        }
      });
    }

    // Mixpanel
    if (ANALYTICS_CONFIG.ENABLE_MIXPANEL) {
      mixpanel.track('Page View', pageData);
    }

    // Custom analytics
    if (ANALYTICS_CONFIG.ENABLE_CUSTOM_ANALYTICS) {
      this.sendCustomEvent('page_view', pageData);
    }

    if (this.debugMode) {
      console.log('📄 Page tracked:', pageName || pageData.page_path, pageData);
    }
  }

  // Enhanced event tracking
  trackEvent(eventName, properties = {}) {
    if (this.respectPrivacy) {
      if (!this.initialized) {
        return this.queueEvent('trackEvent', eventName, properties);
      }
      return;
    }

    const eventData = {
      event_name: eventName,
      session_id: this.sessionId,
      device_id: this.deviceId,
      timestamp: new Date().toISOString(),
      page_path: window.location.pathname,
      user_agent: navigator.userAgent,
      ...this.userProperties,
      ...properties
    };

    // Google Analytics 4
    if (ANALYTICS_CONFIG.ENABLE_GA4) {
      ReactGA.event({
        category: properties.category || 'General',
        action: eventName,
        label: properties.label,
        value: properties.value,
        custom_parameters: eventData
      });
    }

    // Mixpanel
    if (ANALYTICS_CONFIG.ENABLE_MIXPANEL) {
      mixpanel.track(eventName, eventData);
    }

    // Custom analytics
    if (ANALYTICS_CONFIG.ENABLE_CUSTOM_ANALYTICS) {
      this.sendCustomEvent('custom_event', eventData);
    }

    if (this.debugMode) {
      console.log('🎯 Event tracked:', eventName, eventData);
    }
  }

  // Enhanced user identification
  identify(userId, traits = {}) {
    if (this.respectPrivacy) {
      if (!this.initialized) {
        return this.queueEvent('identify', userId, traits);
      }
      return;
    }

    const userData = {
      user_id: userId,
      session_id: this.sessionId,
      device_id: this.deviceId,
      identified_at: new Date().toISOString(),
      ...traits
    };

    // Store user properties
    this.userProperties = { ...this.userProperties, ...userData };

    // Google Analytics 4
    if (ANALYTICS_CONFIG.ENABLE_GA4) {
      ReactGA.set({ user_id: userId });
      ReactGA.gtag('config', ANALYTICS_CONFIG.GA4_MEASUREMENT_ID, {
        user_id: userId,
        custom_map: userData
      });
    }

    // Mixpanel
    if (ANALYTICS_CONFIG.ENABLE_MIXPANEL) {
      mixpanel.identify(userId);
      mixpanel.people.set(userData);
    }

    // Custom analytics
    if (ANALYTICS_CONFIG.ENABLE_CUSTOM_ANALYTICS) {
      this.sendCustomEvent('user_identified', userData);
    }

    if (this.debugMode) {
      console.log('👤 User identified:', userId, userData);
    }
  }

  // E-commerce tracking
  trackPurchase(transactionData) {
    if (this.respectPrivacy) return;

    const purchaseData = {
      transaction_id: transactionData.transaction_id,
      affiliation: 'ShoeMarkNet',
      value: transactionData.value,
      currency: transactionData.currency || 'USD',
      items: transactionData.items || [],
      session_id: this.sessionId,
      device_id: this.deviceId,
      timestamp: new Date().toISOString(),
      ...transactionData
    };

    // Google Analytics 4 Enhanced Ecommerce
    if (ANALYTICS_CONFIG.ENABLE_GA4) {
      ReactGA.event('purchase', {
        transaction_id: purchaseData.transaction_id,
        value: purchaseData.value,
        currency: purchaseData.currency,
        items: purchaseData.items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          category: item.category,
          quantity: item.quantity,
          price: item.price
        }))
      });
    }

    // Mixpanel
    if (ANALYTICS_CONFIG.ENABLE_MIXPANEL) {
      mixpanel.track('Purchase', purchaseData);
      
      // Track revenue
      mixpanel.people.track_charge(purchaseData.value, {
        transaction_id: purchaseData.transaction_id,
        currency: purchaseData.currency
      });
    }

    // Custom analytics
    if (ANALYTICS_CONFIG.ENABLE_CUSTOM_ANALYTICS) {
      this.sendCustomEvent('purchase', purchaseData);
    }

    if (this.debugMode) {
      console.log('💰 Purchase tracked:', purchaseData);
    }
  }

  // Enhanced error tracking
  trackError(error, additionalContext = {}) {
    const errorData = {
      error_message: error.message || 'Unknown error',
      error_stack: error.stack,
      error_type: error.name || 'Error',
      page_path: window.location.pathname,
      user_agent: navigator.userAgent,
      session_id: this.sessionId,
      device_id: this.deviceId,
      timestamp: new Date().toISOString(),
      ...additionalContext
    };

    // Google Analytics 4
    if (ANALYTICS_CONFIG.ENABLE_GA4) {
      ReactGA.event('exception', {
        description: errorData.error_message,
        fatal: additionalContext.fatal || false,
        custom_parameters: errorData
      });
    }

    // Mixpanel
    if (ANALYTICS_CONFIG.ENABLE_MIXPANEL) {
      mixpanel.track('Error', errorData);
    }

    // Custom analytics
    if (ANALYTICS_CONFIG.ENABLE_CUSTOM_ANALYTICS) {
      this.sendCustomEvent('error', errorData);
    }

    if (this.debugMode) {
      console.log('❌ Error tracked:', errorData);
    }
  }

  // Performance tracking
  trackPerformance(metricName, value, additionalData = {}) {
    const performanceData = {
      metric_name: metricName,
      metric_value: value,
      page_path: window.location.pathname,
      session_id: this.sessionId,
      device_id: this.deviceId,
      timestamp: new Date().toISOString(),
      ...additionalData
    };

    // Google Analytics 4
    if (ANALYTICS_CONFIG.ENABLE_GA4) {
      ReactGA.event('timing_complete', {
        name: metricName,
        value: Math.round(value),
        custom_parameters: performanceData
      });
    }

    // Mixpanel
    if (ANALYTICS_CONFIG.ENABLE_MIXPANEL) {
      mixpanel.track('Performance Metric', performanceData);
    }

    // Custom analytics
    if (ANALYTICS_CONFIG.ENABLE_CUSTOM_ANALYTICS) {
      this.sendCustomEvent('performance', performanceData);
    }

    if (this.debugMode) {
      console.log('⚡ Performance tracked:', metricName, value);
    }
  }

  // Form interaction tracking
  trackFormInteraction(formName, action, fieldName = null, additionalData = {}) {
    const formData = {
      form_name: formName,
      form_action: action, // 'start', 'submit', 'abandon', 'field_focus', 'field_blur'
      field_name: fieldName,
      page_path: window.location.pathname,
      session_id: this.sessionId,
      device_id: this.deviceId,
      timestamp: new Date().toISOString(),
      ...additionalData
    };

    this.trackEvent('Form Interaction', formData);
  }

  // Search tracking
  trackSearch(searchTerm, results = null, filters = {}) {
    const searchData = {
      search_term: searchTerm,
      search_results_count: results,
      search_filters: filters,
      page_path: window.location.pathname,
      session_id: this.sessionId,
      device_id: this.deviceId,
      timestamp: new Date().toISOString()
    };

    this.trackEvent('Search', searchData);
  }

  // Send custom analytics events
  async sendCustomEvent(eventType, data) {
    if (!ANALYTICS_CONFIG.ENABLE_CUSTOM_ANALYTICS) return;

    try {
      await fetch(ANALYTICS_CONFIG.CUSTOM_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: eventType,
          data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      if (this.debugMode) {
        console.error('Failed to send custom analytics event:', error);
      }
    }
  }

  // Clear user data (for privacy compliance)
  clearUserData() {
    this.userProperties = {};
    
    // Clear Mixpanel data
    if (ANALYTICS_CONFIG.ENABLE_MIXPANEL) {
      mixpanel.reset();
    }

    // Clear local storage analytics data
    localStorage.removeItem('device_id');
    localStorage.removeItem('analytics_consent');

    if (this.debugMode) {
      console.log('🧹 Analytics user data cleared');
    }
  }

  // Get session information
  getSessionInfo() {
    return {
      session_id: this.sessionId,
      device_id: this.deviceId,
      user_properties: this.userProperties,
      consent_given: this.consentGiven,
      initialized: this.initialized
    };
  }

  // Debug methods
  enableDebug() {
    this.debugMode = true;
    console.log('🐛 Analytics debug mode enabled');
  }

  disableDebug() {
    this.debugMode = false;
  }

  // Get analytics status
  getStatus() {
    return {
      initialized: this.initialized,
      respectPrivacy: this.respectPrivacy,
      consentGiven: this.consentGiven,
      debugMode: this.debugMode,
      services: {
        ga4: ANALYTICS_CONFIG.ENABLE_GA4,
        mixpanel: ANALYTICS_CONFIG.ENABLE_MIXPANEL,
        hotjar: ANALYTICS_CONFIG.ENABLE_HOTJAR,
        custom: ANALYTICS_CONFIG.ENABLE_CUSTOM_ANALYTICS
      }
    };
  }
}

// Create singleton instance
const analytics = new Analytics();

// Convenience methods for common tracking patterns
export const trackEvent = (eventName, properties) => analytics.trackEvent(eventName, properties);
export const trackPage = (pageName, properties) => analytics.page(pageName, properties);
export const identifyUser = (userId, traits) => analytics.identify(userId, traits);
export const trackPurchase = (transactionData) => analytics.trackPurchase(transactionData);
export const trackError = (error, context) => analytics.trackError(error, context);
export const trackPerformance = (metricName, value, data) => analytics.trackPerformance(metricName, value, data);
export const trackFormInteraction = (formName, action, fieldName, data) => analytics.trackFormInteraction(formName, action, fieldName, data);
export const trackSearch = (searchTerm, results, filters) => analytics.trackSearch(searchTerm, results, filters);

// Privacy and consent methods
export const grantConsent = () => analytics.grantConsent();
export const revokeConsent = () => analytics.revokeConsent();
export const clearUserData = () => analytics.clearUserData();

// Utility methods
export const getSessionInfo = () => analytics.getSessionInfo();
export const getAnalyticsStatus = () => analytics.getStatus();
export const enableDebug = () => analytics.enableDebug();
export const disableDebug = () => analytics.disableDebug();

// Export the main analytics instance
export default analytics;
