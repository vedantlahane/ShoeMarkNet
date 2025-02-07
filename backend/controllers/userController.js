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