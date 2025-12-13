// Helper utility functions
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatPrice = (price) => {
  return `$${price}`;
};

export const calculateDiscount = (price, discountPercentage) => {
  if (!discountPercentage || discountPercentage <= 0) return price;
  return price - (price * discountPercentage / 100);
};

export const formatDate = (dateInput, options = {}) => {
  const { fallbackText = 'N/A', ...formatOptions } = options;
  const resolvedOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...formatOptions
  };

  if (!dateInput) {
    return fallbackText;
  }

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return fallbackText;
  }

  try {
    return new Intl.DateTimeFormat('en-US', resolvedOptions).format(date);
  } catch (error) {
    console.error('formatDate failed', { dateInput, resolvedOptions, error });
    return fallbackText;
  }
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const getRelativeTime = (dateInput) => {
  if (!dateInput) {
    return 'Unknown';
  }

  const now = new Date();
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercentage = (value, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const calculateTax = (subtotal, taxRate = 0.08) => {
  return subtotal * taxRate;
};
