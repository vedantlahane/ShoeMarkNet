/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const Product = require('../models/Product');

const productImageUpdates = {
    'Nike Air Jordan 1 Retro High OG': [
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=1200&q=80'
    ],
    'Adidas Yeezy Boost 350': [
        'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80'
    ],
    'Nike Air Low Premium': [
        'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80'
    ],
    'Adidas Superstar': [
        'https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1605408499391-6368c628ef42?auto=format&fit=crop&w=1200&q=80'
    ],
    'Nike Air Force Green': [
        'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80'
    ],
    'Nike Air Max 270': [
        'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=1200&q=80'
    ],
    'Nike Adapt BB Rose': [
        'https://images.unsplash.com/photo-1606890542528-f89c3a13b3ab?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80'
    ],
    'Puma RS-X Reinvention': [
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=1200&q=80'
    ]
};

const categoryImageUpdates = {
    'Basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    'Fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80',
    'Lifestyle': 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    'Running': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80'
};

async function updateImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Update products
        for (const [name, images] of Object.entries(productImageUpdates)) {
            const result = await Product.updateOne(
                { name },
                {
                    $set: {
                        images,
                        'variants.$[].images': [images[0]]
                    }
                }
            );
            console.log(`Updated ${name}: ${result.modifiedCount} modified`);
        }

        // Update categories
        const Category = require('../models/Category');
        for (const [name, image] of Object.entries(categoryImageUpdates)) {
            const result = await Category.updateOne(
                { name },
                { $set: { image } }
            );
            console.log(`Updated category ${name}: ${result.modifiedCount} modified`);
        }

        console.log('✅ All images updated successfully!');
    } catch (error) {
        console.error('Error updating images:', error);
    } finally {
        await mongoose.disconnect();
    }
}

updateImages();
