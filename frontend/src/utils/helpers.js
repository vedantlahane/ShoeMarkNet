// Utility functions for the application

// Currency formatting
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Price formatting (simpler version)
export const formatPrice = (price) => {
  return `$${parseFloat(price).toFixed(2)}`;
};

// Number formatting
export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

// Percentage formatting
export const formatPercentage = (value, decimals = 1) => {
  return `${parseFloat(value).toFixed(decimals)}%`;
};

// Date formatting
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

// Relative time formatting
export const getRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now - targetDate;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

// Calculate discount
export const calculateDiscount = (originalPrice, discountPercentage) => {
  return originalPrice * (1 - discountPercentage / 100);
};

// Generate slug from text
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Check if user is online
export const isOnline = () => {
  return navigator.onLine;
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};
