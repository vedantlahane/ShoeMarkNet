const mongoose = require('mongoose');

const connectDB = async () => {
    mongoose.connect(process.env.MONGODB_URI);
    mongoose.connection.on('connected', () => {
        console.log('MongoDB connected successfully');
    })

};

module.exports = connectDB;
