require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { connectDB } = require('../utils/database');

const seedSaleData = async () => {
    try {
        await connectDB();

        const products = await Product.find({});
        console.log(`Found ${products.length} products`);

        let updatedCount = 0;

        for (const product of products) {
            // Randomly decide if this product should be on sale (30% chance)
            if (Math.random() < 0.3) {
                const discountPercentage = Math.floor(Math.random() * 41) + 10; // 10% to 50%

                // If product already has a discount, skip or update? Let's update.
                // Ensure originalPrice is set
                if (!product.originalPrice || product.originalPrice === 0) {
                    product.originalPrice = product.price;
                }

                // Calculate new price based on discount
                const originalPrice = product.originalPrice;
                const discountAmount = (originalPrice * discountPercentage) / 100;
                const newPrice = originalPrice - discountAmount;

                product.price = Math.round(newPrice * 100) / 100; // Round to 2 decimal places
                product.discountPercentage = discountPercentage;

                await product.save();
                updatedCount++;
                console.log(`Updated ${product.name}: ${discountPercentage}% off`);
            } else {
                // Ensure non-sale products have clean state if needed, 
                // but for now let's just leave them or reset them if we want a fresh seed?
                // Let's just add sales, not remove existing ones unless explicitly asked.
                // But to ensure we have a mix, maybe we should reset some? 
                // For this task, just adding sales is safer.
            }
        }

        console.log(`Successfully updated ${updatedCount} products with sale data`);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedSaleData();
