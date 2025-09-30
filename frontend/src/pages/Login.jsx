import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../components/seo/PageMeta';
import { toast } from 'react-toastify';

// Redux actions
import { 
  loginUser, 
  clearError, 
  clearAllErrors,
  resetRetryCount 
} from '../redux/slices/authSlice';

// Hooks
import useLocalStorage from '../hooks/useLocalStorage';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';
import PasswordStrengthIndicator from '../components/common/PasswordStrengthIndicator';
import SocialLoginButton from '../components/common/SocialLoginButton';

// Utils
import { validateEmail, validatePassword } from '../utils/validation';
import { trackEvent } from '../utils/analytics';

const Login = () => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useLocalStorage('rememberMe', false);
  const [formTouched, setFormTouched] = useState({
    email: false,
    password: false
  });
  const emailInputRef = useRef(null);

  // Redux state
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    isAuthenticated, 
    loginLoading,
    error,
    retryCount,
    isInitialized 
  } = useSelector((state) => state.auth);

  const errorMessage = useMemo(() => {
    if (!error) return '';
    if (typeof error === 'string') return error;
    if (typeof error === 'object') {
      return error.userMessage || error.message || error.error || '';
    }
    return '';
  }, [error]);
  
  // Navigation state
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const redirectPath = searchParams.get('redirect') || 
                      location.state?.from?.pathname || 
                      '/';

  // Form validation
  const validation = useMemo(() => {
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);
    
    return {
      email: emailValidation,
      password: passwordValidation,
      isValid: emailValidation.isValid && passwordValidation.isValid
    };
  }, [formData.email, formData.password]);

  // Handle input changes
  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (error && !formTouched[field]) {
      dispatch(clearError());
    }
  }, [error, formTouched, dispatch]);

  // Handle input blur
  const handleInputBlur = useCallback((field) => () => {
    setFormTouched(prev => ({
      ...prev,
      [field]: true
    }));
  }, []);

  // Clear errors on component mount
  useEffect(() => {
    dispatch(clearAllErrors());
    dispatch(resetRetryCount());
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
    
    // Track page view
    trackEvent('page_view', {
      page_title: 'Login',
      page_location: window.location.href
    });
  }, [dispatch]);

  // Handle authentication redirect
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      console.log('User authenticated, redirecting to:', redirectPath);
      
      // Track successful login
      trackEvent('login_success', {
        method: 'email',
        redirect_path: redirectPath
      });
      
      // Show success message
      toast.success('🎉 Welcome back! Redirecting...');
      
      // Delayed redirect for better UX
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1000);
    }
  }, [isAuthenticated, isInitialized, navigate, redirectPath]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validation.isValid || loginLoading) return;
    
    // Mark all fields as touched
    setFormTouched({
      email: true,
      password: true
    });

    try {
      // Track login attempt
      trackEvent('login_attempt', {
        method: 'email'
      });

      await dispatch(loginUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      })).unwrap();

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('savedEmail', formData.email);
      } else {
        localStorage.removeItem('savedEmail');
      }

    } catch (err) {
      // Error handling is done in Redux slice
      // Track failed login
      trackEvent('login_failed', {
        method: 'email',
        error_message: err.message || 'Unknown error'
      });
    }
  };

  // Handle demo login
  const handleDemoLogin = useCallback(() => {
    setFormData({
      email: 'demo@shoemarknet.com',
      password: 'Demo123456'
    });
    
    // Auto-submit demo login
    setTimeout(() => {
      dispatch(loginUser({
        email: 'demo@shoemarknet.com',
        password: 'Demo123456'
      }));
    }, 500);

    // Track demo login
    trackEvent('demo_login_clicked', {
      source: 'login_page'
    });
  }, [dispatch]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.altKey || event.metaKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        handleDemoLogin();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [handleDemoLogin]);

  // Handle social login
  const handleSocialLogin = useCallback((provider) => {
    // Track social login attempt
    trackEvent('social_login_attempt', {
      provider
    });

    // Redirect to social auth endpoint
    window.location.href = `/api/auth/${provider}?redirect=${encodeURIComponent(redirectPath)}`;
  }, [redirectPath]);

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail && rememberMe) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail
      }));
    }
  }, [rememberMe]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Alt + D for demo login
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        handleDemoLogin();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleDemoLogin]);

  return (
    <>
      {/* SEO Meta Tags */}
      <PageMeta
        title="Sign In - ShoeMarkNet | Premium Footwear Store"
        description="Sign in to ShoeMarkNet to access exclusive deals, track orders, and enjoy a personalized shopping experience."
        robots="noindex, nofollow"
        canonical="https://shoemarknet.com/login"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          {/* Animated Background Shapes */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          
          {/* Enhanced Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 6}s`
              }}
            />
          ))}
        </div>

  <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-5 lg:px-6 py-8 relative z-10">
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md">
              
              {/* Enhanced Header Section */}
              <div className="text-center mb-8">
                {/* Logo */}
                <Link 
                  to="/" 
                  className="inline-flex items-center space-x-3 mb-6 group transition-transform duration-200 hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-200">
                    S
                  </div>
                  <span className="text-3xl font-bold text-white">ShoeMarkNet</span>
                </Link>

                {/* Enhanced Status Badge */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-3 mb-6 inline-block">
                  <div className="flex items-center space-x-2 text-white">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <i className="fas fa-shield-alt text-green-400"></i>
                    <span className="text-sm font-medium">Secure Login</span>
                    {retryCount > 0 && (
                      <span className="text-xs bg-yellow-500/20 px-2 py-1 rounded-full">
                        Attempt {retryCount + 1}
                      </span>
                    )}
                  </div>
                </div>

                <h1 className="text-4xl font-bold text-white mb-2">Welcome Back!</h1>
                <p className="text-blue-100 text-lg">
                  <i className="fas fa-user-circle mr-2"></i>
                  Sign in to your account to continue shopping
                </p>

                {/* Return path indicator */}
                {redirectPath !== '/' && (
                  <div className="mt-4 text-sm text-blue-200 bg-blue-500/20 rounded-lg px-3 py-2 inline-block">
                    <i className="fas fa-arrow-left mr-1"></i>
                    You'll return to: {redirectPath}
                  </div>
                )}
              </div>

              {/* Enhanced Main Login Card */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 mb-6">
                
                {/* Enhanced Error Display */}
                {error && (
                  <div className="bg-red-500/20 backdrop-blur-lg border border-red-300/50 text-red-100 px-6 py-4 rounded-2xl mb-6 animate-shake">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                        <i className="fas fa-exclamation-triangle text-white text-sm"></i>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">Login Failed</p>
                        <p className="text-xs text-red-200">{error.message || error}</p>
                        {retryCount >= 2 && (
                          <div className="mt-2 flex items-center space-x-2">
                            <Link 
                              to="/forgot-password" 
                              className="text-xs text-red-200 hover:text-white underline"
                            >
                              Forgot your password?
                            </Link>
                            <span className="text-red-300">|</span>
                            <button 
                              onClick={() => dispatch(clearAllErrors())}
                              className="text-xs text-red-200 hover:text-white underline"
                            >
                              Clear error
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {errorMessage && (
                    <div className="bg-red-500/15 border border-red-400/30 text-red-100 text-sm rounded-2xl px-4 py-3 flex items-center space-x-2">
                      <i className="fas fa-exclamation-triangle"></i>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Enhanced Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-white font-semibold text-sm">
                      <i className="fas fa-envelope mr-2 text-blue-300"></i>
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        ref={emailInputRef}
                        className={`w-full px-4 py-4 pl-12 bg-white/10 backdrop-blur-lg border rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          formTouched.email && !validation.email.isValid
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-white/20 focus:ring-blue-400 focus:border-transparent'
                        }`}
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        onBlur={handleInputBlur('email')}
                        autoComplete="email"
                        aria-describedby={formTouched.email && !validation.email.isValid ? "email-error" : undefined}
                        required
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <i className="fas fa-envelope text-blue-300"></i>
                      </div>
                      {formData.email && validation.email.isValid && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <i className="fas fa-check-circle text-green-400"></i>
                        </div>
                      )}
                    </div>
                    
                    {/* Email validation message */}
                    {formTouched.email && !validation.email.isValid && (
                      <p id="email-error" className="text-red-300 text-xs flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {validation.email.message}
                      </p>
                    )}
                  </div>
                  
                  {/* Enhanced Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-white font-semibold text-sm">
                      <i className="fas fa-lock mr-2 text-purple-300"></i>
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        className={`w-full px-4 py-4 pl-12 pr-12 bg-white/10 backdrop-blur-lg border rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          formTouched.password && !validation.password.isValid
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-white/20 focus:ring-purple-400 focus:border-transparent'
                        }`}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        onBlur={handleInputBlur('password')}
                        autoComplete="current-password"
                        aria-describedby={formTouched.password && !validation.password.isValid ? "password-error" : undefined}
                        required
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <i className="fas fa-lock text-purple-300"></i>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors duration-200"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    
                    {/* Password validation message */}
                    {formTouched.password && !validation.password.isValid && (
                      <p id="password-error" className="text-red-300 text-xs flex items-center">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {validation.password.message}
                      </p>
                    )}
                    
                    {/* Enhanced Password Strength Indicator */}
                    {formData.password && (
                      <PasswordStrengthIndicator 
                        password={formData.password} 
                        className="mt-2"
                      />
                    )}
                  </div>

                  {/* Enhanced Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-lg border-2 border-white/30 flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${
                          rememberMe ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-400' : 'bg-white/10'
                        }`}>
                          {rememberMe && <i className="fas fa-check text-white text-xs"></i>}
                        </div>
                      </div>
                      <span className="text-blue-100 text-sm group-hover:text-white transition-colors duration-200">
                        Remember me
                      </span>
                    </label>
                    
                    <Link 
                      to="/forgot-password" 
                      className="text-blue-300 hover:text-white text-sm transition-colors duration-200 hover:underline group"
                    >
                      <i className="fas fa-question-circle mr-1 group-hover:animate-pulse"></i>
                      Forgot Password?
                    </Link>
                  </div>
                  
                  {/* Enhanced Submit Button */}
                  <button
                    type="submit"
                    disabled={loginLoading || !validation.isValid}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 transform relative overflow-hidden ${
                      loginLoading || !validation.isValid
                        ? 'bg-gray-500/50 cursor-not-allowed text-gray-300 scale-100'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:scale-105 active:scale-95'
                    }`}
                  >
                    {loginLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <LoadingSpinner size="small" />
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <i className="fas fa-sign-in-alt"></i>
                        <span>Sign In</span>
                        <i className="fas fa-arrow-right"></i>
                      </div>
                    )}
                    
                    {/* Button shine effect */}
                    {!loginLoading && validation.isValid && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    )}
                  </button>

                  {/* Enhanced Demo Login Button */}
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="w-full py-3 px-6 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-2xl font-medium hover:bg-white/20 transition-all duration-200 transform hover:scale-105 group"
                    disabled={loginLoading}
                  >
                    <i className="fas fa-user-circle mr-2 group-hover:animate-bounce"></i>
                    Try Demo Login
                    <span className="text-xs ml-2 text-blue-200">(Alt + D)</span>
                  </button>
                </form>
              </div>

              {/* Enhanced Social Login Options */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-6">
                <div className="text-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white/10 text-blue-100 rounded-full">Or continue with</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <SocialLoginButton
                    provider="google"
                    onClick={() => handleSocialLogin('google')}
                    disabled={loginLoading}
                    className="flex items-center justify-center space-x-2 py-3 px-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fab fa-google text-red-400"></i>
                    <span className="text-sm font-medium">Google</span>
                  </SocialLoginButton>
                  
                  <SocialLoginButton
                    provider="facebook"
                    onClick={() => handleSocialLogin('facebook')}
                    disabled={loginLoading}
                    className="flex items-center justify-center space-x-2 py-3 px-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fab fa-facebook-f text-blue-400"></i>
                    <span className="text-sm font-medium">Facebook</span>
                  </SocialLoginButton>
                </div>
                
                <p className="text-xs text-blue-200 text-center mt-3">
                  By signing in with social media, you agree to our Terms & Privacy Policy
                </p>
              </div>

              {/* Enhanced Sign Up Link */}
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 inline-block transition-all duration-200 hover:bg-white/20">
                  <span className="text-blue-100 text-sm">Don't have an account? </span>
                  <Link 
                    to="/register" 
                    className="text-white font-semibold hover:text-blue-300 transition-colors duration-200 underline group"
                  >
                    <i className="fas fa-user-plus mr-1 group-hover:animate-pulse"></i>
                    Create Account
                  </Link>
                </div>
              </div>

              {/* Enhanced Security Note */}
              <div className="text-center mt-6">
                <div className="flex items-center justify-center space-x-4 text-blue-200 text-xs">
                  <div className="flex items-center space-x-1 group">
                    <i className="fas fa-shield-alt text-green-400 group-hover:animate-pulse"></i>
                    <span>SSL Secured</span>
                  </div>
                  <div className="flex items-center space-x-1 group">
                    <i className="fas fa-lock text-yellow-400 group-hover:animate-bounce"></i>
                    <span>256-bit Encryption</span>
                  </div>
                  <div className="flex items-center space-x-1 group">
                    <i className="fas fa-user-shield text-blue-400 group-hover:animate-pulse"></i>
                    <span>Privacy Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Custom Styles */}
      </div>
    </>
  );
};

export default Login;
