// Test data for Reviews
const testReviews = [
  {
    rating: 5,
    title: "Absolutely Amazing!",
    comment: "These Nike Air Jordans exceeded my expectations. The quality is outstanding and they're incredibly comfortable. Perfect for both basketball and casual wear.",
    isVerifiedPurchase: true,
    isHelpful: 24,
    images: ["/assets/review1.jpg", "/assets/review2.jpg"],
    pros: ["Excellent quality", "Very comfortable", "Great design", "Good value"],
    cons: ["Price is a bit high"],
    wouldRecommend: true
  },
  {
    rating: 4,
    title: "Great shoes, minor issues",
    comment: "Love the Adidas Superstar classic design. Very comfortable for daily wear. Only issue is they get dirty easily due to the white color.",
    isVerifiedPurchase: true,
    isHelpful: 18,
    images: ["/assets/review3.jpg"],
    pros: ["Classic design", "Comfortable", "Good build quality"],
    cons: ["Gets dirty easily", "Sizing runs slightly large"],
    wouldRecommend: true
  },
  {
    rating: 5,
    title: "Perfect for running!",
    comment: "The Puma RS-X gives excellent support for my daily runs. The cushioning is perfect and the retro style looks amazing.",
    isVerifiedPurchase: true,
    isHelpful: 31,
    images: [],
    pros: ["Excellent cushioning", "Great support", "Retro style", "Durable"],
    cons: [],
    wouldRecommend: true
  },
  {
    rating: 4,
    title: "Good value for money",
    comment: "Nike Air Max 270 offers good comfort and style. The Air Max technology really makes a difference in cushioning.",
    isVerifiedPurchase: false,
    isHelpful: 12,
    images: ["/assets/review4.jpg"],
    pros: ["Good cushioning", "Stylish design", "Reasonable price"],
    cons: ["Could be more durable"],
    wouldRecommend: true
  },
  {
    rating: 5,
    title: "Best purchase ever!",
    comment: "The Yeezy Boost 350 is absolutely incredible. The comfort level is unmatched and the style is perfect for any occasion.",
    isVerifiedPurchase: true,
    isHelpful: 45,
    images: ["/assets/review5.jpg", "/assets/review6.jpg"],
    pros: ["Unmatched comfort", "Premium quality", "Versatile style", "Great fit"],
    cons: ["Expensive", "Hard to get"],
    wouldRecommend: true
  },
  {
    rating: 3,
    title: "Decent but overpriced",
    comment: "The Nike Adapt BB technology is cool but the price point is too high for what you get. Comfortable but battery life could be better.",
    isVerifiedPurchase: true,
    isHelpful: 8,
    images: [],
    pros: ["Cool technology", "Comfortable fit", "Unique feature"],
    cons: ["Very expensive", "Battery life issues", "App connectivity problems"],
    wouldRecommend: false
  }
];

// Test data for Cart items
const testCartItems = [
  {
    quantity: 2,
    price: 200,
    variant: {
      color: "Bred",
      size: "9"
    },
    addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    quantity: 1,
    price: 200,
    variant: {
      color: "Core Black",
      size: "10"
    },
    addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    quantity: 1,
    price: 200,
    variant: {
      color: "Multi-Color",
      size: "8"
    },
    addedAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
  }
];

// Test data for Wishlist items (just product IDs, no additional data needed)
const testWishlistItems = [
  // Will be populated with actual product IDs in the setup script
];

// Test data for Orders
const testOrders = [
  {
    orderId: "ORD-2025-001",
    totalPrice: 400,
    discount: 0,
    tax: 20,
    shippingFee: 10,
    grandTotal: 430,
    paymentMethod: "credit_card",
    paymentResult: {
      id: "PAY123456789",
      status: "completed",
      update_time: new Date().toISOString(),
      email_address: "vedant@example.com"
    },
    isPaid: true,
    paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: "delivered",
    isDelivered: true,
    deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    trackingNumber: "TRK123456789",
    estimatedDelivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    shippingAddress: {
      fullName: "Vedant Lahane",
      phone: "+91 9876543210",
      addressLine1: "123 MG Road",
      addressLine2: "Near City Mall",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      country: "India"
    },
    items: [
      {
        quantity: 2,
        price: 200,
        color: "Bred",
        size: 9
      }
    ]
  },
  {
    orderId: "ORD-2025-002",
    totalPrice: 200,
    discount: 20,
    tax: 9,
    shippingFee: 15,
    grandTotal: 204,
    paymentMethod: "upi",
    paymentResult: {
      id: "UPI987654321",
      status: "completed",
      update_time: new Date().toISOString(),
      email_address: "johndoe@example.com"
    },
    isPaid: true,
    paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: "shipped",
    isDelivered: false,
    trackingNumber: "TRK987654321",
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    shippingAddress: {
      fullName: "John Doe",
      phone: "+1 123-456-7890",
      addressLine1: "456 Broadway",
      addressLine2: "Apt 5B",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA"
    },
    items: [
      {
        quantity: 1,
        price: 200,
        color: "Core Black",
        size: 10
      }
    ]
  },
  {
    orderId: "ORD-2025-003",
    totalPrice: 150,
    discount: 0,
    tax: 7.5,
    shippingFee: 12.5,
    grandTotal: 170,
    paymentMethod: "paypal",
    paymentResult: {
      id: "PP456789123",
      status: "completed",
      update_time: new Date().toISOString(),
      email_address: "alice.johnson@example.com"
    },
    isPaid: true,
    paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: "processing",
    isDelivered: false,
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    shippingAddress: {
      fullName: "Alice Johnson",
      phone: "+44 20 7946 0958",
      addressLine1: "789 Baker Street",
      city: "London",
      state: "England",
      postalCode: "NW1 6XE",
      country: "UK"
    },
    items: [
      {
        quantity: 1,
        price: 150,
        color: "Premium White",
        size: 8
      }
    ]
  }
];

// Test data for Search History
const testSearchHistory = [
  {
    query: "Nike Air Jordan",
    category: null,
    filters: { brand: "Nike" },
    resultCount: 2,
    clickedProducts: [],
    searchDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    query: "running shoes",
    category: "running",
    filters: { minPrice: 100, maxPrice: 200 },
    resultCount: 3,
    clickedProducts: [],
    searchDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    query: "Adidas",
    category: null,
    filters: { brand: "Adidas" },
    resultCount: 2,
    clickedProducts: [],
    searchDate: new Date(Date.now() - 3 * 60 * 60 * 1000)
  }
];

module.exports = {
  testReviews,
  testCartItems,
  testWishlistItems,
  testOrders,
  testSearchHistory
};
