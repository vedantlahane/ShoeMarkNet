// Encryption utility for ShoeMarkNet
// Provides comprehensive data encryption and security utilities

import CryptoJS from 'crypto-js';

// Configuration
const ENCRYPTION_CONFIG = {
  ALGORITHM: 'AES',
  KEY_SIZE: 256,
  IV_SIZE: 16,
  ITERATIONS: 10000,
  SALT_SIZE: 32,
  SECRET_KEY: process.env.REACT_APP_ENCRYPTION_KEY || 'your-secret-key-here-change-in-production',
  
  // Feature flags
  ENABLE_ENCRYPTION: process.env.REACT_APP_ENABLE_ENCRYPTION !== 'false',
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  
  // Security settings
  USE_PBKDF2: true,
  USE_RANDOM_IV: true,
  CLEAR_MEMORY: true
};

/**
 * Generate a random salt
 * @param {number} length - Length of the salt
 * @returns {string} Random salt
 */
const generateSalt = (length = ENCRYPTION_CONFIG.SALT_SIZE) => {
  return CryptoJS.lib.WordArray.random(length).toString();
};

/**
 * Generate a random IV (Initialization Vector)
 * @param {number} length - Length of the IV
 * @returns {string} Random IV
 */
const generateIV = (length = ENCRYPTION_CONFIG.IV_SIZE) => {
  return CryptoJS.lib.WordArray.random(length).toString();
};

/**
 * Derive encryption key from password using PBKDF2
 * @param {string} password - Password to derive key from
 * @param {string} salt - Salt for key derivation
 * @param {number} iterations - Number of iterations
 * @returns {string} Derived key
 */
const deriveKey = (password, salt, iterations = ENCRYPTION_CONFIG.ITERATIONS) => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: ENCRYPTION_CONFIG.KEY_SIZE / 32,
    iterations: iterations
  }).toString();
};

/**
 * Enhanced AES encryption with multiple security layers
 * @param {string} plaintext - Text to encrypt
 * @param {string} password - Password for encryption
 * @param {Object} options - Encryption options
 * @returns {Object} Encrypted data with metadata
 */
export const encryptData = (plaintext, password = ENCRYPTION_CONFIG.SECRET_KEY, options = {}) => {
  try {
    if (!ENCRYPTION_CONFIG.ENABLE_ENCRYPTION) {
      console.warn('Encryption is disabled. Data will be stored in plain text.');
      return {
        encrypted: plaintext,
        metadata: {
          encrypted: false,
          timestamp: new Date().toISOString()
        }
      };
    }

    if (!plaintext) {
      throw new Error('Plaintext is required for encryption');
    }

    const {
      useSalt = ENCRYPTION_CONFIG.USE_PBKDF2,
      useRandomIV = ENCRYPTION_CONFIG.USE_RANDOM_IV,
      iterations = ENCRYPTION_CONFIG.ITERATIONS
    } = options;

    // Generate salt and IV
    const salt = useSalt ? generateSalt() : '';
    const iv = useRandomIV ? generateIV() : '';
    
    // Derive encryption key
    const key = useSalt ? deriveKey(password, salt, iterations) : password;
    
    // Encrypt the data
    const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString();

    const result = {
      encrypted,
      metadata: {
        salt: useSalt ? salt : null,
        iv: useRandomIV ? iv : null,
        algorithm: ENCRYPTION_CONFIG.ALGORITHM,
        keySize: ENCRYPTION_CONFIG.KEY_SIZE,
        iterations: useSalt ? iterations : null,
        encrypted: true,
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    };

    if (ENCRYPTION_CONFIG.DEBUG_MODE) {
      console.log('Encryption successful:', {
        originalLength: plaintext.length,
        encryptedLength: encrypted.length,
        usedSalt: useSalt,
        usedIV: useRandomIV
      });
    }

    return result;

  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Enhanced AES decryption
 * @param {Object} encryptedData - Encrypted data object
 * @param {string} password - Password for decryption
 * @returns {string} Decrypted plaintext
 */
export const decryptData = (encryptedData, password = ENCRYPTION_CONFIG.SECRET_KEY) => {
  try {
    if (!encryptedData) {
      throw new Error('Encrypted data is required for decryption');
    }

    // Handle plain text data (when encryption is disabled)
    if (typeof encryptedData === 'string') {
      return encryptedData;
    }

    if (!encryptedData.metadata?.encrypted) {
      return encryptedData.encrypted || encryptedData;
    }

    const { encrypted, metadata } = encryptedData;
    const { salt, iv, iterations } = metadata;

    // Derive decryption key
    const key = salt ? deriveKey(password, salt, iterations) : password;
    
    // Decrypt the data
    const decryptedBytes = CryptoJS.AES.decrypt(encrypted, key, {
      iv: iv ? CryptoJS.enc.Hex.parse(iv) : undefined,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      throw new Error('Decryption failed - invalid password or corrupted data');
    }

    if (ENCRYPTION_CONFIG.DEBUG_MODE) {
      console.log('Decryption successful:', {
        encryptedLength: encrypted.length,
        decryptedLength: decrypted.length
      });
    }

    return decrypted;

  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

/**
 * Encrypt sensitive data specifically for payments
 * @param {Object} sensitiveData - Sensitive data to encrypt
 * @returns {Object} Encrypted sensitive data
 */
export const encryptSensitiveData = (sensitiveData) => {
  try {
    if (!sensitiveData || typeof sensitiveData !== 'object') {
      throw new Error('Invalid sensitive data provided');
    }

    const encryptedData = {};
    
    // Define which fields should be encrypted
    const sensitiveFields = [
      'cardNumber',
      'cvv',
      'expiryDate',
      'cardholderName',
      'bankAccount',
      'routingNumber',
      'ssn',
      'pin'
    ];

    // Encrypt sensitive fields
    Object.keys(sensitiveData).forEach(key => {
      const value = sensitiveData[key];
      
      if (sensitiveFields.includes(key) && value) {
        // Use enhanced encryption for sensitive fields
        encryptedData[key] = encryptData(String(value), ENCRYPTION_CONFIG.SECRET_KEY, {
          useSalt: true,
          useRandomIV: true,
          iterations: ENCRYPTION_CONFIG.ITERATIONS * 2 // Double iterations for extra security
        });
      } else {
        // Keep non-sensitive data as-is
        encryptedData[key] = value;
      }
    });

    // Add encryption metadata
    encryptedData._encryption = {
      encrypted: true,
      algorithm: ENCRYPTION_CONFIG.ALGORITHM,
      timestamp: new Date().toISOString(),
      fields: sensitiveFields.filter(field => sensitiveData[field])
    };

    return encryptedData;

  } catch (error) {
    console.error('Sensitive data encryption failed:', error);
    throw new Error(`Failed to encrypt sensitive data: ${error.message}`);
  }
};

/**
 * Decrypt sensitive data
 * @param {Object} encryptedSensitiveData - Encrypted sensitive data
 * @returns {Object} Decrypted sensitive data
 */
export const decryptSensitiveData = (encryptedSensitiveData) => {
  try {
    if (!encryptedSensitiveData || typeof encryptedSensitiveData !== 'object') {
      throw new Error('Invalid encrypted sensitive data provided');
    }

    const decryptedData = {};
    const encryptionMeta = encryptedSensitiveData._encryption;

    if (!encryptionMeta?.encrypted) {
      // Data is not encrypted, return as-is
      return { ...encryptedSensitiveData };
    }

    const encryptedFields = encryptionMeta.fields || [];

    // Decrypt each field
    Object.keys(encryptedSensitiveData).forEach(key => {
      if (key === '_encryption') return; // Skip metadata
      
      const value = encryptedSensitiveData[key];
      
      if (encryptedFields.includes(key) && value) {
        decryptedData[key] = decryptData(value, ENCRYPTION_CONFIG.SECRET_KEY);
      } else {
        decryptedData[key] = value;
      }
    });

    return decryptedData;

  } catch (error) {
    console.error('Sensitive data decryption failed:', error);
    throw new Error(`Failed to decrypt sensitive data: ${error.message}`);
  }
};

/**
 * Generate secure hash for data integrity
 * @param {string} data - Data to hash
 * @param {string} algorithm - Hash algorithm (SHA256, SHA512, etc.)
 * @returns {string} Hash string
 */
export const generateHash = (data, algorithm = 'SHA256') => {
  try {
    if (!data) {
      throw new Error('Data is required for hashing');
    }

    let hash;
    switch (algorithm.toUpperCase()) {
      case 'SHA256':
        hash = CryptoJS.SHA256(data);
        break;
      case 'SHA512':
        hash = CryptoJS.SHA512(data);
        break;
      case 'SHA1':
        hash = CryptoJS.SHA1(data);
        break;
      case 'MD5':
        hash = CryptoJS.MD5(data);
        break;
      default:
        throw new Error(`Unsupported hash algorithm: ${algorithm}`);
    }

    return hash.toString();

  } catch (error) {
    console.error('Hash generation failed:', error);
    throw new Error(`Hash generation failed: ${error.message}`);
  }
};

/**
 * Verify data integrity using hash
 * @param {string} data - Original data
 * @param {string} hash - Hash to verify against
 * @param {string} algorithm - Hash algorithm used
 * @returns {boolean} True if hash matches
 */
export const verifyHash = (data, hash, algorithm = 'SHA256') => {
  try {
    const generatedHash = generateHash(data, algorithm);
    return generatedHash === hash;
  } catch (error) {
    console.error('Hash verification failed:', error);
    return false;
  }
};

/**
 * Generate secure random token
 * @param {number} length - Length of the token
 * @param {string} charset - Character set to use
 * @returns {string} Secure random token
 */
export const generateSecureToken = (length = 32, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  try {
    const randomWords = CryptoJS.lib.WordArray.random(length);
    const randomBytes = randomWords.toString(CryptoJS.enc.Hex);
    
    let token = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = parseInt(randomBytes.substr(i * 2, 2), 16) % charset.length;
      token += charset[randomIndex];
    }
    
    return token;
  } catch (error) {
    console.error('Secure token generation failed:', error);
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

/**
 * Encrypt data for localStorage with expiration
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 * @param {number} expirationHours - Hours until expiration
 */
export const encryptForStorage = (key, data, expirationHours = 24) => {
  try {
    const storageData = {
      data,
      timestamp: Date.now(),
      expiration: Date.now() + (expirationHours * 60 * 60 * 1000)
    };

    const encrypted = encryptData(JSON.stringify(storageData));
    localStorage.setItem(key, JSON.stringify(encrypted));

  } catch (error) {
    console.error('Storage encryption failed:', error);
    throw new Error(`Failed to encrypt data for storage: ${error.message}`);
  }
};

/**
 * Decrypt data from localStorage with expiration check
 * @param {string} key - Storage key
 * @returns {any} Decrypted data or null if expired/invalid
 */
export const decryptFromStorage = (key) => {
  try {
    const storedData = localStorage.getItem(key);
    if (!storedData) return null;

    const encryptedData = JSON.parse(storedData);
    const decryptedString = decryptData(encryptedData);
    const storageData = JSON.parse(decryptedString);

    // Check expiration
    if (Date.now() > storageData.expiration) {
      localStorage.removeItem(key);
      return null;
    }

    return storageData.data;

  } catch (error) {
    console.error('Storage decryption failed:', error);
    localStorage.removeItem(key); // Remove corrupted data
    return null;
  }
};

/**
 * Securely clear sensitive data from memory
 * @param {Object} obj - Object containing sensitive data
 */
export const clearSensitiveData = (obj) => {
  if (!ENCRYPTION_CONFIG.CLEAR_MEMORY) return;

  try {
    if (obj && typeof obj === 'object') {
      const sensitiveFields = [
        'cardNumber', 'cvv', 'expiryDate', 'cardholderName',
        'password', 'pin', 'ssn', 'bankAccount', 'routingNumber'
      ];

      Object.keys(obj).forEach(key => {
        if (sensitiveFields.includes(key)) {
          obj[key] = null;
          delete obj[key];
        }
      });
    }
  } catch (error) {
    console.warn('Failed to clear sensitive data:', error);
  }
};

/**
 * Mask sensitive data for display
 * @param {string} data - Sensitive data to mask
 * @param {string} type - Type of data (card, ssn, phone, etc.)
 * @returns {string} Masked data
 */
export const maskSensitiveData = (data, type = 'default') => {
  if (!data) return '';

  try {
    const str = String(data);
    
    switch (type.toLowerCase()) {
      case 'card':
      case 'cardnumber':
        // Show last 4 digits: **** **** **** 1234
        return str.length > 4 
          ? '**** **** **** ' + str.slice(-4)
          : str.replace(/./g, '*');
      
      case 'cvv':
        return str.replace(/./g, '*');
      
      case 'ssn':
        // Show last 4 digits: ***-**-1234
        return str.length > 4 
          ? '***-**-' + str.slice(-4)
          : str.replace(/./g, '*');
      
      case 'phone':
        // Show last 4 digits: (***) ***-1234
        return str.length > 4 
          ? '(***) ***-' + str.slice(-4)
          : str.replace(/./g, '*');
      
      case 'email':
        const emailParts = str.split('@');
        if (emailParts.length === 2) {
          const [username, domain] = emailParts;
          const maskedUsername = username.length > 2 
            ? username[0] + '*'.repeat(username.length - 2) + username.slice(-1)
            : username.replace(/./g, '*');
          return maskedUsername + '@' + domain;
        }
        return str.replace(/./g, '*');
      
      case 'name':
        // Show first and last character
        return str.length > 2 
          ? str[0] + '*'.repeat(str.length - 2) + str.slice(-1)
          : str.replace(/./g, '*');
      
      default:
        // Mask all but first and last character
        return str.length > 2 
          ? str[0] + '*'.repeat(str.length - 2) + str.slice(-1)
          : str.replace(/./g, '*');
    }
  } catch (error) {
    console.error('Data masking failed:', error);
    return String(data).replace(/./g, '*');
  }
};

/**
 * Validate encryption configuration
 * @returns {Object} Validation result
 */
export const validateEncryptionConfig = () => {
  const issues = [];
  
  if (ENCRYPTION_CONFIG.SECRET_KEY === 'your-secret-key-here-change-in-production') {
    issues.push('Using default encryption key - change in production');
  }
  
  if (ENCRYPTION_CONFIG.SECRET_KEY.length < 32) {
    issues.push('Encryption key should be at least 32 characters long');
  }
  
  if (!ENCRYPTION_CONFIG.ENABLE_ENCRYPTION && process.env.NODE_ENV === 'production') {
    issues.push('Encryption is disabled in production environment');
  }

  return {
    isValid: issues.length === 0,
    issues,
    config: {
      encryptionEnabled: ENCRYPTION_CONFIG.ENABLE_ENCRYPTION,
      algorithm: ENCRYPTION_CONFIG.ALGORITHM,
      keySize: ENCRYPTION_CONFIG.KEY_SIZE,
      environment: process.env.NODE_ENV
    }
  };
};

// Export utility functions
export default {
  encryptData,
  decryptData,
  encryptSensitiveData,
  decryptSensitiveData,
  generateHash,
  verifyHash,
  generateSecureToken,
  encryptForStorage,
  decryptFromStorage,
  clearSensitiveData,
  maskSensitiveData,
  validateEncryptionConfig
};
