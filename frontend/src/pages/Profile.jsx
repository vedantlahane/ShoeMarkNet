import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PageMeta from '../components/seo/PageMeta';
import PageLayout from '../components/common/layout/PageLayout';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/layout/PageHeader';

// Redux actions
import { 
  updateUserProfile, 
  changePassword,
  clearError,
  clearAllErrors,
  clearSuccessFlags
} from '../redux/slices/authSlice';

// Components
import LoadingSpinner from '../components/common/feedback/LoadingSpinner';
import PasswordStrengthIndicator from '../components/common/forms/PasswordStrengthIndicator';
import ProfileCompleteness from '../components/profile/ProfileCompleteness';
import ProfileAvatar from '../components/profile/ProfileAvatar';

// Utils
import { validateName, validatePhone } from '../utils/validation';
import { trackEvent } from '../utils/analytics';

// Hooks
import useLocalStorage from '../hooks/useLocalStorage';

const Profile = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    user, 
    isAuthenticated,
    profileUpdateLoading,
    passwordChangeLoading,
    error,
    profileUpdateSuccess,
    passwordChangeSuccess,
    profileUpdateTime,
    passwordChangeTime
  } = useSelector((state) => state.auth);

  // Local state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bio: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [activeTab, setActiveTab] = useLocalStorage('profileActiveTab', 'profile');
  const [formTouched, setFormTouched] = useState({});
  const [passwordTouched, setPasswordTouched] = useState({});
  const profileNameInputRef = useRef(null);

  // Memoized profile completeness calculation
  const profileCompleteness = useMemo(() => {
    if (!user) return 0;
    
    const fields = ['name', 'phone', 'address', 'bio'];
    const filledFields = fields.filter(field => user[field] && user[field].trim().length > 0);
    return Math.round((filledFields.length / fields.length) * 100);
  }, [user]);

  // Form validation
  const validation = useMemo(() => {
    const nameValidation = validateName(formData.name);
    const phoneValidation = formData.phone ? validatePhone(formData.phone) : { isValid: true, message: '' };
    
    const addressValidation = formData.address && formData.address.length > 0 && formData.address.length < 5
      ? { isValid: false, message: 'Address should be at least 5 characters long' }
      : { isValid: true, message: '' };
      
    const bioValidation = formData.bio && formData.bio.length > 500
      ? { isValid: false, message: 'Bio should not exceed 500 characters' }
      : { isValid: true, message: '' };

    return {
      name: nameValidation,
      phone: phoneValidation,
      address: addressValidation,
      bio: bioValidation,
      isValid: nameValidation.isValid && 
               phoneValidation.isValid && 
               addressValidation.isValid && 
               bioValidation.isValid
    };
  }, [formData]);

  // Password validation
  const passwordValidation = useMemo(() => {
    const currentPasswordValidation = !passwordData.currentPassword
      ? { isValid: false, message: 'Current password is required' }
      : { isValid: true, message: '' };

    const newPasswordValidation = !passwordData.newPassword
      ? { isValid: false, message: 'New password is required' }
      : passwordData.newPassword.length < 8
      ? { isValid: false, message: 'Password must be at least 8 characters long' }
      : !/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(passwordData.newPassword)
      ? { isValid: false, message: 'Password must include uppercase, lowercase, and numbers' }
      : { isValid: true, message: '' };

    const confirmPasswordValidation = passwordData.newPassword !== passwordData.confirmPassword
      ? { isValid: false, message: 'Passwords do not match' }
      : { isValid: true, message: '' };

    return {
      currentPassword: currentPasswordValidation,
      newPassword: newPasswordValidation,
      confirmPassword: confirmPasswordValidation,
      isValid: currentPasswordValidation.isValid && 
               newPasswordValidation.isValid && 
               confirmPasswordValidation.isValid
    };
  }, [passwordData]);

  const profileErrorMessage = useMemo(() => {
    if (!error) return '';
    if (typeof error === 'string') return error;
    if (typeof error === 'object') {
      return error.userMessage || error.message || 'An error occurred while updating your profile';
    }
    return 'An unknown error occurred.';
  }, [error]);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (isEditing && profileNameInputRef.current) {
      profileNameInputRef.current.focus();
    }
  }, [isEditing]);

  // Clear errors on component mount
  useEffect(() => {
    dispatch(clearAllErrors());
    
    // Track page view
    trackEvent('page_view', {
      page_title: 'Profile',
      page_location: window.location.href
    });
  }, [dispatch]);

  // Handle success states
  useEffect(() => {
    if (profileUpdateSuccess && profileUpdateTime) {
      const timeDiff = Date.now() - profileUpdateTime;
      if (timeDiff < 5000) { // Show success for 5 seconds
        setIsEditing(false);
        setTimeout(() => {
          dispatch(clearSuccessFlags());
        }, 3000);
      }
    }
  }, [profileUpdateSuccess, profileUpdateTime, dispatch]);

  useEffect(() => {
    if (passwordChangeSuccess && passwordChangeTime) {
      const timeDiff = Date.now() - passwordChangeTime;
      if (timeDiff < 5000) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setIsChangingPassword(false);
        setPasswordTouched({});
        setTimeout(() => {
          dispatch(clearSuccessFlags());
        }, 3000);
      }
    }
  }, [passwordChangeSuccess, passwordChangeTime, dispatch]);

  // Handle input changes
  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Mark field as touched
    setFormTouched(prev => ({ ...prev, [field]: true }));
    
    // Clear errors when user starts typing
    if (error && !formTouched[field]) {
      dispatch(clearError());
    }
  }, [error, formTouched, dispatch]);

  const handlePasswordChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    // Mark field as touched
    setPasswordTouched(prev => ({ ...prev, [field]: true }));
    
    // Clear errors when user starts typing
    if (error && !passwordTouched[field]) {
      dispatch(clearError());
    }
  }, [error, passwordTouched, dispatch]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setFormTouched({
      name: true,
      phone: true,
      address: true,
      bio: true
    });
    
    if (!validation.isValid) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }
    
    try {
      // Track profile update attempt
      trackEvent('profile_update_attempt', {
        fields_updated: Object.keys(formData).filter(key => 
          formData[key] !== (user[key] || '')
        )
      });

      await dispatch(updateUserProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        bio: formData.bio.trim(),
      })).unwrap();

    } catch (err) {
      console.error('Profile update failed:', err);
      // Error handling is done in Redux slice
    }
  };

  // Handle password submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setPasswordTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true
    });
    
    if (!passwordValidation.isValid) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }
    
    try {
      // Track password change attempt
      trackEvent('password_change_attempt');

      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })).unwrap();

    } catch (err) {
      console.error('Password change failed:', err);
      // Error handling is done in Redux slice
    }
  };

  // Handle cancel actions
  const handleCancel = useCallback(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
      });
    }
    setValidationErrors({});
    setFormTouched({});
    setIsEditing(false);
    dispatch(clearError());
  }, [user, dispatch]);

  const handlePasswordCancel = useCallback(() => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setValidationErrors({});
    setPasswordTouched({});
    setIsChangingPassword(false);
    dispatch(clearError());
  }, [dispatch]);

  // Handle tab changes
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    dispatch(clearError());
    
    trackEvent('profile_tab_change', {
      tab: tab
    });
  }, [setActiveTab, dispatch]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-lg shadow-lg dark:shadow-none border border-slate-200 dark:border-slate-800 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-lock text-red-600 dark:text-red-400 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Authentication Required</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Please sign in to access your profile</p>
          <a 
            href="/login" 
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 inline-block"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner size="large" message="Loading your profile..." />
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <PageMeta
        title={`Profile - ${user.name} | ShoeMarkNet`}
        description="Manage your ShoeMarkNet profile, update personal information, and change security settings."
        robots="noindex, nofollow"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Animated floating orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-[10%] top-[15%] h-48 w-48 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-400/5 animate-pulse" />
          <div className="absolute right-[15%] top-[25%] h-56 w-56 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-400/5 animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[20%] left-[20%] h-44 w-44 rounded-full bg-rose-400/10 blur-3xl dark:bg-rose-400/5 animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 py-6 text-slate-900 dark:text-slate-100">
        <div className="container-app">
          <PageHeader
            title="Profile"
            description="Manage your account settings and personal information."
            breadcrumbItems={[{ label: 'Profile' }]}
          />
          
          {/* Profile Header */}
          <div className="relative mb-6 overflow-hidden">
            {/* Glassmorphism card with gradient background */}
            <div className="relative rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg shadow-slate-900/10 dark:shadow-slate-900/30 overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-rose-500/10 dark:from-sky-500/5 dark:via-indigo-500/5 dark:to-rose-500/5" />
              
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-sky-400/20 to-indigo-400/20 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-rose-400/20 to-pink-400/20 rounded-full blur-2xl" />

              <div className="relative px-6 py-8 lg:px-8 lg:py-10">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                  {/* Avatar section */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {/* Avatar glow effect */}
                      <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 rounded-full blur-md opacity-30" />
                      <div className="relative">
                        <ProfileAvatar user={user} size="xl" />
                      </div>
                    </div>
                  </div>

                  {/* User info section */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="space-y-3">
                      {/* Name with gradient */}
                      <h1 className="text-3xl lg:text-4xl font-bold">
                        <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-rose-600 dark:from-sky-400 dark:via-indigo-400 dark:to-rose-400 bg-clip-text text-transparent">
                          {user.name}
                        </span>
                      </h1>
                      
                      {/* Email */}
                      <p className="text-base text-slate-600 dark:text-slate-300 font-medium">
                        {user.email}
                      </p>

                      {/* Member badge */}
                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 px-4 py-2 backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completeness */}
          <ProfileCompleteness completeness={profileCompleteness} className="mb-5" />
          
          {/* Success Messages */}
          {profileUpdateSuccess && (
            <div className="relative mb-6 overflow-hidden rounded-xl border border-green-200/50 dark:border-green-800/50 bg-green-50/70 dark:bg-green-950/70 backdrop-blur-xl shadow-md shadow-green-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10" />
              <div className="relative flex items-center p-4">
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-white text-xs"></i>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">
                    Profile Updated Successfully!
                  </h3>
                  <p className="mt-0.5 text-xs text-green-700 dark:text-green-300">
                    Your profile information has been saved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {passwordChangeSuccess && (
            <div className="relative mb-6 overflow-hidden rounded-xl border border-green-200/50 dark:border-green-800/50 bg-green-50/70 dark:bg-green-950/70 backdrop-blur-xl shadow-md shadow-green-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10" />
              <div className="relative flex items-center p-4">
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-shield-check text-white text-xs"></i>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">
                    Password Changed Successfully!
                  </h3>
                  <p className="mt-0.5 text-xs text-green-700 dark:text-green-300">
                    Your password has been updated securely.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Profile Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg shadow-slate-900/10 dark:shadow-slate-900/30">
            
            {/* Tabs Navigation */}
            <div className="border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <nav className="flex -mb-px px-2">
                <button
                  onClick={() => handleTabChange('profile')}
                  className={`relative flex-1 py-4 px-3 text-center font-semibold text-sm transition-all duration-300 rounded-t-lg ${
                    activeTab === 'profile'
                      ? 'text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                  aria-current={activeTab === 'profile' ? 'page' : undefined}
                >
                  <div className="flex items-center justify-center gap-2">
                    <i className={`fas fa-user ${activeTab === 'profile' ? 'text-white' : 'text-sky-500'}`}></i>
                    <span>Profile Information</span>
                  </div>
                  {activeTab === 'profile' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => handleTabChange('security')}
                  className={`relative flex-1 py-5 px-4 text-center font-semibold text-sm transition-all duration-300 rounded-t-xl ${
                    activeTab === 'security'
                      ? 'text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 shadow-lg'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                  aria-current={activeTab === 'security' ? 'page' : undefined}
                >
                  <div className="flex items-center justify-center gap-2">
                    <i className={`fas fa-shield-alt ${activeTab === 'security' ? 'text-white' : 'text-indigo-500'}`}></i>
                    <span>Security</span>
                  </div>
                  {activeTab === 'security' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => handleTabChange('preferences')}
                  className={`relative flex-1 py-5 px-4 text-center font-semibold text-sm transition-all duration-300 rounded-t-xl ${
                    activeTab === 'preferences'
                      ? 'text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 shadow-lg'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                  aria-current={activeTab === 'preferences' ? 'page' : undefined}
                >
                  <div className="flex items-center justify-center gap-2">
                    <i className={`fas fa-cog ${activeTab === 'preferences' ? 'text-white' : 'text-rose-500'}`}></i>
                    <span>Preferences</span>
                  </div>
                  {activeTab === 'preferences' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
                  )}
                </button>
              </nav>
            </div>
            
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <>
                <div className="px-6 py-6 flex justify-between items-center border-b border-gray-100">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Update your personal details and contact information
                    </p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="relative group inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 hover:from-sky-600 hover:via-indigo-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 shadow-lg shadow-sky-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-105"
                      aria-label="Edit profile information"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-6 py-3 border border-slate-200/50 dark:border-slate-700/50 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-lg shadow-slate-900/10 dark:shadow-slate-900/30 transition-all duration-300 hover:shadow-xl hover:scale-105"
                      aria-label="Cancel editing"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Cancel
                    </button>
                  )}
                </div>
                
                {/* Error Display */}
                {profileErrorMessage && (
                  <div className="relative mb-6 overflow-hidden rounded-2xl border border-red-200/50 dark:border-red-800/50 bg-red-50/70 dark:bg-red-950/70 backdrop-blur-xl shadow-lg shadow-red-500/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-rose-400/10" />
                    <div className="relative flex p-6">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                          <i className="fas fa-exclamation-triangle text-white text-sm"></i>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                          Error Updating Profile
                        </h3>
                        <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                          {profileErrorMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {isEditing ? (
                  <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        
                        {/* Name Field */}
                        <div className="sm:col-span-1">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            ref={profileNameInputRef}
                            value={formData.name}
                            onChange={handleInputChange('name')}
                            className={`w-full px-4 py-4 border rounded-xl backdrop-blur-sm transition-all duration-300 ${
                              formTouched.name && !validation.name.isValid
                                ? 'border-red-300/50 bg-red-50/50 dark:bg-red-950/50 text-red-900 dark:text-red-100 placeholder-red-400'
                                : 'border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 hover:bg-white/70 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-400 dark:focus:border-sky-500'
                            }`}
                            aria-required="true"
                            aria-invalid={formTouched.name && !validation.name.isValid}
                            aria-describedby={formTouched.name && !validation.name.isValid ? "name-error" : undefined}
                            placeholder="Enter your full name"
                          />
                          {formTouched.name && !validation.name.isValid && (
                            <p className="mt-1 text-sm text-red-600 flex items-center" id="name-error">
                              <i className="fas fa-exclamation-circle mr-1"></i>
                              {validation.name.message}
                            </p>
                          )}
                        </div>

                        {/* Email Field (Read-only) */}
                        <div className="sm:col-span-1">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={user.email}
                              disabled
                              className="w-full px-4 py-4 border border-slate-200/50 dark:border-slate-700/50 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed backdrop-blur-sm"
                              aria-describedby="email-description"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <i className="fas fa-lock text-gray-400"></i>
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-gray-500" id="email-description">
                            <i className="fas fa-info-circle mr-1"></i>
                            Email address cannot be changed
                          </p>
                        </div>

                        {/* Phone Field */}
                        <div className="sm:col-span-1">
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            value={formData.phone}
                            onChange={handleInputChange('phone')}
                            className={`w-full px-4 py-4 border rounded-xl backdrop-blur-sm transition-all duration-300 ${
                              formTouched.phone && !validation.phone.isValid
                                ? 'border-red-300/50 bg-red-50/50 dark:bg-red-950/50 text-red-900 dark:text-red-100 placeholder-red-400'
                                : 'border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 hover:bg-white/70 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-400 dark:focus:border-indigo-500'
                            }`}
                            aria-invalid={formTouched.phone && !validation.phone.isValid}
                            aria-describedby={formTouched.phone && !validation.phone.isValid ? "phone-error" : undefined}
                            placeholder="+1 (555) 123-4567"
                          />
                          {formTouched.phone && !validation.phone.isValid && (
                            <p className="mt-1 text-sm text-red-600 flex items-center" id="phone-error">
                              <i className="fas fa-exclamation-circle mr-1"></i>
                              {validation.phone.message}
                            </p>
                          )}
                        </div>
                        
                        {/* Address Field */}
                        <div className="sm:col-span-1">
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            id="address"
                            value={formData.address}
                            onChange={handleInputChange('address')}
                            className={`w-full px-4 py-4 border rounded-xl backdrop-blur-sm transition-all duration-300 ${
                              formTouched.address && !validation.address.isValid
                                ? 'border-red-300/50 bg-red-50/50 dark:bg-red-950/50 text-red-900 dark:text-red-100 placeholder-red-400'
                                : 'border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 hover:bg-white/70 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 focus:border-rose-400 dark:focus:border-rose-500'
                            }`}
                            aria-invalid={formTouched.address && !validation.address.isValid}
                            aria-describedby={formTouched.address && !validation.address.isValid ? "address-error" : undefined}
                            placeholder="123 Main St, City, State, ZIP"
                          />
                          {formTouched.address && !validation.address.isValid && (
                            <p className="mt-1 text-sm text-red-600 flex items-center" id="address-error">
                              <i className="fas fa-exclamation-circle mr-1"></i>
                              {validation.address.message}
                            </p>
                          )}
                        </div>
                        
                        {/* Bio Field */}
                        <div className="sm:col-span-2">
                          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                            Bio
                          </label>
                          <textarea
                            name="bio"
                            id="bio"
                            rows="4"
                            value={formData.bio}
                            onChange={handleInputChange('bio')}
                            className={`w-full px-4 py-4 border rounded-xl backdrop-blur-sm resize-none transition-all duration-300 ${
                              formTouched.bio && !validation.bio.isValid
                                ? 'border-red-300/50 bg-red-50/50 dark:bg-red-950/50 text-red-900 dark:text-red-100 placeholder-red-400'
                                : 'border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 hover:bg-white/70 dark:hover:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 focus:border-sky-400 dark:focus:border-sky-500'
                            }`}
                            aria-invalid={formTouched.bio && !validation.bio.isValid}
                            aria-describedby={formTouched.bio && !validation.bio.isValid ? "bio-error" : "bio-help"}
                            placeholder="Tell us a little about yourself..."
                          />
                          {formTouched.bio && !validation.bio.isValid ? (
                            <p className="mt-1 text-sm text-red-600 flex items-center" id="bio-error">
                              <i className="fas fa-exclamation-circle mr-1"></i>
                              {validation.bio.message}
                            </p>
                          ) : (
                            <p className="mt-1 text-sm text-gray-500" id="bio-help">
                              {formData.bio.length}/500 characters
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Form Actions */}
                      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-6 py-3 border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-lg shadow-slate-900/10 dark:shadow-slate-900/30 transition-all duration-300 hover:shadow-xl hover:scale-105"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={profileUpdateLoading || !validation.isValid}
                          className="relative group inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 hover:from-sky-600 hover:via-indigo-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/40 hover:scale-105 disabled:hover:scale-100"
                          aria-busy={profileUpdateLoading}
                        >
                          {profileUpdateLoading ? (
                            <>
                              <LoadingSpinner size="small" className="mr-2" />
                              Saving Changes...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save mr-2"></i>
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="p-6">
                    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-1">Full Name</dt>
                        <dd className="text-sm text-gray-900">{user.name || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-1">Email Address</dt>
                        <dd className="text-sm text-gray-900 flex items-center">
                          {user.email}
                          {user.isEmailVerified && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <i className="fas fa-check-circle mr-1"></i>
                              Verified
                            </span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-1">Phone Number</dt>
                        <dd className="text-sm text-gray-900">{user.phone || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-1">Address</dt>
                        <dd className="text-sm text-gray-900">{user.address || 'Not provided'}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 mb-1">Bio</dt>
                        <dd className="text-sm text-gray-900">{user.bio || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-1">Member Since</dt>
                        <dd className="text-sm text-gray-900">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Unknown'}
                        </dd>
                      </div>
                      {user.role === 'admin' && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500 mb-1">Role</dt>
                          <dd className="text-sm text-gray-900">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <i className="fas fa-crown mr-1"></i>
                              Administrator
                            </span>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
              </>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <>
                <div className="px-6 py-6 flex justify-between items-center border-b border-gray-100">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Security Settings</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Manage your password and account security preferences
                    </p>
                  </div>
                  {!isChangingPassword ? (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      aria-label="Change password"
                    >
                      <i className="fas fa-key mr-2"></i>
                      Change Password
                    </button>
                  ) : (
                    <button
                      onClick={handlePasswordCancel}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      aria-label="Cancel password change"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Cancel
                    </button>
                  )}
                </div>
                
                {isChangingPassword ? (
                  <div className="p-6">
                    <form onSubmit={handlePasswordSubmit} className="space-y-6" noValidate>
                      
                      {/* Current Password */}
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password *
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          id="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange('currentPassword')}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                            passwordTouched.currentPassword && !passwordValidation.currentPassword.isValid
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 hover:border-gray-400 focus:border-transparent'
                          }`}
                          aria-required="true"
                          aria-invalid={passwordTouched.currentPassword && !passwordValidation.currentPassword.isValid}
                          aria-describedby={passwordTouched.currentPassword && !passwordValidation.currentPassword.isValid ? "currentPassword-error" : undefined}
                          placeholder="Enter your current password"
                        />
                        {passwordTouched.currentPassword && !passwordValidation.currentPassword.isValid && (
                          <p className="mt-1 text-sm text-red-600 flex items-center" id="currentPassword-error">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {passwordValidation.currentPassword.message}
                          </p>
                        )}
                      </div>
                      
                      {/* New Password */}
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          New Password *
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          id="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange('newPassword')}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                            passwordTouched.newPassword && !passwordValidation.newPassword.isValid
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 hover:border-gray-400 focus:border-transparent'
                          }`}
                          aria-required="true"
                          aria-invalid={passwordTouched.newPassword && !passwordValidation.newPassword.isValid}
                          aria-describedby={passwordTouched.newPassword && !passwordValidation.newPassword.isValid ? "newPassword-error" : "newPassword-help"}
                          placeholder="Enter your new password"
                        />
                        {passwordTouched.newPassword && !passwordValidation.newPassword.isValid ? (
                          <p className="mt-1 text-sm text-red-600 flex items-center" id="newPassword-error">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {passwordValidation.newPassword.message}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-gray-500" id="newPassword-help">
                            Password must be at least 8 characters and include uppercase, lowercase, and numbers
                          </p>
                        )}
                        
                        {/* Password Strength Indicator */}
                        {passwordData.newPassword && (
                          <PasswordStrengthIndicator 
                            password={passwordData.newPassword} 
                            className="mt-2"
                          />
                        )}
                      </div>
                      
                      {/* Confirm Password */}
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password *
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange('confirmPassword')}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                            passwordTouched.confirmPassword && !passwordValidation.confirmPassword.isValid
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 hover:border-gray-400 focus:border-transparent'
                          }`}
                          aria-required="true"
                          aria-invalid={passwordTouched.confirmPassword && !passwordValidation.confirmPassword.isValid}
                          aria-describedby={passwordTouched.confirmPassword && !passwordValidation.confirmPassword.isValid ? "confirmPassword-error" : undefined}
                          placeholder="Confirm your new password"
                        />
                        {passwordTouched.confirmPassword && !passwordValidation.confirmPassword.isValid && (
                          <p className="mt-1 text-sm text-red-600 flex items-center" id="confirmPassword-error">
                            <i className="fas fa-exclamation-circle mr-1"></i>
                            {passwordValidation.confirmPassword.message}
                          </p>
                        )}
                      </div>
                      
                      {/* Form Actions */}
                      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={handlePasswordCancel}
                          className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={passwordChangeLoading || !passwordValidation.isValid}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          aria-busy={passwordChangeLoading}
                        >
                          {passwordChangeLoading ? (
                            <>
                              <LoadingSpinner size="small" className="mr-2" />
                              Updating Password...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-shield-check mr-2"></i>
                              Update Password
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="p-6">
                    <dl className="space-y-6">
                      <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <div>
                          <dt className="text-sm font-medium text-gray-900">Password</dt>
                          <dd className="mt-1 text-sm text-gray-500">
                            Last changed: {user.passwordUpdatedAt ? new Date(user.passwordUpdatedAt).toLocaleDateString() : 'Never'}
                          </dd>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl text-gray-400 mb-1">••••••••••••</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <div>
                          <dt className="text-sm font-medium text-gray-900">Two-Factor Authentication</dt>
                          <dd className="mt-1 text-sm text-gray-500">Add an extra layer of security to your account</dd>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <i className="fas fa-times-circle mr-1"></i>
                            Not Enabled
                          </span>
                          <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                            Enable 2FA
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between py-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-900">Login Activity</dt>
                          <dd className="mt-1 text-sm text-gray-500">Monitor recent sign-ins to your account</dd>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-900">
                            Last login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Unknown'}
                          </div>
                          <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                            View All Activity
                          </button>
                        </div>
                      </div>
                    </dl>
                  </div>
                )}
              </>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="p-6">
                <div className="text-center py-12">
                  <i className="fas fa-cog text-gray-400 text-4xl mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Preferences Coming Soon</h3>
                  <p className="text-gray-500">
                    We're working on adding more customization options for your account.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Profile;
