// src/redux/slices/orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/orderService';

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
// Add this async thunk to your orderSlice.js file
export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, updates }, { rejectWithValue }) => {
    try {
      // You'll need to add this method to your orderService
      return await orderService.updateOrderStatus(orderId, updates);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update order status' });
    }
  }
);

// Async thunk to create a new order
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      return await orderService.createOrder(orderData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create order' });
    }
  }
);

// Async thunk to update order payment
export const payOrder = createAsyncThunk(
  'order/payOrder',
  async ({ orderId, paymentResult }, { rejectWithValue }) => {
    try {
      return await orderService.updateOrderPayment(orderId, paymentResult);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Payment failed' });
    }
  }
);

const initialState = {
  orders: [],
  order: null,
  loading: false,
  success: false,
  error: null,
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
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
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add these cases to your extraReducers builder in orderSlice.js
.addCase(updateOrderStatus.pending, (state) => {
  state.loading = true;
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
})
.addCase(updateOrderStatus.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
})

      // Pay Order
      .addCase(payOrder.pending, (state) => {
        state.loading = true;
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
      })
      .addCase(payOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderError, resetOrderSuccess } = orderSlice.actions;
export default orderSlice.reducer;
