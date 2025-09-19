const realisticUsers = [
  {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    password: "password123", // This will be hashed during seeding
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    role: "user",
    isVerified: true,
    phone: "+1-555-0101",
    dateOfBirth: new Date("1990-05-15"),
    gender: "male",
    addresses: [
      {
        type: "home",
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "United States",
        isDefault: true
      }
    ],
    preferences: {
      newsletter: true,
      smsNotifications: false,
      favoriteCategories: ["basketball-shoes", "lifestyle-sneakers"],
      preferredBrands: ["Nike", "Adidas"],
      shoeSize: "10"
    },
    loyaltyPoints: 1250,
    totalOrders: 8,
    totalSpent: 1340.00
  },
  {
    name: "Sarah Chen",
    email: "sarah.chen@example.com", 
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b79ad5b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    role: "user",
    isVerified: true,
    phone: "+1-555-0102",
    dateOfBirth: new Date("1988-09-22"),
    gender: "female",
    addresses: [
      {
        type: "home",
        street: "456 Oak Avenue",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90210",
        country: "United States",
        isDefault: true
      },
      {
        type: "work",
        street: "789 Business Blvd",
        city: "Los Angeles", 
        state: "CA",
        zipCode: "90211",
        country: "United States",
        isDefault: false
      }
    ],
    preferences: {
      newsletter: true,
      smsNotifications: true,
      favoriteCategories: ["running-shoes", "womens"],
      preferredBrands: ["Nike", "New Balance"],
      shoeSize: "8"
    },
    loyaltyPoints: 2100,
    totalOrders: 12,
    totalSpent: 2150.00
  },
  {
    name: "Mike Rodriguez",
    email: "mike.rodriguez@example.com",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    role: "user",
    isVerified: true,
    phone: "+1-555-0103",
    dateOfBirth: new Date("1985-12-08"),
    gender: "male",
    addresses: [
      {
        type: "home",
        street: "321 Pine Street",
        city: "Chicago",
        state: "IL", 
        zipCode: "60601",
        country: "United States",
        isDefault: true
      }
    ],
    preferences: {
      newsletter: false,
      smsNotifications: false,
      favoriteCategories: ["skateboarding", "lifestyle-sneakers"],
      preferredBrands: ["Vans", "Converse"],
      shoeSize: "11"
    },
    loyaltyPoints: 850,
    totalOrders: 5,
    totalSpent: 675.00
  },
  {
    name: "Emma Thompson",
    email: "emma.thompson@example.com",
    password: "password123",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    role: "user",
    isVerified: true,
    phone: "+1-555-0104",
    dateOfBirth: new Date("1992-03-18"),
    gender: "female",
    addresses: [
      {
        type: "home",
        street: "654 Maple Drive",
        city: "Seattle",
        state: "WA",
        zipCode: "98101", 
        country: "United States",
        isDefault: true
      }
    ],
    preferences: {
      newsletter: true,
      smsNotifications: true,
      favoriteCategories: ["training-fitness", "womens"],
      preferredBrands: ["Adidas", "Puma"],
      shoeSize: "7.5"
    },
    loyaltyPoints: 450,
    totalOrders: 3,
    totalSpent: 395.00
  },
  {
    name: "David Kim",
    email: "david.kim@example.com",
    password: "password123", 
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    role: "user",
    isVerified: false,
    phone: "+1-555-0105",
    dateOfBirth: new Date("1987-07-25"),
    gender: "male",
    addresses: [
      {
        type: "home",
        street: "987 Cedar Lane",
        city: "Miami",
        state: "FL",
        zipCode: "33101",
        country: "United States",
        isDefault: true
      }
    ],
    preferences: {
      newsletter: true,
      smsNotifications: false,
      favoriteCategories: ["limited-editions", "basketball-shoes"],
      preferredBrands: ["Nike", "Air Jordan"],
      shoeSize: "9.5"
    },
    loyaltyPoints: 50,
    totalOrders: 1,
    totalSpent: 170.00
  },
  {
    name: "Admin User",
    email: "admin@shoemarknet.com",
    password: "admin123",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    role: "admin",
    isVerified: true,
    phone: "+1-555-0001",
    dateOfBirth: new Date("1980-01-01"),
    gender: "male",
    addresses: [
      {
        type: "work",
        street: "ShoeMarkNet HQ",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "United States",
        isDefault: true
      }
    ],
    preferences: {
      newsletter: true,
      smsNotifications: true,
      favoriteCategories: [],
      preferredBrands: [],
      shoeSize: "10"
    },
    loyaltyPoints: 0,
    totalOrders: 0,
    totalSpent: 0.00,
    adminLevel: "super"
  }
];

module.exports = { realisticUsers };
