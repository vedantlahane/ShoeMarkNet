import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, loading, error, updateUserProfile, refreshProfile, changePassword } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [activeTab, setActiveTab] = useState('profile');

  // Calculate profile completeness
  const calculateProfileCompleteness = () => {
    const fields = ['name', 'email', 'phone', 'address', 'bio'];
    const filledFields = fields.filter(field => user && user[field]);
    return Math.round((filledFields.length / fields.length) * 100);
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    // Fixed and improved phone validation
    if (formData.phone && !/^\+?[0-9]{10,15}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number (10-15 digits)';
    }
    
    // Added address validation
    if (formData.address && formData.address.length < 5) {
      errors.address = 'Address should be at least 5 characters long';
    }
    
    // Added bio validation
    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio should not exceed 500 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must include uppercase, lowercase, and numbers';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: undefined
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: undefined
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Safely access user ID
      const userId = user && user._id ? user._id : null;
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      await updateUserProfile({
        id: userId,
        userData: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
        }
      });
      
      // Refresh profile data
      refreshProfile();
      
      // Show success notification
      toast.success('Your profile has been updated successfully');
      
      // Exit edit mode
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password form
    if (!validatePasswordForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      // Show success notification
      toast.success('Your password has been changed successfully');
      
      // Reset form and exit password change mode
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPassword(false);
    } catch (err) {
      toast.error(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
      });
    }
    setValidationErrors({});
    setIsEditing(false);
  };

  const handlePasswordCancel = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setValidationErrors({});
    setIsChangingPassword(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Not Authenticated</h2>
        <p className="mt-2">Please log in to view your profile</p>
        <a href="/login" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Go to Login
        </a>
      </div>
    );
  }

  const completeness = calculateProfileCompleteness();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Profile completeness indicator */}
      <div className="mb-6 bg-white shadow overflow-hidden sm:rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Completeness</h3>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              completeness < 50 ? 'bg-red-500' : completeness < 80 ? 'bg-yellow-500' : 'bg-green-500'
            }`} 
            style={{ width: `${completeness}%` }}
          ></div>
        </div>
        <p className="mt-2 text-sm text-gray-600">{completeness}% complete</p>
      </div>
      
      {/* Main profile card */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Tabs for profile sections */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === 'profile' ? 'page' : undefined}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              aria-current={activeTab === 'security' ? 'page' : undefined}
            >
              Security
            </button>
          </nav>
        </div>
        
        {activeTab === 'profile' && (
          <>
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and preferences</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  aria-label="Edit profile information"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
              )}
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-4 my-2" role="alert">
                <span className="block sm:inline">{error.message || 'An error occurred'}</span>
              </div>
            )}
            
            {isEditing ? (
              <div className="border-t border-gray-200">
                <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6" aria-label="Edit profile form">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                          validationErrors.name ? 'border-red-500' : ''
                        }`}
                        aria-required="true"
                        aria-invalid={!!validationErrors.name}
                        aria-describedby={validationErrors.name ? "name-error" : undefined}
                      />
                      {validationErrors.name && (
                        <p className="mt-1 text-sm text-red-600" id="name-error">{validationErrors.name}</p>
                      )}
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-100"
                        aria-describedby="email-description"
                      />
                      <p className="mt-1 text-xs text-gray-500" id="email-description">Email cannot be changed</p>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                          validationErrors.phone ? 'border-red-500' : ''
                        }`}
                        aria-invalid={!!validationErrors.phone}
                        aria-describedby={validationErrors.phone ? "phone-error" : undefined}
                      />
                      {validationErrors.phone && (
                        <p className="mt-1 text-sm text-red-600" id="phone-error">{validationErrors.phone}</p>
                      )}
                    </div>
                    
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        id="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                          validationErrors.address ? 'border-red-500' : ''
                        }`}
                        aria-invalid={!!validationErrors.address}
                        aria-describedby={validationErrors.address ? "address-error" : undefined}
                      />
                      {validationErrors.address && (
                        <p className="mt-1 text-sm text-red-600" id="address-error">{validationErrors.address}</p>
                      )}
                    </div>
                    
                    <div className="col-span-6">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        id="bio"
                        rows="3"
                        value={formData.bio}
                        onChange={handleChange}
                        className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                          validationErrors.bio ? 'border-red-500' : ''
                        }`}
                        aria-invalid={!!validationErrors.bio}
                        aria-describedby={validationErrors.bio ? "bio-error" : undefined}
                      ></textarea>
                      {validationErrors.bio && (
                        <p className="mt-1 text-sm text-red-600" id="bio-error">{validationErrors.bio}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">{formData.bio.length}/500 characters</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="mr-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name || 'Not provided'}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.phone || 'Not provided'}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.address || 'Not provided'}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Bio</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.bio || 'Not provided'}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Member since</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Unknown'}
                    </dd>
                  </div>
                  {user.role === 'admin' && (
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Role</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
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
        
        {activeTab === 'security' && (
          <>
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Security Settings</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your password and account security</p>
              </div>
              {!isChangingPassword ? (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  aria-label="Change password"
                >
                  Change Password
                </button>
              ) : (
                <button
                  onClick={handlePasswordCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  aria-label="Cancel password change"
                >
                  Cancel
                </button>
              )}
            </div>
            
            {isChangingPassword ? (
              <div className="border-t border-gray-200">
                <form onSubmit={handlePasswordSubmit} className="px-4 py-5 sm:p-6" aria-label="Change password form">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                          validationErrors.currentPassword ? 'border-red-500' : ''
                        }`}
                        aria-required="true"
                        aria-invalid={!!validationErrors.currentPassword}
                        aria-describedby={validationErrors.currentPassword ? "currentPassword-error" : undefined}
                      />
                      {validationErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600" id="currentPassword-error">{validationErrors.currentPassword}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                          validationErrors.newPassword ? 'border-red-500' : ''
                        }`}
                        aria-required="true"
                        aria-invalid={!!validationErrors.newPassword}
                        aria-describedby={validationErrors.newPassword ? "newPassword-error" : undefined}
                      />
                      {validationErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600" id="newPassword-error">{validationErrors.newPassword}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters and include uppercase, lowercase, and numbers</p>
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                          validationErrors.confirmPassword ? 'border-red-500' : ''
                        }`}
                        aria-required="true"
                        aria-invalid={!!validationErrors.confirmPassword}
                        aria-describedby={validationErrors.confirmPassword ? "confirmPassword-error" : undefined}
                      />
                      {validationErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600" id="confirmPassword-error">{validationErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={handlePasswordCancel}
                      className="mr-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-busy={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Password</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      ••••••••••••
                      <span className="ml-2 text-xs text-gray-500">Last changed: {user.passwordUpdatedAt ? new Date(user.passwordUpdatedAt).toLocaleDateString() : 'Never'}</span>
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Two-factor authentication</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Not enabled
                      </span>
                      <button className="ml-4 text-sm text-indigo-600 hover:text-indigo-500">
                        Enable
                      </button>
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Login activity</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      Last login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Unknown'}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
