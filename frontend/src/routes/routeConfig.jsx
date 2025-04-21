// src/routes/routeConfig.js
import React from 'react';
import MainLayout from '../components/layouts/MainLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminRoute from '../components/common/AdminRoute';

// Pages
import Home from '../pages/Home';
import ProductDetail from '../pages/ProductDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Orders from '../pages/Orders';
import Cart from '../pages/Cart';
import Wishlist from '../pages/Wishlist';
import AdminDashboard from '../pages/AdminDashboard';
import NotFound from '../pages/NotFound';

const routes = [
  // Public routes
  { path: '/', element: <MainLayout><Home /></MainLayout> },
  { path: '/products/:id', element: <MainLayout><ProductDetail /></MainLayout> },
  { path: '/login', element: <MainLayout><Login /></MainLayout> },
  { path: '/register', element: <MainLayout><Register /></MainLayout> },
  
  // Protected user routes
  { 
    path: '/profile', 
    element: <MainLayout><ProtectedRoute><Profile /></ProtectedRoute></MainLayout> 
  },
  { 
    path: '/orders', 
    element: <MainLayout><ProtectedRoute><Orders /></ProtectedRoute></MainLayout> 
  },
  { 
    path: '/cart', 
    element: <MainLayout><ProtectedRoute><Cart /></ProtectedRoute></MainLayout> 
  },
  { 
    path: '/wishlist', 
    element: <MainLayout><ProtectedRoute><Wishlist /></ProtectedRoute></MainLayout> 
  },
  
  // Admin routes
  { 
    path: '/admin', 
    element: <MainLayout><AdminRoute><AdminDashboard /></AdminRoute></MainLayout> 
  },
  { 
    path: '/admin/products', 
    element: <MainLayout><AdminRoute><AdminDashboard section="products" /></AdminRoute></MainLayout> 
  },
  { 
    path: '/admin/orders', 
    element: <MainLayout><AdminRoute><AdminDashboard section="orders" /></AdminRoute></MainLayout> 
  },
  { 
    path: '/admin/users', 
    element: <MainLayout><AdminRoute><AdminDashboard section="users" /></AdminRoute></MainLayout> 
  },
  
  // 404 route
  { path: '*', element: <MainLayout><NotFound /></MainLayout> }
];

export default routes;
