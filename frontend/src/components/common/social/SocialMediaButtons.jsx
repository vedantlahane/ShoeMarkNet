import React, { useState } from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin, FaGithub } from 'react-icons/fa';

const SocialMediaButtons = ({ 
  className = "",
  size = "medium",
  orientation = "horizontal",
  showLabels = false,
  variant = "default"
}) => {
  const [hoveredIcon, setHoveredIcon] = useState(null);

  const socialLinks = [
    {
      name: 'Facebook',
      icon: FaFacebook,
      url: 'https://facebook.com/shoemarknet',
      color: '#1877F2',
      hoverColor: '#166FE5'
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: 'https://twitter.com/shoemarknet',
      color: '#1DA1F2',
      hoverColor: '#1A91DA'
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      url: 'https://instagram.com/shoemarknet',
      color: '#E4405F',
      hoverColor: '#D62851'
    },
    {
      name: 'YouTube',
      icon: FaYoutube,
      url: 'https://youtube.com/shoemarknet',
      color: '#FF0000',
      hoverColor: '#E60000'
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      url: 'https://linkedin.com/company/shoemarknet',
      color: '#0A66C2',
      hoverColor: '#095BA8'
    }
  ];

  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-10 h-10 text-base',
    large: 'w-12 h-12 text-lg'
  };

  const containerClasses = {
    horizontal: 'flex space-x-3',
    vertical: 'flex flex-col space-y-3'
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-600 hover:text-white transition-all duration-200',
    outline: 'border-2 border-gray-300 text-gray-600 hover:text-white hover:border-transparent transition-all duration-200',
    filled: 'text-white transition-all duration-200',
    minimal: 'text-gray-600 hover:scale-110 transition-all duration-200'
  };

  const handleClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`social-media-buttons ${className}`}>
      <div className={containerClasses[orientation]}>
        {socialLinks.map((social) => {
          const Icon = social.icon;
          const isHovered = hoveredIcon === social.name;
          
          return (
            <div key={social.name} className="relative">
              <button
                onClick={() => handleClick(social.url)}
                onMouseEnter={() => setHoveredIcon(social.name)}
                onMouseLeave={() => setHoveredIcon(null)}
                className={`
                  ${sizeClasses[size]}
                  ${variantClasses[variant]}
                  flex items-center justify-center rounded-full
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                `}
                style={{
                  backgroundColor: variant === 'filled' 
                    ? social.color 
                    : isHovered && variant !== 'minimal' 
                      ? social.hoverColor 
                      : undefined,
                  color: variant === 'minimal' && isHovered 
                    ? social.color 
                    : undefined
                }}
                aria-label={`Follow us on ${social.name}`}
                title={`Follow us on ${social.name}`}
              >
                <Icon />
              </button>
              
              {showLabels && (
                <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 pointer-events-none transition-opacity duration-200 hover:opacity-100 whitespace-nowrap">
                  {social.name}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialMediaButtons;
