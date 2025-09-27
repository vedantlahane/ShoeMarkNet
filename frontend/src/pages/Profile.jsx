import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageMeta from '../components/seo/PageMeta';
import { toast } from 'react-toastify';

// Redux actions
import { 
  updateUserProfile, 
  changePassword,
  clearError,
  clearAllErrors,
  clearSuccessFlags
} from '../redux/slices/authSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';
import PasswordStrengthIndicator from '../components/common/PasswordStrengthIndicator';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-lock text-red-600 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your profile</p>
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Profile Header */}
          <div className="bg-white shadow-sm rounded-lg mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
              <div className="flex items-center space-x-6">
                <ProfileAvatar user={user} size="large" />
                <div className="text-white">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-blue-100">{user.email}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
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

          {/* Profile Completeness */}
          <ProfileCompleteness completeness={profileCompleteness} className="mb-6" />
          
          {/* Success Messages */}
          {profileUpdateSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <i className="fas fa-check-circle mr-2"></i>
              <span>Profile updated successfully!</span>
            </div>
          )}

          {passwordChangeSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <i className="fas fa-shield-check mr-2"></i>
              <span>Password changed successfully!</span>
            </div>
          )}

          {/* Main Profile Card */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            
            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => handleTabChange('profile')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'profile'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-current={activeTab === 'profile' ? 'page' : undefined}
                >
                  <i className="fas fa-user mr-2"></i>
                  Profile Information
                </button>
                <button
                  onClick={() => handleTabChange('security')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'security'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-current={activeTab === 'security' ? 'page' : undefined}
                >
                  <i className="fas fa-shield-alt mr-2"></i>
                  Security
                </button>
                <button
                  onClick={() => handleTabChange('preferences')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'preferences'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-current={activeTab === 'preferences' ? 'page' : undefined}
                >
                  <i className="fas fa-cog mr-2"></i>
                  Preferences
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
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      aria-label="Edit profile information"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      aria-label="Cancel editing"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Cancel
                    </button>
                  )}
                </div>
                
                {/* Error Display */}
                {profileErrorMessage && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <i className="fas fa-exclamation-circle text-red-400"></i>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
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
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                              formTouched.name && !validation.name.isValid
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300 hover:border-gray-400 focus:border-transparent'
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
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
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
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                              formTouched.phone && !validation.phone.isValid
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300 hover:border-gray-400 focus:border-transparent'
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
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                              formTouched.address && !validation.address.isValid
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300 hover:border-gray-400 focus:border-transparent'
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
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none ${
                              formTouched.bio && !validation.bio.isValid
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300 hover:border-gray-400 focus:border-transparent'
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
                          className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={profileUpdateLoading || !validation.isValid}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
    </>
  );
};

export default Profile;
