class UserController {
    constructor(User) {
        this.User = User;// The constructor method initializes the User model, which is used to interact with the MongoDB database.
        // model  is a representation of a collection in a MongoDB database.
        // It is used to interact with the database, such as querying, inserting, updating, and deleting documents.
        // The User model is passed as an argument when creating a new UserController instance.
        // This allows the controller to use the User model to perform user-related operations.
    }

    // createUser method is used to create a new user in the database.
    // It extracts the name, email, and password from the request body, creates a new user instance using the User model, and saves it to the database.
    // If the operation is successful, it returns a success response with a status code of 201 and the created user data.
    // If an error occurs during the process, it sends a 500 response with an error message.
    async createUser(req, res) {
        const { name, email, password } = req.body;
        try {
            const newUser = new this.User({ name, email, password });//creates a new user instance using the User model.
            await newUser.save();//saves the new user to the database.
            //save is a method provided by Mongoose that saves the document to the database.
            res.status(201).json({ message: 'User created successfully', user: newUser });
        } catch (error) {
            res.status(500).json({ message: 'Error creating user', error: error.message });
        }
    }

    // getUser method is used to retrieve a user from the database by ID.
    // It reads the user ID from the request parameters, searches for the user in the database, and returns the user data with a 200 status code if found.
    async getUser(req, res) {
        const { id } = req.params;//reads the user ID from the request parameters.
        try {
            const user = await this.User.findById(id);//searches for a user in the database by ID.
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving user', error: error.message });
        }
    }

    // deleteUser method is used to delete a user from the database by ID.
    // It reads the user ID from the request parameters, attempts to delete the user using the findByIdAndDelete method, and returns a success message if the deletion is successful.
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

// This controller class, named UserController, is designed to manage user-related operations in your backend.
// class means that it can be used to create objects with specific properties and methods.
// class has a constructor method that initializes the User model, which is passed as an argument when creating a new UserController instance.
// 
//  Here's a breakdown of what it does:


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