// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import { useEffect } from "react";
import { initAuth } from "./redux/slices/authSlice";
// Layout
import MainLayout from "./components/layouts/MainLayout";

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

// Protection Components
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoute from "./components/common/AdminRoute";

const App = () => {
  // In App.jsx
useEffect(() => {
  store.dispatch(initAuth());
}, []);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Standalone routes for Login and Register */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public routes wrapped by MainLayout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="categories" element={<Category />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            
            {/* Protected user routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<Profile />} />
              <Route path="orders" element={<Orders />} />
              <Route path="cart" element={<Cart />} />
              <Route path="wishlist" element={<Wishlist />} />
            </Route>
            
            {/* Admin routes - protected by AdminRoute */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route index element={<AdminDashboard section="overview" />} /> {/* Corresponds to /admin/dashboard */}
              <Route path="products" element={<AdminDashboard section="products" />} />
              <Route path="orders" element={<AdminDashboard section="orders" />} />
              <Route path="users" element={<AdminDashboard section="users" />} /> {/* Corresponds to /admin/users */}
              <Route path="reports/sales" element={<AdminDashboard section="reports-sales" />} /> {/* Corresponds to /admin/reports/sales */}
              <Route path="reports/inventory" element={<AdminDashboard section="reports-inventory" />} /> {/* Corresponds to /admin/reports/inventory */}
              <Route path="analytics/customers" element={<AdminDashboard section="analytics-customers" />} /> {/* Corresponds to /admin/analytics/customers */}
              <Route path="leads" element={<AdminDashboard section="leads" />} /> {/* Corresponds to /admin/leads */}
              <Route path="settings" element={<AdminDashboard section="settings" />} /> {/* Corresponds to /admin/settings */}
              <Route path="campaigns" element={<AdminDashboard section="campaigns" />} /> {/* Corresponds to /admin/campaigns */}
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
