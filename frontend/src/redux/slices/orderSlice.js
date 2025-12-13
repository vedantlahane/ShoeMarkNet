import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/orderService';
import { toast } from 'react-toastify';

// Enhanced error handling utility
const createErrorPayload = (error, defaultMessage) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    defaultMessage;

  return {
    message,
    status: error.response?.status,
    code: error.response?.data?.code,
    timestamp: new Date().toISOString(),
  };
};

// Enhanced toast notifications
const showSuccessToast = (message, options = {}) => {
  toast.success(message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: "premium-toast-success",
    ...options,
  });
};

const showErrorToast = (message, options = {}) => {
  toast.error(message, {
    position: "bottom-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: "premium-toast-error",
    ...options,
  });
};

const showInfoToast = (message, options = {}) => {
  toast.info(message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: "premium-toast-info",
    ...options,
  });
};

// Helper to extract orders from different response formats
const extractOrdersArray = (response) => {
  if (Array.isArray(response)) return response;
  if (response?.orders && Array.isArray(response.orders)) return response.orders;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
};

// Helper to extract pagination info
const extractPagination = (response) => {
  if (response?.pagination) return response.pagination;
  if (response?.meta) return response.meta;
  return null;
};

// Enhanced async thunks

// Fetch user's orders with enhanced error handling
export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (options = {}, { rejectWithValue }) => {
    try {
      const { orders = [], pagination, totalOrders } = await orderService.getUserOrders(options);
      
      if (orders.length === 0) {
        showInfoToast("📦 No orders found. Start shopping to see your orders here!");
      } else {
        showInfoToast(`📋 Loaded ${orders.length} orders`);
      }
      
      return {
        orders,
        pagination,
        totalOrders: totalOrders ?? orders.length,
      };
    } catch (error) {
      const errorPayload = createErrorPayload(error, 'Failed to fetch orders');
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

// Fetch single order by ID with enhanced details
export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const loadingToast = toast.loading("📦 Loading order details...");
      
      const response = await orderService.getOrderById(orderId);
      
      toast.dismiss(loadingToast);
      
      return response;
    } catch (error) {
      const errorPayload = createErrorPayload(error, 'Failed to fetch order details');
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

// Create new order with enhanced flow
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue, dispatch }) => {
    try {
      const loadingToast = toast.loading("🛒 Creating your order...");
      
      const { order, message } = await orderService.createOrder(orderData);
      const resolvedOrder = order ?? null;
      
      toast.dismiss(loadingToast);
      const orderReference = resolvedOrder?.orderId || resolvedOrder?.orderNumber || resolvedOrder?._id || 'order';
      showSuccessToast(message ?? `🎉 Order #${orderReference} placed successfully!`);
      
      // Show follow-up information
      setTimeout(() => {
        showInfoToast(
          "📧 Order confirmation email sent! Check your inbox for details.",
          { autoClose: 5000 }
        );
      }, 2000);

      // Track order creation analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag("event", "purchase", {
          transaction_id: resolvedOrder?._id,
          value: resolvedOrder?.grandTotal ?? resolvedOrder?.totalPrice ?? 0,
          currency: "USD",
          items: resolvedOrder?.items?.map(item => ({
            item_id: item.product._id,
            item_name: item.product.name,
            quantity: item.quantity,
            price: item.price
          }))
        });
      }
      
      return resolvedOrder;
    } catch (error) {
      const errorPayload = createErrorPayload(error, 'Failed to create order');
      showErrorToast(`❌ ${errorPayload.message}`);
      
      // Track failed order
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag("event", "purchase_failed", {
          error_message: errorPayload.message,
        });
      }
      
      return rejectWithValue(errorPayload);
    }
  }
);

// Update order payment with enhanced flow
export const payOrder = createAsyncThunk(
  'order/payOrder',
  async ({ orderId, paymentResult }, { rejectWithValue }) => {
    try {
      const loadingToast = toast.loading("💳 Processing payment...");
      
      const { order, message } = await orderService.updateOrderPayment(orderId, paymentResult);
      const resolvedOrder = order ?? null;
      
      toast.dismiss(loadingToast);
      showSuccessToast(message ?? "✅ Payment completed successfully!");
      
      // Show payment success details
      const paymentAmount = resolvedOrder?.grandTotal ?? resolvedOrder?.totalPrice ?? paymentResult?.amount ?? 0;
      const formattedPaymentAmount = Number(paymentAmount || 0).toFixed(2);
      setTimeout(() => {
        showInfoToast(
          `💰 Payment of $${formattedPaymentAmount} processed successfully`,
          { autoClose: 5000 }
        );
      }, 1500);

      // Track payment completion
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag("event", "payment_completed", {
          transaction_id: orderId,
          payment_method: paymentResult.payment_method,
          value: Number(paymentAmount || 0),
        });
      }
      
      return resolvedOrder;
    } catch (error) {
      const errorPayload = createErrorPayload(error, 'Payment failed');
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

// Cancel order with enhanced confirmation
export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const loadingToast = toast.loading("🚫 Cancelling order...");
      
      const { order, message } = await orderService.cancelOrder(orderId, reason);
      const resolvedOrder = order ?? null;
      
      toast.dismiss(loadingToast);
      showSuccessToast(message ?? "✅ Order cancelled successfully");
      
      // Show cancellation details
      const refundAmount = resolvedOrder?.refundAmount ?? 0;
      if (refundAmount > 0) {
        setTimeout(() => {
          showInfoToast(
            `💰 Refund of $${refundAmount} will be processed within 3-5 business days`,
            { autoClose: 6000 }
          );
        }, 2000);
      }

      // Track cancellation
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag("event", "order_cancelled", {
          transaction_id: orderId,
          reason: reason || 'user_request',
        });
      }
      
      return resolvedOrder;
    } catch (error) {
      const errorPayload = createErrorPayload(error, 'Failed to cancel order');
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

// Update order status (admin)
export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, updates }, { rejectWithValue }) => {
    try {
      const loadingToast = toast.loading("⚡ Updating order status...");
      
  const result = await orderService.updateOrderStatus(orderId, updates);

  toast.dismiss(loadingToast);
  const resolvedStatus = updates.status ?? result.status ?? (result.isDelivered ? 'delivered' : undefined);
  const statusSuffix = resolvedStatus ? ` (status: ${resolvedStatus})` : '';
  showSuccessToast(`✅ Order #${result.orderId || orderId} updated successfully${statusSuffix}`);

      return result;
    } catch (error) {
      const errorPayload = createErrorPayload(error, 'Failed to update order status');
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

// Fetch all orders (admin)
export const fetchAllOrders = createAsyncThunk(
  'order/fetchAllOrders',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const { orders = [], pagination, totalOrders } = await orderService.getAllOrders(queryParams);
      
      showInfoToast(`📊 Loaded ${orders.length} orders for admin view`);
      
      return {
        orders,
        pagination,
        totalOrders: totalOrders ?? orders.length,
      };
    } catch (error) {
      const errorPayload = createErrorPayload(error, 'Failed to fetch all orders');
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

// Track order delivery
export const trackOrder = createAsyncThunk(
  'order/trackOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const { order, message } = await orderService.trackOrder(orderId);
      const trackingPayload = order ?? null;
      
      showInfoToast(message ?? `📍 Order tracking updated for #${orderId}`);
      
      return { orderId, trackingInfo: trackingPayload };
    } catch (error) {
      const errorPayload = createErrorPayload(error, 'Failed to track order');
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

// Get order statistics (admin)
export const fetchOrderStats = createAsyncThunk(
  'order/fetchOrderStats',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderStats(filters);
      return response;
    } catch (error) {
      const errorPayload = createErrorPayload(error, 'Failed to fetch order statistics');
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

// Delete order (admin)
export const deleteOrder = createAsyncThunk(
  'order/deleteOrder',
  async ({ orderId, orderNumber }, { rejectWithValue }) => {
    try {
      const loadingToast = toast.loading("🗑️ Deleting order...");
      
      await orderService.deleteOrder(orderId);
      
      toast.dismiss(loadingToast);
      showSuccessToast(`✅ Order #${orderNumber || orderId} deleted successfully`);
      
      return orderId;
    } catch (error) {
      const errorPayload = createErrorPayload(error, 'Failed to delete order');
      showErrorToast(`❌ ${errorPayload.message}`);
      return rejectWithValue(errorPayload);
    }
  }
);

export const validateCoupon = createAsyncThunk(
  'order/validateCoupon',
  async (couponCode, { rejectWithValue }) => {
    try {
      // TODO: Implement actual coupon validation with backend
      // For now, return a mock valid response
      if (!couponCode || couponCode.trim().length === 0) {
        return rejectWithValue({ message: 'Coupon code is required' });
      }
      
      // Mock validation - in real implementation, this would call the backend
      const mockCouponData = {
        code: couponCode.toUpperCase(),
        discountType: 'percentage',
        discountValue: 10,
        minimumPurchase: 50,
        isValid: true,
        message: 'Coupon applied successfully!'
      };
      
      return mockCouponData;
    } catch (error) {
      const errorPayload = createErrorPayload(error, 'Failed to validate coupon');
      return rejectWithValue(errorPayload);
    }
  }
);

// Enhanced initial state
const initialState = {
  // User orders
  orders: [],
  order: null,
  totalOrders: 0,
  pagination: null,
  
  // Loading states
  loading: false,
  orderLoading: false,
  createLoading: false,
  paymentLoading: false,
  cancelLoading: false,
  trackingLoading: false,
  
  // Success states
  success: false,
  createSuccess: false,
  paymentSuccess: false,
  cancelSuccess: false,
  updateSuccess: false,
  
  // Error states
  error: null,
  lastError: null,
  
  // Coupon validation
  coupon: null,
  
  // Admin section
  adminOrders: {
    items: [],
    totalItems: 0,
    pagination: {
      page: 1,
      totalPages: 1,
      totalItems: 0,
      limit: 10
    },
    loading: false,
    error: null,
  },
  
  // Order statistics
  orderStats: {
    data: null,
    loading: false,
    error: null,
  },
  
  // Tracking information
  trackingInfo: {},
  
  // Filters and search
  filters: {
    status: '',
    dateRange: null,
    search: '',
  },
  
  // UI state
  selectedOrders: [],
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Error management
    clearOrderError: (state) => {
      state.lastError = state.error;
      state.error = null;
    },
    
    clearAllErrors: (state) => {
      state.error = null;
      state.lastError = null;
      state.adminOrders.error = null;
      state.orderStats.error = null;
    },
    
    // Success flags management
    resetOrderSuccess: (state) => {
      state.success = false;
      state.createSuccess = false;
      state.paymentSuccess = false;
      state.cancelSuccess = false;
      state.updateSuccess = false;
    },
    
    clearOrderDetails: (state) => {
      state.order = null;
      state.trackingInfo = {};
    },
    
    // Filters and sorting
    setOrderFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearOrderFilters: (state) => {
      state.filters = {
        status: '',
        dateRange: null,
        search: '',
      };
    },
    
    setSortOptions: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },
    
    // Selection management (admin)
    toggleOrderSelection: (state, action) => {
      const orderId = action.payload;
      const index = state.selectedOrders.indexOf(orderId);
      if (index >= 0) {
        state.selectedOrders.splice(index, 1);
      } else {
        state.selectedOrders.push(orderId);
      }
    },
    
    selectAllOrders: (state) => {
      state.selectedOrders = state.adminOrders.items.map(order => order._id);
    },
    
    clearOrderSelection: (state) => {
      state.selectedOrders = [];
    },
    
    // Local order management
    updateOrderLocally: (state, action) => {
      const updatedOrder = action.payload;
      
      // Update in user orders
      const userOrderIndex = state.orders.findIndex(order => order._id === updatedOrder._id);
      if (userOrderIndex >= 0) {
        state.orders[userOrderIndex] = updatedOrder;
      }
      
      // Update current order if it matches
      if (state.order && state.order._id === updatedOrder._id) {
        state.order = updatedOrder;
      }
      
      // Update in admin orders
      const adminOrderIndex = state.adminOrders.items.findIndex(order => order._id === updatedOrder._id);
      if (adminOrderIndex >= 0) {
        state.adminOrders.items[adminOrderIndex] = updatedOrder;
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.totalOrders = action.payload.totalOrders;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Order By ID
      .addCase(fetchOrderById.pending, (state) => {
        state.orderLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.orderLoading = false;
        state.order = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.orderLoading = false;
        state.error = action.payload;
      })
      
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.createLoading = true;
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.createLoading = false;
        state.loading = false;
        state.createSuccess = true;
        state.success = true;
        state.order = action.payload;
        state.orders = [action.payload, ...state.orders];
        state.totalOrders += 1;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.createLoading = false;
        state.loading = false;
        state.error = action.payload;
        state.createSuccess = false;
      })
      
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
        
        const updatedOrder = action.payload;
        
        // Update current order
        if (state.order && state.order._id === updatedOrder._id) {
          state.order = updatedOrder;
        }
        
        // Update in user orders
        const userOrderIndex = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (userOrderIndex >= 0) {
          state.orders[userOrderIndex] = updatedOrder;
        }
        
        // Update in admin orders
        const adminOrderIndex = state.adminOrders.items.findIndex(order => order._id === updatedOrder._id);
        if (adminOrderIndex >= 0) {
          state.adminOrders.items[adminOrderIndex] = updatedOrder;
        }
        
        state.error = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })
      
      // Pay Order
      .addCase(payOrder.pending, (state) => {
        state.paymentLoading = true;
        state.loading = true;
        state.error = null;
        state.paymentSuccess = false;
      })
      .addCase(payOrder.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.loading = false;
        state.paymentSuccess = true;
        state.success = true;
        
        const paidOrder = action.payload;
        state.order = paidOrder;
        
        // Update in orders array
        const orderIndex = state.orders.findIndex(order => order._id === paidOrder._id);
        if (orderIndex >= 0) {
          state.orders[orderIndex] = paidOrder;
        }
        
        // Update in admin orders
        const adminOrderIndex = state.adminOrders.items.findIndex(order => order._id === paidOrder._id);
        if (adminOrderIndex >= 0) {
          state.adminOrders.items[adminOrderIndex] = paidOrder;
        }
        
        state.error = null;
      })
      .addCase(payOrder.rejected, (state, action) => {
        state.paymentLoading = false;
        state.loading = false;
        state.error = action.payload;
        state.paymentSuccess = false;
      })
      
      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.cancelLoading = true;
        state.loading = true;
        state.error = null;
        state.cancelSuccess = false;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.cancelLoading = false;
        state.loading = false;
        state.cancelSuccess = true;
        state.success = true;
        
        const cancelledOrder = action.payload;
        
        // Update current order
        if (state.order && state.order._id === cancelledOrder._id) {
          state.order = cancelledOrder;
        }
        
        // Update in orders array
        const orderIndex = state.orders.findIndex(order => order._id === cancelledOrder._id);
        if (orderIndex >= 0) {
          state.orders[orderIndex] = cancelledOrder;
        }
        
        // Update in admin orders
        const adminOrderIndex = state.adminOrders.items.findIndex(order => order._id === cancelledOrder._id);
        if (adminOrderIndex >= 0) {
          state.adminOrders.items[adminOrderIndex] = cancelledOrder;
        }
        
        state.error = null;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.cancelLoading = false;
        state.loading = false;
        state.error = action.payload;
        state.cancelSuccess = false;
      })
      
      // Fetch All Orders (Admin)
      .addCase(fetchAllOrders.pending, (state) => {
        state.adminOrders.loading = true;
        state.adminOrders.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.adminOrders.loading = false;
        state.adminOrders.items = action.payload.orders;
        state.adminOrders.totalItems = action.payload.totalOrders;
        
        if (action.payload.pagination) {
          state.adminOrders.pagination = {
            ...state.adminOrders.pagination,
            ...action.payload.pagination
          };
        }
        
        state.adminOrders.error = null;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.adminOrders.loading = false;
        state.adminOrders.error = action.payload;
      })
      
      // Track Order
      .addCase(trackOrder.pending, (state) => {
        state.trackingLoading = true;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.trackingLoading = false;
        state.trackingInfo[action.payload.orderId] = action.payload.trackingInfo;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.trackingLoading = false;
        state.error = action.payload;
      })
      
      // Order Statistics
      .addCase(fetchOrderStats.pending, (state) => {
        state.orderStats.loading = true;
        state.orderStats.error = null;
      })
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.orderStats.loading = false;
        state.orderStats.data = action.payload;
        state.orderStats.error = null;
      })
      .addCase(fetchOrderStats.rejected, (state, action) => {
        state.orderStats.loading = false;
        state.orderStats.error = action.payload;
      })
      
      // Delete Order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        const deletedOrderId = action.payload;
        
        // Remove from user orders
        state.orders = state.orders.filter(order => order._id !== deletedOrderId);
        state.totalOrders = Math.max(0, state.totalOrders - 1);
        
        // Remove from admin orders
        state.adminOrders.items = state.adminOrders.items.filter(order => order._id !== deletedOrderId);
        state.adminOrders.totalItems = Math.max(0, state.adminOrders.totalItems - 1);
        
        // Clear current order if it was deleted
        if (state.order && state.order._id === deletedOrderId) {
          state.order = null;
        }
        
        // Remove from selection
        state.selectedOrders = state.selectedOrders.filter(id => id !== deletedOrderId);
        
        state.error = null;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Validate Coupon
      .addCase(validateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = action.payload;
        state.error = null;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.coupon = null;
      });
  },
});

// Enhanced selectors
export const selectOrders = (state) => state.order.orders;
export const selectOrderDetails = (state) => state.order.order;
export const selectOrderLoading = (state) => state.order.loading;
export const selectOrderError = (state) => state.order.error;
export const selectOrderSuccess = (state) => state.order.success;
export const selectAdminOrders = (state) => state.order.adminOrders;
export const selectOrderStats = (state) => state.order.orderStats;
export const selectOrderFilters = (state) => state.order.filters;
export const selectSelectedOrders = (state) => state.order.selectedOrders;
export const selectOrderPagination = (state) => state.order.pagination;
export const selectTotalOrders = (state) => state.order.totalOrders;

// Loading selectors
export const selectCreateLoading = (state) => state.order.createLoading;
export const selectPaymentLoading = (state) => state.order.paymentLoading;
export const selectCancelLoading = (state) => state.order.cancelLoading;
export const selectTrackingLoading = (state) => state.order.trackingLoading;
export const selectOrderDetailLoading = (state) => state.order.orderLoading;

// Success selectors
export const selectCreateSuccess = (state) => state.order.createSuccess;
export const selectPaymentSuccess = (state) => state.order.paymentSuccess;
export const selectCancelSuccess = (state) => state.order.cancelSuccess;
export const selectUpdateSuccess = (state) => state.order.updateSuccess;

// Utility selectors
export const selectOrderById = (orderId) => (state) =>
  state.order.orders.find(order => order._id === orderId);

export const selectOrdersByStatus = (status) => (state) =>
  state.order.orders.filter(order => order.status === status);

export const selectRecentOrders = (limit = 5) => (state) =>
  state.order.orders.slice(0, limit);

export const selectTrackingInfo = (orderId) => (state) =>
  state.order.trackingInfo[orderId];

export const selectHasAnyLoading = (state) =>
  state.order.loading ||
  state.order.createLoading ||
  state.order.paymentLoading ||
  state.order.cancelLoading ||
  state.order.trackingLoading ||
  state.order.orderLoading;

export const {
  clearOrderError,
  clearAllErrors,
  resetOrderSuccess,
  clearOrderDetails,
  setOrderFilters,
  clearOrderFilters,
  setSortOptions,
  toggleOrderSelection,
  selectAllOrders,
  clearOrderSelection,
  updateOrderLocally,
} = orderSlice.actions;

export default orderSlice.reducer;
