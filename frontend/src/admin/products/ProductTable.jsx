import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatNumber } from '../../utils/helpers';

const SortButton = ({ field, activeField, activeOrder, onSort, children }) => {
  const isActive = activeField === field;
  const icon = !isActive ? 'fa-sort' : activeOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`flex items-center space-x-2 uppercase text-xs tracking-wide font-semibold ${
        isActive ? 'text-blue-500' : 'text-gray-500'
      }`}
    >
      <span>{children}</span>
      <i className={`fas ${icon}`}></i>
    </button>
  );
};

const ProductTable = ({
  products = [],
  selectedProducts = [],
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onImageGallery,
  getStockStatus,
  calculateTotalStock,
  categories = [],
  sortBy,
  sortOrder,
  onSort,
  animateCards = false,
  className = ''
}) => {
  const isAllSelected =
    products.length > 0 && products.every((product) => selectedProducts.includes(product._id));

  return (
    <div
      className={`overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-xl ${
        animateCards ? 'animate-fade-in-up' : ''
      } ${className}`}
    >
      <table className="min-w-full divide-y divide-white/20 dark:divide-gray-700/20">
        <thead className="bg-white/10">
          <tr>
            <th scope="col" className="px-6 py-4">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onSelectAll}
                className="w-4 h-4 rounded border-white/40 text-blue-500 focus:ring-blue-400"
                aria-label="Select all products"
              />
            </th>
            <th scope="col" className="px-6 py-4 text-left">
              <SortButton field="name" activeField={sortBy} activeOrder={sortOrder} onSort={onSort}>
                Product
              </SortButton>
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Category
            </th>
            <th scope="col" className="px-6 py-4 text-left">
              <SortButton field="price" activeField={sortBy} activeOrder={sortOrder} onSort={onSort}>
                Price
              </SortButton>
            </th>
            <th scope="col" className="px-6 py-4 text-left">
              <SortButton field="stock" activeField={sortBy} activeOrder={sortOrder} onSort={onSort}>
                Stock
              </SortButton>
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Status
            </th>
            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 dark:divide-gray-700/10 text-sm">
          {products.map((product) => {
            const stockInfo = getStockStatus(product);
            const totalStock = calculateTotalStock(product);
            return (
              <tr key={product._id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product._id)}
                    onChange={() => onSelect(product._id)}
                    className="w-4 h-4 rounded border-white/40 text-blue-500 focus:ring-blue-400"
                    aria-label={`Select ${product.name}`}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/10 flex-shrink-0">
                      {product.images?.length ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <i className="fas fa-image"></i>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{product.sku || 'SKU pending'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                  {categories.find((cat) => (cat._id || cat.slug || cat.name) === product.category)?.name ||
                    product.category?.name ||
                    product.category ||
                    '—'}
                </td>
                <td className="px-6 py-4 text-gray-900 dark:text-white">
                  {formatCurrency(product.price)}
                  {product.originalPrice && product.originalPrice > product.price ? (
                    <span className="ml-2 text-xs text-gray-500 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  ) : null}
                </td>
                <td className="px-6 py-4 text-gray-900 dark:text-white">
                  {formatNumber(totalStock)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 text-xs font-semibold text-white rounded-full bg-gradient-to-r ${stockInfo.color}`}
                  >
                    <i className={`fas ${stockInfo.icon} mr-2`}></i>
                    {stockInfo.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    type="button"
                    className="px-3 py-2 text-sm font-semibold text-blue-500 hover:text-blue-400"
                    onClick={() => onImageGallery(product.images || [])}
                  >
                    <i className="fas fa-images"></i>
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    onClick={() => onEdit(product)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 text-sm font-semibold text-red-500 hover:text-red-400"
                    onClick={() => onDelete(product._id, product.name)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {products.length === 0 && (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          No products available. Try adjusting your filters.
        </div>
      )}
    </div>
  );
};

ProductTable.propTypes = {
  products: PropTypes.array,
  selectedProducts: PropTypes.array,
  onSelect: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onImageGallery: PropTypes.func.isRequired,
  getStockStatus: PropTypes.func.isRequired,
  calculateTotalStock: PropTypes.func.isRequired,
  categories: PropTypes.array,
  sortBy: PropTypes.string,
  sortOrder: PropTypes.string,
  onSort: PropTypes.func.isRequired,
  animateCards: PropTypes.bool,
  className: PropTypes.string
};

export default ProductTable;
