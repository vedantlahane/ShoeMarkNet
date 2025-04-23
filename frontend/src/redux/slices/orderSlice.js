// src/redux/slices/orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/orderService';
import { toast } from 'react-toastify'; // Assuming you use react-toastify

// Async thunk to fetch user's orders
export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getUserOrders();
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch orders' });
    }
  }
);

// Async thunk to fetch a single order by ID
export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      return await orderService.getOrderById(orderId);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch order details' });
    }
  }
);

// Async thunk to update order status
export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, updates }, { rejectWithValue }) => {
    try {
      return await orderService.updateOrderStatus(orderId, updates);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update order status' });
    }
  }
);

// Async thunk to create a new order
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue, dispatch }) => {
    try {
      const result = await orderService.createOrder(orderData);
      
      // Show success notification
      toast.success('Order placed successfully!');
      
      return result;
    } catch (error) {
      // Show error notification
      toast.error(error.response?.data?.message || 'Failed to create order');
      return rejectWithValue(error.response?.data || { message: 'Failed to create order' });
    }
  }
);

// Async thunk to update order payment
export const payOrder = createAsyncThunk(
  'order/payOrder',
  async ({ orderId, paymentResult }, { rejectWithValue }) => {
    try {
      const result = await orderService.updateOrderPayment(orderId, paymentResult);
      
      // Show success notification
      toast.success('Payment completed successfully!');
      
      return result;
    } catch (error) {
      // Show error notification
      toast.error(error.response?.data?.message || 'Payment failed');
      return rejectWithValue(error.response?.data || { message: 'Payment failed' });
    }
  }
);

// Async thunk to cancel an order
export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const result = await orderService.cancelOrder(orderId);
      
      // Show success notification
      toast.success('Order cancelled successfully');
      
      return result;
    } catch (error) {
      // Show error notification
      toast.error(error.response?.data?.message || 'Failed to cancel order');
      return rejectWithValue(error.response?.data || { message: 'Failed to cancel order' });
    }
  }
);

// Async thunk to fetch all orders (admin only)
export const fetchAllOrders = createAsyncThunk(
  'order/fetchAllOrders',
  async (queryParams, { rejectWithValue }) => {
    try {
      return await orderService.getAllOrders(queryParams);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch all orders' });
    }
  }
);

const initialState = {
  orders: [],
  order: null,
  loading: false,
  success: false,
  error: null,
  adminOrders: {
    items: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      totalPages: 1,
      totalItems: 0
    }
  }
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    resetOrderSuccess: (state) => {
      state.success = false;
    },
    clearOrderDetails: (state) => {
      state.order = null;
    }
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
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Order By ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload;
        // Add the new order to the orders array if it exists
        if (state.orders.length > 0) {
          state.orders = [action.payload, ...state.orders];
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        // If the updated order is the currently selected order, update it
        if (state.order && state.order._id === action.payload._id) {
          state.order = action.payload;
        }
        
        // Update the order in the orders array
        if (state.orders.length > 0) {
          state.orders = state.orders.map(order => 
            order._id === action.payload._id ? action.payload : order
          );
        }
        
        // Update in admin orders if present
        if (state.adminOrders.items.length > 0) {
          state.adminOrders.items = state.adminOrders.items.map(order => 
            order._id === action.payload._id ? action.payload : order
          );
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Pay Order
      .addCase(payOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(payOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload;
        
        // Update the order in the orders array
        if (state.orders.length > 0) {
          state.orders = state.orders.map(order => 
            order._id === action.payload._id ? action.payload : order
          );
        }
        
        // Update in admin orders if present
        if (state.adminOrders.items.length > 0) {
          state.adminOrders.items = state.adminOrders.items.map(order => 
            order._id === action.payload._id ? action.payload : order
          );
        }
      })
      .addCase(payOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cancel Order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        
        // If the cancelled order is the currently selected order, update it
        if (state.order && state.order._id === action.payload._id) {
          state.order = action.payload;
        }
        
        // Update the order in the orders array
        if (state.orders.length > 0) {
          state.orders = state.orders.map(order => 
            order._id === action.payload._id ? action.payload : order
          );
        }
        
        // Update in admin orders if present
        if (state.adminOrders.items.length > 0) {
          state.adminOrders.items = state.adminOrders.items.map(order => 
            order._id === action.payload._id ? action.payload : order
          );
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch All Orders (Admin)
      .addCase(fetchAllOrders.pending, (state) => {
        state.adminOrders.loading = true;
        state.adminOrders.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.adminOrders.loading = false;
        
        // Handle different response formats
        if (Array.isArray(action.payload)) {
          state.adminOrders.items = action.payload;
          state.adminOrders.pagination = {
            page: 1,
            totalPages: 1,
            totalItems: action.payload.length
          };
        } else if (action.payload && typeof action.payload === 'object') {
          // Handle paginated response
          state.adminOrders.items = action.payload.orders || action.payload.items || [];
          state.adminOrders.pagination = {
            page: action.payload.page || 1,
            totalPages: action.payload.totalPages || 1,
            totalItems: action.payload.totalItems || action.payload.count || state.adminOrders.items.length
          };
        }
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.adminOrders.loading = false;
        state.adminOrders.error = action.payload;
      });
  },
});

// Selectors
export const selectOrders = (state) => state.order.orders;
export const selectOrderDetails = (state) => state.order.order;
export const selectOrderLoading = (state) => state.order.loading;
export const selectOrderError = (state) => state.order.error;
export const selectOrderSuccess = (state) => state.order.success;
export const selectAdminOrders = (state) => state.order.adminOrders;

export const { clearOrderError, resetOrderSuccess, clearOrderDetails } = orderSlice.actions;
export default orderSlice.reducer;
