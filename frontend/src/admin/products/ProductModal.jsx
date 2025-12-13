import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { validateProduct } from '../../utils/productUtils';
import { formatCurrency } from '../../utils/helpers';

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: 'fa-info-circle' },
  { id: 'pricing', label: 'Pricing', icon: 'fa-tags' },
  { id: 'inventory', label: 'Inventory', icon: 'fa-warehouse' },
  { id: 'seo', label: 'SEO & Meta', icon: 'fa-search' }
];

const ProductModal = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  formErrors = {},
  onFormChange,
  onSubmit,
  activeTab,
  onTabChange,
  categories = [],
  loading = false
}) => {
  if (!isOpen) {
    return null;
  }

  const validationErrors = useMemo(() => ({
    ...formErrors,
    ...validateProduct(formData)
  }), [formData, formErrors]);

  const updateImage = (index, value) => {
    const images = Array.isArray(formData.images) ? [...formData.images] : [];
    images[index] = value;
    onFormChange('images', images.filter((img, idx) => img || idx === index));
  };

  const addImageField = () => {
    const images = Array.isArray(formData.images) ? [...formData.images] : [];
    images.push('');
    onFormChange('images', images);
  };

  const removeImage = (index) => {
    const images = Array.isArray(formData.images) ? [...formData.images] : [];
    images.splice(index, 1);
    onFormChange('images', images);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>

      <div className="relative w-full max-w-4xl bg-gradient-to-br from-white/95 to-white/80 dark:from-gray-900/95 dark:to-gray-900/80 border border-white/30 dark:border-gray-700/30 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        <header className="flex items-center justify-between px-8 py-6 border-b border-white/20 dark:border-gray-700/20">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <i className="fas fa-box mr-3 text-blue-500"></i>
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEditing ? 'Update product details and inventory information.' : 'Provide product details to add it to your catalog.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl border border-white/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            aria-label="Close product modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </header>

        <div className="px-8 pt-6">
          <div className="flex flex-wrap gap-3 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-600 dark:text-gray-300'
                }`}
              >
                <i className={`fas ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="px-8 pb-8 max-h-[70vh] overflow-y-auto">
          {activeTab === 'basic' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Product Name</span>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(event) => onFormChange('name', event.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white ${
                    validationErrors.name ? 'border-red-400' : ''
                  }`}
                  placeholder="e.g. Air Runner 2025"
                  required
                />
                {validationErrors.name && (
                  <span className="text-xs text-red-400">{validationErrors.name}</span>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Brand</span>
                <input
                  type="text"
                  value={formData.brand || ''}
                  onChange={(event) => onFormChange('brand', event.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Brand name"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Category</span>
                <select
                  value={formData.category || ''}
                  onChange={(event) => onFormChange('category', event.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white ${
                    validationErrors.category ? 'border-red-400' : ''
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category._id || category.slug || category.name} value={category._id || category.slug || category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {validationErrors.category && (
                  <span className="text-xs text-red-400">{validationErrors.category}</span>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</span>
                <textarea
                  value={formData.description || ''}
                  onChange={(event) => onFormChange('description', event.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Describe the product features and benefits"
                ></textarea>
              </label>

              <div className="space-y-2 lg:col-span-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Image URLs</span>
                <div className="space-y-3">
                  {(formData.images || ['']).map((image, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="url"
                        value={image}
                        onChange={(event) => updateImage(index, event.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-3 rounded-2xl bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        aria-label="Remove image"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageField}
                    className="px-4 py-2 rounded-2xl bg-white/20 border border-white/30 text-sm text-blue-500 hover:bg-white/30"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add image
                  </button>
                  {validationErrors.images && (
                    <span className="text-xs text-red-400 block">{validationErrors.images}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                  <span>Price</span>
                  <span className="text-xs text-gray-400">
                    {formatCurrency(Number(formData.price || 0))}
                  </span>
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(event) => onFormChange('price', event.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white ${
                    validationErrors.price ? 'border-red-400' : ''
                  }`}
                  required
                />
                {validationErrors.price && (
                  <span className="text-xs text-red-400">{validationErrors.price}</span>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Compare at Price</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.originalPrice || ''}
                  onChange={(event) => onFormChange('originalPrice', event.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white ${
                    validationErrors.originalPrice ? 'border-red-400' : ''
                  }`}
                />
                {validationErrors.originalPrice && (
                  <span className="text-xs text-red-400">{validationErrors.originalPrice}</span>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cost Price</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costPrice || ''}
                  onChange={(event) => onFormChange('costPrice', event.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Discount (%)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discountPercentage || ''}
                  onChange={(event) => onFormChange('discountPercentage', event.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </label>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">In Stock</span>
                <input
                  type="number"
                  min="0"
                  value={formData.countInStock || ''}
                  onChange={(event) => onFormChange('countInStock', event.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white ${
                    validationErrors.countInStock ? 'border-red-400' : ''
                  }`}
                  required
                />
                {validationErrors.countInStock && (
                  <span className="text-xs text-red-400">{validationErrors.countInStock}</span>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">SKU</span>
                <input
                  type="text"
                  value={formData.sku || ''}
                  onChange={(event) => onFormChange('sku', event.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Auto generated if left blank"
                />
              </label>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive !== false}
                    onChange={(event) => onFormChange('isActive', event.target.checked)}
                    className="w-4 h-4 text-blue-500 rounded border-white/30"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured || false}
                    onChange={(event) => onFormChange('isFeatured', event.target.checked)}
                    className="w-4 h-4 text-blue-500 rounded border-white/30"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
                </label>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.trackQuantity !== false}
                    onChange={(event) => onFormChange('trackQuantity', event.target.checked)}
                    className="w-4 h-4 text-blue-500 rounded border-white/30"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Track quantity</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.requiresShipping !== false}
                    onChange={(event) => onFormChange('requiresShipping', event.target.checked)}
                    className="w-4 h-4 text-blue-500 rounded border-white/30"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Requires shipping</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Meta Title</span>
                <input
                  type="text"
                  value={formData.metaTitle || ''}
                  onChange={(event) => onFormChange('metaTitle', event.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Shown in search engine results"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Meta Description</span>
                <textarea
                  value={formData.metaDescription || ''}
                  onChange={(event) => onFormChange('metaDescription', event.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Up to 160 characters"
                ></textarea>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Handle</span>
                <input
                  type="text"
                  value={formData.handle || ''}
                  onChange={(event) => onFormChange('handle', event.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="product-handle"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Meta Keywords (comma separated)</span>
                <input
                  type="text"
                  value={(formData.metaKeywords || []).join(', ')}
                  onChange={(event) =>
                    onFormChange(
                      'metaKeywords',
                      event.target.value
                        .split(',')
                        .map((keyword) => keyword.trim())
                        .filter(Boolean)
                    )
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="sneakers, running, summer"
                />
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-white/10 border border-white/30 text-gray-700 dark:text-gray-200 hover:bg-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-60"
            >
              {loading ? 'Saving…' : isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  formData: PropTypes.object.isRequired,
  formErrors: PropTypes.object,
  onFormChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  categories: PropTypes.array,
  loading: PropTypes.bool
};

export default ProductModal;
