import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./redux/store";
import { initAuth } from "./redux/slices/authSlice";

// Layout
import MainLayout from "./components/layouts/MainLayout";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Pages
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Orders from './pages/Orders';
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from './pages/AdminDashboard';
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import Category from "./pages/Category";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Search from "./pages/Search";
import Checkout from "./pages/Checkout";

// Protection Components
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoute from "./components/common/AdminRoute";

// Make store available globally for API interceptors
window.__REDUX_STORE__ = store;

// App content component that uses hooks
const AppContent = () => {
  const dispatch = useDispatch();
  const { isLoading: authLoading } = useSelector((state) => state.auth);
  const [appInitialized, setAppInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await dispatch(initAuth()).unwrap();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setAppInitialized(true);
      }
    };

    initializeApp();
  }, [dispatch]);

  // Show loading spinner while app is initializing
  if (!appInitialized || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" message="Initializing application..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone routes for Login and Register */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public routes wrapped by MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:slug" element={<ProductDetail />} />
          <Route path="categories" element={<Category />} />
          <Route path="categories/:categoryId" element={<Category />} />
          <Route path="search" element={<Search />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          
          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId" element={<Orders />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="wishlist" element={<Wishlist />} />
          </Route>
          
          {/* Admin routes - protected by AdminRoute */}
          <Route path="admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard section="overview" />} />
            <Route path="dashboard" element={<AdminDashboard section="overview" />} />
            <Route path="products" element={<AdminDashboard section="products" />} />
            <Route path="products/:productId" element={<AdminDashboard section="product-detail" />} />
            <Route path="orders" element={<AdminDashboard section="orders" />} />
            <Route path="orders/:orderId" element={<AdminDashboard section="order-detail" />} />
            <Route path="users" element={<AdminDashboard section="users" />} />
            <Route path="users/:userId" element={<AdminDashboard section="user-detail" />} />
            <Route path="categories" element={<AdminDashboard section="categories" />} />
            <Route path="reviews" element={<AdminDashboard section="reviews" />} />
            <Route path="reports" element={<AdminDashboard section="reports" />} />
            <Route path="reports/sales" element={<AdminDashboard section="reports-sales" />} />
            <Route path="reports/inventory" element={<AdminDashboard section="reports-inventory" />} />
            <Route path="analytics" element={<AdminDashboard section="analytics" />} />
            <Route path="analytics/customers" element={<AdminDashboard section="analytics-customers" />} />
            <Route path="leads" element={<AdminDashboard section="leads" />} />
            <Route path="settings" element={<AdminDashboard section="settings" />} />
            <Route path="campaigns" element={<AdminDashboard section="campaigns" />} />
            <Route path="campaigns/:campaignId" element={<AdminDashboard section="campaign-detail" />} />
          </Route>
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
