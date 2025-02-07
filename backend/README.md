# MERN Stack Project

This is a simple MERN (MongoDB, Express, React, Node.js) stack project that demonstrates user management functionality. The backend is built using Node.js and Express, and it connects to a MongoDB database using Mongoose.

## Project Structure

```
mern-backend
├── config
│   └── db.js                # Database configuration and connection logic
├── controllers
│   └── userController.js     # User-related request handlers
├── models
│   └── user.js               # User model definition
├── routes
│   └── userRoutes.js         # User routes setup
├── app.js                    # Entry point of the application
├── package.json              # Project dependencies and scripts
└── README.md                 # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd mern-backend
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the MongoDB server (make sure MongoDB is installed and running).
2. Run the application:
   ```
   node app.js
   ```

3. The server will start on the specified port (default is 5000).

## API Endpoints

- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get a user by ID
- `DELETE /api/users/:id` - Delete a user by ID

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.