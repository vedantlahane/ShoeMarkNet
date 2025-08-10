import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

// Redux actions (you'll need to create these)
import { 
  submitContactForm, 
  clearContactError 
} from '../redux/slices/contactSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import FileUpload from '../components/common/FileUpload';
import LiveChatWidget from '../components/contact/LiveChatWidget';
import ContactMethodCard from '../components/contact/ContactMethodCard';
import FAQSection from '../components/contact/FAQSection';
import OfficeLocationCard from '../components/contact/OfficeLocationCard';
import ContactFormSuccess from '../components/contact/ContactFormSuccess';

// Hooks
import useLocalStorage from '../hooks/useLocalStorage';
import useDebounce from '../hooks/useDebounce';

// Utils
import { trackEvent } from '../utils/analytics';
import { validateEmail, validatePhone } from '../utils/validation';

// Constants
const CONTACT_SUBJECTS = [
  { value: 'general', label: 'General Inquiry', icon: 'fa-question', priority: 'medium' },
  { value: 'order', label: 'Order Support', icon: 'fa-shopping-cart', priority: 'high' },
  { value: 'returns', label: 'Returns & Exchanges', icon: 'fa-undo', priority: 'high' },
  { value: 'technical', label: 'Technical Issue', icon: 'fa-bug', priority: 'high' },
  { value: 'partnership', label: 'Partnership Opportunity', icon: 'fa-handshake', priority: 'medium' },
  { value: 'feedback', label: 'Feedback & Suggestions', icon: 'fa-comment-alt', priority: 'low' },
  { value: 'press', label: 'Press & Media', icon: 'fa-newspaper', priority: 'medium' },
  { value: 'careers', label: 'Careers', icon: 'fa-briefcase', priority: 'medium' }
];

const CONTACT_METHODS = [
  {
    id: 'email',
    icon: 'fa-envelope',
    title: 'Email Support',
    description: 'Get detailed responses to your questions',
    contact: 'support@shoemarknet.com',
    responseTime: 'Usually within 2-4 hours',
    color: 'from-blue-500 to-cyan-500',
    available: true,
    features: ['24/7 availability', 'Detailed responses', 'File attachments']
  },
  {
    id: 'phone',
    icon: 'fa-phone',
    title: 'Phone Support',
    description: 'Speak directly with our support team',
    contact: '+1 (555) 123-4567',
    responseTime: 'Mon-Fri, 8AM-6PM EST',
    color: 'from-green-500 to-emerald-500',
    available: true,
    features: ['Immediate assistance', 'Voice support', 'Screen sharing available']
  },
  {
    id: 'chat',
    icon: 'fa-comments',
    title: 'Live Chat',
    description: 'Instant messaging with our team',
    contact: 'Start a conversation',
    responseTime: 'Average response: 30 seconds',
    color: 'from-purple-500 to-pink-500',
    available: true,
    features: ['Real-time chat', 'File sharing', 'Co-browsing support']
  },
  {
    id: 'office',
    icon: 'fa-map-marker-alt',
    title: 'Visit Our Office',
    description: 'Come meet us in person',
    contact: '123 Shoe Street, Fashion District, NY 10001',
    responseTime: 'Mon-Fri, 9AM-5PM EST',
    color: 'from-orange-500 to-red-500',
    available: true,
    features: ['Face-to-face support', 'Product demonstrations', 'Free parking']
  }
];

const FAQ_ITEMS = [
  {
    id: 'shipping',
    question: 'What are your shipping options and costs?',
    answer: 'We offer multiple shipping options: Free standard shipping (5-7 business days) on orders over $75, Express shipping (2-3 business days) for $9.99, and Overnight shipping for $19.99. International shipping is available to 25+ countries with rates calculated at checkout.',
    category: 'shipping',
    helpful: 245,
    views: 1520
  },
  {
    id: 'returns',
    question: 'What is your return and exchange policy?',
    answer: 'We accept returns within 30 days of purchase for unworn items in original packaging. Returns are free for defective items or our error. For other returns, a $5.99 return shipping fee applies. Exchanges for different sizes are always free.',
    category: 'returns',
    helpful: 189,
    views: 892
  },
  {
    id: 'international',
    question: 'Do you ship internationally?',
    answer: 'Yes! We ship to over 25 countries worldwide. Shipping costs and delivery times vary by location. International customers are responsible for any customs duties or taxes. All international orders are tracked and insured.',
    category: 'shipping',
    helpful: 156,
    views: 634
  },
  {
    id: 'tracking',
    question: 'How can I track my order?',
    answer: 'Once your order ships, you\'ll receive a tracking number via email and SMS. You can track your order in real-time through your account dashboard, our mobile app, or directly on our shipping partner\'s website.',
    category: 'orders',
    helpful: 298,
    views: 1245
  },
  {
    id: 'sizing',
    question: 'How do I find the right size?',
    answer: 'We provide detailed size guides for each product, including length, width, and fit recommendations. Our virtual sizing tool uses your measurements to suggest the best size. If you\'re unsure, our customer service team can provide personalized sizing advice.',
    category: 'sizing',
    helpful: 203,
    views: 876
  },
  {
    id: 'warranty',
    question: 'What warranty do you offer on products?',
    answer: 'All our products come with a 90-day quality guarantee. Manufacturing defects are covered for up to 1 year. We also offer extended warranty options for premium products. Contact us if you experience any issues with your purchase.',
    category: 'warranty',
    helpful: 134,
    views: 445
  }
];

const Contact = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Redux state
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { 
    loading: contactLoading, 
    error: contactError,
    success: contactSuccess,
    lastSubmissionTime
  } = useSelector((state) => state.contact || {});

  // Form state
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: searchParams.get('subject') || '',
    message: searchParams.get('message') || '',
    preferredContact: 'email',
    priority: 'medium',
    orderNumber: searchParams.get('order') || '',
    category: searchParams.get('category') || 'general'
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [animateElements, setAnimateElements] = useState(false);
  const [activeContactMethod, setActiveContactMethod] = useState('email');
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [formStep, setFormStep] = useState(1);
  const [submitAttempts, setSubmitAttempts] = useLocalStorage('contactSubmitAttempts', 0);

  // Debounced form values for real-time validation
  const debouncedEmail = useDebounce(form.email, 300);
  const debouncedPhone = useDebounce(form.phone, 300);

  // Initialize animations and analytics
  useEffect(() => {
    setTimeout(() => setAnimateElements(true), 100);
    
    // Track page view with context
    trackEvent('page_view', {
      page_title: 'Contact',
      page_location: window.location.href,
      referrer: document.referrer,
      contact_reason: searchParams.get('reason'),
      user_authenticated: isAuthenticated
    });
  }, [searchParams, isAuthenticated]);

  // Auto-fill user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [isAuthenticated, user]);

  // Handle success state
  useEffect(() => {
    if (contactSuccess && lastSubmissionTime) {
      const timeDiff = Date.now() - lastSubmissionTime;
      if (timeDiff < 10000) { // Show success for 10 seconds
        setForm({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          subject: '',
          message: '',
          preferredContact: 'email',
          priority: 'medium',
          orderNumber: '',
          category: 'general'
        });
        setErrors({});
        setTouched({});
        setAttachedFiles([]);
        setFormStep(1);
      }
    }
  }, [contactSuccess, lastSubmissionTime, user]);

  // Real-time validation
  const validation = useMemo(() => {
    const newErrors = {};
    
    if (touched.name && !form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (touched.name && form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (touched.email) {
      const emailValidation = validateEmail(form.email);
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.message;
      }
    }
    
    if (touched.phone && form.phone) {
      const phoneValidation = validatePhone(form.phone);
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.message;
      }
    }
    
    if (touched.subject && !form.subject) {
      newErrors.subject = 'Please select a subject';
    }
    
    if (touched.message && !form.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (touched.message && form.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (touched.message && form.message.trim().length > 2000) {
      newErrors.message = 'Message must be less than 2000 characters';
    }
    
    return {
      errors: newErrors,
      isValid: Object.keys(newErrors).length === 0 && 
               form.name.trim() && 
               form.email.trim() && 
               form.subject && 
               form.message.trim().length >= 10
    };
  }, [form, touched]);

  // Enhanced handlers
  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Clear server errors
    if (contactError) {
      dispatch(clearContactError());
    }
    
    // Track form interaction
    trackEvent('contact_form_interaction', {
      field,
      form_step: formStep,
      has_content: !!value
    });
  }, [contactError, dispatch, formStep]);

  const handleSubjectChange = useCallback((subject) => {
    setForm(prev => ({ ...prev, subject }));
    setTouched(prev => ({ ...prev, subject: true }));
    
    // Auto-set priority based on subject
    const subjectData = CONTACT_SUBJECTS.find(s => s.value === subject);
    if (subjectData) {
      setForm(prev => ({ ...prev, priority: subjectData.priority }));
    }
    
    trackEvent('contact_subject_selected', {
      subject,
      priority: subjectData?.priority
    });
  }, []);

  const handleFileAttachment = useCallback((files) => {
    setAttachedFiles(files);
    
    trackEvent('contact_file_attached', {
      file_count: files.length,
      total_size: files.reduce((sum, file) => sum + file.size, 0)
    });
  }, []);

  const validateStep = useCallback((step) => {
    switch (step) {
      case 1:
        return form.name.trim() && validation.errors.name === undefined &&
               form.email.trim() && validation.errors.email === undefined;
      case 2:
        return form.subject && form.message.trim().length >= 10 && 
               validation.errors.message === undefined;
      default:
        return true;
    }
  }, [form, validation.errors]);

  const handleNextStep = useCallback(() => {
    if (validateStep(formStep)) {
      setFormStep(prev => prev + 1);
      
      trackEvent('contact_form_step_completed', {
        step: formStep,
        next_step: formStep + 1
      });
    } else {
      // Mark all current step fields as touched
      if (formStep === 1) {
        setTouched(prev => ({ ...prev, name: true, email: true, phone: true }));
      } else if (formStep === 2) {
        setTouched(prev => ({ ...prev, subject: true, message: true }));
      }
      
      toast.warning('Please complete all required fields before continuing');
    }
  }, [formStep, validateStep]);

  const handlePrevStep = useCallback(() => {
    setFormStep(prev => Math.max(1, prev - 1));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      subject: true,
      message: true
    });
    
    if (!validation.isValid) {
      toast.error('Please fix all validation errors before submitting');
      
      trackEvent('contact_form_validation_failed', {
        errors: Object.keys(validation.errors),
        form_data: {
          has_name: !!form.name,
          has_email: !!form.email,
          has_subject: !!form.subject,
          message_length: form.message.length
        }
      });
      return;
    }
    
    // Rate limiting check
    setSubmitAttempts(prev => {
      const newCount = prev + 1;
      if (newCount > 5) {
        toast.error('Too many submission attempts. Please wait before trying again.');
        return newCount;
      }
      return newCount;
    });
    
    if (submitAttempts > 5) {
      return;
    }
    
    try {
      const submissionData = {
        ...form,
        attachments: attachedFiles,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
        formVersion: '2.0'
      };
      
      await dispatch(submitContactForm(submissionData)).unwrap();
      
      // Track successful submission
      trackEvent('contact_form_submitted', {
        subject: form.subject,
        priority: form.priority,
        preferred_contact: form.preferredContact,
        has_attachments: attachedFiles.length > 0,
        message_length: form.message.length,
        user_authenticated: isAuthenticated
      });
      
    } catch (error) {
      console.error('Contact form submission failed:', error);
      
      trackEvent('contact_form_submission_failed', {
        error_message: error.message,
        form_data: {
          subject: form.subject,
          message_length: form.message.length
        }
      });
    }
  }, [validation, form, attachedFiles, submitAttempts, setSubmitAttempts, dispatch, isAuthenticated]);

  const handleContactMethodSelect = useCallback((methodId) => {
    setActiveContactMethod(methodId);
    
    trackEvent('contact_method_selected', {
      method: methodId,
      current_form_step: formStep
    });
    
    if (methodId === 'chat') {
      setShowLiveChat(true);
    }
  }, [formStep]);

  const handleLiveChatToggle = useCallback(() => {
    setShowLiveChat(prev => {
      const newState = !prev;
      
      trackEvent('live_chat_toggled', {
        action: newState ? 'opened' : 'closed',
        current_page: 'contact'
      });
      
      return newState;
    });
  }, []);

  // SEO meta data
  const metaTitle = useMemo(() => {
    const reason = searchParams.get('reason');
    if (reason) {
      return `Contact Us - ${reason} | ShoeMarkNet Support`;
    }
    return 'Contact Us | ShoeMarkNet Customer Support';
  }, [searchParams]);

  const metaDescription = useMemo(() => {
    return 'Get in touch with ShoeMarkNet customer support. Multiple ways to reach us including live chat, email, phone support. Fast response times and expert assistance.';
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://shoemarknet.com/contact${location.search}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://shoemarknet.com/contact${location.search}`} />
        
        {/* Contact Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "ShoeMarkNet Contact",
            "description": metaDescription,
            "url": `https://shoemarknet.com/contact${location.search}`,
            "mainEntity": {
              "@type": "Organization",
              "name": "ShoeMarkNet",
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+1-555-123-4567",
                  "contactType": "customer service",
                  "email": "support@shoemarknet.com",
                  "availableLanguage": ["en"],
                  "hoursAvailable": {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    "opens": "08:00",
                    "closes": "18:00"
                  }
                }
              ],
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 Shoe Street",
                "addressLocality": "New York",
                "addressRegion": "NY",
                "postalCode": "10001",
                "addressCountry": "US"
              }
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        {/* Enhanced Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-shimmer"></div>
          </div>
          
          {/* Enhanced Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${4 + Math.random() * 6}s`
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <div className={`w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl ${animateElements ? 'animate-bounce-in' : 'opacity-0'}`}>
                <i className="fas fa-headset text-3xl text-white"></i>
              </div>

              <h1 className={`text-5xl lg:text-7xl font-bold text-white mb-6 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                Get in
                <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                  Touch
                </span>
              </h1>

              <p className={`text-xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
                Have a question, feedback, or need assistance? We're here to help! 
                Our dedicated team is ready to provide you with exceptional support and personalized service.
              </p>

              {/* Enhanced Feature Badges */}
              <div className={`flex flex-wrap gap-4 justify-center ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
                {[
                  { icon: 'fa-clock', text: 'Response within 2 hours', color: 'from-blue-500 to-cyan-500' },
                  { icon: 'fa-shield-alt', text: 'Secure & confidential', color: 'from-green-500 to-emerald-500' },
                  { icon: 'fa-users', text: 'Expert support team', color: 'from-purple-500 to-pink-500' },
                  { icon: 'fa-comments', text: 'Multiple contact options', color: 'from-orange-500 to-red-500' }
                ].map((badge, index) => (
                  <div key={index} className={`bg-gradient-to-r ${badge.color}/20 backdrop-blur-lg border border-white/30 rounded-2xl px-6 py-3 text-white flex items-center space-x-2`}>
                    <i className={`fas ${badge.icon}`}></i>
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Contact Methods */}
        <section className="py-16 -mt-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CONTACT_METHODS.map((method, index) => (
                <ContactMethodCard
                  key={method.id}
                  method={method}
                  isActive={activeContactMethod === method.id}
                  onClick={() => handleContactMethodSelect(method.id)}
                  animateElements={animateElements}
                  animationDelay={0.8 + index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Enhanced Contact Form */}
              <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 lg:p-10 shadow-2xl ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '1.2s' }}>
                
                {/* Form Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    <i className="fas fa-envelope mr-3"></i>
                    Send Us a Message
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Fill out the form below and we'll get back to you within 2-4 hours
                  </p>
                  
                  {/* Form Progress */}
                  <div className="flex items-center justify-center mt-6 space-x-4">
                    {[1, 2].map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                          formStep >= step 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}>
                          {formStep > step ? (
                            <i className="fas fa-check"></i>
                          ) : (
                            step
                          )}
                        </div>
                        {step < 2 && (
                          <div className={`w-12 h-1 mx-2 rounded transition-all duration-300 ${
                            formStep > step ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Success State */}
                {contactSuccess && (
                  <ContactFormSuccess 
                    submissionData={form}
                    onNewMessage={() => {
                      setForm(prev => ({ ...prev, message: '', subject: '' }));
                      setFormStep(1);
                    }}
                  />
                )}

                {/* Error State */}
                {contactError && (
                  <ErrorMessage
                    message={contactError.message || 'Failed to send message'}
                    onRetry={() => dispatch(clearContactError())}
                    className="mb-6"
                  />
                )}

                {/* Contact Form */}
                {!contactSuccess && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Step 1: Personal Information */}
                    {formStep === 1 && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Name Field */}
                          <div>
                            <label className="block text-gray-900 dark:text-white font-semibold mb-2">
                              <i className="fas fa-user mr-2 text-blue-500"></i>
                              Full Name *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={form.name}
                              onChange={handleInputChange('name')}
                              className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                                validation.errors.name ? 'border-red-500/50' : 'border-white/30'
                              }`}
                              placeholder="Enter your full name"
                              aria-required="true"
                              aria-invalid={!!validation.errors.name}
                            />
                            {validation.errors.name && (
                              <p className="mt-2 text-red-500 text-sm flex items-center">
                                <i className="fas fa-exclamation-circle mr-1"></i>
                                {validation.errors.name}
                              </p>
                            )}
                          </div>

                          {/* Email Field */}
                          <div>
                            <label className="block text-gray-900 dark:text-white font-semibold mb-2">
                              <i className="fas fa-envelope mr-2 text-green-500"></i>
                              Email Address *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleInputChange('email')}
                              className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                                validation.errors.email ? 'border-red-500/50' : 'border-white/30'
                              }`}
                              placeholder="Enter your email address"
                              aria-required="true"
                              aria-invalid={!!validation.errors.email}
                            />
                            {validation.errors.email && (
                              <p className="mt-2 text-red-500 text-sm flex items-center">
                                <i className="fas fa-exclamation-circle mr-1"></i>
                                {validation.errors.email}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Phone and Order Number */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-gray-900 dark:text-white font-semibold mb-2">
                              <i className="fas fa-phone mr-2 text-purple-500"></i>
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={form.phone}
                              onChange={handleInputChange('phone')}
                              className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ${
                                validation.errors.phone ? 'border-red-500/50' : 'border-white/30'
                              }`}
                              placeholder="(Optional) Your phone number"
                            />
                            {validation.errors.phone && (
                              <p className="mt-2 text-red-500 text-sm flex items-center">
                                <i className="fas fa-exclamation-circle mr-1"></i>
                                {validation.errors.phone}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-gray-900 dark:text-white font-semibold mb-2">
                              <i className="fas fa-shopping-cart mr-2 text-orange-500"></i>
                              Order Number
                            </label>
                            <input
                              type="text"
                              name="orderNumber"
                              value={form.orderNumber}
                              onChange={handleInputChange('orderNumber')}
                              className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                              placeholder="(Optional) Order number"
                            />
                          </div>
                        </div>

                        {/* Preferred Contact Method */}
                        <div>
                          <label className="block text-gray-900 dark:text-white font-semibold mb-3">
                            <i className="fas fa-comments mr-2 text-cyan-500"></i>
                            Preferred Contact Method
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { value: 'email', label: 'Email', icon: 'fa-envelope' },
                              { value: 'phone', label: 'Phone', icon: 'fa-phone' },
                              { value: 'either', label: 'Either', icon: 'fa-comments' }
                            ].map((option) => (
                              <label key={option.value} className="cursor-pointer">
                                <input
                                  type="radio"
                                  name="preferredContact"
                                  value={option.value}
                                  checked={form.preferredContact === option.value}
                                  onChange={handleInputChange('preferredContact')}
                                  className="sr-only"
                                />
                                <div className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl border transition-all duration-200 ${
                                  form.preferredContact === option.value
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                    : 'bg-white/20 border-white/30 text-gray-900 dark:text-white hover:bg-white/30'
                                }`}>
                                  <i className={`fas ${option.icon}`}></i>
                                  <span className="font-medium">{option.label}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Step 1 Navigation */}
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105"
                          >
                            Continue
                            <i className="fas fa-arrow-right ml-2"></i>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Message Details */}
                    {formStep === 2 && (
                      <div className="space-y-6 animate-fade-in">
                        
                        {/* Subject Selection */}
                        <div>
                          <label className="block text-gray-900 dark:text-white font-semibold mb-3">
                            <i className="fas fa-tag mr-2 text-orange-500"></i>
                            What can we help you with? *
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {CONTACT_SUBJECTS.map((subject) => (
                              <button
                                key={subject.value}
                                type="button"
                                onClick={() => handleSubjectChange(subject.value)}
                                className={`flex items-center space-x-3 p-4 rounded-2xl border text-left transition-all duration-200 ${
                                  form.subject === subject.value
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                    : 'bg-white/20 border-white/30 text-gray-900 dark:text-white hover:bg-white/30'
                                }`}
                              >
                                <i className={`fas ${subject.icon} ${form.subject === subject.value ? 'text-white' : 'text-blue-500'}`}></i>
                                <div>
                                  <div className="font-medium">{subject.label}</div>
                                  <div className={`text-xs ${form.subject === subject.value ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {subject.priority} priority
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                          {validation.errors.subject && (
                            <p className="mt-2 text-red-500 text-sm flex items-center">
                              <i className="fas fa-exclamation-circle mr-1"></i>
                              {validation.errors.subject}
                            </p>
                          )}
                        </div>

                        {/* Message */}
                        <div>
                          <label className="block text-gray-900 dark:text-white font-semibold mb-2">
                            <i className="fas fa-comment-alt mr-2 text-pink-500"></i>
                            Your Message *
                          </label>
                          <textarea
                            name="message"
                            rows="6"
                            value={form.message}
                            onChange={handleInputChange('message')}
                            className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none ${
                              validation.errors.message ? 'border-red-500/50' : 'border-white/30'
                            }`}
                            placeholder="Tell us how we can help you..."
                            aria-required="true"
                            aria-invalid={!!validation.errors.message}
                          />
                          <div className="flex justify-between mt-2">
                            {validation.errors.message ? (
                              <p className="text-red-500 text-sm flex items-center">
                                <i className="fas fa-exclamation-circle mr-1"></i>
                                {validation.errors.message}
                              </p>
                            ) : (
                              <p className="text-gray-500 text-sm">Minimum 10 characters</p>
                            )}
                            <p className={`text-sm ${form.message.length > 1800 ? 'text-orange-500' : 'text-gray-500'}`}>
                              {form.message.length}/2000
                            </p>
                          </div>
                        </div>

                        {/* File Upload */}
                        <div>
                          <label className="block text-gray-900 dark:text-white font-semibold mb-2">
                            <i className="fas fa-paperclip mr-2 text-green-500"></i>
                            Attachments (Optional)
                          </label>
                          <FileUpload
                            onFilesSelected={handleFileAttachment}
                            maxFiles={3}
                            maxSizePerFile={5 * 1024 * 1024} // 5MB
                            acceptedTypes={['image/*', '.pdf', '.doc', '.docx', '.txt']}
                            className="w-full"
                          />
                          <p className="mt-2 text-xs text-gray-500">
                            Max 3 files, 5MB each. Supported: images, PDF, DOC, TXT
                          </p>
                        </div>

                        {/* Step 2 Navigation */}
                        <div className="flex justify-between">
                          <button
                            type="button"
                            onClick={handlePrevStep}
                            className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-2xl hover:bg-white/30 transition-all duration-200"
                          >
                            <i className="fas fa-arrow-left mr-2"></i>
                            Back
                          </button>
                          
                          <button
                            type="submit"
                            disabled={contactLoading || !validation.isValid}
                            className={`font-bold py-3 px-8 rounded-2xl transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-blue-400/50 ${
                              contactLoading || !validation.isValid
                                ? 'bg-gray-400/50 cursor-not-allowed text-gray-600'
                                : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:scale-105 active:scale-95'
                            }`}
                          >
                            {contactLoading ? (
                              <span className="flex items-center">
                                <LoadingSpinner size="small" className="mr-3" />
                                Sending Message...
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <i className="fas fa-paper-plane mr-3"></i>
                                Send Message
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Security Notice */}
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-white/20">
                      <i className="fas fa-shield-alt mr-1 text-green-500"></i>
                      Your information is secure and will never be shared with third parties
                    </p>
                  </form>
                )}
              </div>

              {/* Enhanced Sidebar */}
              <div className="space-y-8">
                
                {/* Office Information */}
                <OfficeLocationCard 
                  animateElements={animateElements}
                  animationDelay="1.4s"
                />

                {/* Live Chat Widget */}
                <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '1.6s' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      <i className="fas fa-comments mr-2 text-purple-500"></i>
                      Need Immediate Help?
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">Online</span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Chat with our support team for instant assistance. Average response time: 30 seconds.
                  </p>
                  <button
                    onClick={handleLiveChatToggle}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105"
                  >
                    <i className="fas fa-comments mr-2"></i>
                    Start Live Chat
                  </button>
                </div>

                {/* Quick Links */}
                <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '1.8s' }}>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    <i className="fas fa-link mr-2 text-blue-500"></i>
                    Quick Links
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Track Your Order', icon: 'fa-package', href: '/orders' },
                      { label: 'Return & Exchanges', icon: 'fa-undo', href: '/returns' },
                      { label: 'Size Guide', icon: 'fa-ruler', href: '/size-guide' },
                      { label: 'Shipping Info', icon: 'fa-truck', href: '/shipping' },
                      { label: 'Help Center', icon: 'fa-question-circle', href: '/help' }
                    ].map((link, index) => (
                      <a
                        key={index}
                        href={link.href}
                        className="flex items-center space-x-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-200 group"
                      >
                        <i className={`fas ${link.icon} text-blue-500 group-hover:scale-110 transition-transform duration-200`}></i>
                        <span className="text-gray-900 dark:text-white font-medium">{link.label}</span>
                        <i className="fas fa-arrow-right text-gray-400 ml-auto group-hover:translate-x-1 transition-transform duration-200"></i>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Social Media */}
                <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-6 shadow-2xl ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '2s' }}>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                    <i className="fas fa-share-alt mr-2 text-purple-500"></i>
                    Follow Us
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { platform: 'Facebook', icon: 'fab fa-facebook', color: 'from-blue-600 to-blue-700', followers: '15.2K' },
                      { platform: 'Instagram', icon: 'fab fa-instagram', color: 'from-pink-500 to-purple-600', followers: '8.9K' },
                      { platform: 'Twitter', icon: 'fab fa-twitter', color: 'from-blue-400 to-blue-500', followers: '12.1K' },
                      { platform: 'LinkedIn', icon: 'fab fa-linkedin', color: 'from-blue-700 to-blue-800', followers: '3.4K' }
                    ].map((social, index) => (
                      <a
                        key={index}
                        href="#"
                        className={`bg-gradient-to-r ${social.color} text-white p-4 rounded-2xl text-center hover:scale-110 transition-transform duration-300 shadow-lg relative overflow-hidden group`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <i className={`${social.icon} text-2xl mb-2 block relative z-10`}></i>
                        <span className="text-sm font-semibold block relative z-10">{social.platform}</span>
                        <span className="text-xs opacity-80 block relative z-10">{social.followers}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced FAQ Section */}
        <FAQSection 
          faqs={FAQ_ITEMS}
          animateElements={animateElements}
          className="py-16 bg-white/5"
        />

        {/* Live Chat Widget */}
        {showLiveChat && (
          <LiveChatWidget
            onClose={handleLiveChatToggle}
            userInfo={{
              name: form.name,
              email: form.email,
              isAuthenticated
            }}
          />
        )}

        {/* Enhanced Custom Styles */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg); 
              opacity: 0.7;
            }
            33% { 
              transform: translateY(-15px) rotate(2deg); 
              opacity: 1;
            }
            66% { 
              transform: translateY(-8px) rotate(-2deg); 
              opacity: 0.8;
            }
          }
          
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes bounce-in {
            0% {
              opacity: 0;
              transform: scale(0.3);
            }
            50% {
              opacity: 1;
              transform: scale(1.1);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%) skewX(-12deg); }
            100% { transform: translateX(200%) skewX(-12deg); }
          }
          
          .animate-float {
            animation: float 8s ease-in-out infinite;
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
            opacity: 0;
          }
          
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
          
          .animate-bounce-in {
            animation: bounce-in 1s ease-out forwards;
            opacity: 0;
          }
          
          .animate-shimmer {
            animation: shimmer 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    </>
  );
};

export default Contact;
