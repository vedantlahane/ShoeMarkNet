const mongoose = require('mongoose');

const connectDB = async (uri = process.env.MONGODB_URI) => {
    if (!uri) {
        throw new Error('MONGODB_URI must be provided to connect to MongoDB');
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    await mongoose.connect(uri);

    if (process.env.NODE_ENV !== 'test') {
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        });
    }

    return mongoose.connection;
};

const disconnectDB = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
};

module.exports = {
    connectDB,
    disconnectDB
};
