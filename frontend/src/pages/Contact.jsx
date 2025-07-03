// src/pages/Contact.jsx
import React, { useState, useEffect } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email'
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [animateElements, setAnimateElements] = useState(false);

  // Trigger animations on mount
  useEffect(() => {
    setAnimateElements(true);
  }, []);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (!form.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setForm({ 
        name: '', 
        email: '', 
        phone: '',
        subject: '',
        message: '',
        preferredContact: 'email'
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 2000);
  };

  // Contact information
  const contactInfo = [
    {
      icon: 'fa-envelope',
      title: 'Email Us',
      description: 'Send us an email anytime',
      contact: 'hello@shoemarknet.com',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: 'fa-phone',
      title: 'Call Us',
      description: 'Mon-Fri from 8am to 5pm',
      contact: '+1 (555) 123-4567',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: 'fa-map-marker-alt',
      title: 'Visit Us',
      description: 'Come say hello at our office',
      contact: '123 Shoe Street, Fashion District, NY 10001',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: 'fa-comments',
      title: 'Live Chat',
      description: '24/7 customer support',
      contact: 'Start a conversation',
      color: 'from-orange-500 to-red-500'
    }
  ];

  // FAQ items
  const faqs = [
    {
      question: 'What are your shipping options?',
      answer: 'We offer free standard shipping on orders over $75, express shipping (2-3 days), and overnight shipping options.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We accept returns within 30 days of purchase for unworn items in original packaging. Free return shipping is included.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes! We ship to over 25 countries worldwide. International shipping rates and times vary by location.'
    },
    {
      question: 'How can I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track orders in your account dashboard.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className={`w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
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

            <div className={`flex flex-wrap gap-4 justify-center ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
              <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-6 py-3 text-white">
                <i className="fas fa-clock mr-2"></i>
                Response within 24 hours
              </div>
              <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-6 py-3 text-white">
                <i className="fas fa-shield-alt mr-2"></i>
                Secure & confidential
              </div>
              <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl px-6 py-3 text-white">
                <i className="fas fa-users mr-2"></i>
                Expert support team
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 -mt-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 text-center shadow-2xl hover:scale-105 transition-all duration-500 group cursor-pointer ${
                  animateElements ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${info.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <i className={`fas ${info.icon} text-2xl text-white`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{info.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{info.description}</p>
                <p className="text-gray-900 dark:text-white font-semibold">{info.contact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-10 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Send Us a Message
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Fill out the form below and we'll get back to you within 24 hours
                </p>
              </div>

              {submitted && (
                <div className="bg-green-500/20 backdrop-blur-lg border border-green-300/50 rounded-3xl p-6 mb-8 animate-fade-in">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <i className="fas fa-check-circle text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-200 text-lg">Message Sent Successfully!</h4>
                      <p className="text-green-700 dark:text-green-300">Thank you for reaching out. We'll get back to you soon.</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-900 dark:text-white font-semibold mb-2">
                      <i className="fas fa-user mr-2 text-blue-500"></i>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border ${
                        errors.name ? 'border-red-500/50' : 'border-white/30'
                      } rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-2 text-red-500 text-sm">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-900 dark:text-white font-semibold mb-2">
                      <i className="fas fa-envelope mr-2 text-green-500"></i>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border ${
                        errors.email ? 'border-red-500/50' : 'border-white/30'
                      } rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="mt-2 text-red-500 text-sm">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone and Subject Row */}
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
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      placeholder="(Optional) Your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 dark:text-white font-semibold mb-2">
                      <i className="fas fa-tag mr-2 text-orange-500"></i>
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border ${
                        errors.subject ? 'border-red-500/50' : 'border-white/30'
                      } rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 appearance-none`}
                    >
                      <option value="" className="bg-gray-800">Select a subject</option>
                      <option value="general" className="bg-gray-800">General Inquiry</option>
                      <option value="order" className="bg-gray-800">Order Support</option>
                      <option value="returns" className="bg-gray-800">Returns & Exchanges</option>
                      <option value="technical" className="bg-gray-800">Technical Issue</option>
                      <option value="partnership" className="bg-gray-800">Partnership Opportunity</option>
                      <option value="feedback" className="bg-gray-800">Feedback & Suggestions</option>
                    </select>
                    {errors.subject && (
                      <p className="mt-2 text-red-500 text-sm">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.subject}
                      </p>
                    )}
                  </div>
                </div>

                {/* Preferred Contact Method */}
                <div>
                  <label className="block text-gray-900 dark:text-white font-semibold mb-3">
                    <i className="fas fa-comments mr-2 text-cyan-500"></i>
                    Preferred Contact Method
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { value: 'email', label: 'Email', icon: 'fa-envelope' },
                      { value: 'phone', label: 'Phone', icon: 'fa-phone' },
                      { value: 'either', label: 'Either', icon: 'fa-comments' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="preferredContact"
                          value={option.value}
                          checked={form.preferredContact === option.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border transition-all duration-200 ${
                          form.preferredContact === option.value
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white/20 border-white/30 text-gray-900 dark:text-white hover:bg-white/30'
                        }`}>
                          <i className={`fas ${option.icon}`}></i>
                          <span>{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
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
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white/20 backdrop-blur-lg border ${
                      errors.message ? 'border-red-500/50' : 'border-white/30'
                    } rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none`}
                    placeholder="Tell us how we can help you..."
                  />
                  <div className="flex justify-between mt-2">
                    {errors.message ? (
                      <p className="text-red-500 text-sm">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        {errors.message}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm">Minimum 10 characters</p>
                    )}
                    <p className="text-gray-500 text-sm">{form.message.length}/500</p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-blue-400/50 ${
                    loading
                      ? 'bg-gray-400/50 cursor-not-allowed text-gray-600'
                      : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:scale-105 active:scale-95'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                      Sending Message...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <i className="fas fa-paper-plane mr-3"></i>
                      Send Message
                      <i className="fas fa-arrow-right ml-3"></i>
                    </span>
                  )}
                </button>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  <i className="fas fa-shield-alt mr-1 text-green-500"></i>
                  Your information is secure and will never be shared with third parties
                </p>
              </form>
            </div>

            {/* Office Information & Map */}
            <div className="space-y-8">
              
              {/* Office Info */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  <i className="fas fa-building mr-3 text-blue-500"></i>
                  Visit Our Office
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-map-marker-alt text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Address</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        123 Shoe Street<br />
                        Fashion District<br />
                        New York, NY 10001
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-clock text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Business Hours</h4>
                      <div className="text-gray-600 dark:text-gray-400 space-y-1">
                        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                        <p>Saturday: 10:00 AM - 4:00 PM</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-parking text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Parking</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        Free parking available in our dedicated customer lot
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl">
                <div className="h-64 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-map text-2xl"></i>
                    </div>
                    <h4 className="text-xl font-bold mb-2">Interactive Map</h4>
                    <p className="text-blue-100">Click to open in Google Maps</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  <i className="fas fa-share-alt mr-3 text-purple-500"></i>
                  Follow Us
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { platform: 'Facebook', icon: 'fab fa-facebook', color: 'from-blue-600 to-blue-700' },
                    { platform: 'Instagram', icon: 'fab fa-instagram', color: 'from-pink-500 to-purple-600' },
                    { platform: 'Twitter', icon: 'fab fa-twitter', color: 'from-blue-400 to-blue-500' },
                    { platform: 'LinkedIn', icon: 'fab fa-linkedin', color: 'from-blue-700 to-blue-800' }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href="#"
                      className={`bg-gradient-to-r ${social.color} text-white p-4 rounded-2xl text-center hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <i className={`${social.icon} text-2xl mb-2 block`}></i>
                      <span className="text-sm font-semibold">{social.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Quick answers to common questions about our products and services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-start">
                  <i className="fas fa-question-circle text-blue-500 mr-3 mt-1 flex-shrink-0"></i>
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed pl-8">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Can't find what you're looking for?
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105">
              <i className="fas fa-question mr-2"></i>
              Ask a Question
            </button>
          </div>
        </div>
      </section>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
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
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Contact;
