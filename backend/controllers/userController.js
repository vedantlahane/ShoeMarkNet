class UserController {
    constructor(User) {
        this.User = User;
    }

    async createUser(req, res) {
        const { name, email, password } = req.body;
        try {
            const newUser = new this.User({ name, email, password });
            await newUser.save();
            res.status(201).json({ message: 'User created successfully', user: newUser });
        } catch (error) {
            res.status(500).json({ message: 'Error creating user', error: error.message });
        }
    }

    async getUser(req, res) {
        const { id } = req.params;
        try {
            const user = await this.User.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving user', error: error.message });
        }
    }

    async deleteUser(req, res) {
        const { id } = req.params;
        try {
            const user = await this.User.findByIdAndDelete(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user', error: error.message });
        }
    }
}

module.exports = UserController;

// This controller class, named UserController, is designed to manage user-related operations in your backend. Here's a breakdown of what it does:

// Initialization:

// The constructor receives a User model (presumably a Mongoose model). This model is used in all methods to interact with the MongoDB database.
// createUser:

// Extracts name, email, and password from the request body.
// Creates a new user instance using the User model.
// Saves the new user to the database.
// Returns a success response with a status code of 201 and the created user data.
// If an error occurs, it sends a 500 response with an error message.
// getUser:

// Reads the user id from the request parameters.
// Searches for a user in the database by ID.
// If found, returns the user data with a 200 status code; if not found, returns a 404 status with an error message.
// Any errors during the process result in a 500 response.
// deleteUser:

// Reads the user id from the request parameters.
// Attempts to delete the user from the database using the findByIdAndDelete method.
// Returns a success message if the deletion is successful, or a 404 response if the user is not found.
// Handles errors by sending a 500 response with an error message.
// In summary, this controller encapsulates the logic for creating, retrieving, and deleting a user, making these functionalities reusable and easy to integrate with your express routes.