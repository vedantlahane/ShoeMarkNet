import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import NewsletterSignup from '../components/about/NewsletterSignup';
import TestimonialCarousel from '../components/about/TestimonialCarousel';
import CompanyTimeline from '../components/about/CompanyTimeline';
import TeamMemberCard from '../components/about/TeamMemberCard';
import ValueCard from '../components/about/ValueCard';
import StatsCounter from '../components/about/StatsCounter';
import ContactCTA from '../components/about/ContactCTA';

// Hooks
import useScrollToTop from '../hooks/useScrollToTop';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import useLocalStorage from '../hooks/useLocalStorage';

// Utils
import { trackEvent } from '../utils/analytics';

// Constants
const COMPANY_STATS = [
  { 
    icon: 'fa-users', 
    label: 'Happy Customers', 
    value: 50000, 
    suffix: '+', 
    color: 'from-blue-500 to-cyan-500',
    description: 'Customers who trust us globally'
  },
  { 
    icon: 'fa-shoe-prints', 
    label: 'Shoes Sold', 
    value: 200000, 
    suffix: '+', 
    color: 'from-green-500 to-emerald-500',
    description: 'Premium footwear delivered'
  },
  { 
    icon: 'fa-store', 
    label: 'Partner Brands', 
    value: 150, 
    suffix: '+', 
    color: 'from-purple-500 to-pink-500',
    description: 'Trusted brand partnerships'
  },
  { 
    icon: 'fa-globe', 
    label: 'Countries Served', 
    value: 25, 
    suffix: '+', 
    color: 'from-orange-500 to-red-500',
    description: 'Global shipping destinations'
  }
];

const TEAM_MEMBERS = [
  {
    id: 'sarah-johnson',
    name: 'Sarah Johnson',
    role: 'Chief Executive Officer',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=400&auto=format&fit=crop',
    bio: 'Passionate about bringing quality footwear to customers worldwide. 10+ years in retail innovation.',
    longBio: 'Sarah founded ShoeMarkNet with a vision to revolutionize online footwear shopping. With over a decade of experience in retail technology and customer experience, she has led the company from startup to industry leader.',
    social: { 
      linkedin: 'https://linkedin.com/in/sarah-johnson-ceo', 
      twitter: 'https://twitter.com/sarahjohnson_ceo',
      email: 'sarah@shoemarknet.com'
    },
    achievements: ['Forbes 30 Under 30', 'Retail Innovation Award 2023', 'Women in Tech Leadership'],
    skills: ['Strategic Leadership', 'E-commerce', 'Team Building']
  },
  {
    id: 'michael-chen',
    name: 'Michael Chen',
    role: 'Head of Product',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
    bio: 'Expert in footwear design and sustainable manufacturing with 15+ years experience.',
    longBio: 'Michael brings deep expertise in product development and sustainable manufacturing. He oversees our quality standards and works closely with brand partners to ensure exceptional products.',
    social: { 
      linkedin: 'https://linkedin.com/in/michael-chen-product', 
      twitter: 'https://twitter.com/michaelchen_design',
      email: 'michael@shoemarknet.com'
    },
    achievements: ['Sustainable Design Award', 'Product Innovation Excellence', 'Industry Expert Speaker'],
    skills: ['Product Development', 'Sustainable Design', 'Quality Assurance']
  },
  {
    id: 'emily-rodriguez',
    name: 'Emily Rodriguez',
    role: 'Customer Experience Director',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop',
    bio: 'Dedicated to ensuring every customer has an exceptional experience with our platform.',
    longBio: 'Emily leads our customer experience initiatives, ensuring every touchpoint exceeds expectations. Her background in psychology and UX design helps create meaningful customer connections.',
    social: { 
      linkedin: 'https://linkedin.com/in/emily-rodriguez-cx', 
      twitter: 'https://twitter.com/emilyrodriguez_cx',
      email: 'emily@shoemarknet.com'
    },
    achievements: ['Customer Experience Excellence', 'UX Design Innovation', 'Team Leadership Award'],
    skills: ['Customer Experience', 'UX Design', 'Data Analytics']
  },
  {
    id: 'david-kim',
    name: 'David Kim',
    role: 'Technology Lead',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    bio: 'Building innovative solutions for the future of online retail and e-commerce.',
    longBio: 'David architects our technology infrastructure and leads innovation initiatives. His expertise in AI and machine learning helps us provide personalized shopping experiences.',
    social: { 
      linkedin: 'https://linkedin.com/in/david-kim-tech', 
      twitter: 'https://twitter.com/davidkim_tech',
      email: 'david@shoemarknet.com'
    },
    achievements: ['Tech Innovation Award', 'AI Excellence Recognition', 'Open Source Contributor'],
    skills: ['Full Stack Development', 'AI/ML', 'System Architecture']
  }
];

const CORE_VALUES = [
  {
    id: 'customer-first',
    icon: 'fa-heart',
    title: 'Customer First',
    description: 'Every decision we make is guided by what\'s best for our customers.',
    fullDescription: 'We believe that putting customers at the center of everything we do creates lasting value. From product selection to customer service, every team member is empowered to make decisions that enhance the customer experience.',
    color: 'from-red-500 to-pink-500',
    examples: ['24/7 Customer Support', 'Easy Returns Policy', 'Personalized Recommendations']
  },
  {
    id: 'sustainability',
    icon: 'fa-leaf',
    title: 'Sustainability',
    description: 'Committed to eco-friendly practices and sustainable footwear.',
    fullDescription: 'Environmental responsibility is core to our mission. We partner with brands that share our commitment to sustainable practices and continuously work to reduce our environmental footprint.',
    color: 'from-green-500 to-emerald-500',
    examples: ['Carbon Neutral Shipping', 'Sustainable Packaging', 'Eco-Friendly Brands']
  },
  {
    id: 'quality-excellence',
    icon: 'fa-gem',
    title: 'Quality Excellence',
    description: 'We partner only with brands that meet our high standards.',
    fullDescription: 'Quality is non-negotiable. Our rigorous vetting process ensures every product meets our standards for craftsmanship, durability, and style.',
    color: 'from-purple-500 to-violet-500',
    examples: ['Quality Assurance Testing', 'Brand Partnership Standards', 'Product Guarantees']
  },
  {
    id: 'trust-integrity',
    icon: 'fa-handshake',
    title: 'Trust & Integrity',
    description: 'Building lasting relationships through honest business practices.',
    fullDescription: 'Trust is the foundation of our relationships with customers, partners, and team members. We commit to transparency, honesty, and ethical practices in all our interactions.',
    color: 'from-blue-500 to-cyan-500',
    examples: ['Transparent Pricing', 'Honest Reviews', 'Ethical Sourcing']
  }
];

const COMPANY_MILESTONES = [
  {
    year: 2018,
    title: 'ShoeMarkNet Founded',
    description: 'Started with a small team and big dreams in a tiny office',
    icon: 'fa-rocket',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    year: 2019,
    title: 'First 1,000 Customers',
    description: 'Reached our first major milestone with incredible community support',
    icon: 'fa-users',
    color: 'from-green-500 to-emerald-500'
  },
  {
    year: 2020,
    title: 'International Expansion',
    description: 'Expanded to serve customers in 10 countries worldwide',
    icon: 'fa-globe',
    color: 'from-purple-500 to-pink-500'
  },
  {
    year: 2021,
    title: 'Sustainability Initiative',
    description: 'Launched our carbon-neutral shipping program',
    icon: 'fa-leaf',
    color: 'from-green-400 to-green-600'
  },
  {
    year: 2022,
    title: '100+ Brand Partners',
    description: 'Reached 100 premium brand partnerships',
    icon: 'fa-handshake',
    color: 'from-orange-500 to-red-500'
  },
  {
    year: 2023,
    title: 'AI-Powered Recommendations',
    description: 'Launched personalized shopping experience with AI',
    icon: 'fa-brain',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    year: 2024,
    title: '50,000+ Happy Customers',
    description: 'Celebrating our amazing community of shoe lovers',
    icon: 'fa-celebration',
    color: 'from-yellow-500 to-orange-500'
  }
];

const About = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Local state
  const [animateElements, setAnimateElements] = useState(false);
  const [activeSection, setActiveSection] = useLocalStorage('aboutActiveSection', 'story');
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [loadingNewsletter, setLoadingNewsletter] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [showFullStory, setShowFullStory] = useState(false);
  const [visitorCount, setVisitorCount] = useState(0);

  // Scroll to top on mount
  useScrollToTop();

  // Initialize animations and track page view
  useEffect(() => {
    setTimeout(() => setAnimateElements(true), 100);
    
    // Track page view
    trackEvent('page_view', {
      page_title: 'About Us',
      page_location: window.location.href,
      referrer: document.referrer,
      user_authenticated: isAuthenticated
    });

    // Simulate visitor counter
    const count = Math.floor(Math.random() * 1000) + 5000;
    setVisitorCount(count);
  }, [isAuthenticated]);

  // Track section changes
  useEffect(() => {
    if (activeSection) {
      trackEvent('about_section_viewed', {
        section: activeSection,
        user_authenticated: isAuthenticated
      });
    }
  }, [activeSection, isAuthenticated]);

  // Memoized section navigation
  const navigationSections = useMemo(() => [
    { id: 'story', label: 'Our Story', icon: 'fa-book-open', description: 'The journey that started it all' },
    { id: 'mission', label: 'Mission & Vision', icon: 'fa-bullseye', description: 'Our purpose and direction' },
    { id: 'values', label: 'Core Values', icon: 'fa-heart', description: 'Principles that guide us' },
    { id: 'team', label: 'Meet the Team', icon: 'fa-users', description: 'The people behind our success' },
    { id: 'timeline', label: 'Our Journey', icon: 'fa-route', description: 'Milestones and achievements' }
  ], []);

  // Enhanced handlers
  const handleSectionChange = useCallback((sectionId) => {
    setActiveSection(sectionId);
    
    trackEvent('about_section_clicked', {
      section: sectionId,
      previous_section: activeSection
    });
  }, [activeSection, setActiveSection]);

  const handleTeamMemberClick = useCallback((member) => {
    setSelectedTeamMember(member);
    
    trackEvent('team_member_viewed', {
      member_name: member.name,
      member_role: member.role
    });
  }, []);

  const handleValueClick = useCallback((value) => {
    setSelectedValue(value);
    
    trackEvent('company_value_explored', {
      value_title: value.title,
      value_id: value.id
    });
  }, []);

  const handleNewsletterSignup = useCallback(async (email) => {
    setLoadingNewsletter(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('🎉 Thank you for subscribing to our newsletter!');
      setNewsletterEmail('');
      
      trackEvent('newsletter_signup', {
        email_domain: email.split('@')[1],
        page: 'about',
        user_authenticated: isAuthenticated
      });
      
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoadingNewsletter(false);
    }
  }, [isAuthenticated]);

  const handleCTAClick = useCallback((action, destination) => {
    trackEvent('about_cta_clicked', {
      action,
      destination,
      section: activeSection
    });
    
    if (destination.startsWith('/')) {
      navigate(destination);
    }
  }, [navigate, activeSection]);

  // SEO meta data
  const metaTitle = 'About ShoeMarkNet | Your Premier Footwear Destination';
  const metaDescription = 'Discover the story behind ShoeMarkNet. Since 2018, we\'ve been revolutionizing online footwear shopping with 50,000+ happy customers, 150+ brand partnerships, and a commitment to quality and sustainability.';

  return (
    <ErrorBoundary>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://shoemarknet.com/about" />
        
        {/* Open Graph */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shoemarknet.com/about" />
        <meta property="og:image" content="https://shoemarknet.com/og-about.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content="https://shoemarknet.com/twitter-about.jpg" />
        
        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ShoeMarkNet",
            "url": "https://shoemarknet.com",
            "logo": "https://shoemarknet.com/logo.png",
            "description": metaDescription,
            "foundingDate": "2018",
            "founder": [
              {
                "@type": "Person",
                "name": "Sarah Johnson",
                "jobTitle": "CEO & Founder"
              }
            ],
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "US"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "hello@shoemarknet.com",
              "availableLanguage": ["en"]
            },
            "sameAs": [
              "https://twitter.com/shoemarknet",
              "https://linkedin.com/company/shoemarknet",
              "https://instagram.com/shoemarknet"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        {/* Enhanced Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          {/* Dynamic Background with Animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-shimmer"></div>
          </div>
          
          {/* Enhanced Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
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
              
              {/* Enhanced Company Logo */}
              <div className={`inline-flex items-center space-x-4 mb-8 ${animateElements ? 'animate-bounce-in' : 'opacity-0'}`}>
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-2xl transform hover:scale-110 transition-transform duration-300">
                  S
                </div>
                <span className="text-4xl font-bold text-white">ShoeMarkNet</span>
              </div>

              {/* Enhanced Main Heading */}
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

              {/* Enhanced CTA Buttons */}
              <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
                <Link
                  to="/products"
                  onClick={() => handleCTAClick('explore_collection', '/products')}
                  className="group bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl relative overflow-hidden"
                >
                  {/* Button shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <i className="fas fa-shopping-bag mr-3 relative z-10"></i>
                  <span className="relative z-10">Explore Collection</span>
                </Link>
                <button 
                  onClick={() => setShowFullStory(true)}
                  className="bg-white/20 backdrop-blur-lg border border-white/30 text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/30 transition-all duration-200"
                >
                  <i className="fas fa-play mr-3"></i>
                  Watch Our Story
                </button>
              </div>

              {/* Visitor Counter */}
              <div className={`inline-flex items-center space-x-2 text-white/80 text-sm ${animateElements ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
                <i className="fas fa-eye"></i>
                <span>You're visitor #{visitorCount.toLocaleString()} today</span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Statistics Section */}
        <section className="py-16 -mt-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {COMPANY_STATS.map((stat, index) => (
                <StatsCounter
                  key={index}
                  stat={stat}
                  index={index}
                  animateElements={animateElements}
                  animationDelay={0.8 + index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Navigation Tabs */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-3 shadow-2xl max-w-4xl mx-auto ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '1.2s' }}>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {navigationSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`group flex flex-col items-center space-y-2 px-4 py-4 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl'
                        : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20'
                    }`}
                    title={section.description}
                  >
                    <i className={`fas ${section.icon} text-xl group-hover:animate-bounce`}></i>
                    <span className="text-sm text-center leading-tight">{section.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Content Sections */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            
            {/* Our Story */}
            {activeSection === 'story' && (
              <div className={`animate-fade-in ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 lg:p-12 shadow-2xl max-w-5xl mx-auto">
                  
                  {/* Header */}
                  <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <i className="fas fa-book-open text-3xl text-white"></i>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                      Our Story
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                      The journey that started with a simple idea
                    </p>
                  </div>

                  {/* Story Content */}
                  <div className="space-y-8 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border-l-4 border-blue-500">
                      <p className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
                        <i className="fas fa-lightbulb mr-3 text-yellow-500"></i>
                        It all started with a simple observation...
                      </p>
                      <p>
                        <strong className="text-blue-600 dark:text-blue-400">ShoeMarkNet was born in 2018</strong> from a simple yet powerful realization: finding the perfect pair of shoes online was unnecessarily complicated. Our founders, passionate footwear enthusiasts themselves, recognized that customers deserved a better way to discover, compare, and purchase quality shoes.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                          <i className="fas fa-seedling mr-3 text-green-500"></i>
                          From Humble Beginnings
                        </h3>
                        <p>
                          What started as a small team of five people working from a cramped office has grown into a thriving company serving customers across 25 countries. But our core mission remains unchanged: <em className="text-purple-600 dark:text-purple-400">to make exceptional footwear accessible to everyone, everywhere.</em>
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                          <i className="fas fa-rocket mr-3 text-orange-500"></i>
                          Growing Strong
                        </h3>
                        <p>
                          Today, we're proud to partner with over 150 premium brands, from emerging designers to established industry leaders. Every shoe in our collection is carefully curated to meet our standards for quality, style, and value.
                        </p>
                      </div>
                    </div>

                    {showFullStory && (
                      <div className="animate-fade-in space-y-6">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50">
                          <h4 className="text-xl font-bold text-purple-800 dark:text-purple-200 mb-3">
                            <i className="fas fa-star mr-2"></i>
                            The Turning Point
                          </h4>
                          <p>
                            In 2020, when the world changed, we saw an opportunity to make online shoe shopping not just convenient, but delightful. We invested heavily in technology, customer experience, and sustainability initiatives that set us apart from traditional retailers.
                          </p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50">
                          <h4 className="text-xl font-bold text-green-800 dark:text-green-200 mb-3">
                            <i className="fas fa-leaf mr-2"></i>
                            Commitment to Sustainability
                          </h4>
                          <p>
                            We became the first major footwear retailer to offer carbon-neutral shipping on all orders. Our partnerships prioritize brands committed to sustainable practices, from eco-friendly materials to ethical manufacturing.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="text-center">
                      <button 
                        onClick={() => setShowFullStory(!showFullStory)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105"
                      >
                        <i className={`fas ${showFullStory ? 'fa-chevron-up' : 'fa-chevron-down'} mr-2`}></i>
                        {showFullStory ? 'Show Less' : 'Read Full Story'}
                      </button>
                    </div>

                    {/* Founder Quote */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border-l-4 border-blue-500 mt-8">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={TEAM_MEMBERS[0].image} 
                          alt="Sarah Johnson"
                          className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-blue-800 dark:text-blue-200 text-lg italic mb-3">
                            <i className="fas fa-quote-left mr-2"></i>
                            "We believe that the right pair of shoes can change how you feel, how you move, and how you see the world. That's why we're committed to helping every customer find their perfect match."
                          </p>
                          <div className="text-blue-600 dark:text-blue-400">
                            <span className="font-bold">Sarah Johnson</span>
                            <span className="text-sm ml-2">CEO & Founder</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mission & Vision */}
            {activeSection === 'mission' && (
              <div className={`animate-fade-in ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                
                {/* Mission & Vision Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  
                  {/* Mission */}
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-10 shadow-2xl hover:scale-105 transition-all duration-500">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <i className="fas fa-bullseye text-3xl text-white"></i>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
                    </div>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center mb-6">
                      To democratize access to premium footwear by creating the world's most trusted, 
                      convenient, and personalized shoe shopping experience. We empower customers to 
                      discover their perfect fit while supporting sustainable and ethical practices 
                      in the footwear industry.
                    </p>
                    
                    {/* Mission Goals */}
                    <div className="space-y-3">
                      {[
                        'Provide exceptional customer experience',
                        'Support sustainable practices',
                        'Offer personalized recommendations',
                        'Build lasting partnerships'
                      ].map((goal, index) => (
                        <div key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                          <i className="fas fa-check-circle text-green-500 mr-3"></i>
                          {goal}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vision */}
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-10 shadow-2xl hover:scale-105 transition-all duration-500">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <i className="fas fa-eye text-3xl text-white"></i>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h3>
                    </div>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center mb-6">
                      To become the global leader in footwear e-commerce, known for our commitment 
                      to quality, innovation, and customer satisfaction. We envision a future where 
                      finding the perfect shoe is effortless, sustainable, and brings joy to every 
                      step of life's journey.
                    </p>
                    
                    {/* Vision Pillars */}
                    <div className="space-y-3">
                      {[
                        'Global market leadership',
                        'Innovation in shopping experience',
                        'Environmental responsibility',
                        'Community building'
                      ].map((pillar, index) => (
                        <div key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                          <i className="fas fa-star text-purple-500 mr-3"></i>
                          {pillar}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2025 Goals */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-10 shadow-2xl">
                  <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                    <i className="fas fa-rocket mr-3 text-blue-500"></i>
                    Our 2025 Goals
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { 
                        icon: 'fa-globe-americas', 
                        title: 'Global Expansion', 
                        desc: 'Reach 50 countries worldwide',
                        progress: 50,
                        color: 'from-blue-500 to-cyan-500'
                      },
                      { 
                        icon: 'fa-seedling', 
                        title: 'Sustainability', 
                        desc: '100% carbon-neutral operations',
                        progress: 75,
                        color: 'from-green-500 to-emerald-500'
                      },
                      { 
                        icon: 'fa-users', 
                        title: 'Community', 
                        desc: '1 million happy customers',
                        progress: 25,
                        color: 'from-purple-500 to-pink-500'
                      }
                    ].map((goal, index) => (
                      <div key={index} className="text-center">
                        <div className={`w-16 h-16 bg-gradient-to-r ${goal.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                          <i className={`fas ${goal.icon} text-2xl text-white`}></i>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{goal.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{goal.desc}</p>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                          <div 
                            className={`bg-gradient-to-r ${goal.color} h-2 rounded-full transition-all duration-1000`}
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{goal.progress}% Complete</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Core Values */}
            {activeSection === 'values' && (
              <div className={`animate-fade-in ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Our Core Values
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                    The principles that guide every decision we make and every step we take
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {CORE_VALUES.map((value, index) => (
                    <ValueCard
                      key={value.id}
                      value={value}
                      isSelected={selectedValue?.id === value.id}
                      onClick={() => handleValueClick(value)}
                      animationDelay={index * 0.1}
                    />
                  ))}
                </div>

                {/* Selected Value Details Modal */}
                {selectedValue && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className={`w-16 h-16 bg-gradient-to-r ${selectedValue.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                            <i className={`fas ${selectedValue.icon} text-2xl text-white`}></i>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedValue.title}</h3>
                        </div>
                        <button
                          onClick={() => setSelectedValue(null)}
                          className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      
                      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        {selectedValue.fullDescription}
                      </p>
                      
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-3">How we live this value:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {selectedValue.examples.map((example, idx) => (
                            <div key={idx} className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl p-3 text-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{example}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Team */}
            {activeSection === 'team' && (
              <div className={`animate-fade-in ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Meet Our Team
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                    The passionate individuals behind ShoeMarkNet's success
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {TEAM_MEMBERS.map((member, index) => (
                    <TeamMemberCard
                      key={member.id}
                      member={member}
                      onClick={() => handleTeamMemberClick(member)}
                      animationDelay={index * 0.1}
                    />
                  ))}
                </div>

                {/* Team Member Details Modal */}
                {selectedTeamMember && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                      <button
                        onClick={() => setSelectedTeamMember(null)}
                        className="absolute top-6 right-6 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <img
                            src={selectedTeamMember.image}
                            alt={selectedTeamMember.name}
                            className="w-full aspect-square object-cover rounded-2xl shadow-2xl"
                          />
                        </div>
                        
                        <div>
                          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedTeamMember.name}</h3>
                          <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-4">{selectedTeamMember.role}</p>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{selectedTeamMember.longBio}</p>
                          
                          {/* Skills */}
                          <div className="mb-6">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-3">Expertise:</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedTeamMember.skills.map((skill, idx) => (
                                <span key={idx} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {/* Achievements */}
                          <div className="mb-6">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-3">Achievements:</h4>
                            <div className="space-y-2">
                              {selectedTeamMember.achievements.map((achievement, idx) => (
                                <div key={idx} className="flex items-center text-gray-600 dark:text-gray-400">
                                  <i className="fas fa-trophy text-yellow-500 mr-3"></i>
                                  {achievement}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Social Links */}
                          <div className="flex space-x-3">
                            <a href={selectedTeamMember.social.linkedin} className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-200">
                              <i className="fab fa-linkedin"></i>
                            </a>
                            <a href={selectedTeamMember.social.twitter} className="w-10 h-10 bg-blue-400 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition-colors duration-200">
                              <i className="fab fa-twitter"></i>
                            </a>
                            <a href={`mailto:${selectedTeamMember.social.email}`} className="w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors duration-200">
                              <i className="fas fa-envelope"></i>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Company Timeline */}
            {activeSection === 'timeline' && (
              <div className={`animate-fade-in ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                <CompanyTimeline 
                  milestones={COMPANY_MILESTONES}
                  title="Our Journey"
                  subtitle="Key milestones that shaped ShoeMarkNet"
                />
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Signup Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <NewsletterSignup
              onSignup={handleNewsletterSignup}
              loading={loadingNewsletter}
              email={newsletterEmail}
              onEmailChange={setNewsletterEmail}
              animateElements={animateElements}
            />
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-white/5">
          <div className="container mx-auto px-4">
            <TestimonialCarousel animateElements={animateElements} />
          </div>
        </section>

        {/* Enhanced Call to Action */}
        <ContactCTA
          onCTAClick={handleCTAClick}
          animateElements={animateElements}
        />

        {/* Custom Styles */}
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
    </ErrorBoundary>
  );
};

export default About;
