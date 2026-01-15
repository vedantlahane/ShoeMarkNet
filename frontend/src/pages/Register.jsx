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

  // Navigation state
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // Paths that should NOT be used as redirect targets
  const invalidRedirectPaths = ['/logout', '/login', '/register', '/forgot-password', '/reset-password'];

  const redirectPath = useMemo(() => {
    const fromUrl = searchParams.get('redirect');
    const fromState = location.state?.from?.pathname;

    if (fromUrl && !invalidRedirectPaths.some(p => fromUrl.startsWith(p))) {
      return fromUrl;
    }

    if (fromState && !invalidRedirectPaths.some(p => fromState.startsWith(p))) {
      return fromState;
    }

    return '/';
  }, [searchParams, location.state]);

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
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }

    // Track page view
    trackEvent('page_view', {
      page_title: 'Register',
      page_location: window.location.href
    });
  }, [dispatch]);

  // Handle authentication redirect
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      console.log('User registered and authenticated, redirecting to:', redirectPath);

      // Track successful registration
      trackEvent('registration_success', {
        method: 'email',
        redirect_path: redirectPath
      });

      // Show success message
      toast.success('🎉 Welcome to ShoeMarkNet! Redirecting...');

      // Delayed redirect for better UX
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1500);
    }
  }, [isAuthenticated, isInitialized, navigate, redirectPath]);

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
        method: 'email'
      });

      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password
      };

      await dispatch(registerUser(userData)).unwrap();

    } catch (err) {
      // Error handling is done in Redux slice
      trackEvent('registration_failed', {
        method: 'email',
        error_message: err.message || 'Unknown error'
      });
    }
  };

  // Handle social registration
  const handleSocialRegister = useCallback((provider) => {
    trackEvent('social_registration_attempt', { provider });
    window.location.href = `/api/auth/${provider}/register?redirect=${encodeURIComponent(redirectPath)}`;
  }, [redirectPath]);

  return (
    <>
      {/* SEO Meta Tags */}
      <PageMeta
        title="Create Account - Join ShoeMarkNet | Premium Footwear Store"
        description="Join ShoeMarkNet and enjoy exclusive deals, free shipping, and access to premium footwear collections. Sign up now!"
        robots="noindex, nofollow"
        canonical="https://shoemarknet.com/register"
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
        {/* Background decorations */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
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
              Create your account
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Join thousands of sneaker enthusiasts
            </p>
          </div>

          {/* Register Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 p-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-exclamation-circle text-red-500 mt-0.5"></i>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full name
                </label>
                <div className="relative">
                  <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    ref={nameInputRef}
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${formTouched.name && !validation.name.isValid
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-slate-200 dark:border-slate-700'
                      }`}
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    onBlur={handleInputBlur('name')}
                    autoComplete="name"
                    required
                  />
                </div>
                {formTouched.name && !validation.name.isValid && (
                  <p className="mt-1.5 text-xs text-red-500">{validation.name.message}</p>
                )}
              </div>

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
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${formTouched.email && !validation.email.isValid
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

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone number
                </label>
                <div className="relative">
                  <i className="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${formTouched.phone && !validation.phone.isValid
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-slate-200 dark:border-slate-700'
                      }`}
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    onBlur={handleInputBlur('phone')}
                    autoComplete="tel"
                    required
                  />
                </div>
                {formTouched.phone && !validation.phone.isValid && (
                  <p className="mt-1.5 text-xs text-red-500">{validation.phone.message}</p>
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
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 pl-11 pr-12 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${formTouched.password && !validation.password.isValid
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-slate-200 dark:border-slate-700'
                      }`}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    onBlur={handleInputBlur('password')}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <i className="fas fa-shield-alt absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 pl-11 pr-12 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${formTouched.confirmPassword && !validation.confirmPassword.isValid
                      ? 'border-red-400 dark:border-red-500'
                      : 'border-slate-200 dark:border-slate-700'
                      }`}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    onBlur={handleInputBlur('confirmPassword')}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {formTouched.confirmPassword && !validation.confirmPassword.isValid && (
                  <p className="mt-1.5 text-xs text-red-500">{validation.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms */}
              <label className={`flex items-start gap-3 rounded-xl border p-4 text-sm cursor-pointer transition ${acceptTerms
                ? 'border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20'
                : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                }`}>
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-600 dark:text-slate-400">
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={registerLoading || !validation.isValid}
                className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registerLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="small" />
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs font-medium text-slate-400 uppercase">Or sign up with</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <SocialLoginButton
                provider="google"
                onClick={handleSocialRegister}
                disabled={registerLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <i className="fab fa-google text-red-500"></i>
                Google
              </SocialLoginButton>
              <SocialLoginButton
                provider="facebook"
                onClick={handleSocialRegister}
                disabled={registerLoading}
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
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
