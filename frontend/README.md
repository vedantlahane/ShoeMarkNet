# ShoeMarkNet Frontend 👟

> Modern React-based e-commerce frontend for the ShoeMarkNet premium footwear platform

## 🛠️ Tech Stack

- **React 19** - Modern component-based UI library
- **Redux Toolkit** - State management with slices for auth, cart, wishlist, products
- **React Router Dom v7** - Client-side routing with lazy loading
- **Tailwind CSS v4** - Utility-first CSS with custom design system
- **Vite** - Fast build tool and development server
- **TanStack Query** - Server state management and caching
- **Framer Motion** - Smooth animations and transitions
- **Chart.js** - Data visualization for admin dashboard
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Elegant notifications

## 📁 Project Structure

```
src/
├── admin/              # Admin dashboard components
│   ├── dashboard/      # Dashboard overview panels
│   ├── orders/         # Order management modals
│   ├── products/       # Product management
│   └── users/          # User management
├── components/         # Reusable UI components
│   ├── category/       # Category navigation
│   ├── checkout/       # Checkout flow components
│   ├── common/         # Shared components (Header, Footer, etc.)
│   ├── home/           # Homepage sections
│   ├── orders/         # Order display components
│   ├── product-details/# Product detail components
│   ├── products/       # Product listing components
│   ├── profile/        # User profile components
│   ├── search/         # Search functionality
│   ├── ui/             # Base UI components
│   └── wishlist/       # Wishlist components
├── hooks/              # Custom React hooks
├── lib/                # Library configurations
├── pages/              # Page components (lazy-loaded)
├── redux/              # Redux store and slices
├── routes/             # Route configurations
├── services/           # API service functions
└── utils/              # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=15000
```

### Development

```bash
# Start development server
npm run dev
```

The app will be available at http://localhost:5173

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Features

### User Features
- 🔐 Authentication (login, register, password reset)
- 🛍️ Product browsing with filters and search
- 🛒 Persistent shopping cart
- ❤️ Wishlist management
- 📦 Order tracking and history
- 👤 Profile management
- ⭐ Product reviews and ratings
- 🌙 Dark/Light theme toggle

### Admin Features
- 📊 Analytics dashboard with charts
- 📦 Product management (CRUD)
- 📋 Order management
- 👥 User management
- 🏷️ Category management
- 📢 Campaign management
- 🎫 Coupon system
- 🔔 Notification center

## 🧩 Key Components

| Component | Description |
|-----------|-------------|
| `MainLayout` | Main app layout with Header and Footer |
| `AdminLayout` | Admin dashboard layout with sidebar |
| `PageLayout` | Reusable page wrapper with breadcrumbs |
| `ProductCard` | Product display card with actions |
| `OrderCard` | Order summary card |
| `Header` | Navigation with search, cart, theme toggle |

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🎯 Design System

The frontend uses a custom Tailwind CSS design system with:
- CSS variables for theming (light/dark mode)
- Consistent spacing scale
- Glass-morphism effects
- Gradient accents
- Responsive breakpoints

## 📝 License

MIT License - see the main [README](../README.md) for details.

