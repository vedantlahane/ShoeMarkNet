const Shoe = require('../../models/Shoe');  // Your existing Shoe model
const Order = require('../../models/order'); // You'll need to create this

exports.getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Shoe.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);

        res.json({
            totalProducts,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('products.productId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Shoe.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = new Shoe(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Shoe.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await Shoe.findByIdAndDelete(id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};