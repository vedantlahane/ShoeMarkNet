import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { formatCurrency, formatDate, getRelativeTime } from '../../utils/helpers';

const OrderDetailsModal = ({ order, onClose, onStatusUpdate, onTrackOrder }) => {
  const orderItems = useMemo(() => {
    if (!order) return [];
    if (Array.isArray(order.orderItems) && order.orderItems.length > 0) {
      return order.orderItems;
    }
    if (Array.isArray(order.items) && order.items.length > 0) {
      return order.items.map((item) => ({
        ...item,
        product: item.product || item.productId || item.details || item
      }));
    }
    return [];
  }, [order]);

  if (!order) {
    return null;
  }

  const shipping = order.shippingAddress || order.shipping || {};
  const orderNumber = order.orderNumber || order.orderId || order._id?.slice(-8) || 'Unknown';

  const handleStatusToggle = async (field, nextValue) => {
    if (!onStatusUpdate || !order?._id) return;
    await onStatusUpdate(order._id, field, nextValue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100/40 dark:border-gray-700/40">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition"
          aria-label="Close order details"
        >
          <i className="fas fa-times text-2xl"></i>
        </button>

        <div className="p-8 space-y-8">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl shadow-lg">
                  <i className="fas fa-receipt"></i>
                </span>
                Order #{orderNumber}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                <i className="fas fa-clock"></i>
                Placed {order.createdAt ? getRelativeTime(order.createdAt) : 'recently'}
                {order.updatedAt && (
                  <span className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                    <i className="fas fa-history"></i>
                    Updated {getRelativeTime(order.updatedAt)}
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onTrackOrder?.()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 dark:bg-white/10 border border-gray-200/70 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium hover:bg-white transition"
              >
                <i className="fas fa-map-marker-alt text-blue-500"></i>
                Track Order
              </button>
              {!order.isPaid && (
                <button
                  onClick={() => handleStatusToggle('isPaid', true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition"
                >
                  <i className="fas fa-check"></i>
                  Mark as Paid
                </button>
              )}
              {order.isPaid && !order.isDelivered && (
                <button
                  onClick={() => handleStatusToggle('isDelivered', true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition"
                >
                  <i className="fas fa-truck"></i>
                  Mark Delivered
                </button>
              )}
            </div>
          </header>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/70 dark:bg-white/5 border border-gray-200/70 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <i className="fas fa-shopping-bag text-blue-500"></i>
                  Order Summary
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <dt className="font-medium text-gray-500 dark:text-gray-400">Status</dt>
                    <dd className="mt-1 capitalize">{order.status || (order.isDelivered ? 'delivered' : 'processing')}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500 dark:text-gray-400">Payment Method</dt>
                    <dd className="mt-1 uppercase">{order.paymentMethod || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500 dark:text-gray-400">Paid</dt>
                    <dd className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <i className={`fas ${order.isPaid ? 'fa-check-circle' : 'fa-times-circle'} mr-1`}></i>
                        {order.isPaid ? 'Yes' : 'No'}
                      </span>
                      {order.paidAt && `on ${formatDate(order.paidAt)}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500 dark:text-gray-400">Delivered</dt>
                    <dd className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.isDelivered ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        <i className={`fas ${order.isDelivered ? 'fa-truck' : 'fa-shipping-fast'} mr-1`}></i>
                        {order.isDelivered ? 'Yes' : 'No'}
                      </span>
                      {order.deliveredAt && `on ${formatDate(order.deliveredAt)}`}
                    </dd>
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-400">Tracking #</dt>
                      <dd className="mt-1 font-mono text-gray-800 dark:text-gray-200">{order.trackingNumber}</dd>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-400">Est. Delivery</dt>
                      <dd className="mt-1">{formatDate(order.estimatedDelivery)}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-6 border-t border-gray-200/70 dark:border-gray-700/60 pt-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.totalPrice ?? order.subtotal ?? 0)}</span>
                  </div>
                  {order.tax ? (
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mt-1">
                      <span>Tax</span>
                      <span>{formatCurrency(order.tax)}</span>
                    </div>
                  ) : null}
                  {order.shippingFee ? (
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mt-1">
                      <span>Shipping</span>
                      <span>{formatCurrency(order.shippingFee)}</span>
                    </div>
                  ) : null}
                  {order.discount ? (
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mt-1">
                      <span>Discount</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-base font-semibold text-gray-900 dark:text-white mt-3">
                    <span>Total</span>
                    <span>{formatCurrency(order.grandTotal ?? order.totalPrice ?? 0)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-white/5 border border-gray-200/70 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <i className="fas fa-list-ul text-purple-500"></i>
                  Items ({orderItems.length})
                </h3>

                {orderItems.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No items available for this order.</p>
                ) : (
                  <ul className="space-y-4 divide-y divide-gray-200/70 dark:divide-gray-800/70">
                    {orderItems.map((item, index) => {
                      const product = item.product || {};
                      const title = product.name || product.title || item.name || `Item ${index + 1}`;
                      return (
                        <li key={`${item._id || index}-${product._id || index}`} className="pt-4 first:pt-0">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                              <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>Qty: {item.quantity ?? 1}</span>
                                {item.size && <span>Size: {item.size}</span>}
                                {item.color && <span>Color: {item.color}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500 dark:text-gray-400">Unit Price</p>
                              <p className="text-base font-semibold text-gray-900 dark:text-white">{formatCurrency(item.price ?? 0)}</p>
                              <p className="text-xs text-gray-400 mt-1">Subtotal: {formatCurrency((item.price ?? 0) * (item.quantity ?? 1))}</p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="bg-white/70 dark:bg-white/5 border border-gray-200/70 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <i className="fas fa-user text-indigo-500"></i>
                  Customer
                </h3>
                <dl className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <dt className="font-medium text-gray-500 dark:text-gray-400">Name</dt>
                    <dd>{order.user?.name || shipping.fullName || 'Guest Customer'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500 dark:text-gray-400">Email</dt>
                    <dd>{order.user?.email || shipping.email || 'Not provided'}</dd>
                  </div>
                  {order.user?.phone || shipping.phone ? (
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-400">Phone</dt>
                      <dd>{order.user?.phone || shipping.phone}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="font-medium text-gray-500 dark:text-gray-400">Account</dt>
                    <dd>{order.user?._id || 'Guest checkout'}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white/70 dark:bg-white/5 border border-gray-200/70 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <i className="fas fa-shipping-fast text-emerald-500"></i>
                  Shipping Address
                </h3>
                {shipping.addressLine1 ? (
                  <address className="not-italic text-sm leading-6 text-gray-600 dark:text-gray-300">
                    <p className="font-medium text-gray-800 dark:text-gray-200">{shipping.fullName}</p>
                    <p>{shipping.addressLine1}</p>
                    {shipping.addressLine2 && <p>{shipping.addressLine2}</p>}
                    <p>
                      {shipping.city}, {shipping.state} {shipping.postalCode}
                    </p>
                    <p>{shipping.country}</p>
                    {shipping.phone && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Phone: {shipping.phone}</p>}
                  </address>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No shipping information available.</p>
                )}
              </div>

              {order.notes && (
                <div className="bg-white/70 dark:bg-white/5 border border-gray-200/70 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <i className="fas fa-sticky-note text-amber-500"></i>
                    Notes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}
            </aside>
          </section>
        </div>
      </div>
    </div>
  );
};

OrderDetailsModal.propTypes = {
  order: PropTypes.object,
  onClose: PropTypes.func,
  onStatusUpdate: PropTypes.func,
  onTrackOrder: PropTypes.func,
};

export default OrderDetailsModal;
