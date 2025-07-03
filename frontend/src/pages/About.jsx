// src/pages/About.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const [animateElements, setAnimateElements] = useState(false);
  const [activeSection, setActiveSection] = useState('story');

  // Trigger animations on mount
  useEffect(() => {
    setAnimateElements(true);
  }, []);

  // Company statistics
  const stats = [
    { icon: 'fa-users', label: 'Happy Customers', value: '50,000+', color: 'from-blue-500 to-cyan-500' },
    { icon: 'fa-shoe-prints', label: 'Shoes Sold', value: '200,000+', color: 'from-green-500 to-emerald-500' },
    { icon: 'fa-store', label: 'Partner Brands', value: '150+', color: 'from-purple-500 to-pink-500' },
    { icon: 'fa-globe', label: 'Countries Served', value: '25+', color: 'from-orange-500 to-red-500' }
  ];

  // Team members
  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Chief Executive Officer',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=300&auto=format&fit=crop',
      bio: 'Passionate about bringing quality footwear to customers worldwide.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Michael Chen',
      role: 'Head of Product',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop',
      bio: 'Expert in footwear design and sustainable manufacturing.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Emily Rodriguez',
      role: 'Customer Experience Director',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop',
      bio: 'Dedicated to ensuring every customer has an exceptional experience.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'David Kim',
      role: 'Technology Lead',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
      bio: 'Building innovative solutions for the future of online retail.',
      social: { linkedin: '#', twitter: '#' }
    }
  ];

  // Company values
  const values = [
    {
      icon: 'fa-heart',
      title: 'Customer First',
      description: 'Every decision we make is guided by what\'s best for our customers.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: 'fa-leaf',
      title: 'Sustainability',
      description: 'Committed to eco-friendly practices and sustainable footwear.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: 'fa-gem',
      title: 'Quality Excellence',
      description: 'We partner only with brands that meet our high standards.',
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: 'fa-handshake',
      title: 'Trust & Integrity',
      description: 'Building lasting relationships through honest business practices.',
      color: 'from-blue-500 to-cyan-500'
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
          {[...Array(12)].map((_, i) => (
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
            
            {/* Company Logo */}
            <div className={`inline-flex items-center space-x-4 mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-2xl">
                S
              </div>
              <span className="text-4xl font-bold text-white">ShoeMarkNet</span>
            </div>

            {/* Main Heading */}
            <h1 className={`text-5xl lg:text-7xl font-bold text-white mb-6 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              Your Premier
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                Footwear Destination
              </span>
            </h1>

            <p className={`text-xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              Since 2018, ShoeMarkNet has been revolutionizing the way people discover, shop for, and experience premium footwear. 
              We're more than just a marketplace – we're your trusted partner in finding the perfect shoe for every step of your journey.
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
              <Link
                to="/products"
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl"
              >
                <i className="fas fa-shopping-bag mr-3"></i>
                Explore Collection
              </Link>
              <button className="bg-white/20 backdrop-blur-lg border border-white/30 text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/30 transition-all duration-200">
                <i className="fas fa-play mr-3"></i>
                Watch Our Story
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 -mt-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 text-center shadow-2xl hover:scale-105 transition-all duration-500 ${
                  animateElements ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <i className={`fas ${stat.icon} text-2xl text-white`}></i>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-2 shadow-2xl max-w-2xl mx-auto">
            <div className="flex flex-wrap justify-center">
              {[
                { id: 'story', label: 'Our Story', icon: 'fa-book-open' },
                { id: 'mission', label: 'Mission & Vision', icon: 'fa-bullseye' },
                { id: 'values', label: 'Core Values', icon: 'fa-heart' },
                { id: 'team', label: 'Meet the Team', icon: 'fa-users' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                    activeSection === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20'
                  }`}
                >
                  <i className={`fas ${tab.icon}`}></i>
                  <span className="hidden sm:block">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          
          {/* Our Story */}
          {activeSection === 'story' && (
            <div className="animate-fade-in">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-12 shadow-2xl max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-book-open text-3xl text-white"></i>
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Our Story
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    The journey that started with a simple idea
                  </p>
                </div>

                <div className="space-y-8 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  <p>
                    <strong className="text-blue-600 dark:text-blue-400">ShoeMarkNet was born in 2018</strong> from a simple yet powerful observation: finding the perfect pair of shoes online was unnecessarily complicated. Our founders, passionate footwear enthusiasts themselves, recognized that customers deserved a better way to discover, compare, and purchase quality shoes.
                  </p>
                  
                  <p>
                    What started as a small team of five people working from a cramped office has grown into a thriving company serving customers across 25 countries. But our core mission remains unchanged: <em className="text-purple-600 dark:text-purple-400">to make exceptional footwear accessible to everyone, everywhere.</em>
                  </p>
                  
                  <p>
                    Today, we're proud to partner with over 150 premium brands, from emerging designers to established industry leaders. Every shoe in our collection is carefully curated to meet our standards for quality, style, and value. We've built more than just a marketplace – we've created a community of shoe lovers who trust us to help them find their perfect fit.
                  </p>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-l-4 border-blue-500">
                    <p className="font-semibold text-blue-800 dark:text-blue-200">
                      <i className="fas fa-quote-left mr-2"></i>
                      "We believe that the right pair of shoes can change how you feel, how you move, and how you see the world. That's why we're committed to helping every customer find their perfect match."
                      <span className="block text-sm font-normal text-blue-600 dark:text-blue-400 mt-2">
                        — Sarah Johnson, CEO & Founder
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mission & Vision */}
          {activeSection === 'mission' && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Mission */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-10 shadow-2xl">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-bullseye text-2xl text-white"></i>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                    To democratize access to premium footwear by creating the world's most trusted, 
                    convenient, and personalized shoe shopping experience. We empower customers to 
                    discover their perfect fit while supporting sustainable and ethical practices 
                    in the footwear industry.
                  </p>
                </div>

                {/* Vision */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-10 shadow-2xl">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-eye text-2xl text-white"></i>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h3>
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                    To become the global leader in footwear e-commerce, known for our commitment 
                    to quality, innovation, and customer satisfaction. We envision a future where 
                    finding the perfect shoe is effortless, sustainable, and brings joy to every 
                    step of life's journey.
                  </p>
                </div>
              </div>

              {/* Additional Goals */}
              <div className="mt-12 bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-10 shadow-2xl">
                <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
                  <i className="fas fa-rocket mr-3 text-blue-500"></i>
                  Our 2025 Goals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: 'fa-globe-americas', title: 'Global Expansion', desc: 'Reach 50 countries worldwide' },
                    { icon: 'fa-seedling', title: 'Sustainability', desc: '100% carbon-neutral shipping' },
                    { icon: 'fa-users', title: 'Community', desc: '1 million happy customers' }
                  ].map((goal, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <i className={`fas ${goal.icon} text-white`}></i>
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">{goal.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{goal.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Core Values */}
          {activeSection === 'values' && (
            <div className="animate-fade-in">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Our Core Values
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  The principles that guide every decision we make and every step we take
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {values.map((value, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl hover:scale-105 transition-all duration-500"
                  >
                    <div className="flex items-start space-x-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <i className={`fas ${value.icon} text-2xl text-white`}></i>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{value.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team */}
          {activeSection === 'team' && (
            <div className="animate-fade-in">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Meet Our Team
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  The passionate individuals behind ShoeMarkNet's success
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {team.map((member, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition-all duration-500 group"
                  >
                    <div className="relative">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      
                      {/* Social Links */}
                      <div className="absolute bottom-4 left-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <a href={member.social.linkedin} className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                          <i className="fab fa-linkedin text-sm"></i>
                        </a>
                        <a href={member.social.twitter} className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                          <i className="fab fa-twitter text-sm"></i>
                        </a>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">{member.role}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{member.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
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

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Find Your Perfect Pair?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust ShoeMarkNet for their footwear needs. 
            Discover your next favorite pair today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl"
            >
              <i className="fas fa-shopping-bag mr-3"></i>
              Start Shopping
            </Link>
            <Link
              to="/contact"
              className="bg-white/20 backdrop-blur-lg border border-white/30 text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/30 transition-all duration-200"
            >
              <i className="fas fa-envelope mr-3"></i>
              Contact Us
            </Link>
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

export default About;
