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

      <div className="min-h-screen bg-page">
        <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_480px]">
          <section className="relative hidden overflow-hidden lg:flex">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600" />
            <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-[-180px] right-[-120px] h-[420px] w-[420px] rounded-full bg-pink-400/25 blur-3xl" />
            <div className="relative z-10 flex h-full flex-col justify-between px-12 py-16 text-white">
              <div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-3 text-base font-semibold text-white/90 transition-colors duration-200 hover:text-white"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                    S
                  </span>
                  ShoeMarkNet
                </Link>
                <p className="mt-6 max-w-sm text-sm text-white/70">
                  Discover curated drops, personalized recommendations, and faster checkout with your ShoeMarkNet account.
                </p>
              </div>

              <div className="space-y-10">
                <div>
                  <h2 className="max-w-md text-4xl font-semibold leading-tight">
                    Step back into your sneaker sanctuary.
                  </h2>
                  <p className="mt-4 max-w-md text-white/70">
                    Keep track of orders, save wishlists, and unlock early access to limited releases tailored to your style.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                    <div className="flex items-center gap-3 text-sm font-semibold">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                        <i className="fas fa-shipping-fast"></i>
                      </span>
                      Priority shipping
                    </div>
                    <p className="mt-3 text-xs text-white/70">
                      Members receive faster delivery windows and live tracking updates.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                    <div className="flex items-center gap-3 text-sm font-semibold">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                        <i className="fas fa-heart"></i>
                      </span>
                      Wishlist sync
                    </div>
                    <p className="mt-3 text-xs text-white/70">
                      Save sizes, monitor restocks, and share your collections instantly.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-5 backdrop-blur sm:col-span-2">
                    <div className="flex items-center gap-3 text-sm font-semibold">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                        <i className="fas fa-crown"></i>
                      </span>
                      Insider rewards
                    </div>
                    <p className="mt-3 text-xs text-white/70">
                      Unlock member-only launches, early-bird pricing, and seasonal gifts.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-white/70">
                  <div>
                    <p className="text-3xl font-bold text-white">120k+</p>
                    <p>Active members worldwide</p>
                  </div>
                  <div className="h-10 w-px bg-white/20" />
                  <div>
                    <p className="text-3xl font-bold text-white">4.9★</p>
                    <p>Average member rating</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
            <div className="w-full max-w-md space-y-8">
              <div className="space-y-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2.5 text-lg font-semibold text-slate-900 transition-colors duration-200 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 lg:hidden"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    S
                  </span>
                  ShoeMarkNet
                </Link>
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-semibold text-theme">
                    Welcome back
                  </h1>
                  <p className="text-sm text-theme-secondary">
                    Sign in to manage your orders, wishlist, and personalized recommendations.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-200">
                    <i className="fas fa-shield-alt"></i>
                    Secure login
                  </span>
                  {retryCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-medium text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/30 dark:text-amber-200">
                      <i className="fas fa-sync"></i>
                      Attempt {retryCount + 1}
                    </span>
                  )}
                  {redirectPath !== '/' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-medium text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/30 dark:text-blue-200">
                      <i className="fas fa-location-arrow"></i>
                      Redirect to {redirectPath}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-5 rounded-2xl border border-theme bg-card p-6 shadow-lg">
                {errorMessage && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-200">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-200">
                        <i className="fas fa-exclamation-triangle"></i>
                      </span>
                      <div className="space-y-1.5">
                        <p className="font-semibold">We couldn't sign you in</p>
                        <p className="text-xs leading-5 text-red-600/80 dark:text-red-300">{errorMessage}</p>
                        {retryCount >= 2 && (
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
                            <Link to="/forgot-password" className="text-red-600 underline transition-colors hover:text-red-500 dark:text-red-200 dark:hover:text-red-100">
                              Forgot password?
                            </Link>
                            <button
                              type="button"
                              onClick={() => dispatch(clearAllErrors())}
                              className="text-red-600 underline transition-colors hover:text-red-500 dark:text-red-200 dark:hover:text-red-100"
                            >
                              Clear message
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-theme-secondary">
                      Email address
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted">
                        <i className="fas fa-envelope"></i>
                      </span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        ref={emailInputRef}
                        className={`w-full rounded-2xl border px-4 py-3 pl-11 text-sm font-medium text-theme placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:placeholder-slate-500 ${formTouched.email && !validation.email.isValid
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500/60'
                            : 'border-theme focus:border-blue-500'
                          } bg-input`}
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        onBlur={handleInputBlur('email')}
                        autoComplete="email"
                        aria-describedby={formTouched.email && !validation.email.isValid ? 'email-error' : undefined}
                        required
                      />
                      {formData.email && validation.email.isValid && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                          <i className="fas fa-check-circle"></i>
                        </span>
                      )}
                    </div>
                    {formTouched.email && !validation.email.isValid && (
                      <p id="email-error" className="text-xs text-red-500 dark:text-red-300">
                        {validation.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-sm font-medium text-theme-secondary">
                      Password
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        className={`w-full rounded-2xl border px-4 py-3 pl-11 pr-12 text-sm font-medium text-theme placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:placeholder-slate-500 ${formTouched.password && !validation.password.isValid
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500/60'
                            : 'border-theme focus:border-blue-500'
                          } bg-input`}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        onBlur={handleInputBlur('password')}
                        autoComplete="current-password"
                        aria-describedby={formTouched.password && !validation.password.isValid ? 'password-error' : undefined}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {formTouched.password && !validation.password.isValid && (
                      <p id="password-error" className="text-xs text-red-500 dark:text-red-300">
                        {validation.password.message}
                      </p>
                    )}
                    {formData.password && (
                      <PasswordStrengthIndicator password={formData.password} className="mt-3" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="inline-flex items-center gap-2 text-theme-secondary">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-theme-strong text-blue-600 focus:ring-blue-500"
                      />
                      Remember me
                    </label>
                    <Link to="/forgot-password" className="font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading || !validation.isValid}
                    className="w-full rounded-2xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-50 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 dark:focus:ring-offset-slate-900 dark:hover:bg-blue-500 dark:disabled:bg-slate-600"
                  >
                    {loginLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="small" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <i className="fas fa-sign-in-alt"></i>
                        Sign in
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={loginLoading}
                    className="w-full rounded-2xl border border-theme bg-card px-6 py-3 text-sm font-semibold text-theme-secondary transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-80 dark:hover:bg-slate-800"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-magic"></i>
                      Try demo login
                      <span className="text-xs text-slate-400 dark:text-slate-500">(Alt + D)</span>
                    </span>
                  </button>
                </form>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-theme-muted">
                    <span className="h-px flex-1 bg-theme-secondary" />
                    Or continue with
                    <span className="h-px flex-1 bg-theme-secondary" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <SocialLoginButton
                      provider="google"
                      onClick={handleSocialLogin}
                      disabled={loginLoading}
                      className="flex items-center justify-center gap-2 rounded-xl border border-theme bg-card px-3 py-2 text-sm font-semibold text-theme-secondary transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 dark:hover:bg-slate-800"
                    >
                      <i className="fab fa-google text-red-500"></i>
                      Google
                    </SocialLoginButton>
                    <SocialLoginButton
                      provider="facebook"
                      onClick={handleSocialLogin}
                      disabled={loginLoading}
                      className="flex items-center justify-center gap-2 rounded-xl border border-theme bg-card px-3 py-2 text-sm font-semibold text-theme-secondary transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 dark:hover:bg-slate-800"
                    >
                      <i className="fab fa-facebook-f text-blue-600"></i>
                      Facebook
                    </SocialLoginButton>
                  </div>
                  <p className="text-xs text-theme-muted">
                    By continuing you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-center">
                <div className="text-sm text-theme-secondary">
                  Don&apos;t have an account?
                  <Link to="/register" className="ml-2 font-semibold text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    Create one
                  </Link>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-theme-muted">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-shield-alt text-blue-500"></i>
                    SSL secured
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fas fa-lock text-emerald-500"></i>
                    256-bit encryption
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fas fa-user-shield text-purple-500"></i>
                    Privacy protected
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Login;
