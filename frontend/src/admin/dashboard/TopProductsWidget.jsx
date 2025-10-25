import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatNumber } from '../../utils/helpers';

const getProductKey = (item) => {
  if (!item) return null;
  return item.productId || item.product?._id || item._id || item.id || null;
};

const normalizeQuantity = (item) => {
  if (!item) return 0;
  if (typeof item.quantity === 'number') return item.quantity;
  if (typeof item.qty === 'number') return item.qty;
  return 1;
};

const normalizePrice = (item, fallbackProduct) => {
  if (!item) return fallbackProduct?.price || 0;
  if (typeof item.price === 'number') return item.price;
  if (typeof item.unitPrice === 'number') return item.unitPrice;
  return fallbackProduct?.price || 0;
};

const TopProductsWidget = ({ products = [], orders = [], timeRange }) => {
  const productLookup = useMemo(() => {
    return products.reduce((acc, product) => {
      if (product?._id) {
        acc[product._id] = product;
      }
      if (product?.id && !acc[product.id]) {
        acc[product.id] = product;
      }
      return acc;
    }, {});
  }, [products]);

  const topProducts = useMemo(() => {
    const aggregates = new Map();

    orders.forEach((order) => {
      order?.orderItems?.forEach((item) => {
        const key = getProductKey(item);
        if (!key) return;

        const quantity = normalizeQuantity(item);
        const fallbackProduct = productLookup[key];
        const unitPrice = normalizePrice(item, fallbackProduct);
        const revenue = quantity * unitPrice;

        if (!aggregates.has(key)) {
          aggregates.set(key, {
            totalSold: 0,
            revenue: 0,
            product: fallbackProduct || item?.product || null,
          });
        }

        const entry = aggregates.get(key);
        entry.totalSold += quantity;
        entry.revenue += revenue;

        if (!entry.product && fallbackProduct) {
          entry.product = fallbackProduct;
        }
        if (!entry.product && item?.product) {
          entry.product = item.product;
        }
      });
    });

    const ranked = Array.from(aggregates.entries()).map(([id, data]) => {
      const product = data.product || productLookup[id] || {};
      return {
        id,
        name: product.name || itemNameFromId(id),
        image: product.image || product.images?.[0] || null,
        sku: product.sku,
        category: product.category,
        totalSold: data.totalSold,
        revenue: data.revenue,
        price: product.price,
      };
    });

    ranked.sort((a, b) => {
      if (b.totalSold !== a.totalSold) {
        return b.totalSold - a.totalSold;
      }
      return b.revenue - a.revenue;
    });

    return ranked.slice(0, 5);
  }, [orders, productLookup]);

  if (topProducts.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <i className="fas fa-trophy mr-2 text-yellow-500"></i>
            Top Products
          </h3>
          {timeRange && (
            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {timeRange}
            </span>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Not enough sales data yet. Keep an eye on your orders to populate this widget.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <i className="fas fa-trophy mr-2 text-yellow-500"></i>
          Top Products
        </h3>
        {timeRange && (
          <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {timeRange}
          </span>
        )}
      </div>

      <ul className="space-y-4">
        {topProducts.map((product, index) => (
          <li key={product.id || index} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white/40 flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <i className="fas fa-box text-gray-400"></i>
                )}
                <span className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  #{index + 1}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {product.category || product.sku || 'Uncategorized'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatNumber(product.totalSold)} sold
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(product.revenue)} revenue
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const itemNameFromId = (id) => {
  if (!id) return 'Unknown product';
  return `Product ${String(id).slice(-6)}`;
};

TopProductsWidget.propTypes = {
  products: PropTypes.array,
  orders: PropTypes.array,
  timeRange: PropTypes.string,
};

export default TopProductsWidget;
