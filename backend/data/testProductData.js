const testProducts = [
  {
    name: "Nike Air Jordan 1 Retro High OG",
    description: "The Air Jordan 1 Retro High OG offers a premium take on the iconic silhouette. Featuring high-quality materials and classic colorways.",
    brand: "Nike",
    price: 200,
    originalPrice: 220,
    discountPercentage: 9,
    images: [
      "/assets/hero.png",
      "/assets/airjordan 1.jpg",
      "/assets/product1.png"
    ],
    countInStock: 25,
    rating: 4.9,
    numReviews: 124,
    isFeatured: true,
    isNewArrival: false,
    gender: "men",
    variants: [
      {
        color: "Bred",
        colorCode: "#000000",
        images: ["/assets/hero.png"],
        sizes: [
          { size: 8, countInStock: 5, price: 200 },
          { size: 9, countInStock: 8, price: 200 },
          { size: 10, countInStock: 6, price: 200 },
          { size: 11, countInStock: 4, price: 200 },
          { size: 12, countInStock: 2, price: 200 }
        ]
      }
    ],
    specifications: new Map([
      ["Material", "Leather"],
      ["Sole", "Rubber"],
      ["Closure", "Lace-up"],
      ["Country of Origin", "Vietnam"]
    ]),
    metaTitle: "Nike Air Jordan 1 Retro High OG - Premium Basketball Shoes",
    metaDescription: "Shop the iconic Nike Air Jordan 1 Retro High OG. Premium leather construction with classic colorways."
  },
  {
    name: "Adidas Superstar",
    description: "The iconic shell toe sneaker that started it all. A timeless classic that never goes out of style.",
    brand: "Adidas",
    price: 200,
    originalPrice: 200,
    discountPercentage: 0,
    images: [
      "/assets/Addidas.png",
      "/assets/product3.png",
      "/assets/product4.png"
    ],
    countInStock: 40,
    rating: 4.5,
    numReviews: 89,
    isFeatured: true,
    isNewArrival: false,
    gender: "men",
    variants: [
      {
        color: "Core Black",
        colorCode: "#000000",
        images: ["/assets/Addidas.png"],
        sizes: [
          { size: 7, countInStock: 8, price: 200 },
          { size: 8, countInStock: 10, price: 200 },
          { size: 9, countInStock: 12, price: 200 },
          { size: 10, countInStock: 8, price: 200 },
          { size: 11, countInStock: 2, price: 200 }
        ]
      }
    ],
    specifications: new Map([
      ["Material", "Leather"],
      ["Sole", "Rubber Shell Toe"],
      ["Style", "Classic Three Stripes"],
      ["Era", "1970s Original"]
    ]),
    metaTitle: "Adidas Superstar - Classic Shell Toe Sneakers",
    metaDescription: "The original Adidas Superstar with iconic shell toe design and three stripes."
  },
  {
    name: "Puma RS-X Reinvention",
    description: "The RS-X takes vintage running style to the max with bold colors and retro silhouettes that bring back the 80s.",
    brand: "Puma",
    price: 200,
    originalPrice: 220,
    discountPercentage: 9,
    images: [
      "/assets/rsx.png",
      "/assets/product7.png",
      "/assets/product8.png"
    ],
    countInStock: 28,
    rating: 5,
    numReviews: 67,
    isFeatured: true,
    isNewArrival: true,
    gender: "men",
    variants: [
      {
        color: "Multi-Color",
        colorCode: "#FF6B35",
        images: ["/assets/rsx.png"],
        sizes: [
          { size: 8, countInStock: 7, price: 200 },
          { size: 9, countInStock: 8, price: 200 },
          { size: 10, countInStock: 9, price: 200 },
          { size: 11, countInStock: 4, price: 200 }
        ]
      }
    ],
    specifications: new Map([
      ["Material", "Synthetic and Mesh"],
      ["Style", "Retro Running"],
      ["Closure", "Lace-up"],
      ["Era", "80s Inspired"]
    ]),
    metaTitle: "Puma RS-X Reinvention - Bold Retro Running Sneakers",
    metaDescription: "Step back in time with Puma RS-X retro running shoes featuring bold 80s-inspired design."
  },
  {
    name: "Nike Air Low Premium",
    description: "Premium comfort meets classic style in these versatile low-top sneakers perfect for everyday wear.",
    brand: "Nike",
    price: 150,
    originalPrice: 170,
    discountPercentage: 12,
    images: [
      "/assets/product7.png",
      "/assets/product5.png",
      "/assets/product6.png"
    ],
    countInStock: 35,
    rating: 5,
    numReviews: 156,
    isFeatured: false,
    isNewArrival: false,
    gender: "men",
    variants: [
      {
        color: "Premium White",
        colorCode: "#FFFFFF",
        images: ["/assets/product7.png"],
        sizes: [
          { size: 7, countInStock: 7, price: 150 },
          { size: 8, countInStock: 9, price: 150 },
          { size: 9, countInStock: 10, price: 150 },
          { size: 10, countInStock: 6, price: 150 },
          { size: 11, countInStock: 3, price: 150 }
        ]
      }
    ],
    specifications: new Map([
      ["Material", "Premium Leather"],
      ["Style", "Low Top"],
      ["Sole", "Rubber"],
      ["Comfort", "Air Cushioning"]
    ]),
    metaTitle: "Nike Air Low Premium - Classic Low-Top Sneakers",
    metaDescription: "Premium Nike Air Low sneakers with classic styling and superior comfort."
  },
  {
    name: "Nike Air Force Green",
    description: "The legendary Air Force 1 in a fresh green colorway. Street style meets basketball heritage.",
    brand: "Nike",
    price: 150,
    originalPrice: 150,
    discountPercentage: 0,
    images: [
      "/assets/product2.png",
      "/assets/nike-air-red.png",
      "/assets/product1.png"
    ],
    countInStock: 30,
    rating: 5,
    numReviews: 203,
    isFeatured: true,
    isNewArrival: false,
    gender: "men",
    variants: [
      {
        color: "Forest Green",
        colorCode: "#228B22",
        images: ["/assets/product2.png"],
        sizes: [
          { size: 8, countInStock: 8, price: 150 },
          { size: 9, countInStock: 10, price: 150 },
          { size: 10, countInStock: 7, price: 150 },
          { size: 11, countInStock: 5, price: 150 }
        ]
      }
    ],
    specifications: new Map([
      ["Material", "Leather"],
      ["Technology", "Air Force"],
      ["Sole", "Rubber"],
      ["Style", "Basketball Heritage"]
    ]),
    metaTitle: "Nike Air Force Green - Classic Basketball Sneakers",
    metaDescription: "Iconic Nike Air Force 1 in fresh green colorway with basketball heritage styling."
  },
  {
    name: "Nike Adapt BB Rose",
    description: "The future meets style in these self-lacing basketball shoes with premium rose colorway.",
    brand: "Nike",
    price: 150,
    originalPrice: 180,
    discountPercentage: 17,
    images: [
      "/assets/product3.png",
      "/assets/nike-adapt-bb.png",
      "/assets/nike-adapt-bb-smart.png"
    ],
    countInStock: 15,
    rating: 5,
    numReviews: 45,
    isFeatured: true,
    isNewArrival: true,
    gender: "men",
    variants: [
      {
        color: "Rose Gold",
        colorCode: "#E91E63",
        images: ["/assets/product3.png"],
        sizes: [
          { size: 9, countInStock: 3, price: 150 },
          { size: 10, countInStock: 4, price: 150 },
          { size: 11, countInStock: 5, price: 150 },
          { size: 12, countInStock: 3, price: 150 }
        ]
      }
    ],
    specifications: new Map([
      ["Technology", "Self-Lacing"],
      ["Connectivity", "Bluetooth"],
      ["Material", "Flyknit"],
      ["Sport", "Basketball"],
      ["App Control", "Nike Adapt App"]
    ]),
    metaTitle: "Nike Adapt BB Rose - Self-Lacing Smart Basketball Shoes",
    metaDescription: "Revolutionary Nike Adapt BB in rose colorway with self-lacing technology."
  },
  // Adding more diverse products
  {
    name: "Nike Air Max 270",
    description: "Inspired by two icons of big Air: the Air Max 180 and Air Max 93. The largest heel Max Air unit yet delivers exceptional cushioning.",
    brand: "Nike",
    price: 160,
    originalPrice: 180,
    discountPercentage: 11,
    images: [
      "/assets/product4.png",
      "/assets/product5.png",
      "/assets/product6.png"
    ],
    countInStock: 42,
    rating: 4.7,
    numReviews: 178,
    isFeatured: false,
    isNewArrival: true,
    gender: "unisex",
    variants: [
      {
        color: "Black/White",
        colorCode: "#000000",
        images: ["/assets/product4.png"],
        sizes: [
          { size: 7, countInStock: 8, price: 160 },
          { size: 8, countInStock: 10, price: 160 },
          { size: 9, countInStock: 12, price: 160 },
          { size: 10, countInStock: 8, price: 160 },
          { size: 11, countInStock: 4, price: 160 }
        ]
      }
    ],
    specifications: new Map([
      ["Technology", "Air Max 270"],
      ["Material", "Mesh and Synthetic"],
      ["Sole", "Rubber with Air Max"],
      ["Style", "Lifestyle"]
    ]),
    metaTitle: "Nike Air Max 270 - Maximum Air Cushioning",
    metaDescription: "Nike Air Max 270 with the largest heel Air Max unit for exceptional comfort."
  },
  {
    name: "Adidas Yeezy Boost 350",
    description: "The revolutionary Yeezy Boost 350 features Primeknit upper and full-length Boost midsole for ultimate comfort and style.",
    brand: "Adidas",
    price: 220,
    originalPrice: 250,
    discountPercentage: 12,
    images: [
      "/assets/product9.png",
      "/assets/product10.png",
      "/assets/product11.png"
    ],
    countInStock: 18,
    rating: 4.9,
    numReviews: 267,
    isFeatured: true,
    isNewArrival: true,
    gender: "unisex",
    variants: [
      {
        color: "Cream White",
        colorCode: "#F5F5DC",
        images: ["/assets/product9.png"],
        sizes: [
          { size: 8, countInStock: 4, price: 220 },
          { size: 9, countInStock: 5, price: 220 },
          { size: 10, countInStock: 6, price: 220 },
          { size: 11, countInStock: 3, price: 220 }
        ]
      }
    ],
    specifications: new Map([
      ["Material", "Primeknit"],
      ["Technology", "Boost Midsole"],
      ["Designer", "Kanye West"],
      ["Style", "Lifestyle/Fashion"]
    ]),
    metaTitle: "Adidas Yeezy Boost 350 - Premium Lifestyle Sneakers",
    metaDescription: "Adidas Yeezy Boost 350 designed by Kanye West with Primeknit and Boost technology."
  }
];

module.exports = {
  testProducts
};
