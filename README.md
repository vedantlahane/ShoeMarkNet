# ShoeMarkNet 👟

> A modern, full-stack e-commerce platform for premium footwear with advanced features and beautiful UI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green.svg)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF.svg)](https://vitejs.dev/)

## 🌟 Overview

ShoeMarkNet is a comprehensive e-commerce platform designed specifically for footwear retail. Built with modern technologies and featuring a sleek, responsive design, it provides both customers and administrators with an exceptional experience.

### ✨ Key Features

- **🎨 Modern UI/UX**: Beautiful gradient designs with glass-morphism effects
- **📱 Fully Responsive**: Optimized for all devices and screen sizes  
- **🔐 Advanced Authentication**: Secure JWT-based user authentication
- **🛒 Shopping Cart**: Persistent cart with real-time updates
- **❤️ Wishlist System**: Save favorite products for later
- **📊 Admin Dashboard**: Comprehensive analytics and management tools
- **🔍 Smart Search**: Advanced product search with filters
- **⭐ Review System**: Customer reviews and ratings
- **📈 Lead Scoring**: AI-powered customer behavior analysis
- **🎯 Campaign Management**: Marketing campaigns and promotions
- **📦 Order Management**: Complete order lifecycle tracking
- **📬 Contact Center**: Unified inbox with SLA tracking for customer inquiries
- **🌙 Dark Mode**: Beautiful dark theme support

## 🏗️ Technology Stack

### Frontend
- **React 19** - Modern component-based UI library
- **Redux Toolkit** - State management
- **React Router Dom v7** - Client-side routing
- **Tailwind CSS v4** - Utility-first CSS framework
- **Vite 7** - Next-generation build tool and development server
- **Axios** - HTTP client for API calls
- **TanStack Query** - Server state management
- **React Hot Toast** - Beautiful notifications
- **Framer Motion** - Animation library
- **Chart.js** - Data visualization
- **Lucide React & Heroicons** - Icon libraries
- **React Intersection Observer** - Intersection detection
- **date-fns** - Date utility library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js v5** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose v8** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email sending
- **Express Rate Limit** - API rate limiting
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **UUID** - Unique identifier generation
- **Slugify** - URL-friendly string generation
- **Compression** - Response compression
- **Morgan** - HTTP request logger

### Development Tools
- **ESLint v9** - Code linting with modern flat config
- **Vite 7** - Next-generation build tool with HMR
- **Tailwind CSS v4** - Latest utility-first CSS framework
- **Nodemon** - Development server auto-restart
- **TanStack Query DevTools** - Query debugging

## 🚀 Quick Start

### Prerequisites
- Node.js (v20 or higher)
- MongoDB (v8 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/vedantlahane/ShoeMarkNet.git
cd ShoeMarkNet
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Configure your environment variables in .env
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install

# Create environment file
cp .env.example .env
# Configure your environment variables in .env
```

4. **Environment Variables**

Backend `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shoemarknet
JWT_SECRET=your_jwt_secret_key
REFRESH_TOKEN_SECRET=your_refresh_token_secret
JWT_EXPIRE=30d
REFRESH_TOKEN_EXPIRE=7d

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_NAME=ShoeMarkNet
FROM_EMAIL=noreply@shoemarknet.com

# Optional: Realtime metrics interval (milliseconds)
REALTIME_METRICS_INTERVAL=15000
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=15000

# Optional: WebSocket configuration for real-time features
# VITE_WS_BASE_URL=ws://localhost:5000
# VITE_WS_ENABLED=true

# Optional: Analytics and tracking
# VITE_GA_MEASUREMENT_ID=your_google_analytics_id
# VITE_MIXPANEL_TOKEN=your_mixpanel_token
```

5. **Start Development Servers**

Backend:
```bash
cd backend
npm run dev
```

Frontend (in new terminal):
```bash
cd frontend
npm run dev
```

### Seed Default Accounts

Need ready-to-use credentials for testing? Run the backend seeding script after configuring your `.env`:

```bash
cd backend
npm run seed:accounts
```

This command creates or updates two accounts:

- **Admin** — `admin@shoemarknet.test` / `Admin@123!`
- **User** — `user@shoemarknet.test` / `User@123!`

The script is idempotent: rerunning it refreshes the passwords without duplicating users.

### Seed Sample Catalog, Coupons & Promotions

Want products, coupons, and promotions ready to demo? Run the sample data seeder after default accounts:

```bash
cd backend
npm run seed:sample
```

This populates featured categories, products, a `WELCOME10` coupon, a public promotion banner, and a few admin notifications.

6. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## 📁 Project Structure

```
ShoeMarkNet/
├── backend/                    # Backend API server
│   ├── controllers/           # Route controllers (15 controllers)
│   ├── models/                # Database models (16 models)
│   ├── routes/                # API routes (14 route files)
│   ├── middleware/            # Custom middleware (auth, error, rate limit, validation)
│   ├── services/              # Business logic services
│   ├── utils/                 # Utility functions (API response, database, file upload, etc.)
│   ├── scripts/               # Database seeding scripts
│   ├── docs/                  # API documentation
│   └── public/                # Static files
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── admin/            # Admin dashboard components
│   │   ├── components/       # Reusable UI components (organized by feature)
│   │   ├── pages/            # Page components
│   │   ├── redux/            # Redux store & slices
│   │   ├── services/         # API service functions
│   │   ├── hooks/            # Custom React hooks
│   │   ├── routes/           # Route configurations
│   │   ├── lib/              # Library configurations
│   │   ├── utils/            # Utility functions
│   │   └── assets/           # Static assets
│   └── public/               # Public static files
└── README.md                  # Project documentation
```

## 🎯 Features Deep Dive

### User Features
- **Authentication**: Secure login/register with JWT tokens, password reset, email verification
- **Product Browsing**: Browse products with advanced filtering (category, brand, price, gender, etc.)
- **Shopping Cart**: Add/remove items with quantity management and persistence
- **Wishlist**: Save favorite products for later
- **Checkout Process**: Complete checkout flow with billing, shipping, and payment forms
- **Order Management**: Track order status and history with detailed order views
- **User Profile**: Manage personal information, addresses, and preferences
- **Product Reviews**: Leave product reviews and ratings
- **Search Functionality**: Advanced product search with filters
- **Contact Support**: Submit support tickets with file attachments
- **Responsive Design**: Mobile-first design that works on all devices

### Admin Features
- **Dashboard Analytics**: Comprehensive sales, revenue, and user metrics with charts
- **Product Management**: Full CRUD operations for products with image uploads
- **Order Management**: Process and track orders with status updates
- **User Management**: View and manage customer accounts
- **Category Management**: Organize products with categories
- **Campaign Management**: Create and manage promotional campaigns
- **Coupon System**: Create and monitor discount codes with usage limits
- **Lead Scoring**: Track customer engagement and behavior metrics
- **Contact Center**: Triage, assign, and close customer support tickets with SLA tracking
- **Notification Center**: Manage operational alerts and notifications
- **Realtime Dashboard**: Live statistics with auto-refresh capabilities
- **Settings Panel**: Configure application settings
- **Analytics Panel**: Detailed analytics and reporting

### Technical Features
- **Responsive Design**: Mobile-first approach
- **API Rate Limiting**: Prevent abuse and ensure stability
- **Error Handling**: Comprehensive error management
- **Data Validation**: Input validation on both frontend and backend
- **Security**: CORS, Helmet, and input sanitization
- **Performance**: Image optimization and lazy loading
- **SEO Friendly**: Meta tags and semantic HTML
- **Service Desk Ready**: API endpoints for contact submissions, status updates, and analytics

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password with token
- `GET /api/auth/verify-email/:token` - Verify email address
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order status (Admin)

### Cart & Wishlist
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove item from cart
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add item to wishlist
- `DELETE /api/wishlist/:productId` - Remove item from wishlist

### Reviews
- `GET /api/reviews/:productId` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Contact Center
- `POST /api/contact` - Submit a support request (public)
- `GET /api/admin/contacts` - List contact tickets with filters (Admin)
- `GET /api/admin/contacts/:id` - View a specific ticket (Admin)
- `PATCH /api/admin/contacts/:id/status` - Update ticket status or assignment (Admin)
- `POST /api/admin/contacts/:id/respond` - Record responses and timeline events (Admin)
- `DELETE /api/admin/contacts/:id` - Remove a ticket (Admin)
- `GET /api/admin/contacts/stats` - Retrieve SLA and workload analytics (Admin)

### Admin Dashboard
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/products` - Get all products for admin
- `GET /api/admin/campaigns` - Get marketing campaigns
- `POST /api/admin/campaigns` - Create campaign
- `GET /api/admin/coupons` - Get discount coupons
- `POST /api/admin/coupons` - Create coupon

## 🔧 Environment Setup

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create a new database named `shoemarknet`
3. Update the `MONGODB_URI` in your backend `.env` file

### Email Configuration
Configure email settings in your backend `.env` file for:
- User registration confirmation
- Password reset functionality
- Order confirmation emails

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
1. Set up production environment variables
2. Configure MongoDB Atlas connection
3. Deploy using Git or Docker

### Frontend Deployment (Vercel/Netlify)
1. Build the production bundle: `npm run build`
2. Deploy the `dist` folder
3. Configure environment variables

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

### Development Guidelines
- Follow the existing code style
- Write descriptive commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Vedant Lahane**
- GitHub: [@vedantlahane](https://github.com/vedantlahane)
- Email: vedant.lahane@gmail.com
- LinkedIn: [Vedant Lahane](https://linkedin.com/in/vedantlahane)

*Last updated: December 2025*

## 🙏 Acknowledgments

- React.js community for excellent documentation
- Tailwind CSS for the amazing utility framework
- MongoDB team for the robust database solution
- All contributors who helped improve this project

## 📚 Documentation

For detailed documentation, please visit:
- [API Reference](backend/docs/api-reference.md)
- [Frontend Components](frontend/README.md)
- [Backend Architecture](backend/README.md)

Additional documentation files are available in the respective directories.

## 🐛 Support & Issues

### Common Issues & Solutions

**CORS Errors**: Ensure your frontend URL is added to the allowed origins in `backend/app.js`

**Database Connection**: Verify your MongoDB URI is correct and the database is running

**Environment Variables**: Double-check all required environment variables are set

**Port Conflicts**: Make sure ports 5000 and 5173 are available

**Noisy Vite Dev Logs**: The frontend development server now filters repetitive `[vite]` HMR connection messages. If you need the original verbosity, remove or adjust the `noisyLogPatterns` array in `frontend/vite.config.js`.

**WebSocket Console Errors**: Real-time dashboard updates are disabled unless `VITE_WS_BASE_URL` is set. Configure the variable (and optionally `VITE_WS_ENABLED=true`) once a WebSocket backend is available to avoid repeated connection warnings during development.

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/vedantlahane/ShoeMarkNet/issues) page
2. Create a new issue with detailed description
3. Contact the maintainers

## 📈 Roadmap

### ✅ Completed Features
- [x] Complete e-commerce platform with user and admin functionality
- [x] Advanced authentication with email verification and password reset
- [x] Comprehensive product catalog with categories and reviews
- [x] Shopping cart and wishlist functionality
- [x] Full checkout process with order management
- [x] Admin dashboard with analytics and management tools
- [x] Contact center with ticket management
- [x] Real-time features and notifications
- [x] Responsive design with dark mode support
- [x] API documentation and comprehensive testing

### 🚧 In Progress
- [ ] Payment gateway integration (Stripe, PayPal, Razorpay)
- [ ] Real-time chat support system
- [ ] Advanced inventory management
- [ ] Multi-language support (i18n)

### 📋 Planned Features
- [ ] Mobile application (React Native)
- [ ] Advanced analytics and reporting
- [ ] Social media integration
- [ ] AI-powered product recommendations
- [ ] Loyalty program and rewards system
- [ ] Advanced search with AI-powered suggestions
- [ ] Email marketing campaigns
- [ ] Integration with shipping providers
- [ ] Product comparison feature
- [ ] Wishlist sharing functionality

---

<div align="center">
  <p>Made with ❤️ by Vedant Lahane</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
