
/* models/user.js */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
name: { type: String, required: true },
email: { type: String, required: true, unique: true },
phone: { type: String, required: true }, // Added phone number field
password:{ type: String, required: true },
}, { timestamps: true });

// Pre-save hook to hash the password before saving
userSchema.pre('save', async function(next) {
if (!this.isModified('password')) return next();
try {
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(this.password, salt);
this.password = hashedPassword;
next();
} catch (error) {
next(error);
}
});

// Method to compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model('User', userSchema);