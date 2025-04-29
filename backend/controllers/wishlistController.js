// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
    if (!wishlist) {
      return res.status(200).json([]); // Return empty array
    }
    res.status(200).json(wishlist.products); // Return array of products
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
  }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, products: [] });
    }
    if (wishlist.products.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    wishlist.products.push(productId);
    await wishlist.save();
    updateLeadScore(req.user.id, 'add_to_wishlist');
    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
    res.status(200).json(populatedWishlist.products); // Return array of products
  } catch (error) {
    res.status(500).json({ message: 'Error adding to wishlist', error: error.message });
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    if (!wishlist.products.includes(productId)) {
      return res.status(400).json({ message: 'Product not in wishlist' });
    }
    wishlist.products = wishlist.products.filter(
      product => product.toString() !== productId
    );
    await wishlist.save();
    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');
    res.status(200).json(populatedWishlist.products); // Return array of products
  } catch (error) {
    res.status(500).json({ message: 'Error removing from wishlist', error: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
