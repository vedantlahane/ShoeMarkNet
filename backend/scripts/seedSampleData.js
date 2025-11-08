/* eslint-disable no-console */
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify');

const Category = require('../models/Category');
const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const Campaign = require('../models/Campaign');
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');

const LEGACY_CATEGORY_NAMES = ['Running Shoes', 'Basketball Shoes'];
const LEGACY_PRODUCT_NAMES = [
  'Nike Air Zoom Pegasus 40',
  'Adidas Ultraboost Light',
  'Air Jordan 1 Retro High OG',
  'New Balance 550 Sea Salt'
];

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const SAMPLE_CATEGORIES = [
  {
    name: 'Lifestyle Sneakers',
    description: 'Everyday silhouettes built for comfort-first wear with a fashion-forward edge.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    isFeatured: true
  },
  {
    name: 'Performance Running',
    description: 'Responsive trainers tuned for tempo sessions, long runs, and race day breakthroughs.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
    isFeatured: true
  },
  {
    name: 'Trail & Adventure',
    description: 'Lugged traction, weather-ready uppers, and stability for off-road pursuits.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    isFeatured: true
  },
  {
    name: 'Walking & Comfort',
    description: 'Plush cushioning and ergonomic support to keep you moving all day long.',
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=80',
    isFeatured: true
  },
  {
    name: 'Slip-On Ease',
    description: 'Seamless entries and adaptive uppers for effortless style on the move.',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80',
    isFeatured: false
  },
  {
    name: 'Premium Boots',
    description: 'Heritage craftsmanship with modern insulation for rugged city-to-summit wear.',
    image: 'https://images.unsplash.com/photo-1528702748617-c64d49f918af?auto=format&fit=crop&w=1200&q=80',
    isFeatured: true
  },
  {
    name: 'Retro Classics',
    description: 'Timeless silhouettes reissued with premium materials and archival colorways.',
    image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=1200&q=80',
    isFeatured: false
  },
  {
    name: "Women's Collection",
    description: 'Curated styles engineered for women-specific fits and trend-forward palettes.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
    isFeatured: true
  },
  {
    name: 'High-Top Classics',
    description: 'Elevated collars for ankle support and statement-making street presence.',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80',
    isFeatured: false
  },
  {
    name: 'Limited Edition Drops',
    description: 'Small-batch collaborations and numbered releases for collectors.',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80',
    isFeatured: true
  },
  {
    name: 'Urban Commuter',
    description: 'Weather-resistant uppers paired with reflective hits for confident city navigation.',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80',
    isFeatured: false
  }
];

const SAMPLE_PRODUCTS = [
  {
    name: 'StrideForge Apex Runner',
    brand: 'StrideForge',
    category: 'Performance Running',
    description: 'Engineered mesh upper with responsive PulseFoam cushioning for uptempo training and race day breakthroughs.',
    price: 189.0,
    originalPrice: 219.0,
    images: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'unisex',
    isFeatured: true,
    isNewArrival: true,
    rating: 4.8,
    numReviews: 184,
    specifications: {
      cushioning: 'PulseFoam + Carbon Assist Plate',
      drop: '8 mm',
      weight: '275 g'
    },
    variants: [
      {
        color: 'Aurora Black',
        colorCode: '#111827',
        images: [
          'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 12, price: 189 },
          { size: 'US 9', countInStock: 14, price: 189 },
          { size: 'US 10', countInStock: 11, price: 189 }
        ]
      },
      {
        color: 'Glacier White',
        colorCode: '#F3F4F6',
        images: [
          'https://images.unsplash.com/photo-1523381140794-47a76ffeed00?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 8, price: 189 },
          { size: 'US 9', countInStock: 10, price: 189 },
          { size: 'US 10', countInStock: 9, price: 189 }
        ]
      }
    ],
    weight: 0.28,
    dimensions: { length: 33, width: 21, height: 12 }
  },
  {
    name: 'PulseRunner Velocity Knit',
    brand: 'PulseRunner',
    category: 'Walking & Comfort',
    description: 'Breathable knit upper with dual-density cushioning delivers effortless comfort for long days on your feet.',
    price: 149.0,
    originalPrice: 179.0,
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'unisex',
    isFeatured: true,
    rating: 4.7,
    numReviews: 142,
    specifications: {
      cushioning: 'DualWave EVA',
      upper: '360-degree knit weave',
      outsole: 'Adaptive flex rubber'
    },
    variants: [
      {
        color: 'Slate Navy',
        colorCode: '#1F2937',
        images: [
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 7', countInStock: 9, price: 149 },
          { size: 'US 8', countInStock: 12, price: 149 },
          { size: 'US 9', countInStock: 13, price: 149 }
        ]
      },
      {
        color: 'Nimbus Grey',
        colorCode: '#D1D5DB',
        images: [
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 7', countInStock: 7, price: 149 },
          { size: 'US 8', countInStock: 10, price: 149 },
          { size: 'US 9', countInStock: 8, price: 149 }
        ]
      }
    ]
  },
  {
    name: 'TerraTrail Summit Pro',
    brand: 'TerraTrail',
    category: 'Trail & Adventure',
    description: 'Vibram-inspired lugs, rock plate protection, and a weatherproof membrane keep you confident on technical terrain.',
    price: 209.0,
    originalPrice: 239.0,
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1528701800489-20be3cce9c08?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'unisex',
    isFeatured: true,
    rating: 4.9,
    numReviews: 96,
    specifications: {
      waterproof: 'StormShield membrane',
      outsole: 'MegaGrip 4.5mm lugs',
      drop: '6 mm'
    },
    variants: [
      {
        color: 'Forest Night',
        colorCode: '#065F46',
        images: [
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 8, price: 209 },
          { size: 'US 9', countInStock: 12, price: 209 },
          { size: 'US 10', countInStock: 9, price: 209 }
        ]
      },
      {
        color: 'Sunset Ember',
        colorCode: '#EA580C',
        images: [
          'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 6, price: 209 },
          { size: 'US 9', countInStock: 9, price: 209 },
          { size: 'US 10', countInStock: 7, price: 209 }
        ]
      }
    ]
  },
  {
    name: 'MetroFlex CityGlide 2.0',
    brand: 'MetroFlex',
    category: 'Urban Commuter',
    description: 'Reflective panels, hydrophobic knit, and an articulated sole keep you moving through wet city streets.',
    price: 169.0,
    originalPrice: 199.0,
    images: [
      'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'unisex',
    isFeatured: true,
    rating: 4.6,
    numReviews: 121,
    specifications: {
      upper: 'Hydroguard knit',
      outsole: 'Segmented reflex rubber',
  visibility: '360-degree reflective piping'
    },
    variants: [
      {
        color: 'Cinder Black',
        colorCode: '#0F172A',
        images: [
          'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 10, price: 169 },
          { size: 'US 9', countInStock: 12, price: 169 },
          { size: 'US 10', countInStock: 11, price: 169 }
        ]
      },
      {
        color: 'Neon Pulse',
        colorCode: '#22D3EE',
        images: [
          'https://images.unsplash.com/photo-1523381140794-47a76ffeed00?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 7, price: 169 },
          { size: 'US 9', countInStock: 9, price: 169 },
          { size: 'US 10', countInStock: 6, price: 169 }
        ]
      }
    ]
  },
  {
    name: 'NimbusStep Drift Slip',
    brand: 'NimbusStep',
    category: 'Slip-On Ease',
    description: 'Featherlight knit slip-on with cloud foam midsole and supportive arch band for all-day ease.',
    price: 129.0,
    originalPrice: 149.0,
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'women',
    isFeatured: false,
    rating: 4.5,
    numReviews: 88,
    specifications: {
      cushioning: 'CloudLite foam',
      upper: 'Seamless knit',
      weight: '215 g'
    },
    variants: [
      {
        color: 'Rose Quartz',
        colorCode: '#FBCFE8',
        images: [
          'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 6', countInStock: 8, price: 129 },
          { size: 'US 7', countInStock: 11, price: 129 },
          { size: 'US 8', countInStock: 9, price: 129 }
        ]
      },
      {
        color: 'Morning Mist',
        colorCode: '#E0F2FE',
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 6', countInStock: 6, price: 129 },
          { size: 'US 7', countInStock: 9, price: 129 },
          { size: 'US 8', countInStock: 7, price: 129 }
        ]
      }
    ]
  },
  {
    name: 'NimbusStep CloudWalker',
    brand: 'NimbusStep',
    category: "Women's Collection",
    description: 'Supportive midsole geometry tuned for women-specific biomechanics with a plush recycled knit upper.',
    price: 159.0,
    originalPrice: 189.0,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'women',
    isFeatured: true,
    rating: 4.6,
    numReviews: 132,
    specifications: {
      cushioning: 'CloudWalker dual-foam',
      stability: 'Guidance rail system',
      sustainability: '60% recycled knit upper'
    },
    variants: [
      {
        color: 'Soft Lavender',
        colorCode: '#C4B5FD',
        images: [
          'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 6', countInStock: 9, price: 159 },
          { size: 'US 7', countInStock: 11, price: 159 },
          { size: 'US 8', countInStock: 8, price: 159 }
        ]
      },
      {
        color: 'Chalk White',
        colorCode: '#F8FAFC',
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 6', countInStock: 7, price: 159 },
          { size: 'US 7', countInStock: 9, price: 159 },
          { size: 'US 8', countInStock: 7, price: 159 }
        ]
      }
    ]
  },
  {
    name: 'VelocityPro NitroFlash LTD',
    brand: 'VelocityPro',
    category: 'Limited Edition Drops',
    description: 'Carbon infused high-top with iridescent overlays and nitrogen-infused cushioning released in numbered batches.',
    price: 249.0,
    originalPrice: 289.0,
    images: [
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'unisex',
    isFeatured: true,
    isNewArrival: true,
    rating: 4.9,
    numReviews: 64,
    specifications: {
      edition: 'Limited to 1500 pairs',
      cushioning: 'NitroPod full-length',
      upper: 'Reflective phantom weave'
    },
    variants: [
      {
        color: 'Spectrum Black',
        colorCode: '#0B1120',
        images: [
          'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 5, price: 249 },
          { size: 'US 9', countInStock: 7, price: 249 },
          { size: 'US 10', countInStock: 6, price: 249 }
        ]
      },
      {
        color: 'Plasma Violet',
        colorCode: '#7C3AED',
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 4, price: 249 },
          { size: 'US 9', countInStock: 5, price: 249 },
          { size: 'US 10', countInStock: 4, price: 249 }
        ]
      }
    ]
  },
  {
    name: 'UrbanGlide Voyager Knit',
    brand: 'UrbanGlide',
    category: 'Lifestyle Sneakers',
    description: 'Sculpted EVA midsole and breathable knit upper blend comfort with elevated street style cues.',
    price: 139.0,
    originalPrice: 169.0,
    images: [
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'unisex',
    isFeatured: true,
    rating: 4.5,
    numReviews: 78,
    specifications: {
      upper: 'Dual-layer knit',
      midsole: 'Sculpted EVA',
      outsole: 'Herringbone traction'
    },
    variants: [
      {
        color: 'Charcoal',
        colorCode: '#1F2933',
        images: [
          'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 7', countInStock: 9, price: 139 },
          { size: 'US 8', countInStock: 12, price: 139 },
          { size: 'US 9', countInStock: 10, price: 139 }
        ]
      },
      {
        color: 'Sunrise Coral',
        colorCode: '#F97316',
        images: [
          'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 7', countInStock: 6, price: 139 },
          { size: 'US 8', countInStock: 8, price: 139 },
          { size: 'US 9', countInStock: 7, price: 139 }
        ]
      }
    ]
  },
  {
    name: 'UrbanGlide Heritage High',
    brand: 'UrbanGlide',
    category: 'Retro Classics',
    description: 'Premium leather overlays and vintage tooling revive a courtside icon for modern wardrobes.',
    price: 159.0,
    originalPrice: 189.0,
    images: [
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'unisex',
    isFeatured: false,
    rating: 4.4,
    numReviews: 54,
    specifications: {
      upper: 'Full-grain leather',
      collar: 'Padded high-top',
      outsole: 'Cupsole rubber'
    },
    variants: [
      {
        color: 'Heritage White',
        colorCode: '#F8FAFC',
        images: [
          'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 7, price: 159 },
          { size: 'US 9', countInStock: 9, price: 159 },
          { size: 'US 10', countInStock: 8, price: 159 }
        ]
      },
      {
        color: 'Crimson Accent',
        colorCode: '#DC2626',
        images: [
          'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 5, price: 159 },
          { size: 'US 9', countInStock: 6, price: 159 },
          { size: 'US 10', countInStock: 5, price: 159 }
        ]
      }
    ]
  },
  {
    name: 'SummitReach Ridge Boot GTX',
    brand: 'SummitReach',
    category: 'Premium Boots',
    description: 'Full-grain leather upper with recycled insulation and Vibram outsole built for winter commutes and alpine getaways.',
    price: 229.0,
    originalPrice: 269.0,
    images: [
      'https://images.unsplash.com/photo-1528702748617-c64d49f918af?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'unisex',
    isFeatured: true,
    rating: 4.7,
    numReviews: 73,
    specifications: {
      waterproof: 'Gore-Tex bootie',
      insulation: 'Primaloft Eco 100g',
      outsole: 'Vibram WinterGrip'
    },
    variants: [
      {
        color: 'Canyon Brown',
        colorCode: '#78350F',
        images: [
          'https://images.unsplash.com/photo-1528702748617-c64d49f918af?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 6, price: 229 },
          { size: 'US 9', countInStock: 8, price: 229 },
          { size: 'US 10', countInStock: 7, price: 229 }
        ]
      },
      {
        color: 'Glacier Grey',
        colorCode: '#9CA3AF',
        images: [
          'https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 5, price: 229 },
          { size: 'US 9', countInStock: 6, price: 229 },
          { size: 'US 10', countInStock: 5, price: 229 }
        ]
      }
    ],
    weight: 0.48
  },
  {
    name: 'StrideForge Tempo Elite',
    brand: 'StrideForge',
    category: 'Performance Running',
    description: 'Race-tuned plate and aero knit upper deliver explosive toe-off and stable landings for elite tempo sessions.',
    price: 215.0,
    originalPrice: 249.0,
    images: [
      'https://images.unsplash.com/photo-1599058918133-69b63003fe54?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542294516-41cd1f6b177d?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'unisex',
    isFeatured: true,
    rating: 4.9,
    numReviews: 102,
    specifications: {
      cushioning: 'TempoPulse supercritical foam',
      plate: 'Full-length carbon composite',
      drop: '7 mm'
    },
    variants: [
      {
        color: 'Carbon Red',
        colorCode: '#991B1B',
        images: [
          'https://images.unsplash.com/photo-1599058918133-69b63003fe54?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 6, price: 215 },
          { size: 'US 9', countInStock: 8, price: 215 },
          { size: 'US 10', countInStock: 7, price: 215 }
        ]
      },
      {
        color: 'Ice Silver',
        colorCode: '#E5E7EB',
        images: [
          'https://images.unsplash.com/photo-1542294516-41cd1f6b177d?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 5, price: 215 },
          { size: 'US 9', countInStock: 7, price: 215 },
          { size: 'US 10', countInStock: 6, price: 215 }
        ]
      }
    ]
  },
  {
    name: 'PulseRunner FlexRide Max',
    brand: 'PulseRunner',
    category: 'Walking & Comfort',
    description: 'Triple-density midsole with medial guidance rail keeps daily walkers stable and cushioned for miles.',
    price: 159.0,
    originalPrice: 189.0,
    images: [
      'https://images.unsplash.com/photo-1530882548122-0596ee66cdfb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523381201188-2cb8dd4e04d5?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'unisex',
    isFeatured: false,
    rating: 4.6,
    numReviews: 91,
    specifications: {
      cushioning: 'FlexRide triple-density',
      support: 'Medial guidance rail',
      upper: 'Engineered comfort mesh'
    },
    variants: [
      {
        color: 'Graphite',
        colorCode: '#374151',
        images: [
          'https://images.unsplash.com/photo-1530882548122-0596ee66cdfb?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 7', countInStock: 10, price: 159 },
          { size: 'US 8', countInStock: 12, price: 159 },
          { size: 'US 9', countInStock: 11, price: 159 }
        ]
      },
      {
        color: 'Ocean Mist',
        colorCode: '#93C5FD',
        images: [
          'https://images.unsplash.com/photo-1523381201188-2cb8dd4e04d5?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 7', countInStock: 8, price: 159 },
          { size: 'US 8', countInStock: 10, price: 159 },
          { size: 'US 9', countInStock: 9, price: 159 }
        ]
      }
    ]
  },
  {
    name: 'TerraTrail Horizon Mid',
    brand: 'TerraTrail',
    category: 'Trail & Adventure',
    description: 'Mid-cut stability, gusseted tongue, and reinforced toe rand protect against scree and slick descents.',
    price: 219.0,
    originalPrice: 259.0,
    images: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519681393784-9d0a00b71c06?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'unisex',
    isFeatured: false,
    rating: 4.8,
    numReviews: 87,
    specifications: {
      waterproof: 'StormShield Pro membrane',
      protection: 'Reinforced toe rand',
      outsole: 'HorizonGrip 5mm lugs'
    },
    variants: [
      {
        color: 'Summit Navy',
        colorCode: '#1E3A8A',
        images: [
          'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 7, price: 219 },
          { size: 'US 9', countInStock: 9, price: 219 },
          { size: 'US 10', countInStock: 8, price: 219 }
        ]
      },
      {
        color: 'Ash Grey',
        colorCode: '#9CA3AF',
        images: [
          'https://images.unsplash.com/photo-1519681393784-9d0a00b71c06?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 5, price: 219 },
          { size: 'US 9', countInStock: 7, price: 219 },
          { size: 'US 10', countInStock: 6, price: 219 }
        ]
      }
    ]
  },
  {
    name: 'MetroFlex NightShift GTX',
    brand: 'MetroFlex',
    category: 'Urban Commuter',
    description: 'Gore-Tex lining, reflective accents, and a grippy outsole built for late-night city riders and walkers.',
    price: 189.0,
    originalPrice: 219.0,
    images: [
      'https://images.unsplash.com/photo-1484976063839-977293d1231d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1589187155474-093b0c54b965?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'unisex',
    isFeatured: true,
    rating: 4.7,
    numReviews: 84,
    specifications: {
      waterproof: 'Gore-Tex Invisible Fit',
      visibility: 'Reflective heel counter',
      outsole: 'CityGrip wet-traction'
    },
    variants: [
      {
        color: 'Midnight Black',
        colorCode: '#0B1120',
        images: [
          'https://images.unsplash.com/photo-1484976063839-977293d1231d?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 9, price: 189 },
          { size: 'US 9', countInStock: 11, price: 189 },
          { size: 'US 10', countInStock: 9, price: 189 }
        ]
      },
      {
        color: 'Steel Grey',
        colorCode: '#6B7280',
        images: [
          'https://images.unsplash.com/photo-1589187155474-093b0c54b965?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 7, price: 189 },
          { size: 'US 9', countInStock: 8, price: 189 },
          { size: 'US 10', countInStock: 7, price: 189 }
        ]
      }
    ]
  },
  {
    name: 'NimbusStep CozyWave Mule',
    brand: 'NimbusStep',
    category: 'Slip-On Ease',
    description: 'Hybrid mule with collapsible heel and shearling-lined footbed for effortless transitions indoors and out.',
    price: 119.0,
    originalPrice: 139.0,
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504198458649-3128b932f49b?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'women',
    isFeatured: false,
    rating: 4.6,
    numReviews: 63,
    specifications: {
      cushioning: 'CozyWave foam',
      lining: 'Recycled shearling',
      heel: 'Collapsible design'
    },
    variants: [
      {
        color: 'Sandstone',
        colorCode: '#F5E0B8',
        images: [
          'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 6', countInStock: 7, price: 119 },
          { size: 'US 7', countInStock: 10, price: 119 },
          { size: 'US 8', countInStock: 8, price: 119 }
        ]
      },
      {
        color: 'Fog Grey',
        colorCode: '#CBD5F5',
        images: [
          'https://images.unsplash.com/photo-1504198458649-3128b932f49b?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 6', countInStock: 6, price: 119 },
          { size: 'US 7', countInStock: 8, price: 119 },
          { size: 'US 8', countInStock: 7, price: 119 }
        ]
      }
    ]
  },
  {
    name: 'VelocityPro Street Circuit',
    brand: 'VelocityPro',
    category: 'High-Top Classics',
    description: 'Street-ready high-top with molded ankle pods, forefoot Zoom pods, and reflective overlays for night runs.',
    price: 189.0,
    originalPrice: 229.0,
    images: [
      'https://images.unsplash.com/photo-1483664852095-df94d19e3fe4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1523381057414-f6cc7fc0e23f?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'unisex',
    isFeatured: true,
    rating: 4.5,
    numReviews: 59,
    specifications: {
      cushioning: 'StreetZoom forefoot pods',
      ankle: 'Molded support pods',
      visibility: 'Reflective overlays'
    },
    variants: [
      {
        color: 'Lunar Black',
        colorCode: '#111827',
        images: [
          'https://images.unsplash.com/photo-1483664852095-df94d19e3fe4?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 8, price: 189 },
          { size: 'US 9', countInStock: 10, price: 189 },
          { size: 'US 10', countInStock: 8, price: 189 }
        ]
      },
      {
        color: 'Neon Lime',
        colorCode: '#84CC16',
        images: [
          'https://images.unsplash.com/photo-1523381057414-f6cc7fc0e23f?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 6, price: 189 },
          { size: 'US 9', countInStock: 7, price: 189 },
          { size: 'US 10', countInStock: 6, price: 189 }
        ]
      }
    ]
  },
  {
    name: 'UrbanGlide Studio Low',
    brand: 'UrbanGlide',
    category: 'Lifestyle Sneakers',
    description: 'Minimalist leather low-top with suede overlays and cupsole cushioning for studio-to-street versatility.',
    price: 149.0,
    originalPrice: 179.0,
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1482349514655-8910ea843abc?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'unisex',
    isFeatured: false,
    rating: 4.4,
    numReviews: 48,
    specifications: {
      upper: 'Premium leather with suede overlays',
      midsole: 'Cupsole cushioning',
      lining: 'Moisture-wicking textile'
    },
    variants: [
      {
        color: 'Ivory',
        colorCode: '#F8F4ED',
        images: [
          'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 7', countInStock: 8, price: 149 },
          { size: 'US 8', countInStock: 10, price: 149 },
          { size: 'US 9', countInStock: 9, price: 149 }
        ]
      },
      {
        color: 'Slate Navy',
        colorCode: '#1F2A44',
        images: [
          'https://images.unsplash.com/photo-1482349514655-8910ea843abc?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 7', countInStock: 6, price: 149 },
          { size: 'US 8', countInStock: 8, price: 149 },
          { size: 'US 9', countInStock: 7, price: 149 }
        ]
      }
    ]
  },
  {
    name: 'SummitReach Alpine Low GTX',
    brand: 'SummitReach',
    category: 'Premium Boots',
    description: 'Low-cut alpine boot with waterproof membrane, speed hooks, and sticky rubber for fast hikes above tree line.',
    price: 219.0,
    originalPrice: 259.0,
    images: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80'
    ],
    gender: 'unisex',
    isFeatured: false,
    rating: 4.7,
    numReviews: 58,
    specifications: {
      waterproof: 'Gore-Tex Performance Comfort',
      lacing: 'Speed hook system',
      outsole: 'SummitGrip sticky rubber'
    },
    variants: [
      {
        color: 'Granite',
        colorCode: '#4B5563',
        images: [
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 7, price: 219 },
          { size: 'US 9', countInStock: 9, price: 219 },
          { size: 'US 10', countInStock: 8, price: 219 }
        ]
      },
      {
        color: 'Obsidian',
        colorCode: '#1F2937',
        images: [
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80'
        ],
        sizes: [
          { size: 'US 8', countInStock: 6, price: 219 },
          { size: 'US 9', countInStock: 8, price: 219 },
          { size: 'US 10', countInStock: 6, price: 219 }
        ]
      }
    ]
  }
];

const SAMPLE_REVIEW = {
  rating: 5,
  title: 'Responsive and light',
  comment: 'Clocked two half-marathons already—excellent lockdown and cushioning without hot spots.',
  status: 'approved',
  verifiedPurchase: true
};

const SAMPLE_ORDER = {
  paymentMethod: 'credit_card',
  tax: 18.5,
  shippingFee: 6.99,
  discount: 15,
  shippingAddress: {
    fullName: 'Demo Shopper',
    addressLine1: '221B Baker Street',
    city: 'London',
    state: 'London',
    postalCode: 'NW16XE',
    country: 'United Kingdom',
    phone: '+447700900123'
  }
};

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI in environment variables');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  });
}

async function seedCategories() {
  console.log('📁 Seeding categories');
  const map = new Map();

  if (LEGACY_CATEGORY_NAMES.length > 0) {
    await Category.deleteMany({ name: { $in: LEGACY_CATEGORY_NAMES } });
  }

  for (const categoryData of SAMPLE_CATEGORIES) {
    const slug = slugify(categoryData.name, { lower: true, strict: true });
    const category = await Category.findOneAndUpdate(
      { name: categoryData.name },
      { $set: { ...categoryData, slug } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    map.set(categoryData.name, category);
  }

  return map;
}

async function seedProducts(categoryMap) {
  console.log('👟 Seeding products');
  const products = [];

  if (LEGACY_PRODUCT_NAMES.length > 0) {
    await Product.deleteMany({ name: { $in: LEGACY_PRODUCT_NAMES } });
  }

  for (const productData of SAMPLE_PRODUCTS) {
    const category = categoryMap.get(productData.category);
    if (!category) {
      throw new Error(`Missing category for product: ${productData.name}`);
    }

    const payload = {
      ...productData,
      category: category._id,
      slug: slugify(productData.name, { lower: true, strict: true })
    };

    const product = await Product.findOneAndUpdate(
      { name: productData.name },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Ensure stock metrics are synced after potential variant changes.
    product.syncStockFromVariants();
    await product.save();

    await category.updateProductCount();

    products.push(product);
  }

  return products;
}

async function seedReview(user, product) {
  console.log('⭐ Seeding featured review');
  await Review.findOneAndUpdate(
    { user: user._id, product: product._id },
    {
      ...SAMPLE_REVIEW,
      user: user._id,
      product: product._id
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function seedOrder(user, products) {
  console.log('🧾 Seeding sample order');

  if (products.length < 2) return;

  const items = products.slice(0, 2).map((product, index) => {
    const variant = product.variants?.[0];
    const size = variant?.sizes?.[index] || variant?.sizes?.[0];

    return {
      product: product._id,
      quantity: index === 0 ? 2 : 1,
      price: size?.price || product.price,
      color: variant?.color,
      size: size?.size
    };
  });

  await Order.findOneAndUpdate(
    { user: user._id, 'items.0.product': items[0].product },
    {
      user: user._id,
      items,
      orderId: 'DEMO-ORDER-001',
      ...SAMPLE_ORDER,
      status: 'processing',
      isPaid: true,
      paidAt: new Date(),
      paymentResult: {
        id: 'demo_txn_001',
        status: 'succeeded',
        update_time: new Date().toISOString(),
        email_address: user.email
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function seedCoupons() {
  console.log('🎟️ Seeding coupons');
  const now = new Date();

  await Coupon.findOneAndUpdate(
    { code: 'WELCOME10' },
    {
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      minPurchase: 120,
      maxDiscount: 40,
      usageLimit: { total: 500, perUser: 2 },
      startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function seedPromotions() {
  console.log('📣 Seeding public promotions');
  const adminUser = await Admin.findOne();
  if (!adminUser) {
    console.warn('⚠️ No admin document found. Skipping campaign seeding. Run admin seeding first.');
    return;
  }

  const now = new Date();

  await Campaign.findOneAndUpdate(
    { name: 'Spring Step Up Sale' },
    {
      name: 'Spring Step Up Sale',
      description: 'Save on fresh arrivals and top sellers all month long.',
      type: 'promotion',
      discount: {
        type: 'percentage',
        value: 15,
        minimumPurchase: 150,
        maxDiscountAmount: 75
      },
      startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      status: 'active',
      isActive: true,
      isPublic: true,
      priority: 8,
      bannerImage: 'https://res.cloudinary.com/demo/image/upload/v1700000000/promotions/spring-step.jpg',
      ctaUrl: 'https://shoemarknet.com/collections/spring',
      targetAudience: {
        segments: ['all'],
        userTags: [],
        specificUsers: []
      },
      applicableItems: {
        allProducts: true
      },
      createdBy: adminUser._id
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function seedNotifications() {
  console.log('🔔 Seeding admin notifications');

  const payloads = [
    {
      title: 'Real-time dashboard is live',
      message: 'Monitor live orders, revenue, and active shoppers from the new realtime dashboard tab.',
      category: 'product',
      priority: 'medium'
    },
    {
      title: 'Inventory alert: Pegasus 40',
      message: 'Stock levels dipped below 15 units. Consider reordering soon.',
      category: 'inventory',
      priority: 'high'
    }
  ];

  for (const notification of payloads) {
    await Notification.findOneAndUpdate(
      { title: notification.title },
      notification,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

async function clearCollections() {
  console.log('🧹 Clearing collections');
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    Order.deleteMany({}),
    Wishlist.deleteMany({}),
    Cart.deleteMany({}),
    Coupon.deleteMany({}),
    Campaign.deleteMany({}),
    Notification.deleteMany({})
  ]);
}

async function seed() {
  const shouldReset = process.argv.includes('--fresh');

  await connectDB();

  if (shouldReset) {
    await clearCollections();
  }

  const categoryMap = await seedCategories();
  const products = await seedProducts(categoryMap);
  await seedCoupons();
  await seedPromotions();
  await seedNotifications();

  const demoUser = await User.findOne({ email: 'user@shoemarknet.test' });
  if (demoUser) {
    await seedReview(demoUser, products[0]);
    await seedOrder(demoUser, products);
  } else {
    console.warn('⚠️ Demo user not found. Run seedDefaultAccounts.js first to enable sample review/order seeding.');
  }

  console.log('✅ Sample data ready.');
  await mongoose.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('❌ Error seeding sample data:', error);
    await mongoose.disconnect();
    process.exit(1);
  });
