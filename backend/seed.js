const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify');
const Product = require('./models/Product');
const Category = require('./models/Category');
const { testProducts } = require('./data/testProductData');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Product.deleteMany();
    await Category.deleteMany();

    // Create a default category
    const defaultCategory = await Category.create({
      name: 'Sneakers',
      slug: 'sneakers',
      description: 'Comfortable and stylish sneakers'
    });

    // Add category and slug to products
    const productsWithCategory = testProducts.map((product, index) => ({
      ...product,
      category: defaultCategory._id,
      slug: slugify(product.name + '-' + index, { lower: true, strict: true }),
      isActive: true
    }));

    await Product.insertMany(productsWithCategory);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    await Product.deleteMany();
    await Category.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
