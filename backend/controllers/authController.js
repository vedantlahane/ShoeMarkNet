/* controllers/authController.js */
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Replace with your own secret key (preferably stored in your .env file)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Register Controller
exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body; // Include phone

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Create new user with phone number

    user = new User({ name, email, phone, password });

    await user.save();

    // Generate JWT token

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      token,

      user: {
        id: user._id,

        name: user.name,

        email: user.email,

        phone: user.phone, // Returning phone number in the response
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Login Controller remains similar. Typically we use only email and password for login.
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Verify password

    const isMatch = await user.comparePassword(password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,

      user: {
        id: user._id,

        name: user.name,

        email: user.email,

        phone: user.phone, // Include phone info in response
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
