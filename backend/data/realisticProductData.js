const realisticProducts = [
  // Nike Products
  {
    name: "Nike Air Jordan 1 Retro High OG 'Bred Toe'",
    description: "The Air Jordan 1 Retro High OG 'Bred Toe' features a premium leather upper in white with black overlays and red accents on the toe and heel. This iconic colorway pays homage to the original 'Bred' and 'Chicago' colorways.",
    brand: "Nike",
    price: 170,
    originalPrice: 190,
    discountPercentage: 11,
    images: [
      "https://images.stockx.com/images/Air-Jordan-1-Retro-High-OG-Bred-Toe-Product.jpg",
      "https://images.stockx.com/images/Air-Jordan-1-Retro-High-OG-Bred-Toe-2.jpg",
      "https://images.stockx.com/images/Air-Jordan-1-Retro-High-OG-Bred-Toe-3.jpg"
    ],
    countInStock: 45,
    rating: 4.8,
    numReviews: 284,
    isFeatured: true,
    isNewArrival: false,
    gender: "unisex",
    variants: [
      {
        color: "White/Black-Gym Red",
        colorCode: "#FFFFFF",
        images: ["https://images.stockx.com/images/Air-Jordan-1-Retro-High-OG-Bred-Toe-Product.jpg"],
        sizes: [
          { size: 7, countInStock: 3, price: 170 },
          { size: 8, countInStock: 8, price: 170 },
          { size: 9, countInStock: 12, price: 170 },
          { size: 10, countInStock: 15, price: 170 },
          { size: 11, countInStock: 7, price: 170 }
        ]
      }
    ],
    specifications: {
      "Style Code": "555088-610",
      "Colorway": "White/Black-Gym Red",
      "Upper Material": "Leather",
      "Release Date": "2018-02-24"
    }
  },

  {
    name: "Nike Air Max 97 'Silver Bullet'",
    description: "The Nike Air Max 97 'Silver Bullet' returns with its original metallic silver design. Featuring a sleek upper with reflective details and full-length visible Air cushioning.",
    brand: "Nike",
    price: 180,
    originalPrice: 180,
    discountPercentage: 0,
    images: [
      "https://images.stockx.com/images/Nike-Air-Max-97-Silver-Bullet-2022-Product.jpg",
      "https://images.stockx.com/images/Nike-Air-Max-97-Silver-Bullet-2022-2.jpg"
    ],
    countInStock: 32,
    rating: 4.6,
    numReviews: 156,
    isFeatured: true,
    isNewArrival: false,
    gender: "unisex",
    variants: [
      {
        color: "Metallic Silver/White-Black",
        colorCode: "#C0C0C0",
        images: ["https://images.stockx.com/images/Nike-Air-Max-97-Silver-Bullet-2022-Product.jpg"],
        sizes: [
          { size: 8, countInStock: 5, price: 180 },
          { size: 9, countInStock: 8, price: 180 },
          { size: 10, countInStock: 12, price: 180 },
          { size: 11, countInStock: 7, price: 180 }
        ]
      }
    ],
    specifications: {
      "Style Code": "884421-001",
      "Colorway": "Metallic Silver/White-Black",
      "Technology": "Air Max",
      "Release Date": "2022-04-02"
    }
  },

  {
    name: "Nike Dunk Low 'Panda'",
    description: "The Nike Dunk Low 'Panda' features a clean white leather base with black overlays, creating a timeless colorway perfect for everyday wear.",
    brand: "Nike",
    price: 110,
    originalPrice: 130,
    discountPercentage: 15,
    images: [
      "https://images.stockx.com/images/Nike-Dunk-Low-White-Black-2021-Product.jpg",
      "https://images.stockx.com/images/Nike-Dunk-Low-White-Black-2021-2.jpg"
    ],
    countInStock: 67,
    rating: 4.7,
    numReviews: 392,
    isFeatured: true,
    isNewArrival: false,
    gender: "unisex",
    variants: [
      {
        color: "White/Black",
        colorCode: "#FFFFFF",
        images: ["https://images.stockx.com/images/Nike-Dunk-Low-White-Black-2021-Product.jpg"],
        sizes: [
          { size: 7, countInStock: 8, price: 110 },
          { size: 8, countInStock: 15, price: 110 },
          { size: 9, countInStock: 18, price: 110 },
          { size: 10, countInStock: 14, price: 110 },
          { size: 11, countInStock: 12, price: 110 }
        ]
      }
    ],
    specifications: {
      "Style Code": "DD1391-100",
      "Colorway": "White/Black",
      "Upper Material": "Leather",
      "Release Date": "2021-01-14"
    }
  },

  // Adidas Products
  {
    name: "Adidas Yeezy Boost 350 V2 'Zebra'",
    description: "The Adidas Yeezy Boost 350 V2 'Zebra' features a white Primeknit upper with black stripes and a semi-translucent stripe with red 'SPLY-350' text.",
    brand: "Adidas",
    price: 230,
    originalPrice: 250,
    discountPercentage: 8,
    images: [
      "https://images.stockx.com/images/Adidas-Yeezy-Boost-350-V2-Zebra-Product.jpg",
      "https://images.stockx.com/images/Adidas-Yeezy-Boost-350-V2-Zebra-2.jpg"
    ],
    countInStock: 23,
    rating: 4.9,
    numReviews: 567,
    isFeatured: true,
    isNewArrival: false,
    gender: "unisex",
    variants: [
      {
        color: "White/Core Black/Red",
        colorCode: "#FFFFFF",
        images: ["https://images.stockx.com/images/Adidas-Yeezy-Boost-350-V2-Zebra-Product.jpg"],
        sizes: [
          { size: 8, countInStock: 3, price: 230 },
          { size: 9, countInStock: 5, price: 230 },
          { size: 10, countInStock: 8, price: 230 },
          { size: 11, countInStock: 4, price: 230 },
          { size: 12, countInStock: 3, price: 230 }
        ]
      }
    ],
    specifications: {
      "Style Code": "CP9654",
      "Colorway": "White/Core Black/Red",
      "Technology": "Boost",
      "Designer": "Kanye West"
    }
  },

  {
    name: "Adidas Stan Smith 'Cloud White'",
    description: "The timeless Adidas Stan Smith in cloud white features a clean leather upper with perforated three stripes and green accents.",
    brand: "Adidas",
    price: 90,
    originalPrice: 90,
    discountPercentage: 0,
    images: [
      "https://images.stockx.com/images/Adidas-Stan-Smith-Cloud-White-Green-Product.jpg",
      "https://images.stockx.com/images/Adidas-Stan-Smith-Cloud-White-Green-2.jpg"
    ],
    countInStock: 156,
    rating: 4.5,
    numReviews: 234,
    isFeatured: false,
    isNewArrival: false,
    gender: "unisex",
    variants: [
      {
        color: "Cloud White/Green",
        colorCode: "#FFFFFF",
        images: ["https://images.stockx.com/images/Adidas-Stan-Smith-Cloud-White-Green-Product.jpg"],
        sizes: [
          { size: 7, countInStock: 20, price: 90 },
          { size: 8, countInStock: 25, price: 90 },
          { size: 9, countInStock: 30, price: 90 },
          { size: 10, countInStock: 35, price: 90 },
          { size: 11, countInStock: 28, price: 90 },
          { size: 12, countInStock: 18, price: 90 }
        ]
      }
    ],
    specifications: {
      "Style Code": "FX5500",
      "Colorway": "Cloud White/Green",
      "Upper Material": "Leather",
      "Iconic Since": "1971"
    }
  },

  {
    name: "Adidas Ultraboost 22 'Triple Black'",
    description: "The Adidas Ultraboost 22 features updated Boost midsole technology and a Primeknit+ upper for ultimate comfort and performance.",
    brand: "Adidas",
    price: 190,
    originalPrice: 190,
    discountPercentage: 0,
    images: [
      "https://images.stockx.com/images/Adidas-Ultraboost-22-Triple-Black-Product.jpg",
      "https://images.stockx.com/images/Adidas-Ultraboost-22-Triple-Black-2.jpg"
    ],
    countInStock: 78,
    rating: 4.4,
    numReviews: 89,
    isFeatured: false,
    isNewArrival: true,
    gender: "unisex",
    variants: [
      {
        color: "Core Black",
        colorCode: "#000000",
        images: ["https://images.stockx.com/images/Adidas-Ultraboost-22-Triple-Black-Product.jpg"],
        sizes: [
          { size: 8, countInStock: 12, price: 190 },
          { size: 9, countInStock: 18, price: 190 },
          { size: 10, countInStock: 22, price: 190 },
          { size: 11, countInStock: 16, price: 190 },
          { size: 12, countInStock: 10, price: 190 }
        ]
      }
    ],
    specifications: {
      "Style Code": "GZ0127",
      "Colorway": "Core Black",
      "Technology": "Boost",
      "Upper Material": "Primeknit+"
    }
  },

  // New Balance Products
  {
    name: "New Balance 550 'White Green'",
    description: "The New Balance 550 brings back the classic basketball silhouette with a white leather base and green accents.",
    brand: "New Balance",
    price: 110,
    originalPrice: 110,
    discountPercentage: 0,
    images: [
      "https://images.stockx.com/images/New-Balance-550-White-Green-Product.jpg",
      "https://images.stockx.com/images/New-Balance-550-White-Green-2.jpg"
    ],
    countInStock: 89,
    rating: 4.6,
    numReviews: 167,
    isFeatured: true,
    isNewArrival: false,
    gender: "unisex",
    variants: [
      {
        color: "White/Green",
        colorCode: "#FFFFFF",
        images: ["https://images.stockx.com/images/New-Balance-550-White-Green-Product.jpg"],
        sizes: [
          { size: 8, countInStock: 15, price: 110 },
          { size: 9, countInStock: 20, price: 110 },
          { size: 10, countInStock: 25, price: 110 },
          { size: 11, countInStock: 18, price: 110 },
          { size: 12, countInStock: 11, price: 110 }
        ]
      }
    ],
    specifications: {
      "Style Code": "BB550LB1",
      "Colorway": "White/Green",
      "Upper Material": "Leather",
      "Basketball Heritage": "1989"
    }
  },

  {
    name: "New Balance 990v5 'Grey'",
    description: "The New Balance 990v5 continues the legacy of American-made excellence with premium suede and mesh construction.",
    brand: "New Balance",
    price: 185,
    originalPrice: 185,
    discountPercentage: 0,
    images: [
      "https://images.stockx.com/images/New-Balance-990v5-Grey-Product.jpg",
      "https://images.stockx.com/images/New-Balance-990v5-Grey-2.jpg"
    ],
    countInStock: 56,
    rating: 4.8,
    numReviews: 203,
    isFeatured: false,
    isNewArrival: false,
    gender: "unisex",
    variants: [
      {
        color: "Grey/Castlerock",
        colorCode: "#808080",
        images: ["https://images.stockx.com/images/New-Balance-990v5-Grey-Product.jpg"],
        sizes: [
          { size: 8, countInStock: 8, price: 185 },
          { size: 9, countInStock: 12, price: 185 },
          { size: 10, countInStock: 15, price: 185 },
          { size: 11, countInStock: 13, price: 185 },
          { size: 12, countInStock: 8, price: 185 }
        ]
      }
    ],
    specifications: {
      "Style Code": "M990GL5",
      "Colorway": "Grey/Castlerock",
      "Made In": "USA",
      "Upper Material": "Pigskin Suede/Mesh"
    }
  },

  // Vans Products
  {
    name: "Vans Old Skool 'Black White'",
    description: "The iconic Vans Old Skool featuring the classic side stripe, sturdy canvas and suede uppers, and the signature waffle outsole.",
    brand: "Vans",
    price: 65,
    originalPrice: 65,
    discountPercentage: 0,
    images: [
      "https://images.stockx.com/images/Vans-Old-Skool-Black-White-Product.jpg",
      "https://images.stockx.com/images/Vans-Old-Skool-Black-White-2.jpg"
    ],
    countInStock: 234,
    rating: 4.7,
    numReviews: 456,
    isFeatured: false,
    isNewArrival: false,
    gender: "unisex",
    variants: [
      {
        color: "Black/White",
        colorCode: "#000000",
        images: ["https://images.stockx.com/images/Vans-Old-Skool-Black-White-Product.jpg"],
        sizes: [
          { size: 7, countInStock: 35, price: 65 },
          { size: 8, countInStock: 45, price: 65 },
          { size: 9, countInStock: 50, price: 65 },
          { size: 10, countInStock: 48, price: 65 },
          { size: 11, countInStock: 38, price: 65 },
          { size: 12, countInStock: 18, price: 65 }
        ]
      }
    ],
    specifications: {
      "Style Code": "VN000D3HY28",
      "Colorway": "Black/White",
      "Upper Material": "Canvas/Suede",
      "Iconic Since": "1977"
    }
  },

  // Converse Products
  {
    name: "Converse Chuck Taylor All Star '70 High 'Black'",
    description: "The Converse Chuck Taylor All Star '70 High features premium materials and enhanced cushioning for a vintage-inspired look.",
    brand: "Converse",
    price: 85,
    originalPrice: 85,
    discountPercentage: 0,
    images: [
      "https://images.stockx.com/images/Converse-Chuck-Taylor-All-Star-70-High-Black-Product.jpg",
      "https://images.stockx.com/images/Converse-Chuck-Taylor-All-Star-70-High-Black-2.jpg"
    ],
    countInStock: 167,
    rating: 4.5,
    numReviews: 298,
    isFeatured: false,
    isNewArrival: false,
    gender: "unisex",
    variants: [
      {
        color: "Black/Black/Egret",
        colorCode: "#000000",
        images: ["https://images.stockx.com/images/Converse-Chuck-Taylor-All-Star-70-High-Black-Product.jpg"],
        sizes: [
          { size: 7, countInStock: 25, price: 85 },
          { size: 8, countInStock: 32, price: 85 },
          { size: 9, countInStock: 38, price: 85 },
          { size: 10, countInStock: 35, price: 85 },
          { size: 11, countInStock: 25, price: 85 },
          { size: 12, countInStock: 12, price: 85 }
        ]
      }
    ],
    specifications: {
      "Style Code": "162050C",
      "Colorway": "Black/Black/Egret",
      "Upper Material": "Canvas",
      "Heritage": "1970s"
    }
  },

  // Puma Products
  {
    name: "Nike LeBron XX 'South Beach'",
    description: "The Nike LeBron XX 'South Beach' brings Miami-inspired colors to LeBron's twentieth signature shoe, featuring a low-cut knit upper, Zoom Air cushioning, and carbon fiber support.",
    brand: "Nike",
    price: 210,
    originalPrice: 220,
    discountPercentage: 5,
    images: [
      "https://images.stockx.com/images/Nike-LeBron-20-South-Beach-Product.jpg",
      "https://images.stockx.com/images/Nike-LeBron-20-South-Beach-2.jpg"
    ],
    countInStock: 34,
    rating: 4.7,
    numReviews: 142,
    isFeatured: true,
    isNewArrival: true,
    gender: "men",
    variants: [
      {
        color: "Laser Blue/Pink Prime",
        colorCode: "#1C9CF1",
        images: ["https://images.stockx.com/images/Nike-LeBron-20-South-Beach-Product.jpg"],
        sizes: [
          { size: 8, countInStock: 6, price: 210 },
          { size: 9, countInStock: 8, price: 210 },
          { size: 10, countInStock: 10, price: 210 },
          { size: 11, countInStock: 7, price: 210 },
          { size: 12, countInStock: 3, price: 210 }
        ]
      }
    ],
    specifications: {
      "Style Code": "DM0087-400",
      "Colorway": "Laser Blue/Pink Prime-Blue Lightning",
      "Technology": "Zoom Air",
      "Release Date": "2023-07-12"
    }
  },

  {
    name: "Adidas Harden Vol. 7 'Pulse Aqua'",
    description: "James Harden's seventh signature sneaker delivers a quilted textile upper, Lightstrike cushioning, and a bold Pulse Aqua palette for quick cuts and step-backs.",
    brand: "Adidas",
    price: 160,
    originalPrice: 160,
    discountPercentage: 0,
    images: [
      "https://images.stockx.com/images/adidas-Harden-Vol-7-Pulse-Aqua-Product.jpg",
      "https://images.stockx.com/images/adidas-Harden-Vol-7-Pulse-Aqua-2.jpg"
    ],
    countInStock: 41,
    rating: 4.4,
    numReviews: 96,
    isFeatured: false,
    isNewArrival: true,
    gender: "men",
    variants: [
      {
        color: "Pulse Aqua/Core Black",
        colorCode: "#36C3D2",
        images: ["https://images.stockx.com/images/adidas-Harden-Vol-7-Pulse-Aqua-Product.jpg"],
        sizes: [
          { size: 8, countInStock: 7, price: 160 },
          { size: 9, countInStock: 9, price: 160 },
          { size: 10, countInStock: 11, price: 160 },
          { size: 11, countInStock: 8, price: 160 },
          { size: 12, countInStock: 6, price: 160 }
        ]
      }
    ],
    specifications: {
      "Style Code": "IE2692",
      "Colorway": "Pulse Aqua/Core Black/Cloud White",
      "Technology": "Lightstrike",
      "Release Date": "2023-03-02"
    }
  },

  {
    name: "ASICS Gel-Kayano 30 'Glacier Grey'",
    description: "The ASICS Gel-Kayano 30 celebrates thirty years of stability with 4D Guidance and PureGEL technology to support long-distance runners.",
    brand: "ASICS",
    price: 160,
    originalPrice: 165,
    discountPercentage: 3,
    images: [
      "https://images.stockx.com/images/ASICS-Gel-Kayano-30-White-Glacier-Grey-Product.jpg",
      "https://images.stockx.com/images/ASICS-Gel-Kayano-30-White-Glacier-Grey-2.jpg"
    ],
    countInStock: 52,
    rating: 4.6,
    numReviews: 74,
    isFeatured: false,
    isNewArrival: true,
    gender: "unisex",
    variants: [
      {
        color: "Glacier Grey/White",
        colorCode: "#D1D5DB",
        images: ["https://images.stockx.com/images/ASICS-Gel-Kayano-30-White-Glacier-Grey-Product.jpg"],
        sizes: [
          { size: 6, countInStock: 6, price: 160 },
          { size: 7, countInStock: 8, price: 160 },
          { size: 8, countInStock: 10, price: 160 },
          { size: 9, countInStock: 12, price: 160 },
          { size: 10, countInStock: 10, price: 160 },
          { size: 11, countInStock: 6, price: 160 }
        ]
      }
    ],
    specifications: {
      "Style Code": "1011B548-020",
      "Colorway": "Glacier Grey/White",
      "Technology": "PureGEL & FF Blast Plus",
      "Release Date": "2023-08-15"
    }
  },

  {
    name: "Hoka Speedgoat 5 'Fiesta'",
    description: "Built for technical trails, the Hoka Speedgoat 5 'Fiesta' uses a Vibram Megagrip outsole and lightweight mesh upper for confident traction and breathability.",
    brand: "Hoka",
    price: 155,
    originalPrice: 155,
    discountPercentage: 0,
    images: [
      "https://images.stockx.com/images/HOKA-Speedgoat-5-Fiesta-Camellia-Product.jpg",
      "https://images.stockx.com/images/HOKA-Speedgoat-5-Fiesta-Camellia-2.jpg"
    ],
    countInStock: 47,
    rating: 4.8,
    numReviews: 65,
    isFeatured: true,
    isNewArrival: true,
    gender: "unisex",
    variants: [
      {
        color: "Fiesta/Camellia",
        colorCode: "#F97316",
        images: ["https://images.stockx.com/images/HOKA-Speedgoat-5-Fiesta-Camellia-Product.jpg"],
        sizes: [
          { size: 7, countInStock: 7, price: 155 },
          { size: 8, countInStock: 9, price: 155 },
          { size: 9, countInStock: 11, price: 155 },
          { size: 10, countInStock: 10, price: 155 },
          { size: 11, countInStock: 6, price: 155 }
        ]
      }
    ],
    specifications: {
      "Style Code": "1123157-FSTCM",
      "Colorway": "Fiesta/Camellia",
      "Technology": "Vibram Megagrip",
      "Release Date": "2023-05-20"
    }
  },
  {
    name: "Puma Suede Classic XXI 'Peacoat'",
    description: "The Puma Suede Classic XXI brings back the iconic basketball shoe with premium suede upper and classic formstrip.",
    brand: "Puma",
    price: 70,
    originalPrice: 80,
    discountPercentage: 13,
    images: [
      "https://images.stockx.com/images/Puma-Suede-Classic-XXI-Peacoat-Product.jpg",
      "https://images.stockx.com/images/Puma-Suede-Classic-XXI-Peacoat-2.jpg"
    ],
    countInStock: 123,
    rating: 4.3,
    numReviews: 145,
    isFeatured: false,
    isNewArrival: false,
    gender: "unisex",
    variants: [
      {
        color: "Peacoat/White",
        colorCode: "#000080",
        images: ["https://images.stockx.com/images/Puma-Suede-Classic-XXI-Peacoat-Product.jpg"],
        sizes: [
          { size: 8, countInStock: 18, price: 70 },
          { size: 9, countInStock: 25, price: 70 },
          { size: 10, countInStock: 30, price: 70 },
          { size: 11, countInStock: 28, price: 70 },
          { size: 12, countInStock: 22, price: 70 }
        ]
      }
    ],
    specifications: {
      "Style Code": "374915-02",
      "Colorway": "Peacoat/White",
      "Upper Material": "Suede",
      "Iconic Since": "1968"
    }
  },

  // Women's Specific Products
  {
    name: "Nike Air Jordan 1 Low 'UNC'",
    description: "The Air Jordan 1 Low 'UNC' features University Blue accents on a clean white leather base, perfect for everyday wear.",
    brand: "Nike",
    price: 90,
    originalPrice: 110,
    discountPercentage: 18,
    images: [
      "https://images.stockx.com/images/Air-Jordan-1-Low-UNC-Product.jpg",
      "https://images.stockx.com/images/Air-Jordan-1-Low-UNC-2.jpg"
    ],
    countInStock: 98,
    rating: 4.6,
    numReviews: 187,
    isFeatured: false,
    isNewArrival: false,
    gender: "women",
    variants: [
      {
        color: "White/University Blue",
        colorCode: "#FFFFFF",
        images: ["https://images.stockx.com/images/Air-Jordan-1-Low-UNC-Product.jpg"],
        sizes: [
          { size: 6, countInStock: 15, price: 90 },
          { size: 7, countInStock: 22, price: 90 },
          { size: 8, countInStock: 25, price: 90 },
          { size: 9, countInStock: 20, price: 90 },
          { size: 10, countInStock: 16, price: 90 }
        ]
      }
    ],
    specifications: {
      "Style Code": "553558-144",
      "Colorway": "White/University Blue",
      "Upper Material": "Leather",
      "Gender": "Women's"
    }
  },

  {
    name: "Adidas Samba OG 'White Green'",
    description: "The Adidas Samba OG returns with its original soccer-inspired design featuring a white leather upper with green accents.",
    brand: "Adidas",
    price: 100,
    originalPrice: 100,
    discountPercentage: 0,
    images: [
      "https://images.stockx.com/images/Adidas-Samba-OG-White-Green-Product.jpg",
      "https://images.stockx.com/images/Adidas-Samba-OG-White-Green-2.jpg"
    ],
    countInStock: 134,
    rating: 4.7,
    numReviews: 223,
    isFeatured: true,
    isNewArrival: false,
    gender: "unisex",
    variants: [
      {
        color: "White/Green",
        colorCode: "#FFFFFF",
        images: ["https://images.stockx.com/images/Adidas-Samba-OG-White-Green-Product.jpg"],
        sizes: [
          { size: 7, countInStock: 20, price: 100 },
          { size: 8, countInStock: 28, price: 100 },
          { size: 9, countInStock: 32, price: 100 },
          { size: 10, countInStock: 30, price: 100 },
          { size: 11, countInStock: 24, price: 100 }
        ]
      }
    ],
    specifications: {
      "Style Code": "B75806",
      "Colorway": "White/Green",
      "Upper Material": "Leather",
      "Soccer Heritage": "1950s"
    }
  },

  // Performance/Running Shoes
  {
    name: "Nike Air Zoom Pegasus 39",
    description: "The Nike Air Zoom Pegasus 39 delivers responsive cushioning and breathability for your daily runs and training.",
    brand: "Nike",
    price: 130,
    originalPrice: 130,
    discountPercentage: 0,
    images: [
      "https://images.stockx.com/images/Nike-Air-Zoom-Pegasus-39-Black-White-Product.jpg",
      "https://images.stockx.com/images/Nike-Air-Zoom-Pegasus-39-Black-White-2.jpg"
    ],
    countInStock: 187,
    rating: 4.4,
    numReviews: 167,
    isFeatured: false,
    isNewArrival: true,
    gender: "unisex",
    variants: [
      {
        color: "Black/White",
        colorCode: "#000000",
        images: ["https://images.stockx.com/images/Nike-Air-Zoom-Pegasus-39-Black-White-Product.jpg"],
        sizes: [
          { size: 8, countInStock: 25, price: 130 },
          { size: 9, countInStock: 35, price: 130 },
          { size: 10, countInStock: 40, price: 130 },
          { size: 11, countInStock: 38, price: 130 },
          { size: 12, countInStock: 30, price: 130 },
          { size: 13, countInStock: 19, price: 130 }
        ]
      }
    ],
    specifications: {
      "Style Code": "DN3142-002",
      "Colorway": "Black/White",
      "Technology": "Air Zoom",
      "Category": "Running"
    }
  },

  // Limited Edition/Collaboration
  {
    name: "Travis Scott x Air Jordan 1 Low 'Reverse Mocha'",
    description: "The Travis Scott x Air Jordan 1 Low 'Reverse Mocha' features reversed colors from the original with premium materials and signature backwards Swoosh.",
    brand: "Nike",
    price: 150,
    originalPrice: 150,
    discountPercentage: 0,
    images: [
      "https://images.stockx.com/images/Travis-Scott-Air-Jordan-1-Low-Reverse-Mocha-Product.jpg",
      "https://images.stockx.com/images/Travis-Scott-Air-Jordan-1-Low-Reverse-Mocha-2.jpg"
    ],
    countInStock: 8,
    rating: 4.9,
    numReviews: 89,
    isFeatured: true,
    isNewArrival: true,
    gender: "unisex",
    variants: [
      {
        color: "Light Smoke Grey/Gym Red-Sail",
        colorCode: "#D3D3D3",
        images: ["https://images.stockx.com/images/Travis-Scott-Air-Jordan-1-Low-Reverse-Mocha-Product.jpg"],
        sizes: [
          { size: 9, countInStock: 1, price: 150 },
          { size: 10, countInStock: 3, price: 150 },
          { size: 11, countInStock: 2, price: 150 },
          { size: 12, countInStock: 2, price: 150 }
        ]
      }
    ],
    specifications: {
      "Style Code": "DM7866-162",
      "Collaboration": "Travis Scott",
      "Colorway": "Light Smoke Grey/Gym Red-Sail",
      "Special Feature": "Backwards Swoosh"
    }
  }
];

module.exports = { realisticProducts };
