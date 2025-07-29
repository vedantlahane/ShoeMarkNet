# ShoeMarkNet 👟

> A modern, full-stack e-commerce platform for premium footwear with advanced features and beautiful UI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://www.mongodb.com/)

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
- **🌙 Dark Mode**: Beautiful dark theme support

## 🏗️ Technology Stack

### Frontend
- **React 18** - Modern component-based UI library
- **Redux Toolkit** - State management
- **React Router Dom** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server
- **Axios** - HTTP client for API calls
- **React Query** - Server state management
- **React Hot Toast** - Beautiful notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email sending
- **Express Rate Limit** - API rate limiting
- **Helmet** - Security middleware

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server auto-restart
- **Morgan** - HTTP request logger
- **Compression** - Response compression

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v7 or higher)
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
JWT_EXPIRE=30d
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ShoeMarkNet
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

6. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## 📁 Project Structure

```
ShoeMarkNet/
├── backend/                    # Backend API server
│   ├── controllers/           # Route controllers
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── middleware/           # Custom middleware
│   ├── utils/                # Utility functions
│   ├── data/                 # Sample data
│   └── public/               # Static files
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── redux/            # Redux store & slices
│   │   ├── services/         # API service functions
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   └── routes/           # Route configurations
│   └── public/               # Static assets
└── README.md                 # Project documentation
```

## 🎯 Features Deep Dive

### User Features
- **Authentication**: Secure login/register with JWT tokens
- **Product Browsing**: Browse products with advanced filtering
- **Shopping Cart**: Add/remove items with quantity management  
- **Wishlist**: Save favorite products
- **Order Management**: Track order status and history
- **User Profile**: Manage personal information and addresses
- **Reviews**: Leave product reviews and ratings

### Admin Features
- **Dashboard Analytics**: Sales, revenue, and user metrics
- **Product Management**: CRUD operations for products
- **Order Management**: Process and track orders
- **User Management**: View and manage customer accounts
- **Campaign Management**: Create promotional campaigns
- **Lead Scoring**: Track customer engagement metrics
- **Inventory Management**: Stock level monitoring

### Technical Features
- **Responsive Design**: Mobile-first approach
- **API Rate Limiting**: Prevent abuse and ensure stability
- **Error Handling**: Comprehensive error management
- **Data Validation**: Input validation on both frontend and backend
- **Security**: CORS, Helmet, and input sanitization
- **Performance**: Image optimization and lazy loading
- **SEO Friendly**: Meta tags and semantic HTML

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order status (Admin)

### Cart & Wishlist
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add item to wishlist

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
- Email: vedant.lahane@example.com

## 🙏 Acknowledgments

- React.js community for excellent documentation
- Tailwind CSS for the amazing utility framework
- MongoDB team for the robust database solution
- All contributors who helped improve this project

## 📚 Documentation

For detailed documentation, please visit:
- [API Documentation](docs/api.md)
- [Frontend Guide](docs/frontend.md)
- [Backend Guide](docs/backend.md)
- [Deployment Guide](docs/deployment.md)

## 🐛 Support & Issues

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/vedantlahane/ShoeMarkNet/issues) page
2. Create a new issue with detailed description
3. Contact the maintainers

---

<div align="center">
  <p>Made with ❤️ by Vedant Lahane</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
