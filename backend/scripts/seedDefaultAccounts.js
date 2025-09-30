const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

const DEFAULT_ACCOUNTS = [
  {
    label: 'Admin',
    name: 'Demo Admin',
    email: 'admin@shoemarknet.test',
    password: 'Admin@123!',
    role: 'admin',
    phone: '+155500001',
    preferences: {
      newsletter: true,
      marketing: true
    }
  },
  {
    label: 'User',
    name: 'Demo Shopper',
    email: 'user@shoemarknet.test',
    password: 'User@123!',
    role: 'user',
    phone: '+155500002',
    preferences: {
      newsletter: true,
      marketing: false
    }
  }
];

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI in environment variables');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  });
};

const upsertAccount = async (account) => {
  const { password, preferences = {}, ...profile } = account;

  const existingUser = await User.findOne({ email: profile.email });
  const basePreferences = {
    newsletter: false,
    marketing: false,
    ...preferences
  };

  if (existingUser) {
    existingUser.name = profile.name || existingUser.name;
    existingUser.role = profile.role || existingUser.role;
    existingUser.phone = profile.phone || existingUser.phone;
    existingUser.source = profile.source || existingUser.source || 'direct';
    existingUser.isActive = true;
    existingUser.isEmailVerified = true;
    existingUser.preferences = {
      ...existingUser.preferences?.toObject?.() ?? existingUser.preferences ?? {},
      ...basePreferences
    };
    existingUser.password = password;

    await existingUser.save();

    return { action: 'updated', email: existingUser.email };
  }

  await User.create({
    ...profile,
    password,
    preferences: basePreferences,
    source: profile.source || 'direct',
    isActive: true,
    isEmailVerified: true
  });

  return { action: 'created', email: profile.email };
};

const seedAccounts = async () => {
  console.log('🌱 Seeding default accounts...');
  await connectDB();

  const results = [];

  for (const account of DEFAULT_ACCOUNTS) {
    try {
      const result = await upsertAccount(account);
      results.push({
        label: account.label,
        email: account.email,
        password: account.password,
        status: result.action
      });
    } catch (error) {
      console.error(`❌ Failed to seed ${account.label} account (${account.email}):`, error.message);
      results.push({
        label: account.label,
        email: account.email,
        password: account.password,
        status: 'error'
      });
    }
  }

  console.table(results.map(({ label, email, password, status }) => ({ label, email, password, status })));
  console.log('✅ Default accounts are ready to use.');

  await mongoose.disconnect();
};

seedAccounts()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error while seeding accounts:', error);
    mongoose.disconnect().finally(() => process.exit(1));
  });
