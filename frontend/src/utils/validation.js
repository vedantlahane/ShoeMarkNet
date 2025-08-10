export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true, message: '' };
};

export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  
  return { isValid: true, message: '' };
};
export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, message: 'Name must not exceed 50 characters' };
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
    return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { isValid: true, message: '' };
};

export const validatePhone = (phone) => {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10) {
    return { isValid: false, message: 'Phone number must be at least 10 digits' };
  }
  
  if (cleanPhone.length > 15) {
    return { isValid: false, message: 'Phone number must not exceed 15 digits' };
  }
  
  // Basic phone format validation
  const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, message: 'Please enter a valid phone number' };
  }
  
  return { isValid: true, message: '' };
};

// Remove duplicate export - these functions are already defined in this file
