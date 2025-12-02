import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import wishlistReducer from './slices/wishlistSlice';
import contactReducer from './slices/contactSlice';
import categoryReducer from './slices/categorySlice';
import searchReducer from './slices/searchSlice';
import campaignReducer from './slices/campaignSlice';

// Development middleware
const isDevelopment = process.env.NODE_ENV === 'development';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    product: productReducer,
    contact: contactReducer,
    order: orderReducer,
    wishlist: wishlistReducer,
    category: categoryReducer,
    search: searchReducer,
    campaign: campaignReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
        ],
        ignoredPaths: ['register'],
      },
    }),
  devTools: isDevelopment,
});

export default store;
