import { lazy } from 'react';

// Lazy load components for better performance
const Home = lazy(() => import('../pages/Home'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const Products = lazy(() => import('../pages/Products'));
const Category = lazy(() => import('../pages/Category'));
const Sale = lazy(() => import('../pages/Sale'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Profile = lazy(() => import('../pages/Profile'));
const Orders = lazy(() => import('../pages/Orders'));
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboardMinimal'));
const AccessDenied = lazy(() => import('../pages/AccessDeniedPage'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Logout = lazy(() => import('../pages/Logout'));
const About = lazy(() => import('../pages/About'));

// Route configuration with metadata
export const routeConfig = {
  // Public routes
  public: [
    {
      index: true,
      component: Home,
      exact: true,
      title: 'Home',
      description: 'Welcome to our store'
    },
    {
      path: 'about',
      component: About,
      title: 'About Us',
      description: 'Learn more about ShoeMarkNet'
    },
    {
      path: 'products',
      component: Products,
      title: 'Products',
      description: 'Browse our product catalog'
    },
    {
      path: 'products/:slug',
      component: ProductDetail,
      title: 'Product Details',
      description: 'View product information'
    },
    {
      path: 'categories',
      component: Category,
      title: 'Categories',
      description: 'Browse product categories'
    },
    {
      path: 'category',
      component: Category,
      title: 'Categories',
      description: 'Browse product categories'
    },
    {
      path: 'sale',
      component: Sale,
      title: 'Sale & Discounts',
      description: 'Limited time offers and discounts on premium footwear'
    },
    {
      path: 'categories/:categoryId',
      component: Category,
      title: 'Category',
      description: 'View category products'
    },
    {
      path: 'category/:categoryId',
      component: Category,
      title: 'Category',
      description: 'View category products'
    },
    {
      path: 'access-denied',
      component: AccessDenied,
      title: 'Access Restricted',
      description: 'You do not have permission to view this page'
    }
  ],

  // Authentication routes (no layout)
  auth: [
    {
      path: '/login',
      component: Login,
      title: 'Login',
      description: 'Sign in to your account'
    },
    {
      path: '/register',
      component: Register,
      title: 'Register',
      description: 'Create a new account'
    }
  ],

  // Protected user routes
  protected: [
    {
      path: 'profile',
      component: Profile,
      title: 'Profile',
      description: 'Manage your profile',
      requiredRole: 'user'
    },
    {
      path: 'orders',
      component: Orders,
      title: 'Orders',
      description: 'View your orders',
      requiredRole: 'user'
    },
    {
      path: 'orders/:orderId',
      component: Orders,
      title: 'Order Details',
      description: 'View order details',
      requiredRole: 'user'
    },
    {
      path: 'cart',
      component: Cart,
      title: 'Shopping Cart',
      description: 'Review items in your cart',
      requiredRole: 'user'
    },
    {
      path: 'checkout',
      component: Checkout,
      title: 'Checkout',
      description: 'Complete your purchase',
      requiredRole: 'user'
    },
    {
      path: 'wishlist',
      component: Wishlist,
      title: 'Wishlist',
      description: 'Your saved items',
      requiredRole: 'user'
    },
    {
      path: 'logout',
      component: Logout,
      title: 'Logout',
      description: 'Sign out of your account',
      requiredRole: 'user'
    }
  ],

  // Admin routes
  admin: [
    {
      index: true,
      component: AdminDashboard,
      title: 'Admin Dashboard',
      description: 'Administration panel',
      requiredRole: 'admin',
      section: 'overview',
      componentProps: { section: 'overview' }
    },
    {
      path: 'dashboard',
      component: AdminDashboard,
      title: 'Dashboard',
      description: 'Admin dashboard overview',
      requiredRole: 'admin',
      section: 'overview',
      componentProps: { section: 'overview' }
    },
    {
      path: 'products',
      component: AdminDashboard,
      title: 'Manage Products',
      description: 'Product management',
      requiredRole: 'admin',
      section: 'products',
      componentProps: { section: 'products' }
    },
    {
      path: 'orders',
      component: AdminDashboard,
      title: 'Manage Orders',
      description: 'Order management',
      requiredRole: 'admin',
      section: 'orders',
      componentProps: { section: 'orders' }
    },
    {
      path: 'users',
      component: AdminDashboard,
      title: 'Manage Users',
      description: 'User management',
      requiredRole: 'admin',
      section: 'users',
      componentProps: { section: 'users' }
    },
    {
      path: 'analytics',
      component: AdminDashboard,
      title: 'Analytics',
      description: 'Insights and reporting',
      requiredRole: 'admin',
      section: 'analytics',
      componentProps: { section: 'analytics' }
    },
    {
      path: 'settings',
      component: AdminDashboard,
      title: 'Settings',
      description: 'System settings',
      requiredRole: 'admin',
      section: 'settings',
      componentProps: { section: 'settings' }
    }
  ],

  // Fallback route
  fallback: {
    path: '*',
    component: NotFound,
    title: '404 - Page Not Found',
    description: 'The page you are looking for does not exist'
  }
};

export default routeConfig;
