const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        name: { type: String, required: true },
        email: { type: String, required: true }
    },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shoe' },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        address: String,
        city: String,
        postalCode: String,
        country: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);