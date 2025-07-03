// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
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
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  
  const { name, email, phone, password, confirmPassword, source } = formData;
  const { register, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState('');

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  // Form validation
  useEffect(() => {
    const isValidEmail = email.includes('@') && email.includes('.');
    const isValidPassword = password.length >= 6;
    const isValidName = name.trim().length >= 2;
    const isValidPhone = phone.length >= 10;
    const passwordsMatch = password === confirmPassword;
    
    setIsFormValid(
      isValidEmail && 
      isValidPassword && 
      isValidName && 
      isValidPhone && 
      passwordsMatch && 
      acceptTerms
    );
  }, [name, email, phone, password, confirmPassword, acceptTerms]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    return () => {
      clearError();
    };
  }, [isAuthenticated, navigate, clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
      setPasswordError('');
    }
    
    if (name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    const userData = { name, email, phone, password, source };
    await register(userData);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'from-red-500 to-red-600';
    if (passwordStrength <= 2) return 'from-orange-500 to-yellow-500';
    if (passwordStrength <= 3) return 'from-yellow-500 to-green-500';
    if (passwordStrength <= 4) return 'from-green-500 to-emerald-500';
    return 'from-emerald-500 to-green-600';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    if (passwordStrength <= 4) return 'Strong';
    return 'Excellent';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0">
        {/* Animated Background Shapes */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
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
          <div className="w-full max-w-lg">
            
            {/* Header Section */}
            <div className="text-center mb-8">
              {/* Logo */}
              <div className="inline-flex items-center space-x-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl">
                  S
                </div>
                <span className="text-3xl font-bold text-white">ShoeMarkNet</span>
              </div>

              {/* Welcome Badge */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-3 mb-6 inline-block">
                <div className="flex items-center space-x-2 text-white">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <i className="fas fa-user-plus text-green-400"></i>
                  <span className="text-sm font-medium">Join Our Community</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-blue-100 text-lg">
                <i className="fas fa-gift mr-2"></i>
                Join thousands of happy customers and get exclusive deals
              </p>
            </div>

            {/* Main Registration Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 mb-6">
              
              {/* Enhanced Error Display */}
              {error && (
                <div className="bg-red-500/20 backdrop-blur-lg border border-red-300/50 text-red-100 px-6 py-4 rounded-2xl mb-6 animate-shake">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <i className="fas fa-exclamation-triangle text-white text-sm"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Registration Failed</p>
                      <p className="text-xs text-red-200">{error.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {passwordError && (
                <div className="bg-red-500/20 backdrop-blur-lg border border-red-300/50 text-red-100 px-6 py-4 rounded-2xl mb-6 animate-shake">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <i className="fas fa-exclamation-triangle text-white text-sm"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Password Error</p>
                      <p className="text-xs text-red-200">{passwordError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name Field */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-white font-semibold text-sm">
                    <i className="fas fa-user mr-2 text-blue-300"></i>
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-4 pl-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={handleChange}
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <i className="fas fa-user text-blue-300"></i>
                    </div>
                    {name.length >= 2 && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <i className="fas fa-check-circle text-green-400"></i>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-white font-semibold text-sm">
                    <i className="fas fa-envelope mr-2 text-purple-300"></i>
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-4 pl-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleChange}
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <i className="fas fa-envelope text-purple-300"></i>
                    </div>
                    {email.includes('@') && email.includes('.') && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <i className="fas fa-check-circle text-green-400"></i>
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-white font-semibold text-sm">
                    <i className="fas fa-phone mr-2 text-green-300"></i>
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-4 pl-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={handleChange}
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <i className="fas fa-phone text-green-300"></i>
                    </div>
                    {phone.length >= 10 && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <i className="fas fa-check-circle text-green-400"></i>
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-white font-semibold text-sm">
                    <i className="fas fa-lock mr-2 text-yellow-300"></i>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      className="w-full px-4 py-4 pl-12 pr-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={handleChange}
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <i className="fas fa-lock text-yellow-300"></i>
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-blue-200">
                        <span>Password Strength:</span>
                        <span className="font-semibold">{getPasswordStrengthText()}</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${getPasswordStrengthColor()} transition-all duration-300`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-blue-200">
                        <span className={password.length >= 8 ? 'text-green-400' : ''}>
                          <i className={`fas ${password.length >= 8 ? 'fa-check' : 'fa-times'} mr-1`}></i>
                          8+ characters
                        </span>
                        <span className={/[A-Z]/.test(password) ? 'text-green-400' : ''}>
                          <i className={`fas ${/[A-Z]/.test(password) ? 'fa-check' : 'fa-times'} mr-1`}></i>
                          Uppercase
                        </span>
                        <span className={/[0-9]/.test(password) ? 'text-green-400' : ''}>
                          <i className={`fas ${/[0-9]/.test(password) ? 'fa-check' : 'fa-times'} mr-1`}></i>
                          Number
                        </span>
                        <span className={/[^A-Za-z0-9]/.test(password) ? 'text-green-400' : ''}>
                          <i className={`fas ${/[^A-Za-z0-9]/.test(password) ? 'fa-check' : 'fa-times'} mr-1`}></i>
                          Symbol
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-white font-semibold text-sm">
                    <i className="fas fa-shield-alt mr-2 text-pink-300"></i>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      className="w-full px-4 py-4 pl-12 pr-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <i className="fas fa-shield-alt text-pink-300"></i>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors duration-200"
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <div className={`flex items-center text-xs ${password === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                      <i className={`fas ${password === confirmPassword ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                      {password === confirmPassword ? 'Passwords match!' : 'Passwords do not match'}
                    </div>
                  )}
                </div>

                {/* Source Selection */}
                <div className="space-y-2">
                  <label htmlFor="source" className="block text-white font-semibold text-sm">
                    <i className="fas fa-question-circle mr-2 text-cyan-300"></i>
                    How did you hear about us?
                  </label>
                  <div className="relative">
                    <select
                      id="source"
                      name="source"
                      className="w-full px-4 py-4 pl-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                      value={source}
                      onChange={handleChange}
                    >
                      <option value="direct" className="bg-gray-800">Direct Visit</option>
                      <option value="google" className="bg-gray-800">Google Search</option>
                      <option value="facebook" className="bg-gray-800">Facebook</option>
                      <option value="instagram" className="bg-gray-800">Instagram</option>
                      <option value="referral" className="bg-gray-800">Friend Referral</option>
                      <option value="other" className="bg-gray-800">Other</option>
                    </select>
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <i className="fas fa-question-circle text-cyan-300"></i>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3">
                  <div className="relative mt-1">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="sr-only"
                    />
                    <div 
                      onClick={() => setAcceptTerms(!acceptTerms)}
                      className={`w-6 h-6 rounded-lg border-2 border-white/30 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                        acceptTerms ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-400' : 'bg-white/10'
                      }`}
                    >
                      {acceptTerms && <i className="fas fa-check text-white text-sm"></i>}
                    </div>
                  </div>
                  <label htmlFor="acceptTerms" className="text-blue-100 text-sm leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-300 hover:text-white underline">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-blue-300 hover:text-white underline">
                      Privacy Policy
                    </Link>
                  </label>
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
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <i className="fas fa-user-plus"></i>
                      <span>Create Account</span>
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Social Registration Options */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-6">
              <div className="text-center mb-4">
                <span className="text-blue-100 text-sm">Or sign up with</span>
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

            {/* Sign In Link */}
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 inline-block">
                <span className="text-blue-100 text-sm">Already have an account? </span>
                <Link 
                  to="/login" 
                  className="text-white font-semibold hover:text-blue-300 transition-colors duration-200 underline"
                >
                  <i className="fas fa-sign-in-alt mr-1"></i>
                  Sign In
                </Link>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="text-center mt-8">
              <div className="grid grid-cols-3 gap-4 text-blue-200 text-xs">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl flex items-center justify-center">
                    <i className="fas fa-gift text-yellow-400"></i>
                  </div>
                  <span>Exclusive Deals</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl flex items-center justify-center">
                    <i className="fas fa-shipping-fast text-green-400"></i>
                  </div>
                  <span>Free Shipping</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl flex items-center justify-center">
                    <i className="fas fa-crown text-purple-400"></i>
                  </div>
                  <span>VIP Access</span>
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
        
        select option {
          background-color: #1f2937;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Register;
