/* eslint-disable no-console */
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Category = require('../models/Category');
const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const Cart = require('../models/Cart');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const SAMPLE_CATEGORIES = [
  {
    name: 'Lifestyle Sneakers',
    description: 'Casual sneakers designed for everyday comfort and style.',
    image: 'https://images.solecollector.com/assets/2023/04/pegasus-40.jpeg',
    isFeatured: true
  },
  {
    name: 'Running Shoes',
    description: 'Performance footwear engineered for road and trail mileage.',
    image: 'https://images.nike.com/is/image/DotCom/DQ3430_300',
    isFeatured: true
  },
  {
    name: 'Basketball Shoes',
    description: 'High-top support and cushioning tuned for the hardwood.',
    image: 'https://images.nike.com/is/image/DotCom/555088_161',
    isFeatured: false
  }
];

const SAMPLE_PRODUCTS = [
  {
    name: 'Nike Air Zoom Pegasus 40',
    brand: 'Nike',
    category: 'Running Shoes',
    description: 'Responsive Zoom Air units and React foam deliver daily mileage comfort with breathable mesh uppers.',
    price: 139.99,
    originalPrice: 159.99,
    discountPercentage: 12.5,
    images: [
      'https://static.nike.com/a/images/t_default/88e1efd2-pegasus-40-volt.png',
      'https://static.nike.com/a/images/t_default/pegasus-40-side.png'
    ],
    gender: 'unisex',
    isFeatured: true,
    isNewArrival: true,
    specifications: {
      cushioning: 'Nike React + Zoom Air',
      drop: '10 mm',
      weight: '281 g'
    },
    variants: [
      {
        color: 'Volt Green',
        colorCode: '#8DF35B',
        images: [
          'https://static.nike.com/a/images/t_prod/v1/pegasus-40-volt-lateral.png',
          'https://static.nike.com/a/images/t_prod/v1/pegasus-40-volt-medial.png'
        ],
        sizes: [
          { size: 'US 8', countInStock: 10, price: 139.99 },
          { size: 'US 9', countInStock: 14, price: 139.99 },
          { size: 'US 10', countInStock: 12, price: 139.99 }
        ]
      },
      {
        color: 'Anthracite/Black',
        colorCode: '#1C1C1C',
        images: [
          'https://static.nike.com/a/images/t_prod/v1/pegasus-40-black.png'
        ],
        sizes: [
          { size: 'US 8', countInStock: 6, price: 139.99 },
          { size: 'US 9', countInStock: 8, price: 139.99 },
          { size: 'US 10', countInStock: 5, price: 139.99 }
        ]
      }
    ],
    weight: 0.28,
    dimensions: { length: 34, width: 22, height: 13 }
  },
  {
    name: 'Adidas Ultraboost Light',
    brand: 'Adidas',
    category: 'Running Shoes',
    description: 'Lightweight Primeknit+ upper paired with Light BOOST cushioning for energetic runs.',
    price: 189.99,
    originalPrice: 210.00,
    discountPercentage: 9.5,
    images: [
      'https://assets.adidas.com/images/w_600/Ultraboost-Light-white.jpg',
      'https://assets.adidas.com/images/w_600/Ultraboost-Light-heel.jpg'
    ],
    gender: 'unisex',
    isFeatured: true,
    specifications: {
      cushioning: 'Light BOOST',
      upper: 'Primeknit+',
      outsole: 'Continental Rubber'
    },
    variants: [
      {
        color: 'Cloud White',
        colorCode: '#F5F5F5',
        images: [
          'https://assets.adidas.com/images/w_600/Ultraboost-Light-cloudwhite.jpg'
        ],
        sizes: [
          { size: 'US 7', countInStock: 5, price: 189.99 },
          { size: 'US 8', countInStock: 9, price: 189.99 },
          { size: 'US 9', countInStock: 11, price: 189.99 }
        ]
      },
      {
        color: 'Core Black',
        colorCode: '#000000',
        images: [
          'https://assets.adidas.com/images/w_600/Ultraboost-Light-coreblack.jpg'
        ],
        sizes: [
          { size: 'US 8', countInStock: 7, price: 189.99 },
          { size: 'US 9', countInStock: 10, price: 189.99 },
          { size: 'US 10', countInStock: 6, price: 189.99 }
        ]
      }
    ]
  },
  {
    name: 'Air Jordan 1 Retro High OG',
    brand: 'Jordan',
    category: 'Basketball Shoes',
    description: 'Iconic heritage styling with premium leather, encapsulated Air cushioning, and a high-top collar.',
    price: 179.99,
    originalPrice: 200.00,
    discountPercentage: 10,
    images: [
      'https://static.nike.com/a/images/t_prod/v1/air-jordan-1-retro-high-og-chicago.png',
      'https://static.nike.com/a/images/t_prod/v1/air-jordan-1-retro-high-og-back.png'
    ],
    gender: 'unisex',
    isFeatured: true,
    specifications: {
      colorway: 'Varsity Red/Black/Sail',
      releaseYear: '2023',
      materials: 'Full-grain leather upper'
    },
    variants: [
      {
        color: 'Chicago',
        colorCode: '#C8102E',
        images: [
          'https://static.nike.com/a/images/t_prod/v1/air-jordan-1-retro-high-og-chicago-lateral.png'
        ],
        sizes: [
          { size: 'US 8', countInStock: 4, price: 179.99 },
          { size: 'US 9', countInStock: 6, price: 179.99 },
          { size: 'US 10', countInStock: 5, price: 179.99 }
        ]
      },
      {
        color: 'Shadow 2.0',
        colorCode: '#4C4C4C',
        images: [
          'https://static.nike.com/a/images/t_prod/v1/air-jordan-1-retro-high-og-shadow.png'
        ],
        sizes: [
          { size: 'US 8', countInStock: 3, price: 179.99 },
          { size: 'US 9', countInStock: 5, price: 179.99 },
          { size: 'US 10', countInStock: 3, price: 179.99 }
        ]
      }
    ],
    weight: 0.41
  },
  {
    name: 'New Balance 550 Sea Salt',
    brand: 'New Balance',
    category: 'Lifestyle Sneakers',
    description: 'Retro basketball-inspired silhouette reinvented for daily wear with premium leather overlays.',
    price: 109.99,
    originalPrice: 120.00,
    discountPercentage: 8.5,
    images: [
      'https://nb.scene7.com/is/image/newbalance/BB550PWC_nb_02_i?$pdpflexf2$'
    ],
    gender: 'unisex',
    specifications: {
      upper: 'Leather',
      midsole: 'EVA foam',
      outsole: 'Rubber cupsole'
    },
    variants: [
      {
        color: 'Sea Salt',
        colorCode: '#F2EBD8',
        images: [
          'https://nb.scene7.com/is/image/newbalance/BB550PWC_nb_06_i?$pdpflexf2$'
        ],
        sizes: [
          { size: 'US 7', countInStock: 8, price: 109.99 },
          { size: 'US 8', countInStock: 11, price: 109.99 },
          { size: 'US 9', countInStock: 9, price: 109.99 }
        ]
      }
    ],
    isNewArrival: true
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

  for (const categoryData of SAMPLE_CATEGORIES) {
    const category = await Category.findOneAndUpdate(
      { name: categoryData.name },
      { $set: categoryData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    map.set(categoryData.name, category);
  }

  return map;
}

async function seedProducts(categoryMap) {
  console.log('👟 Seeding products');
  const products = [];

  for (const productData of SAMPLE_PRODUCTS) {
    const category = categoryMap.get(productData.category);
    if (!category) {
      throw new Error(`Missing category for product: ${productData.name}`);
    }

    const payload = {
      ...productData,
      category: category._id
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

async function clearCollections() {
  console.log('🧹 Clearing collections');
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    Order.deleteMany({}),
    Wishlist.deleteMany({}),
    Cart.deleteMany({})
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
