const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // store hashed passwords
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
// it can be also written as:
// const User = mongoose.model('User', userSchema);
// module.exports = User;
