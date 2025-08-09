const bcrypt = require('bcrypt');

// Extended user test data with all fields from User model
const testUsers = [
  {
    name: "Vedant Lahane",
    email: "vedant@example.com",
    phone: "+91-9876543210",
    password: "password123", // Will be hashed
    source: "web",
    score: 85,
    profilePic: "https://example.com/profiles/vedant.jpg",
    role: "user",
    isActive: true,
    isEmailVerified: true,
    emailVerificationToken: null,
    lastLogin: new Date(),
    resetPasswordToken: null,
    resetPasswordExpire: null,
    preferences: {
      newsletter: true,
      marketing: false
    }
  },
  {
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "+1-555-0123",
    password: "securepass456", // Will be hashed
    source: "social_media",
    score: 67,
    profilePic: "https://example.com/profiles/john.jpg",
    role: "user",
    isActive: true,
    isEmailVerified: false,
    emailVerificationToken: "verification_token_123",
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    resetPasswordToken: null,
    resetPasswordExpire: null,
    preferences: {
      newsletter: false,
      marketing: true
    }
  },
  {
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    phone: "+44-7700-900123",
    password: "alicepass789", // Will be hashed
    source: "email",
    score: 92,
    profilePic: "https://example.com/profiles/alice.jpg",
    role: "user",
    isActive: true,
    isEmailVerified: true,
    emailVerificationToken: null,
    lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    resetPasswordToken: null,
    resetPasswordExpire: null,
    preferences: {
      newsletter: true,
      marketing: true
    }
  },
  {
    name: "Admin User",
    email: "admin@shoemarnet.com",
    phone: "+91-9999999999",
    password: "adminpass123", // Will be hashed
    source: "direct",
    score: 100,
    profilePic: "https://example.com/profiles/admin.jpg",
    role: "admin",
    isActive: true,
    isEmailVerified: true,
    emailVerificationToken: null,
    lastLogin: new Date(),
    resetPasswordToken: null,
    resetPasswordExpire: null,
    preferences: {
      newsletter: true,
      marketing: false
    }
  },
  {
    name: "Bob Wilson",
    email: "bob.wilson@example.com",
    phone: "+1-555-0456",
    password: "bobpass321", // Will be hashed
    source: "referral",
    score: 45,
    profilePic: null,
    role: "user",
    isActive: false,
    isEmailVerified: false,
    emailVerificationToken: "verification_token_456",
    lastLogin: null,
    resetPasswordToken: "reset_token_789",
    resetPasswordExpire: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    preferences: {
      newsletter: false,
      marketing: false
    }
  },
  {
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    phone: "+86-138-0013-8000",
    password: "sarahpass456",
    source: "instagram",
    score: 78,
    profilePic: "https://example.com/profiles/sarah.jpg",
    role: "user",
    isActive: true,
    isEmailVerified: true,
    emailVerificationToken: null,
    lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    resetPasswordToken: null,
    resetPasswordExpire: null,
    preferences: {
      newsletter: true,
      marketing: true
    }
  }
];

// Test addresses for users
const testAddresses = [
  {
    // For Vedant
    fullName: "Vedant Lahane",
    addressLine1: "123 MG Road",
    addressLine2: "Near City Center",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
    phone: "+91-9876543210",
    isDefault: true,
    addressType: "both"
  },
  {
    // For Vedant (secondary address)
    fullName: "Vedant Lahane",
    addressLine1: "456 Park Street",
    addressLine2: "Apartment 5B",
    city: "Pune",
    state: "Maharashtra",
    postalCode: "411001",
    country: "India",
    phone: "+91-9876543210",
    isDefault: false,
    addressType: "shipping"
  },
  {
    // For John Doe
    fullName: "John Doe",
    addressLine1: "789 Main Street",
    addressLine2: "Suite 200",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA",
    phone: "+1-555-0123",
    isDefault: true,
    addressType: "both"
  },
  {
    // For Alice Johnson
    fullName: "Alice Johnson",
    addressLine1: "321 Baker Street",
    addressLine2: "",
    city: "London",
    state: "England",
    postalCode: "NW1 6XE",
    country: "UK",
    phone: "+44-7700-900123",
    isDefault: true,
    addressType: "both"
  },
  {
    // For Admin User
    fullName: "Admin User",
    addressLine1: "Corporate Office, Tech Park",
    addressLine2: "Building A, Floor 5",
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "560001",
    country: "India",
    phone: "+91-9999999999",
    isDefault: true,
    addressType: "both"
  },
  {
    // For Sarah Chen
    fullName: "Sarah Chen",
    addressLine1: "888 Nanjing Road",
    addressLine2: "Tower B, 15th Floor",
    city: "Shanghai",
    state: "Shanghai",
    postalCode: "200001",
    country: "China",
    phone: "+86-138-0013-8000",
    isDefault: true,
    addressType: "both"
  }
];

module.exports = {
  testUsers,
  testAddresses
};
