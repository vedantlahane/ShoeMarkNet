// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  
  // Get redirect path from URL query parameters or state
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/';
  
  // Validate form inputs
  useEffect(() => {
    const isValidEmail = email.includes('@') && email.includes('.');
    const isValidPassword = password.length >= 6;
    setIsFormValid(isValidEmail && isValidPassword);
  }, [email, password]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, redirecting to:', redirectPath);
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate, redirectPath]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      // Successful login will trigger the useEffect above
    } catch (err) {
      // Error handling is done in the Redux slice
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@example.com');
    setPassword('demo123');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0">
        {/* Animated Background Shapes */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md">
            
            {/* Header Section */}
            <div className="text-center mb-8">
              {/* Logo */}
              <div className="inline-flex items-center space-x-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl">
                  S
                </div>
                <span className="text-3xl font-bold text-white">ShoeMarkNet</span>
              </div>

              {/* Welcome Message */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-3 mb-6 inline-block">
                <div className="flex items-center space-x-2 text-white">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <i className="fas fa-shield-alt text-green-400"></i>
                  <span className="text-sm font-medium">Secure Login</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-white mb-2">Welcome Back!</h1>
              <p className="text-blue-100 text-lg">
                <i className="fas fa-user-circle mr-2"></i>
                Sign in to your account to continue shopping
              </p>
            </div>

            {/* Main Login Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 mb-6">
              
              {/* Enhanced Error Display */}
              {error && (
                <div className="bg-red-500/20 backdrop-blur-lg border border-red-300/50 text-red-100 px-6 py-4 rounded-2xl mb-6 animate-shake">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <i className="fas fa-exclamation-triangle text-white text-sm"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Login Failed</p>
                      <p className="text-xs text-red-200">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-white font-semibold text-sm">
                    <i className="fas fa-envelope mr-2 text-blue-300"></i>
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-4 pl-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <i className="fas fa-envelope text-blue-300"></i>
                    </div>
                    {email && email.includes('@') && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <i className="fas fa-check-circle text-green-400"></i>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-white font-semibold text-sm">
                    <i className="fas fa-lock mr-2 text-purple-300"></i>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="w-full px-4 py-4 pl-12 pr-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <i className="fas fa-lock text-purple-300"></i>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors duration-200"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="flex space-x-1">
                        <div className={`w-2 h-2 rounded-full ${password.length >= 6 ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(password) ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                      </div>
                      <span className="text-blue-200">Password strength</span>
                    </div>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-lg border-2 border-white/30 flex items-center justify-center transition-all duration-200 ${
                        rememberMe ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-400' : 'bg-white/10'
                      }`}>
                        {rememberMe && <i className="fas fa-check text-white text-xs"></i>}
                      </div>
                    </div>
                    <span className="text-blue-100 text-sm">Remember me</span>
                  </label>
                  
                  <Link 
                    to="/forgot-password" 
                    className="text-blue-300 hover:text-white text-sm transition-colors duration-200 hover:underline"
                  >
                    <i className="fas fa-question-circle mr-1"></i>
                    Forgot Password?
                  </Link>
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 transform ${
                    loading || !isFormValid
                      ? 'bg-gray-500/50 cursor-not-allowed text-gray-300'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:scale-105 active:scale-95'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <i className="fas fa-sign-in-alt"></i>
                      <span>Sign In</span>
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  )}
                </button>

                {/* Demo Login Button */}
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="w-full py-3 px-6 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-2xl font-medium hover:bg-white/20 transition-all duration-200 transform hover:scale-105"
                >
                  <i className="fas fa-user-circle mr-2"></i>
                  Try Demo Login
                </button>
              </form>
            </div>

            {/* Social Login Options */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-6">
              <div className="text-center mb-4">
                <span className="text-blue-100 text-sm">Or continue with</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center space-x-2 py-3 px-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
                  <i className="fab fa-google text-red-400"></i>
                  <span className="text-sm font-medium">Google</span>
                </button>
                
                <button className="flex items-center justify-center space-x-2 py-3 px-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-200 transform hover:scale-105">
                  <i className="fab fa-facebook-f text-blue-400"></i>
                  <span className="text-sm font-medium">Facebook</span>
                </button>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 inline-block">
                <span className="text-blue-100 text-sm">Don't have an account? </span>
                <Link 
                  to="/register" 
                  className="text-white font-semibold hover:text-blue-300 transition-colors duration-200 underline"
                >
                  <i className="fas fa-user-plus mr-1"></i>
                  Create Account
                </Link>
              </div>
            </div>

            {/* Security Note */}
            <div className="text-center mt-6">
              <div className="flex items-center justify-center space-x-4 text-blue-200 text-xs">
                <div className="flex items-center space-x-1">
                  <i className="fas fa-shield-alt text-green-400"></i>
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="fas fa-lock text-yellow-400"></i>
                  <span>256-bit Encryption</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="fas fa-user-shield text-blue-400"></i>
                  <span>Privacy Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
