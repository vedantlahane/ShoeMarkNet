require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { connectDB } = require('../utils/database');

const inspectSaleData = async () => {
    try {
        await connectDB();

        const saleProducts = await Product.find({ discountPercentage: { $gt: 0 } });
        console.log(`Found ${saleProducts.length} products with discount > 0`);

        if (saleProducts.length > 0) {
            console.log('Sample product:', JSON.stringify(saleProducts[0], null, 2));
        } else {
            // Check a few random products to see what they look like
            const randomProducts = await Product.find().limit(3);
            console.log('Random products:', JSON.stringify(randomProducts, null, 2));
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

inspectSaleData();
