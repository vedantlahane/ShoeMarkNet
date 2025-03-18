const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
name: { type: String, required: true },
email: { type: String, required: true, unique: true },
phone: { type: String, required: true },
password:{ type: String, required: true },
source: { type: String, required: true }, // e.g. "web", "email", "social media", "referral", etc.
score: { type: Number, default: 0 } // Lead score that can be updated based on interactions
}, { timestamps: true });

// Pre-save hook to handle password hashing and initial score setting
userSchema.pre('save', async function(next) {
// For new documents, set the initial score based on the source, if not already provided
if (this.isNew) {
// Customize your logic here. For example, if the source is "referral", give an initial boost.
if (this.source === 'referral') {
this.score = 10;
} else {
this.score = 0;
}
}

// If password is modified, hash it before saving
if (this.isModified('password')) {
try {
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(this.password, salt);
this.password = hashedPassword;
} catch (error) {
return next(error);
}
}

next();
});

// Method to compare the entered password with the stored hash
userSchema.methods.comparePassword = async function(enteredPassword) {
return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model('User', userSchema);