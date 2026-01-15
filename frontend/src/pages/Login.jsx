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
import LoadingSpinner from '../components/common/feedback/LoadingSpinner';
import PasswordStrengthIndicator from '../components/common/forms/PasswordStrengthIndicator';
import SocialLoginButton from '../components/common/auth/SocialLoginButton';

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

  // Paths that should NOT be used as redirect targets (would cause loops or immediate logout)
  const invalidRedirectPaths = ['/logout', '/login', '/register', '/forgot-password', '/reset-password'];

  const redirectPath = useMemo(() => {
    const fromUrl = searchParams.get('redirect');
    const fromState = location.state?.from?.pathname;

    // Check URL param first
    if (fromUrl && !invalidRedirectPaths.some(p => fromUrl.startsWith(p))) {
      return fromUrl;
    }

    // Check location state
    if (fromState && !invalidRedirectPaths.some(p => fromState.startsWith(p))) {
      return fromState;
    }

    // Default to home
    return '/';
  }, [searchParams, location.state]);

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

    // Track login attempt
    trackEvent('login_attempt', {
      method: 'email',
      remembered: rememberMe
    });

    // Save email if remember me is checked
    if (rememberMe) {
      localStorage.setItem('savedEmail', formData.email);
    } else {
      localStorage.removeItem('savedEmail');
    }

    // Dispatch login action
    dispatch(loginUser({
      email: formData.email,
      password: formData.password
    }));
  };

  // Handle demo login
  const handleDemoLogin = useCallback(() => {
    const demoCreds = {
      email: 'user@shoemarknet.test',
      password: 'User@123!'
    };

    setFormData(demoCreds);

    // Auto-submit demo login
    setTimeout(() => {
      dispatch(loginUser({
        email: demoCreds.email,
        password: demoCreds.password
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

  return (
    <>
      {/* SEO Meta Tags */}
      <PageMeta
        title="Sign In - ShoeMarkNet | Premium Footwear Store"
        description="Sign in to ShoeMarkNet to access exclusive deals, track orders, and enjoy a personalized shopping experience."
        robots="noindex, nofollow"
        canonical="https://shoemarknet.com/login"
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
        {/* Background decorations */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">S</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">ShoeMarkNet</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 p-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-exclamation-circle text-red-500 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">{errorMessage}</p>
                    {retryCount >= 2 && (
                      <Link to="/forgot-password" className="text-xs text-red-600 dark:text-red-400 underline mt-1 inline-block">
                        Forgot password?
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    ref={emailInputRef}
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${formTouched.email && !validation.email.isValid
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-slate-200 dark:border-slate-700'
                      }`}
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    onBlur={handleInputBlur('email')}
                    autoComplete="email"
                    required
                  />
                </div>
                {formTouched.email && !validation.email.isValid && (
                  <p className="mt-1.5 text-xs text-red-500">{validation.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 pl-11 pr-12 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${formTouched.password && !validation.password.isValid
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-slate-200 dark:border-slate-700'
                      }`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    onBlur={handleInputBlur('password')}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {formTouched.password && !validation.password.isValid && (
                  <p className="mt-1.5 text-xs text-red-500">{validation.password.message}</p>
                )}
                {formData.password && (
                  <PasswordStrengthIndicator password={formData.password} className="mt-3" />
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loginLoading || !validation.isValid}
                className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="small" />
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>

              {/* Demo Login */}
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loginLoading}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-magic text-purple-500"></i>
                  Try demo login
                  <span className="text-xs text-slate-400">(Alt+D)</span>
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs font-medium text-slate-400 uppercase">Or continue with</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <SocialLoginButton
                provider="google"
                onClick={handleSocialLogin}
                disabled={loginLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <i className="fab fa-google text-red-500"></i>
                Google
              </SocialLoginButton>
              <SocialLoginButton
                provider="facebook"
                onClick={handleSocialLogin}
                disabled={loginLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <i className="fab fa-facebook-f text-blue-600"></i>
                Facebook
              </SocialLoginButton>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Create one
              </Link>
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <i className="fas fa-shield-alt text-blue-500"></i>
                SSL secured
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-lock text-emerald-500"></i>
                Encrypted
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
