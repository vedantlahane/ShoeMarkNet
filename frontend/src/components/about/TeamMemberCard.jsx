import React, { useState, useCallback } from 'react';

// Utils
import { trackEvent } from '../../utils/analytics';

const TeamMemberCard = ({
  member = {},
  index = 0,
  variant = 'default', // default, compact, featured
  showSocialLinks = true,
  showContact = true,
  onContactClick = null,
  className = ''
}) => {
  // Default member data structure
  const defaultMember = {
    id: '1',
    name: 'John Doe',
    role: 'Chief Executive Officer',
    department: 'Leadership',
    bio: 'Passionate leader with over 15 years of experience in the footwear industry, driving innovation and excellence at ShoeMarkNet.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    email: 'john.doe@shoemarknet.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    joinDate: '2018-03-15',
    achievements: [
      'Led company to 500% growth',
      'Launched 5 successful product lines',
      'Industry Innovation Award 2023'
    ],
    specialties: ['Strategic Planning', 'Team Leadership', 'Product Development'],
    social: {
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe',
      instagram: 'https://instagram.com/johndoe'
    },
    stats: {
      experience: '15+ Years',
      projectsLed: '50+',
      teamSize: '200+'
    },
    isFounder: true,
    isExecutive: true
  };

  // Merge provided member with defaults
  const memberData = {
    ...defaultMember,
    ...member,
    social: { ...defaultMember.social, ...member.social },
    stats: { ...defaultMember.stats, ...member.stats }
  };

  // Local state
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  // Handle social link click
  const handleSocialClick = useCallback((platform, url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    
    trackEvent('team_member_social_click', {
      member_id: memberData.id,
      member_name: memberData.name,
      platform,
      url
    });
  }, [memberData]);

  // Handle contact click
  const handleContactClick = useCallback((contactType, value) => {
    trackEvent('team_member_contact', {
      member_id: memberData.id,
      member_name: memberData.name,
      contact_type: contactType,
      value
    });

    switch (contactType) {
      case 'email':
        window.open(`mailto:${value}`);
        break;
      case 'phone':
        window.open(`tel:${value}`);
        break;
      default:
        if (onContactClick) onContactClick(contactType, value, memberData);
    }
  }, [memberData, onContactClick]);

  // Get role color based on department/role
  const getRoleColor = useCallback((role, department) => {
    if (memberData.isFounder) return 'from-yellow-500 to-orange-500';
    if (memberData.isExecutive) return 'from-purple-500 to-pink-500';
    
    switch (department?.toLowerCase()) {
      case 'leadership':
      case 'executive':
        return 'from-blue-500 to-indigo-500';
      case 'engineering':
      case 'technology':
        return 'from-green-500 to-emerald-500';
      case 'design':
      case 'creative':
        return 'from-purple-500 to-pink-500';
      case 'marketing':
      case 'sales':
        return 'from-orange-500 to-red-500';
      case 'operations':
      case 'logistics':
        return 'from-cyan-500 to-blue-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  }, [memberData]);

  const roleColor = getRoleColor(memberData.role, memberData.department);

  // Render compact variant
  if (variant === 'compact') {
    return (
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${className}`}>
        <div className="flex items-center space-x-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white/30 shadow-lg">
              <img
                src={memberData.image}
                alt={memberData.name}
                className="w-full h-full object-cover"
              />
            </div>
            {memberData.isFounder && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                <i className="fas fa-crown text-white text-xs"></i>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
              {memberData.name}
            </h3>
            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium truncate">
              {memberData.role}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              {memberData.department}
            </p>
          </div>

          {showSocialLinks && memberData.social && (
            <div className="flex space-x-2">
              {Object.entries(memberData.social).map(([platform, url]) => (
                <button
                  key={platform}
                  onClick={() => handleSocialClick(platform, url)}
                  className="w-8 h-8 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110"
                  title={`${memberData.name} on ${platform}`}
                >
                  <i className={`fab fa-${platform} text-sm`}></i>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render full variant
  return (
    <div 
      className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl ${
        isHovered ? 'scale-105' : ''
      } ${variant === 'featured' ? 'ring-2 ring-blue-500/50' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      
      {/* Member Photo Section */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={memberData.image}
          alt={memberData.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Special Badges */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          {memberData.isFounder && (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 rounded-full text-white text-sm font-bold backdrop-blur-lg">
              <i className="fas fa-crown mr-2"></i>
              Founder
            </div>
          )}
          {memberData.isExecutive && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full text-white text-sm font-bold backdrop-blur-lg">
              <i className="fas fa-star mr-2"></i>
              Executive
            </div>
          )}
        </div>

        {/* Department Badge */}
        <div className="absolute top-4 left-4">
          <div className={`bg-gradient-to-r ${roleColor} px-3 py-1 rounded-full text-white text-sm font-semibold backdrop-blur-lg`}>
            {memberData.department}
          </div>
        </div>

        {/* Contact Overlay */}
        {showContact && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={() => setShowContactInfo(!showContactInfo)}
              className="w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 hover:scale-110"
              title="Contact Information"
            >
              <i className="fas fa-envelope"></i>
            </button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {memberData.name}
          </h3>
          <p className={`text-lg font-semibold bg-gradient-to-r ${roleColor} bg-clip-text text-transparent mb-1`}>
            {memberData.role}
          </p>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <i className="fas fa-map-marker-alt mr-2"></i>
            {memberData.location}
            <span className="mx-3">•</span>
            <i className="fas fa-calendar-alt mr-2"></i>
            Since {new Date(memberData.joinDate).getFullYear()}
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {memberData.bio}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {Object.entries(memberData.stats).map(([key, value]) => (
            <div key={key} className="text-center bg-white/10 backdrop-blur-lg rounded-xl p-3">
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>

        {/* Specialties */}
        {memberData.specialties && memberData.specialties.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <i className="fas fa-star mr-2 text-yellow-500"></i>
              Specialties
            </h4>
            <div className="flex flex-wrap gap-2">
              {memberData.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-xl text-sm font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {!isExpanded && memberData.achievements && memberData.achievements.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors text-sm font-medium"
            >
              <i className="fas fa-trophy mr-2"></i>
              View Achievements ({memberData.achievements.length})
              <i className="fas fa-chevron-right ml-2"></i>
            </button>
          </div>
        )}

        {/* Expanded Achievements */}
        {isExpanded && memberData.achievements && memberData.achievements.length > 0 && (
          <div className="mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <i className="fas fa-trophy mr-2 text-yellow-500"></i>
                Key Achievements
              </h4>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
              >
                <i className="fas fa-chevron-up"></i>
              </button>
            </div>
            <div className="space-y-2">
              {memberData.achievements.map((achievement, index) => (
                <div key={index} className="flex items-start bg-white/10 backdrop-blur-lg rounded-xl p-3">
                  <i className="fas fa-medal text-yellow-500 mr-3 mt-1 flex-shrink-0"></i>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        {showContactInfo && showContact && (
          <div className="mb-6 animate-fade-in">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <i className="fas fa-address-card mr-2 text-green-500"></i>
              Contact Information
            </h4>
            <div className="space-y-3">
              <button
                onClick={() => handleContactClick('email', memberData.email)}
                className="flex items-center w-full p-3 bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/20 transition-colors text-left"
              >
                <i className="fas fa-envelope w-5 text-blue-500"></i>
                <span className="ml-3 text-gray-700 dark:text-gray-300">{memberData.email}</span>
              </button>
              
              <button
                onClick={() => handleContactClick('phone', memberData.phone)}
                className="flex items-center w-full p-3 bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/20 transition-colors text-left"
              >
                <i className="fas fa-phone w-5 text-green-500"></i>
                <span className="ml-3 text-gray-700 dark:text-gray-300">{memberData.phone}</span>
              </button>
            </div>
          </div>
        )}

        {/* Social Media Links */}
        {showSocialLinks && memberData.social && Object.keys(memberData.social).length > 0 && (
          <div className="pt-6 border-t border-white/20 dark:border-gray-700/20">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Connect with {memberData.name.split(' ')[0]}
            </h4>
            <div className="flex justify-center space-x-4">
              {Object.entries(memberData.social).map(([platform, url]) => (
                <button
                  key={platform}
                  onClick={() => handleSocialClick(platform, url)}
                  className="w-12 h-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110 group"
                  title={`${memberData.name} on ${platform}`}
                >
                  <i className={`fab fa-${platform} text-lg group-hover:scale-110 transition-transform duration-200`}></i>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        /* Enhanced hover effects */
        @media (hover: hover) {
          .team-member-card:hover .member-image {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default TeamMemberCard;
