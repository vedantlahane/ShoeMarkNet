/**
 * Common Components Barrel Export
 * 
 * This file maintains backward compatibility by re-exporting all components
 * from their new organized subfolders.
 * 
 * Structure:
 * - auth/       Authentication & security components
 * - feedback/   Loaders, errors, notifications, ratings
 * - forms/      Form input components
 * - layout/     Page layouts and containers
 * - modals/     Modal and overlay components
 * - navigation/ Headers, footers, nav components
 * - social/     Social sharing components
 * - utils/      Utility components (scroll, consent, etc.)
 */

// Navigation Components
export { 
  Header, 
  Footer, 
  MobileNavigation, 
  NavigationMegaMenu, 
  Breadcrumb, 
  Pagination,
  UserProfileDropdown 
} from './navigation';

// Feedback Components
export { 
  LoadingSpinner, 
  Loader, 
  ErrorMessage, 
  Rating, 
  NotificationCenter, 
  NotificationDropdown,
  CountdownTimer 
} from './feedback';

// Form Components
export { 
  FileUpload, 
  PriceRangeSlider, 
  RatingFilter, 
  PasswordStrengthIndicator, 
  SearchBar 
} from './forms';

// Modal Components
export { 
  SearchModal, 
  ShareModal, 
  SessionWarningModal, 
  CartSidebar 
} from './modals';

// Auth Components
export { 
  AdminRoute, 
  ProtectedRoute, 
  SocialLoginButton, 
  SecurityBadge, 
  SecurityIndicators 
} from './auth';

// Social Components
export { 
  SocialShare, 
  SocialMediaButtons 
} from './social';

// Layout Components
export { 
  PageLayout, 
  PageHeader, 
  GlassPanel, 
  Carousel 
} from './layout';

// Utility Components
export { 
  BackToTopButton, 
  ScrollToTopButton, 
  InfiniteScrollSentinel, 
  CookieConsent, 
  PaymentMethods 
} from './utils';
