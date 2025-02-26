const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;


//dotenv.config() will load the .env file and make the environment variables available to the application.
//async/await is used to handle asynchronous operations in a synchronous way.
// that means the code will wait for the operation to complete before moving on to the next line.
//asynchronous operations are non-blocking, meaning the application can continue to run while waiting for the operation to complete.
//here we are using async/await to connect to the MongoDB database.
//which is an asynchronous operation that returns a promise.
// that is beacause the connection to the database may take some time to establish.
//if the connection is successful, the code will log a message to the console.
//if the connection fails, the code will log an error message and exit the process.
//finally, the connectDB function is exported so it can be used in other parts of the application.
//module means that the connectDB function is a module that can be imported into other files using require() or import.