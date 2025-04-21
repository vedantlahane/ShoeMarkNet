import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist } from '../redux/slices/wishlistSlice';
import Rating from '../components/Rating';
import ReviewForm from '../components/ReviewForm';
import Loader from '../components/common/Loader';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { product, loading, error } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    // Fetch product details when component mounts or ID changes
    dispatch(fetchProductById(id));
    
    // Scroll to top when navigating to product detail
    window.scrollTo(0, 0);
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      alert('Please select a size');
      return;
    }
    
    dispatch(addToCart({
      productId: product._id,
      quantity,
      size: selectedSize
    }));
  };

  const handleAddToWishlist = () => {
    dispatch(addToWishlist(product._id));
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error.message || 'Failed to load product'}</span>
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

  return (
    <div className="container mx-auto px-4 py-8">
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
          <div className="main-image mb-4">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-auto rounded-lg shadow-md object-cover"
            />
          </div>
          
          {/* Additional Images (if available) */}
          {product.additionalImages && product.additionalImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.additionalImages.map((img, index) => (
                <img 
                  key={index}
                  src={img} 
                  alt={`${product.name} view ${index + 1}`}
                  className="w-full h-24 object-cover rounded cursor-pointer border hover:border-blue-500"
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="product-info">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          <div className="flex items-center mb-4">
            <Rating value={product.rating} />
            <span className="ml-2 text-gray-600">
              ({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          <div className="mb-4">
            <span className="text-gray-600">Brand:</span>
            <span className="ml-2 font-medium">{product.brand}</span>
          </div>

          {/* Price Display */}
          <div className="mb-6">
            {product.salePrice && product.salePrice < product.price ? (
              <div className="flex items-center">
                <span className="text-2xl font-bold text-red-600 mr-3">
                  ${product.salePrice.toFixed(2)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
                <span className="ml-3 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`px-4 py-2 border rounded-md ${
                      selectedSize === size
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
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
                className="px-3 py-1 border border-gray-300 rounded-l-md hover:bg-gray-100"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.countInStock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-16 text-center border-t border-b border-gray-300 py-1"
              />
              <button
                className="px-3 py-1 border border-gray-300 rounded-r-md hover:bg-gray-100"
                onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
              >
                +
              </button>
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            <span className={`${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
              {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
            {product.countInStock > 0 && product.countInStock <= 5 && (
              <span className="ml-2 text-orange-500">
                (Only {product.countInStock} left)
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
              className={`flex-1 flex items-center justify-center py-3 px-6 rounded-md ${
                product.countInStock === 0
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
          <nav className="flex space-x-8">
            <button
              className={`py-4 px-1 ${
                activeTab === 'description'
                  ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`py-4 px-1 ${
                activeTab === 'specifications'
                  ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              className={`py-4 px-1 ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.numReviews})
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
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 w-1/3">Brand</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.brand}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Material</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.material || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Style</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.style || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Available Sizes</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sizes ? product.sizes.join(', ') : 'Not specified'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Weight</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.weight || 'Not specified'}</td>
                  </tr>
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
                    <Link to="/login" className="font-medium underline">
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
