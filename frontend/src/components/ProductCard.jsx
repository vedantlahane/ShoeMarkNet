import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

// Utils
import { trackEvent } from '../../../utils/analytics';
import { formatCurrency } from '../../../utils/helpers';

const ProductCard = ({
  product = {},
  onEdit = () => {},
  onDelete = () => {},
  onStatusChange = () => {},
  onDuplicate = () => {},
  variant = 'default', // default, compact, detailed, grid
  showActions = true,
  showStats = true,
  className = ''
}) => {
  // Default product data structure
  const defaultProduct = {
    id: '1',
    name: 'Premium Running Shoes',
    brand: 'ShoeMarkNet',
    sku: 'SMN-RUN-001',
    price: 129.99,
    originalPrice: 159.99,
    discount: 19,
    status: 'active', // active, inactive, draft, archived
    stock: 25,
    lowStockThreshold: 10,
    category: 'Running Shoes',
    subcategory: 'Road Running',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewCount: 156,
    sales: 234,
    views: 1234,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    featured: false,
    tags: ['running', 'athletic', 'comfortable'],
    variants: [
      { size: 'US 8', color: 'Black', stock: 5 },
      { size: 'US 9', color: 'White', stock: 8 },
      { size: 'US 10', color: 'Blue', stock: 12 }
    ]
  };

  // Merge provided product with defaults
  const productData = { ...defaultProduct, ...product };

  // Local state
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Redux state (if needed)
  const { cart, wishlist } = useSelector(state => ({
    cart: state.cart?.items || [],
    wishlist: state.wishlist?.items || []
  }));
  const dispatch = useDispatch();

  // Handle status change
  const handleStatusChange = useCallback((newStatus) => {
    onStatusChange(productData.id, newStatus);
    
    trackEvent('admin_product_status_changed', {
      product_id: productData.id,
      product_name: productData.name,
      old_status: productData.status,
      new_status: newStatus
    });
    
    toast.success(`Product status updated to ${newStatus}`);
  }, [productData.id, productData.name, productData.status, onStatusChange]);

  // Handle delete product
  const handleDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete "${productData.name}"?`)) {
      onDelete(productData.id);
      
      trackEvent('admin_product_deleted', {
        product_id: productData.id,
        product_name: productData.name,
        category: productData.category
      });
      
      toast.success('Product deleted successfully');
    }
  }, [productData.id, productData.name, productData.category, onDelete]);

  // Handle duplicate product
  const handleDuplicate = useCallback(() => {
    onDuplicate(productData);
    
    trackEvent('admin_product_duplicated', {
      product_id: productData.id,
      product_name: productData.name
    });
    
    toast.success('Product duplicated successfully');
  }, [productData, onDuplicate]);

  // Get status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-200', dot: 'bg-green-400' };
      case 'inactive':
        return { bg: 'bg-gray-100 dark:bg-gray-900/20', text: 'text-gray-800 dark:text-gray-200', dot: 'bg-gray-400' };
      case 'draft':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-200', dot: 'bg-yellow-400' };
      case 'archived':
        return { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-200', dot: 'bg-red-400' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-900/20', text: 'text-gray-800 dark:text-gray-200', dot: 'bg-gray-400' };
    }
  };

  // Get stock status
  const getStockStatus = () => {
    if (productData.stock === 0) return { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (productData.stock <= productData.lowStockThreshold) return { label: 'Low Stock', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const statusStyle = getStatusStyle(productData.status);
  const stockStatus = getStockStatus();

  // Render compact variant
  if (variant === 'compact') {
    return (
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${className}`}>
        <div className="flex items-center space-x-4">
          
          {/* Product Image */}
          <div className="relative flex-shrink-0">
            <img
              src={productData.images[0]}
              alt={productData.name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-white/30"
            />
            {productData.featured && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <i className="fas fa-star text-white text-xs"></i>
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
              {productData.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {productData.brand} • {productData.sku}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="font-bold text-green-600 dark:text-green-400">
                {formatCurrency(productData.price)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                {productData.status}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          {showActions && (
            <div className="flex items-center space-x-2">
              <Link
                to={`/admin/products/${productData.id}/edit`}
                className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
                title="Edit product"
              >
                <i className="fas fa-edit text-xs"></i>
              </Link>
              <button
                onClick={handleDelete}
                className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                title="Delete product"
              >
                <i className="fas fa-trash text-xs"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render grid variant
  if (variant === 'grid') {
    return (
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 ${className}`}>
        
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
          <img
            src={productData.images[selectedImage]}
            alt={productData.name}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setSelectedImage((selectedImage + 1) % productData.images.length)}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 space-y-2">
            {productData.discount > 0 && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                -{productData.discount}%
              </span>
            )}
            {productData.featured && (
              <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                Featured
              </span>
            )}
          </div>

          {/* Status Indicator */}
          <div className="absolute top-3 right-3">
            <div className={`w-3 h-3 ${statusStyle.dot} rounded-full animate-pulse`}></div>
          </div>

          {/* Stock Warning */}
          {productData.stock <= productData.lowStockThreshold && (
            <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Low Stock: {productData.stock}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4 space-y-3">
          
          {/* Header */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 line-clamp-2">
              {productData.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {productData.brand} • {productData.category}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(productData.price)}
            </span>
            {productData.originalPrice > productData.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(productData.originalPrice)}
              </span>
            )}
          </div>

          {/* Rating and Sales */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`fas fa-star text-xs ${
                      i < Math.floor(productData.rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                ({productData.reviewCount})
              </span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {productData.sales} sold
            </span>
          </div>

          {/* Status and Stock */}
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
              {productData.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${stockStatus.bg} ${stockStatus.color}`}>
              {stockStatus.label} ({productData.stock})
            </span>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex space-x-2 pt-2">
              <Link
                to={`/admin/products/${productData.id}/edit`}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-xl transition-colors text-center text-sm"
              >
                Edit
              </Link>
              <button
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className="w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl flex items-center justify-center text-gray-900 dark:text-white hover:bg-white/30 transition-colors"
              >
                <i className="fas fa-ellipsis-v text-sm"></i>
              </button>
            </div>
          )}

          {/* Actions Dropdown */}
          {isActionsOpen && showActions && (
            <div className="absolute top-full right-4 mt-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl py-2 min-w-48 z-10">
              <button
                onClick={() => {
                  window.open(`/product/${productData.id}`, '_blank');
                  setIsActionsOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-white/20 transition-colors text-gray-900 dark:text-white flex items-center"
              >
                <i className="fas fa-eye mr-3 text-blue-500"></i>
                View Product
              </button>
              
              <button
                onClick={() => {
                  handleDuplicate();
                  setIsActionsOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-white/20 transition-colors text-gray-900 dark:text-white flex items-center"
              >
                <i className="fas fa-copy mr-3 text-green-500"></i>
                Duplicate
              </button>
              
              <div className="px-4 py-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Status
                </label>
                <select
                  value={productData.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full bg-white/20 border border-white/30 rounded-xl px-2 py-1 text-sm text-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              
              <hr className="border-white/20 my-2" />
              
              <button
                onClick={() => {
                  handleDelete();
                  setIsActionsOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-red-500/20 transition-colors text-red-600 dark:text-red-400 flex items-center"
              >
                <i className="fas fa-trash mr-3"></i>
                Delete Product
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render default detailed variant
  return (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 ${className}`}>
      
      {/* Header */}
      <div className="p-6 border-b border-white/20 dark:border-gray-700/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            
            {/* Product Image */}
            <div className="relative">
              <img
                src={productData.images[selectedImage]}
                alt={productData.name}
                className="w-20 h-20 rounded-xl object-cover border-2 border-white/30 shadow-lg cursor-pointer"
                onClick={() => setSelectedImage((selectedImage + 1) % productData.images.length)}
              />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusStyle.dot} rounded-full border-2 border-white animate-pulse`}></div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {productData.name}
                </h3>
                {productData.featured && (
                  <i className="fas fa-star text-yellow-500" title="Featured Product"></i>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {productData.brand} • {productData.sku}
              </p>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                  {productData.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${stockStatus.bg} ${stockStatus.color}`}>
                  {stockStatus.label}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-gray-900 dark:text-white hover:bg-white/30 transition-all duration-200"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setIsActionsOpen(!isActionsOpen)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-gray-900 dark:text-white hover:bg-white/30 transition-all duration-200"
                  title="More actions"
                >
                  <i className="fas fa-ellipsis-v"></i>
                </button>
                
                {isActionsOpen && (
                  <div className="absolute top-12 right-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl py-2 min-w-48 z-10">
                    <Link
                      to={`/admin/products/${productData.id}/edit`}
                      className="w-full px-4 py-2 text-left hover:bg-white/20 transition-colors text-gray-900 dark:text-white flex items-center"
                      onClick={() => setIsActionsOpen(false)}
                    >
                      <i className="fas fa-edit mr-3 text-blue-500"></i>
                      Edit Product
                    </Link>
                    
                    <button
                      onClick={() => {
                        window.open(`/product/${productData.id}`, '_blank');
                        setIsActionsOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-white/20 transition-colors text-gray-900 dark:text-white flex items-center"
                    >
                      <i className="fas fa-eye mr-3 text-green-500"></i>
                      View Product
                    </button>
                    
                    <button
                      onClick={() => {
                        handleDuplicate();
                        setIsActionsOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-white/20 transition-colors text-gray-900 dark:text-white flex items-center"
                    >
                      <i className="fas fa-copy mr-3 text-purple-500"></i>
                      Duplicate
                    </button>
                    
                    <hr className="border-white/20 my-2" />
                    
                    <button
                      onClick={() => {
                        handleDelete();
                        setIsActionsOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-red-500/20 transition-colors text-red-600 dark:text-red-400 flex items-center"
                    >
                      <i className="fas fa-trash mr-3"></i>
                      Delete Product
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        
        {/* Price and Performance */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Price</label>
            <div className="flex items-baseline space-x-2">
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(productData.price)}
              </p>
              {productData.originalPrice > productData.price && (
                <p className="text-sm text-gray-500 line-through">
                  {formatCurrency(productData.originalPrice)}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Stock</label>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {productData.stock} units
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Sales</label>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {productData.sales}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Rating</label>
            <div className="flex items-center space-x-2">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {productData.rating}
              </p>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`fas fa-star text-xs ${
                      i < Math.floor(productData.rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category and Tags */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</label>
            <p className="text-gray-900 dark:text-white font-semibold">
              {productData.category}  {productData.subcategory}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tags</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {productData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-4 animate-fade-in pt-4 border-t border-white/20 dark:border-gray-700/20">
            
            {/* Variants */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                Product Variants
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                {productData.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {variant.size} - {variant.color}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {variant.stock} left
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Stats */}
            {showStats && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20 dark:border-gray-700/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {productData.views}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {((productData.sales / productData.views) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Conversion</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(productData.sales * productData.price)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex space-x-3 pt-2">
              <Link
                to={`/admin/products/${productData.id}/edit`}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center"
              >
                <i className="fas fa-edit mr-2"></i>
                Edit Product
              </Link>
              <button
                onClick={() => window.open(`/product/${productData.id}`, '_blank')}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center"
              >
                <i className="fas fa-eye mr-2"></i>
                View Live
              </button>
              <button
                onClick={handleDuplicate}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center"
              >
                <i className="fas fa-copy mr-2"></i>
                Duplicate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
