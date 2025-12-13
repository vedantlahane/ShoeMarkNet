require('dotenv').config();
const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Product = require('../models/Product');
const { connectDB } = require('../utils/database');

const seedCampaignData = async () => {
    try {
        await connectDB();

        // Clear existing campaigns
        await Campaign.deleteMany({});
        console.log('Cleared existing campaigns.');

        const products = await Product.find({});
        if (products.length === 0) {
            console.log('No products found. Please run seedSampleData.js first.');
            process.exit(1);
        }

        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const campaigns = [
            {
                name: 'Flash Sale Extravaganza',
                slug: 'flash-sale-extravaganza',
                description: 'Get up to 50% off on selected premium footwear. Limited time offer!',
                type: 'sale',
                startDate: now,
                endDate: threeDaysFromNow,
                status: 'active',
                isActive: true,
                isPublic: true,
                priority: 10,
                bannerImage: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80',
                discount: { type: 'percentage', value: 0 },
                applicableItems: { products: products.slice(0, 10).map(p => p._id), allProducts: false },
                createdBy: new mongoose.Types.ObjectId(),
                marketing: { hashtags: ['#FlashSale', '#Deals'] }
            },
            {
                name: 'Summer Clearance',
                slug: 'summer-clearance',
                description: 'End of season clearance. Everything must go!',
                type: 'sale',
                startDate: now,
                endDate: thirtyDaysFromNow,
                status: 'active',
                isActive: true,
                isPublic: true,
                priority: 5,
                bannerImage: 'https://images.unsplash.com/photo-1560769629-975e13f0c470?auto=format&fit=crop&w=1200&q=80',
                discount: { type: 'percentage', value: 30 },
                applicableItems: { products: products.slice(10, 20).map(p => p._id), allProducts: false },
                createdBy: new mongoose.Types.ObjectId(),
                marketing: { hashtags: ['#Clearance', '#SummerSale'] }
            },
            {
                name: 'Buy One Get One Free',
                slug: 'buy-one-get-one-free',
                description: 'Buy any pair of running shoes and get a second pair free!',
                type: 'promotion',
                startDate: now,
                endDate: sevenDaysFromNow,
                status: 'active',
                isActive: true,
                isPublic: true,
                priority: 8,
                bannerImage: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80',
                discount: { type: 'bogo', value: 0 },
                bundleConfig: { buyQuantity: 1, getQuantity: 1, getDiscountPercentage: 100 },
                applicableItems: { products: products.slice(20, 25).map(p => p._id), allProducts: false },
                createdBy: new mongoose.Types.ObjectId(),
                marketing: { hashtags: ['#BOGO', '#FreeShoes'] }
            },
            {
                name: 'New Arrivals Launch',
                slug: 'new-arrivals-launch',
                description: 'Check out the latest trends in footwear.',
                type: 'promotion',
                startDate: now,
                endDate: sevenDaysFromNow,
                status: 'active',
                isActive: true,
                isPublic: true,
                priority: 7,
                bannerImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
                discount: { type: 'fixed', value: 0 },
                applicableItems: { products: products.slice(0, 5).map(p => p._id), allProducts: false },
                createdBy: new mongoose.Types.ObjectId(),
                marketing: { hashtags: ['#NewArrivals', '#FreshKicks'] }
            }
        ];

        await Campaign.insertMany(campaigns);
        console.log(`Seeded ${campaigns.length} campaigns successfully.`);

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedCampaignData();
