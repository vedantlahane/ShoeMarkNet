import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import orderService from '../../services/orderService';
import { formatDate, getRelativeTime } from '../../utils/helpers';

const OrderTrackingModal = ({ orderId, onClose }) => {
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let isMounted = true;

    const fetchTracking = async () => {
      try {
        setLoading(true);
        setError(null);
        const { order, message } = await orderService.trackOrder(orderId);
        if (!isMounted) return;
        setTrackingInfo(order || null);
        if (message) {
          setTrackingInfo((prev) => ({ ...(prev || {}), trackingMessage: message }));
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load tracking details');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTracking();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100/40 dark:border-gray-700/40 p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition"
          aria-label="Close tracking modal"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <header className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xl shadow-lg">
              <i className="fas fa-route"></i>
            </span>
            Tracking Order
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Order ID: {orderId}</p>
        </header>

        <section className="space-y-4 min-h-[160px]">
          {loading && (
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <i className="fas fa-spinner fa-spin"></i>
              Fetching live tracking updates...
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-300 rounded-2xl p-4 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              <div className="bg-white/70 dark:bg-white/5 border border-gray-200/70 dark:border-gray-700/70 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Status</h3>
                <p className="text-base text-gray-900 dark:text-white font-medium">
                  {trackingInfo?.status || (trackingInfo?.isDelivered ? 'Delivered' : 'In transit')}
                </p>
                {trackingInfo?.trackingMessage && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{trackingInfo.trackingMessage}</p>
                )}
              </div>

              <div className="bg-white/70 dark:bg-white/5 border border-gray-200/70 dark:border-gray-700/70 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Timeline</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {trackingInfo?.shippedAt && (
                    <li>
                      <i className="fas fa-shipping-fast text-blue-500 mr-2"></i>
                      Shipped {getRelativeTime(trackingInfo.shippedAt)} ({formatDate(trackingInfo.shippedAt)})
                    </li>
                  )}
                  {trackingInfo?.estimatedDelivery && (
                    <li>
                      <i className="fas fa-calendar-alt text-purple-500 mr-2"></i>
                      Estimated delivery on {formatDate(trackingInfo.estimatedDelivery)}
                    </li>
                  )}
                  {trackingInfo?.deliveredAt && (
                    <li>
                      <i className="fas fa-check-circle text-green-500 mr-2"></i>
                      Delivered {getRelativeTime(trackingInfo.deliveredAt)} ({formatDate(trackingInfo.deliveredAt)})
                    </li>
                  )}
                  {!trackingInfo?.shippedAt && !trackingInfo?.estimatedDelivery && !trackingInfo?.deliveredAt && (
                    <li className="text-xs text-gray-500 dark:text-gray-400">No timeline data available yet.</li>
                  )}
                </ul>
              </div>

              {trackingInfo?.trackingNumber && (
                <div className="bg-white/70 dark:bg-white/5 border border-gray-200/70 dark:border-gray-700/70 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Tracking Number</h3>
                  <p className="font-mono text-gray-800 dark:text-gray-100">{trackingInfo.trackingNumber}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Share this tracking number with the customer so they can follow the shipment.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        <footer className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-white/10 border border-gray-200 dark:border-gray-700 hover:bg-white"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};

OrderTrackingModal.propTypes = {
  orderId: PropTypes.string,
  onClose: PropTypes.func,
};

export default OrderTrackingModal;
