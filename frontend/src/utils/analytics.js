// Analytics utility functions
export const trackEvent = (eventName, parameters = {}) => {
  // Google Analytics 4 tracking
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      timestamp: new Date().toISOString()
    });
  }

  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', eventName, parameters);
  }
};

export const trackPageView = (pageName, pageTitle) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
      page_title: pageTitle,
      page_location: window.location.href
    });
  }
};

export const trackUserAction = (action, category = 'User', label = '') => {
  trackEvent('user_action', {
    action,
    category,
    label
  });
};
