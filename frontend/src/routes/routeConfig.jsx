import { lazy } from 'react';

// Lazy load components for better performance
const Home = lazy(() => import('../pages/Home'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const Products = lazy(() => import('../pages/Products'));
const Category = lazy(() => import('../pages/Category'));
const Search = lazy(() => import('../pages/Search'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Profile = lazy(() => import('../pages/Profile'));
const Orders = lazy(() => import('../pages/Orders'));
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const AccessDenied = lazy(() => import('../pages/AccessDeniedPage'));
const NotFound = lazy(() => import('../pages/NotFound'));
const Logout = lazy(() => import('../pages/Logout'));

// Route configuration with metadata
export const routeConfig = {
  // Public routes
  public: [
    {
      path: '/',
      component: Home,
      exact: true,
      title: 'Home',
      description: 'Welcome to our store'
    },
    {
      path: '/products',
      component: Products,
      title: 'Products',
      description: 'Browse our product catalog'
    },
    {
      path: '/products/:slug',
      component: ProductDetail,
      title: 'Product Details',
      description: 'View product information'
    },
    {
      path: '/categories',
      component: Category,
      title: 'Categories',
      description: 'Browse product categories'
    },
    {
      path: '/categories/:categoryId',
      component: Category,
      title: 'Category',
      description: 'View category products'
    },
    {
      path: '/search',
      component: Search,
      title: 'Search Results',
      description: 'Search results'
    },
    {
      path: '/about',
      component: About,
      title: 'About Us',
      description: 'Learn more about our company'
    },
    {
      path: '/contact',
      component: Contact,
      title: 'Contact Us',
      description: 'Get in touch with us'
    },
    {
      path: '/access-denied',
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
      path: '/profile',
      component: Profile,
      title: 'Profile',
      description: 'Manage your profile',
      requiredRole: 'user'
    },
    {
      path: '/orders',
      component: Orders,
      title: 'Orders',
      description: 'View your orders',
      requiredRole: 'user'
    },
    {
      path: '/orders/:orderId',
      component: Orders,
      title: 'Order Details',
      description: 'View order details',
      requiredRole: 'user'
    },
    {
      path: '/cart',
      component: Cart,
      title: 'Shopping Cart',
      description: 'Review items in your cart',
      requiredRole: 'user'
    },
    {
      path: '/checkout',
      component: Checkout,
      title: 'Checkout',
      description: 'Complete your purchase',
      requiredRole: 'user'
    },
    {
      path: '/wishlist',
      component: Wishlist,
      title: 'Wishlist',
      description: 'Your saved items',
      requiredRole: 'user'
    },
    {
      path: '/logout',
      component: Logout,
      title: 'Logout',
      description: 'Sign out of your account',
      requiredRole: 'user'
    }
  ],

  // Admin routes
  admin: [
    {
      path: '/admin',
      component: AdminDashboard,
      title: 'Admin Dashboard',
      description: 'Administration panel',
      requiredRole: 'admin',
      section: 'overview'
    },
    {
      path: '/admin/dashboard',
      component: AdminDashboard,
      title: 'Dashboard',
      description: 'Admin dashboard overview',
      requiredRole: 'admin',
      section: 'overview'
    },
    {
      path: '/admin/products',
      component: AdminDashboard,
      title: 'Manage Products',
      description: 'Product management',
      requiredRole: 'admin',
      section: 'products'
    },
    {
      path: '/admin/orders',
      component: AdminDashboard,
      title: 'Manage Orders',
      description: 'Order management',
      requiredRole: 'admin',
      section: 'orders'
    },
    {
      path: '/admin/users',
      component: AdminDashboard,
      title: 'Manage Users',
      description: 'User management',
      requiredRole: 'admin',
      section: 'users'
    },
    {
      path: '/admin/categories',
      component: AdminDashboard,
      title: 'Manage Categories',
      description: 'Category management',
      requiredRole: 'admin',
      section: 'categories'
    },
    {
      path: '/admin/reviews',
      component: AdminDashboard,
      title: 'Manage Reviews',
      description: 'Review management',
      requiredRole: 'admin',
      section: 'reviews'
    },
    {
      path: '/admin/reports',
      component: AdminDashboard,
      title: 'Reports',
      description: 'View reports',
      requiredRole: 'admin',
      section: 'reports'
    },
    {
      path: '/admin/settings',
      component: AdminDashboard,
      title: 'Settings',
      description: 'System settings',
      requiredRole: 'admin',
      section: 'settings'
    },
    {
      path: '/admin/campaigns',
      component: AdminDashboard,
      title: 'Campaigns',
      description: 'Marketing campaigns',
      requiredRole: 'admin',
      section: 'campaigns'
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
