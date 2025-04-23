import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist } from '../redux/slices/wishlistSlice';
import Rating from '../components/Rating';
import ReviewForm from '../components/ReviewForm';
import Loader from '../components/common/Loader';
import { FaShoppingCart, FaHeart, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify'; // Assuming you're using react-toastify

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, loading, error } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  
  // State management
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [mainImage, setMainImage] = useState('');
  
  // Calculate discounted price if applicable
  const calculateDiscountedPrice = useCallback((price, discountPercentage) => {
    if (discountPercentage && discountPercentage > 0) {
      return price - (price * discountPercentage / 100);
    }
    return null;
  }, []);

  // Fetch product details when component mounts or ID changes
  useEffect(() => {
    dispatch(fetchProductById(id));
    window.scrollTo(0, 0);
  }, [dispatch, id]);
  
  // Set main image when product loads or when selected variant changes
  useEffect(() => {
    if (product) {
      // Set main image based on selected variant or first product image
      if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
        setMainImage(selectedVariant.images[0]);
      } else if (product.images && product.images.length > 0) {
        setMainImage(product.images[0]);
      }
    }
  }, [product, selectedVariant]);
  
  // Handle variant selection
  const handleColorSelect = (variant) => {
    setSelectedVariant(variant);
    setSelectedColor(variant.color);
    setSelectedSize(''); // Reset size when color changes
  };
  
  // Handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSize(size.size);
  };
  
  // Get available sizes for the selected variant
  const getAvailableSizes = useCallback(() => {
    if (selectedVariant) {
      return selectedVariant.sizes || [];
    } else if (product && product.variants && product.variants.length > 0) {
      // If no variant selected but product has variants, return sizes from first variant
      return product.variants[0].sizes || [];
    }
    return [];
  }, [product, selectedVariant]);
  
  // Check if a size is in stock
  const isSizeInStock = useCallback((size) => {
    if (selectedVariant) {
      const sizeObj = selectedVariant.sizes.find(s => s.size === size.size);
      return sizeObj && sizeObj.countInStock > 0;
    }
    return size.countInStock > 0;
  }, [selectedVariant]);
  
  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      const maxStock = getMaxStock();
      setQuantity(Math.min(value, maxStock));
    }
  };
  
  // Get maximum stock for selected variant and size
  const getMaxStock = useCallback(() => {
    if (selectedVariant && selectedSize) {
      const sizeObj = selectedVariant.sizes.find(s => s.size === selectedSize);
      return sizeObj ? sizeObj.countInStock : 0;
    } else if (product) {
      return product.countInStock || 0;
    }
    return 0;
  }, [product, selectedVariant, selectedSize]);
  
  // Handle add to cart
  const handleAddToCart = () => {
    // Validate selection
    if (product.variants && product.variants.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    
    if (getAvailableSizes().length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    const maxStock = getMaxStock();
    if (maxStock <= 0) {
      toast.error('This item is out of stock');
      return;
    }
    
    // Find if this item is already in cart
    const existingCartItem = cartItems.find(item => 
      item.productId === product._id && 
      item.size === selectedSize && 
      item.color === selectedColor
    );
    
    // Check if adding would exceed stock
    if (existingCartItem && (existingCartItem.quantity + quantity > maxStock)) {
      toast.warning(`You can only add ${maxStock - existingCartItem.quantity} more of this item`);
      return;
    }
    
    // Prepare cart item
    const cartItem = {
      productId: product._id,
      quantity,
      size: selectedSize,
      color: selectedColor,
      price: selectedVariant && selectedVariant.price ? selectedVariant.price : product.price,
      name: product.name,
      image: mainImage
    };
    
    dispatch(addToCart(cartItem));
    toast.success('Added to cart successfully!');
  };
  
  // Handle add to wishlist
  const handleAddToWishlist = () => {
    if (!user) {
      toast.info('Please sign in to add items to your wishlist');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    dispatch(addToWishlist(product._id));
    toast.success('Added to wishlist!');
  };
  
  // Handle image click
  const handleImageClick = (image) => {
    setMainImage(image);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error.message || 'Failed to load product'}</span>
          <button 
            onClick={() => dispatch(fetchProductById(id))}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Link to="/products" className="text-blue-500 hover:underline">
            Return to Products
          </Link>
        </div>
      </div>
    );
  }
  
  // Calculate sale price
  const salePrice = calculateDiscountedPrice(product.price, product.discountPercentage);
  const availableSizes = getAvailableSizes();
  const maxStock = getMaxStock();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <FaArrowLeft className="mr-2" /> Back to Products
      </button>
      
      {/* Breadcrumb Navigation */}
      <div className="text-sm breadcrumbs mb-6">
        <ul className="flex space-x-2">
          <li><Link to="/" className="text-gray-500 hover:text-blue-500">Home</Link></li>
          <li><span className="text-gray-500">/</span></li>
          <li><Link to="/products" className="text-gray-500 hover:text-blue-500">Products</Link></li>
          <li><span className="text-gray-500">/</span></li>
          <li className="text-blue-500">{product.name}</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="product-images">
          <div className="main-image mb-4 relative">
            <img 
              src={mainImage || (product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/500')} 
              alt={product.name} 
              className="w-full h-auto rounded-lg shadow-md object-cover"
            />
            {product.isNewArrival && (
              <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                NEW
              </span>
            )}
            {product.discountPercentage > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>
          
          {/* Thumbnail Images */}
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, index) => (
                <img 
                  key={index}
                  src={img} 
                  alt={`${product.name} view ${index + 1}`}
                  className={`w-full h-20 object-cover rounded cursor-pointer border-2 ${
                    mainImage === img ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => handleImageClick(img)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="product-info">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          <div className="flex items-center mb-4">
            <Rating value={product.rating} size={20} />
            <span className="ml-2 text-gray-600">
              ({product.numReviews || 0} {product.numReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          <div className="mb-4">
            <span className="text-gray-600">Brand:</span>
            <span className="ml-2 font-medium">{product.brand}</span>
          </div>

          {/* Price Display */}
          <div className="mb-6">
            {salePrice ? (
              <div className="flex items-center">
                <span className="text-2xl font-bold text-red-600 mr-3">
                  ${salePrice.toFixed(2)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
                <span className="ml-3 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {product.discountPercentage}% OFF
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Color Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Select Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, index) => (
                  <button
                    key={index}
                    className={`p-1 rounded-full ${
                      selectedColor === variant.color 
                        ? 'ring-2 ring-blue-500' 
                        : 'ring-1 ring-gray-300 hover:ring-gray-400'
                    }`}
                    onClick={() => handleColorSelect(variant)}
                    aria-label={`Select ${variant.color} color`}
                    title={variant.color}
                  >
                    <div 
                      className="w-8 h-8 rounded-full" 
                      style={{ backgroundColor: variant.colorCode }}
                    ></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {availableSizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size, index) => (
                  <button
                    key={index}
                    disabled={!isSizeInStock(size)}
                    className={`px-4 py-2 border rounded-md ${
                      selectedSize === size.size
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : !isSizeInStock(size)
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleSizeSelect(size)}
                  >
                    {size.size}
                    {!isSizeInStock(size) && <span className="block text-xs">Out of stock</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Quantity</h3>
            <div className="flex items-center">
              <button
                className="px-3 py-1 border border-gray-300 rounded-l-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={maxStock === 0}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={maxStock}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 text-center border-t border-b border-gray-300 py-1"
                disabled={maxStock === 0}
              />
              <button
                className="px-3 py-1 border border-gray-300 rounded-r-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                disabled={maxStock === 0 || quantity >= maxStock}
              >
                +
              </button>
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            <span className={`${maxStock > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
              {maxStock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
            {maxStock > 0 && maxStock <= 5 && (
              <span className="ml-2 text-orange-500">
                (Only {maxStock} left)
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={maxStock === 0}
              className={`flex-1 flex items-center justify-center py-3 px-6 rounded-md ${
                maxStock === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <FaShoppingCart className="mr-2" />
              Add to Cart
            </button>
            
            <button
              onClick={handleAddToWishlist}
              className="flex items-center justify-center py-3 px-6 rounded-md border border-gray-300 hover:bg-gray-100"
              aria-label="Add to wishlist"
            >
              <FaHeart className="mr-2 text-red-500" />
              Wishlist
            </button>
          </div>

          {/* Product Features */}
          {product.features && product.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Key Features</h3>
              <ul className="list-disc pl-5 space-y-1">
                {product.features.map((feature, index) => (
                  <li key={index} className="text-gray-700">{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mb-12">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              className={`py-4 px-1 whitespace-nowrap ${
                activeTab === 'description'
                  ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`py-4 px-1 whitespace-nowrap ${
                activeTab === 'specifications'
                  ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              className={`py-4 px-1 whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.numReviews || 0})
            </button>
          </nav>
        </div>

        <div className="py-6">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 w-1/3">Brand</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.brand}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Gender</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.gender ? product.gender.charAt(0).toUpperCase() + product.gender.slice(1) : 'Not specified'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Material</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.materials ? product.materials.join(', ') : 'Not specified'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Style</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.style || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Available Colors</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.variants ? product.variants.map(v => v.color).join(', ') : 'Not specified'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Available Sizes</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {availableSizes.length > 0 ? availableSizes.map(s => s.size).join(', ') : 'Not specified'}
                    </td>
                  </tr>
                  {/* Add more specifications from the product as needed */}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-6">
                  {product.reviews.map((review) => (
                    <div key={review._id} className="border-b pb-6">
                      <div className="flex items-center mb-2">
                        <Rating value={review.rating} />
                        <span className="ml-2 font-medium">{review.name}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              )}

              {user ? (
                <div className="mt-8">
                  <h3 className="text-xl font-medium mb-4">Write a Review</h3>
                  <ReviewForm productId={product._id} />
                </div>
              ) : (
                <div className="mt-8 p-4 bg-blue-50 rounded-md">
                  <p className="text-blue-700">
                    Please{' '}
                    <Link to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} className="font-medium underline">
                      sign in
                    </Link>{' '}
                    to write a review.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products (placeholder) */}
      <div>
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <p className="text-gray-500">Related products would be displayed here</p>
      </div>
    </div>
  );
};

export default ProductDetail;
