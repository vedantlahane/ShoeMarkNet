// seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Import Mongoose models
const Homeapi = require('./models/homeapi');
const Popularsales = require('./models/popularsales');
const Highlight = require('./models/highlight');
const Sneaker = require('./models/sneaker');
const Topratesales = require('./models/topratesales');
const Story = require('./models/story');
const FooterAPI = require('./models/footerAPI');
const User = require('./models/user');

// Import data files
const homeapiData = require('./data/homeapi.json');
const popularsalesData = require('./data/popularsales.json');
const highlightData = require('./data/highlight.json');
const sneakerData = require('./data/sneaker.json');
const topratesalesData = require('./data/topratesales.json');
const storyData = require('./data/story.json');
const footerAPIData = require('./data/footerAPI.json');
const userData = require('./data/user.json');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shoemarknet';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected!');
    seedData();
  })
  .catch((err) => {
    console.error('Connection error:', err);
  });

// Seed function
async function seedData() {
  try {
    console.log('Seeding data...');

    // Clear existing data to avoid duplicates
    await Homeapi.deleteMany({});
    await Popularsales.deleteMany({});
    await Highlight.deleteMany({});
    await Sneaker.deleteMany({});
    await Topratesales.deleteMany({});
    await Story.deleteMany({});
    await FooterAPI.deleteMany({});
    await User.deleteMany({});

    // Insert new data
    await Homeapi.create(homeapiData);
    await Popularsales.insertMany(popularsalesData);
    await Highlight.create(highlightData);
    await Sneaker.insertMany(sneakerData);
    await Topratesales.insertMany(topratesalesData);
    await Story.insertMany(storyData);
    await FooterAPI.create(footerAPIData);
    await User.insertMany(userData);

    console.log('Data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}
