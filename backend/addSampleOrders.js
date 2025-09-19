const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const addSampleOrders = async () => {
  try {
    console.log('📋 Adding sample orders...');
    
    await connectDB();

    // Get users and products
    const users = await User.find({ role: 'user' });
    const products = await Product.find();

    if (users.length === 0 || products.length === 0) {
      console.log('❌ No users or products found. Please seed basic data first.');
      process.exit(1);
    }

    const sampleOrders = [
      {
        user: users[0]._id, // Alex Johnson
        items: [
          {
            product: products.find(p => p.name.includes('Air Jordan 1 Retro High'))._id,
            quantity: 1,
            price: 170,
            color: 'White/Black-Gym Red',
            size: 10
          }
        ],
        status: 'delivered',
        totalPrice: 170,
        tax: 13.60,
        shippingFee: 0,
        grandTotal: 183.60,
        shippingAddress: {
          fullName: "Alex Johnson",
          addressLine1: "123 Main Street",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "United States",
          phone: "+1-555-0101"
        },
        billingAddress: {
          fullName: "Alex Johnson", 
          addressLine1: "123 Main Street",
          city: "New York",
          state: "NY", 
          postalCode: "10001",
          country: "United States",
          phone: "+1-555-0101"
        },
        paymentMethod: 'credit_card',
        paymentStatus: 'paid'
      },
      {
        user: users[1]._id, // Sarah Chen
        items: [
          {
            product: products.find(p => p.name.includes('Ultraboost 22'))._id,
            quantity: 1,
            price: 190,
            color: 'Core Black',
            size: 8
          },
          {
            product: products.find(p => p.name.includes('Stan Smith'))._id,
            quantity: 1,
            price: 90,
            color: 'Cloud White/Green',
            size: 8
          }
        ],
        status: 'shipped',
        totalPrice: 280,
        discount: 28, // 10% discount
        tax: 20.16,
        shippingFee: 5.99,
        grandTotal: 278.15,
        shippingAddress: {
          fullName: "Sarah Chen",
          addressLine1: "456 Oak Avenue",
          city: "Los Angeles",
          state: "CA",
          postalCode: "90210", 
          country: "United States",
          phone: "+1-555-0102"
        },
        billingAddress: {
          fullName: "Sarah Chen",
          addressLine1: "456 Oak Avenue",
          city: "Los Angeles",
          state: "CA",
          postalCode: "90210",
          country: "United States",
          phone: "+1-555-0102"
        },
        paymentMethod: 'credit_card',
        paymentStatus: 'paid'
      },
      {
        user: users[2]._id, // Mike Rodriguez
        items: [
          {
            product: products.find(p => p.name.includes('Vans Old Skool'))._id,
            quantity: 2,
            price: 65,
            color: 'Black/White',
            size: 11
          }
        ],
        status: 'processing',
        totalPrice: 130,
        tax: 10.40,
        shippingFee: 7.99,
        grandTotal: 148.39,
        shippingAddress: {
          fullName: "Mike Rodriguez",
          addressLine1: "321 Pine Street",
          city: "Chicago", 
          state: "IL",
          postalCode: "60601",
          country: "United States",
          phone: "+1-555-0103"
        },
        billingAddress: {
          fullName: "Mike Rodriguez",
          addressLine1: "321 Pine Street", 
          city: "Chicago",
          state: "IL",
          postalCode: "60601",
          country: "United States",
          phone: "+1-555-0103"
        },
        paymentMethod: 'paypal',
        paymentStatus: 'paid'
      },
      {
        user: users[3]._id, // Emma Thompson
        items: [
          {
            product: products.find(p => p.name.includes('Air Jordan 1 Low'))._id,
            quantity: 1,
            price: 90,
            color: 'White/University Blue',
            size: 7
          }
        ],
        status: 'delivered',
        totalPrice: 90,
        tax: 7.20,
        shippingFee: 0,
        grandTotal: 97.20,
        shippingAddress: {
          fullName: "Emma Thompson",
          addressLine1: "654 Maple Drive",
          city: "Seattle",
          state: "WA",
          postalCode: "98101",
          country: "United States",
          phone: "+1-555-0104"
        },
        billingAddress: {
          fullName: "Emma Thompson",
          addressLine1: "654 Maple Drive",
          city: "Seattle", 
          state: "WA",
          postalCode: "98101",
          country: "United States",
          phone: "+1-555-0104"
        },
        paymentMethod: 'credit_card',
        paymentStatus: 'paid'
      },
      {
        user: users[4]._id, // David Kim
        items: [
          {
            product: products.find(p => p.name.includes('Travis Scott'))._id,
            quantity: 1,
            price: 150,
            color: 'Light Smoke Grey/Gym Red-Sail',
            size: 10
          }
        ],
        status: 'cancelled',
        totalPrice: 150,
        tax: 12.00,
        shippingFee: 9.99,
        grandTotal: 171.99,
        shippingAddress: {
          fullName: "David Kim",
          addressLine1: "987 Cedar Lane",
          city: "Miami",
          state: "FL",
          postalCode: "33101", 
          country: "United States",
          phone: "+1-555-0105"
        },
        billingAddress: {
          fullName: "David Kim",
          addressLine1: "987 Cedar Lane",
          city: "Miami",
          state: "FL", 
          postalCode: "33101",
          country: "United States",
          phone: "+1-555-0105"
        },
        paymentMethod: 'credit_card',
        paymentStatus: 'refunded'
      }
    ];

    // Create orders
    const createdOrders = [];
    for (let i = 0; i < sampleOrders.length; i++) {
      const orderData = sampleOrders[i];
      
      // Add dates (simulate orders from past few weeks)
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      
      const order = await Order.create({
        ...orderData,
        createdAt: orderDate,
        updatedAt: orderDate
      });
      
      createdOrders.push(order);
      console.log(`   ✅ Created order ${order.orderId} for ${users.find(u => u._id.equals(order.user)).name}`);
    }

    console.log(`\n📊 Created ${createdOrders.length} sample orders!`);
    console.log('   Order statuses:');
    const statusCounts = createdOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`     ${status}: ${count}`);
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Error adding sample orders:', error);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  addSampleOrders();
}

module.exports = { addSampleOrders };
