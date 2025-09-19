const realisticCategories = [
  {
    name: "Basketball Shoes",
    slug: "basketball-shoes",
    description: "High-performance basketball shoes for court domination. From retro classics to modern innovations.",
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isActive: true,
    isFeatured: true,
    parentCategory: null,
    subcategories: ["High-Top Basketball", "Low-Top Basketball", "Performance Basketball"]
  },
  {
    name: "Running Shoes",
    slug: "running-shoes", 
    description: "Engineered for speed, comfort, and performance. Find your perfect running companion.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isActive: true,
    isFeatured: true,
    parentCategory: null,
    subcategories: ["Road Running", "Trail Running", "Marathon", "Casual Running"]
  },
  {
    name: "Lifestyle Sneakers",
    slug: "lifestyle-sneakers",
    description: "Street-ready sneakers that blend comfort with style. Perfect for everyday wear.",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isActive: true,
    isFeatured: true,
    parentCategory: null,
    subcategories: ["Retro", "Modern", "Minimalist", "Chunky"]
  },
  {
    name: "Skateboarding",
    slug: "skateboarding",
    description: "Built for the streets and skate parks. Durable construction meets iconic style.",
    image: "https://images.unsplash.com/photo-1520256862855-398228c41684?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isActive: true,
    isFeatured: true,
    parentCategory: null,
    subcategories: ["Classic Skate", "Pro Models", "Vulcanized", "Cupsole"]
  },
  {
    name: "Limited Editions",
    slug: "limited-editions",
    description: "Exclusive releases and collaborations. Rare finds for the true sneaker enthusiast.",
    image: "https://images.unsplash.com/photo-1595950653106-6c9739b5f863?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isActive: true,
    isFeatured: true,
    parentCategory: null,
    subcategories: ["Collaborations", "Retro Releases", "Designer", "Artist Editions"]
  },
  {
    name: "Training & Fitness",
    slug: "training-fitness",
    description: "Cross-training shoes designed for gym workouts, HIIT, and functional fitness.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isActive: true,
    isFeatured: false,
    parentCategory: null,
    subcategories: ["Cross Training", "Weightlifting", "HIIT", "Studio"]
  },
  {
    name: "Women's",
    slug: "womens",
    description: "Curated collection of women's sneakers combining performance with feminine style.",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isActive: true,
    isFeatured: true,
    parentCategory: null,
    subcategories: ["Women's Lifestyle", "Women's Running", "Women's Training", "Women's Basketball"]
  },
  {
    name: "Men's",
    slug: "mens",
    description: "Men's sneaker collection featuring the latest releases and timeless classics.",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    isActive: true,
    isFeatured: true,
    parentCategory: null,
    subcategories: ["Men's Lifestyle", "Men's Running", "Men's Training", "Men's Basketball"]
  }
];

module.exports = { realisticCategories };
