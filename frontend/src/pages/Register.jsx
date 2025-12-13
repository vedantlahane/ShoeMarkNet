import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../components/seo/PageMeta';
import { toast } from 'react-toastify';

// Redux actions
import { 
  registerUser, 
  clearError, 
  clearAllErrors,
  resetRetryCount 
} from '../redux/slices/authSlice';

// Components
import LoadingSpinner from '../components/common/feedback/LoadingSpinner';
import PasswordStrengthIndicator from '../components/common/forms/PasswordStrengthIndicator';
import SocialLoginButton from '../components/common/auth/SocialLoginButton';

// Hooks
import useLocalStorage from '../hooks/useLocalStorage';

// Utils
import { validateEmail, validatePassword, validateName, validatePhone } from '../utils/validation';
import { trackEvent } from '../utils/analytics';

const Register = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    source: 'direct',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formTouched, setFormTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false
  });
  const nameInputRef = useRef(null);

  // Redux state
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    isAuthenticated, 
    registerLoading,
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

  // Local storage for form persistence
  const [savedFormData, setSavedFormData] = useLocalStorage('registerFormData', {});

  // Navigation state
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const redirectPath = searchParams.get('redirect') || 
                      location.state?.from?.pathname || 
                      '/';

  // Form validation
  const validation = useMemo(() => {
    const nameValidation = validateName(formData.name);
    const emailValidation = validateEmail(formData.email);
    const phoneValidation = validatePhone(formData.phone);
    const passwordValidation = validatePassword(formData.password);
    const confirmPasswordValidation = {
      isValid: formData.confirmPassword === formData.password && formData.confirmPassword.length > 0,
      message: formData.confirmPassword !== formData.password ? 'Passwords do not match' : 
               formData.confirmPassword.length === 0 ? 'Please confirm your password' : ''
    };
    
    return {
      name: nameValidation,
      email: emailValidation,
      phone: phoneValidation,
      password: passwordValidation,
      confirmPassword: confirmPasswordValidation,
      isValid: nameValidation.isValid && 
               emailValidation.isValid && 
               phoneValidation.isValid && 
               passwordValidation.isValid && 
               confirmPasswordValidation.isValid && 
               acceptTerms
    };
  }, [formData, acceptTerms]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    let strength = 0;
    const { password } = formData;
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return {
      score: strength,
      level: strength <= 1 ? 'weak' : 
             strength <= 2 ? 'fair' : 
             strength <= 3 ? 'good' : 
             strength <= 4 ? 'strong' : 'excellent',
      color: strength <= 1 ? 'from-red-500 to-red-600' :
             strength <= 2 ? 'from-orange-500 to-yellow-500' :
             strength <= 3 ? 'from-yellow-500 to-green-500' :
             strength <= 4 ? 'from-green-500 to-emerald-500' :
             'from-emerald-500 to-green-600'
    };
  }, [formData.password]);

  // Handle input changes
  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Save to localStorage for form persistence
    setSavedFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (error && !formTouched[field]) {
      dispatch(clearError());
    }
  }, [error, formTouched, dispatch, setSavedFormData]);

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
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
    
    // Restore form data from localStorage
    if (Object.keys(savedFormData).length > 0) {
      setFormData(prev => ({ ...prev, ...savedFormData }));
    }
    
    // Track page view
    trackEvent('page_view', {
      page_title: 'Register',
      page_location: window.location.href
    });
  }, [dispatch, savedFormData]);

  // Handle authentication redirect
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      console.log('User registered and authenticated, redirecting to:', redirectPath);
      
      // Clear saved form data
      setSavedFormData({});
      
      // Track successful registration
      trackEvent('registration_success', {
        method: 'email',
        redirect_path: redirectPath,
        source: formData.source
      });
      
      // Show success message
      toast.success('🎉 Welcome to ShoeMarkNet! Redirecting...');
      
      // Delayed redirect for better UX
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1500);
    }
  }, [isAuthenticated, isInitialized, navigate, redirectPath, formData.source, setSavedFormData]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validation.isValid || registerLoading) return;
    
    // Mark all fields as touched
    setFormTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true
    });

    try {
      // Track registration attempt
      trackEvent('registration_attempt', {
        method: 'email',
        source: formData.source
      });

      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        source: formData.source
      };

      await dispatch(registerUser(userData)).unwrap();

    } catch (err) {
      // Error handling is done in Redux slice
      // Track failed registration
      trackEvent('registration_failed', {
        method: 'email',
        error_message: err.message || 'Unknown error',
        source: formData.source
      });
    }
  };

  // Handle social registration
  const handleSocialRegister = useCallback((provider) => {
    // Track social registration attempt
    trackEvent('social_registration_attempt', {
      provider
    });

    // Redirect to social auth endpoint
    window.location.href = `/api/auth/${provider}/register?redirect=${encodeURIComponent(redirectPath)}`;
  }, [redirectPath]);

  // Handle demo data fill
  const handleDemoFill = useCallback(() => {
    const demoData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      password: 'Demo123456!',
      confirmPassword: 'Demo123456!',
      source: 'demo'
    };
    
    setFormData(prev => ({ ...prev, ...demoData }));
    setAcceptTerms(true);
    
    // Track demo fill
    trackEvent('demo_fill_clicked', {
      source: 'register_page'
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Alt + D for demo fill
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        handleDemoFill();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleDemoFill]);

  return (
    <>
      {/* SEO Meta Tags */}
      <PageMeta
        title="Create Account - Join ShoeMarkNet | Premium Footwear Store"
        description="Join ShoeMarkNet and enjoy exclusive deals, free shipping, and access to premium footwear collections. Sign up now!"
        robots="noindex, nofollow"
        canonical="https://shoemarknet.com/register"
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_520px]">
          <section className="relative hidden overflow-hidden lg:flex">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600" />
            <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-white/25 blur-3xl" />
            <div className="absolute bottom-[-180px] right-[-140px] h-[420px] w-[420px] rounded-full bg-violet-400/25 blur-3xl" />
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
                  Create your ShoeMarkNet account to unlock curated drops, wishlists in sync, and faster checkout every time you shop.
                </p>
              </div>

              <div className="space-y-10">
                <div>
                  <h2 className="max-w-xl text-4xl font-semibold leading-tight">
                    Build your collection with insider access.
                  </h2>
                  <p className="mt-4 max-w-md text-white/70">
                    Members get exclusive launch alerts, restock reminders, and first dibs on limited releases tailored to their taste.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                    <div className="flex items-center gap-3 text-sm font-semibold">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                        <i className="fas fa-gem"></i>
                      </span>
                      Member exclusives
                    </div>
                    <p className="mt-3 text-xs text-white/70">
                      Unlock invite-only drops and pricing reserved for loyal collectors.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                    <div className="flex items-center gap-3 text-sm font-semibold">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                        <i className="fas fa-bell"></i>
                      </span>
                      Restock alerts
                    </div>
                    <p className="mt-3 text-xs text-white/70">
                      Stay ahead with instant notifications when sizes return.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-5 backdrop-blur sm:col-span-2">
                    <div className="flex items-center gap-3 text-sm font-semibold">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                        <i className="fas fa-heart"></i>
                      </span>
                      Personalized picks
                    </div>
                    <p className="mt-3 text-xs text-white/70">
                      Save your wishlist and receive recommendations tuned to your vibe.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-white/70">
                  <div>
                    <p className="text-3xl font-bold text-white">180k+</p>
                    <p>Creators in the community</p>
                  </div>
                  <div className="h-10 w-px bg-white/20" />
                  <div>
                    <p className="text-3xl font-bold text-white">92%</p>
                    <p>Faster checkout completion</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
            <div className="w-full max-w-md space-y-10">
              <div className="space-y-4">
                <Link
                  to="/"
                  className="inline-flex items-center gap-3 text-lg font-semibold text-slate-900 transition-colors duration-200 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 lg:hidden"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                    S
                  </span>
                  ShoeMarkNet
                </Link>

                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
                    Create your account
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Join ShoeMarkNet to track orders, unlock exclusive drops, and sync your wishlist anywhere.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-medium text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/30 dark:text-blue-200">
                    <i className="fas fa-lock"></i>
                    Secure registration
                  </span>
                  {retryCount > 0 && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-medium text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/30 dark:text-amber-200">
                      <i className="fas fa-sync"></i>
                      Attempt {retryCount + 1}
                    </span>
                  )}
                  {redirectPath !== '/' && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-200">
                      <i className="fas fa-location-arrow"></i>
                      Redirect to {redirectPath}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                {errorMessage && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-200">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-200">
                        <i className="fas fa-exclamation-triangle"></i>
                      </span>
                      <div className="space-y-2">
                        <p className="font-semibold">We couldn't complete your registration</p>
                        <p className="text-xs leading-5 text-red-600/80 dark:text-red-300">{errorMessage}</p>
                        {retryCount >= 2 && (
                          <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium">
                            <button
                              type="button"
                              onClick={handleDemoFill}
                              className="text-red-600 underline transition-colors hover:text-red-500 dark:text-red-200 dark:hover:text-red-100"
                            >
                              Try demo data
                            </button>
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

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Full name
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                        <i className="fas fa-user"></i>
                      </span>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        ref={nameInputRef}
                        className={`w-full rounded-2xl border px-4 py-3 pl-12 text-sm font-medium text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 dark:placeholder-slate-500 ${
                          formTouched.name && !validation.name.isValid
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500/60'
                            : 'border-slate-200 focus:border-blue-500 dark:border-slate-700'
                        } bg-white dark:bg-slate-900/70`}
                        placeholder="Jane Doe"
                        value={formData.name}
                        onChange={handleInputChange('name')}
                        onBlur={handleInputBlur('name')}
                        autoComplete="name"
                        aria-describedby={formTouched.name && !validation.name.isValid ? 'name-error' : undefined}
                        required
                      />
                      {formData.name && validation.name.isValid && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                          <i className="fas fa-check-circle"></i>
                        </span>
                      )}
                    </div>
                    {formTouched.name && !validation.name.isValid && (
                      <p id="name-error" className="text-xs text-red-500 dark:text-red-300">
                        {validation.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Email address
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                        <i className="fas fa-envelope"></i>
                      </span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`w-full rounded-2xl border px-4 py-3 pl-12 text-sm font-medium text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 dark:placeholder-slate-500 ${
                          formTouched.email && !validation.email.isValid
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500/60'
                            : 'border-slate-200 focus:border-blue-500 dark:border-slate-700'
                        } bg-white dark:bg-slate-900/70`}
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
                    <label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Phone number
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                        <i className="fas fa-phone"></i>
                      </span>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className={`w-full rounded-2xl border px-4 py-3 pl-12 text-sm font-medium text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 dark:placeholder-slate-500 ${
                          formTouched.phone && !validation.phone.isValid
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500/60'
                            : 'border-slate-200 focus:border-blue-500 dark:border-slate-700'
                        } bg-white dark:bg-slate-900/70`}
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={handleInputChange('phone')}
                        onBlur={handleInputBlur('phone')}
                        autoComplete="tel"
                        aria-describedby={formTouched.phone && !validation.phone.isValid ? 'phone-error' : undefined}
                        required
                      />
                      {formData.phone && validation.phone.isValid && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                          <i className="fas fa-check-circle"></i>
                        </span>
                      )}
                    </div>
                    {formTouched.phone && !validation.phone.isValid && (
                      <p id="phone-error" className="text-xs text-red-500 dark:text-red-300">
                        {validation.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Password
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        className={`w-full rounded-2xl border px-4 py-3 pl-12 pr-12 text-sm font-medium text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 dark:placeholder-slate-500 ${
                          formTouched.password && !validation.password.isValid
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500/60'
                            : 'border-slate-200 focus:border-blue-500 dark:border-slate-700'
                        } bg-white dark:bg-slate-900/70`}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        onBlur={handleInputBlur('password')}
                        autoComplete="new-password"
                        aria-describedby={formTouched.password && !validation.password.isValid ? 'password-error' : undefined}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
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
                      <PasswordStrengthIndicator password={formData.password} strength={passwordStrength} className="mt-3" />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Confirm password
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                        <i className="fas fa-shield-alt"></i>
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        className={`w-full rounded-2xl border px-4 py-3 pl-12 pr-12 text-sm font-medium text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 dark:placeholder-slate-500 ${
                          formTouched.confirmPassword && !validation.confirmPassword.isValid
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500 dark:border-red-500/60'
                            : 'border-slate-200 focus:border-blue-500 dark:border-slate-700'
                        } bg-white dark:bg-slate-900/70`}
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange('confirmPassword')}
                        onBlur={handleInputBlur('confirmPassword')}
                        autoComplete="new-password"
                        aria-describedby={formTouched.confirmPassword && !validation.confirmPassword.isValid ? 'confirm-password-error' : undefined}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {formTouched.confirmPassword && !validation.confirmPassword.isValid && (
                      <p id="confirm-password-error" className="text-xs text-red-500 dark:text-red-300">
                        {validation.confirmPassword.message}
                      </p>
                    )}
                    {formData.confirmPassword && (
                      <div
                        className={`text-xs font-medium ${
                          validation.confirmPassword.isValid
                            ? 'text-emerald-600 dark:text-emerald-300'
                            : 'text-red-600 dark:text-red-300'
                        }`}
                      >
                        {validation.confirmPassword.isValid ? 'Passwords match' : 'Passwords do not match'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="source" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      How did you hear about us?
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                        <i className="fas fa-bullhorn"></i>
                      </span>
                      <select
                        id="source"
                        name="source"
                        className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-12 text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
                        value={formData.source}
                        onChange={handleInputChange('source')}
                      >
                        <option value="direct">Direct visit</option>
                        <option value="google">Google search</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="twitter">Twitter</option>
                        <option value="referral">Friend referral</option>
                        <option value="advertisement">Advertisement</option>
                        <option value="other">Other</option>
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <i className="fas fa-chevron-down"></i>
                      </span>
                    </div>
                  </div>

                  <label className={`flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm font-medium transition ${
                    acceptTerms
                      ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-200'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200'
                  }`}>
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600"
                      aria-describedby="terms-description"
                    />
                    <span className="space-y-1" id="terms-description">
                      I agree to the{' '}
                      <Link to="/terms" className="text-blue-600 underline transition-colors hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200" target="_blank" rel="noopener noreferrer">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-blue-600 underline transition-colors hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200" target="_blank" rel="noopener noreferrer">
                        Privacy Policy
                      </Link>
                      {!acceptTerms && <span className="ml-1 text-red-500">*</span>}
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={registerLoading || !validation.isValid}
                    className="w-full rounded-2xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-50 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 dark:focus:ring-offset-slate-900 dark:hover:bg-blue-500 dark:disabled:bg-slate-600"
                  >
                    {registerLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="small" />
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <i className="fas fa-user-plus"></i>
                        Create account
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDemoFill}
                    disabled={registerLoading}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <span className="inline-flex items-center gap-2">
                      <i className="fas fa-magic"></i>
                      Fill demo data
                      <span className="text-xs text-slate-500 dark:text-slate-400">(Alt + D)</span>
                    </span>
                  </button>
                </form>
              </div>

              <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <div className="relative flex items-center">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span className="mx-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Or sign up with
                  </span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <SocialLoginButton
                    provider="google"
                    onClick={() => handleSocialRegister('google')}
                    disabled={registerLoading}
                    className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-300"
                  >
                    <i className="fab fa-google text-lg text-red-500"></i>
                    Google
                  </SocialLoginButton>
                  <SocialLoginButton
                    provider="facebook"
                    onClick={() => handleSocialRegister('facebook')}
                    disabled={registerLoading}
                    className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-300"
                  >
                    <i className="fab fa-facebook-f text-lg text-blue-600"></i>
                    Facebook
                  </SocialLoginButton>
                </div>

                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                  By signing up with a social account you agree to our Terms & Privacy Policy.
                </p>
              </div>

              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-5 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-600 underline-offset-4 transition hover:underline dark:text-blue-300">
                  Sign in
                </Link>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Why new members love ShoeMarkNet
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200">
                        <i className="fas fa-gift"></i>
                      </span>
                      Exclusive deals
                    </div>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      Seasonal promos and surprise drops designed for members first.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                        <i className="fas fa-shipping-fast"></i>
                      </span>
                      Free shipping perks
                    </div>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      Accelerated delivery, free returns, and live tracking updates.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">
                        <i className="fas fa-crown"></i>
                      </span>
                      VIP access
                    </div>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      Early entry to curated events, launch parties, and limited collabs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Register;
