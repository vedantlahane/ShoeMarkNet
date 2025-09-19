import React, { useState, useCallback, useMemo } from 'react';

// Utils
import { trackEvent } from '../../utils/analytics';

// Constants
const BUSINESS_HOURS = {
  weekdays: '9:00 AM - 6:00 PM',
  saturday: '10:00 AM - 4:00 PM',
  sunday: 'Closed'
};

const CONTACT_METHODS = [
  { type: 'phone', icon: 'fas fa-phone', label: 'Call Us' },
  { type: 'email', icon: 'fas fa-envelope', label: 'Email Us' },
  { type: 'directions', icon: 'fas fa-map-marker-alt', label: 'Get Directions' },
  { type: 'visit', icon: 'fas fa-building', label: 'Visit Us' }
];

const OfficeLocationCard = ({
  location = {},
  index = 0,
  onContactClick = null,
  onDirectionsClick = null,
  showMap = false,
  variant = 'default', // default, compact, featured
  className = ''
}) => {
  // Default location data structure
  const defaultLocation = {
    id: 'headquarters',
    name: 'ShoeMarkNet Headquarters',
    type: 'headquarters', // headquarters, retail, warehouse, service
    address: {
      street: '123 Fashion Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    coordinates: {
      lat: 40.7128,
      lng: -74.0060
    },
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'info@shoemarknet.com',
      fax: '+1 (555) 123-4568'
    },
    hours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed'
    },
    amenities: [
      'Customer Service Center',
      'Product Showroom',
      'Returns Processing',
      'Parking Available',
      'Wheelchair Accessible',
      'Free WiFi'
    ],
    social: {
      facebook: 'https://facebook.com/shoemarknet',
      twitter: 'https://twitter.com/shoemarknet',
      instagram: 'https://instagram.com/shoemarknet'
    },
    manager: {
      name: 'Sarah Johnson',
      title: 'Location Manager',
      phone: '+1 (555) 123-4569'
    },
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
    isMain: true,
    isOpen: true
  };

  // Merge provided location with defaults
  const locationData = useMemo(() => ({
    ...defaultLocation,
    ...location,
    address: { ...defaultLocation.address, ...location.address },
    contact: { ...defaultLocation.contact, ...location.contact },
    hours: { ...defaultLocation.hours, ...location.hours },
    coordinates: { ...defaultLocation.coordinates, ...location.coordinates },
    social: { ...defaultLocation.social, ...location.social },
    manager: { ...defaultLocation.manager, ...location.manager }
  }), [location]);

  // Local state
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeSection, setActiveSection] = useState('info');

  // Get current status
  const getCurrentStatus = useCallback(() => {
    const now = new Date();
    const currentDay = now.toLocaleLowerCase().substring(0, 3);
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const todayHours = locationData.hours[currentDay === 'sun' ? 'sunday' : 
                        currentDay === 'mon' ? 'monday' :
                        currentDay === 'tue' ? 'tuesday' :
                        currentDay === 'wed' ? 'wednesday' :
                        currentDay === 'thu' ? 'thursday' :
                        currentDay === 'fri' ? 'friday' : 'saturday'];
    
    if (todayHours === 'Closed') {
      return { isOpen: false, status: 'Closed', nextOpen: 'Tomorrow at 9:00 AM' };
    }
    
    // Simple open/closed logic (can be enhanced)
    const isCurrentlyOpen = currentTime >= 900 && currentTime <= 1800;
    
    return {
      isOpen: isCurrentlyOpen,
      status: isCurrentlyOpen ? 'Open Now' : 'Closed',
      nextOpen: isCurrentlyOpen ? 'Until 6:00 PM' : 'Opens at 9:00 AM'
    };
  }, [locationData.hours]);

  const status = getCurrentStatus();

  // Handle contact actions
  const handleContactAction = useCallback((action, value) => {
    trackEvent('office_location_contact', {
      location_id: locationData.id,
      location_name: locationData.name,
      action,
      value
    });

    switch (action) {
      case 'phone':
        window.open(`tel:${value}`);
        break;
      case 'email':
        window.open(`mailto:${value}`);
        break;
      case 'directions':
        const { lat, lng } = locationData.coordinates;
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        if (onDirectionsClick) onDirectionsClick(locationData);
        break;
      case 'visit':
        setIsExpanded(true);
        break;
      default:
        if (onContactClick) onContactClick(action, value, locationData);
    }
  }, [locationData, onDirectionsClick, onContactClick]);

  // Format address
  const formatAddress = useCallback((address) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  }, []);

  // Get location type styling
  const getLocationTypeStyle = useCallback((type) => {
    switch (type) {
      case 'headquarters':
        return { 
          bg: 'from-blue-500 to-purple-500', 
          text: 'text-blue-800 dark:text-blue-200',
          icon: 'fas fa-building'
        };
      case 'retail':
        return { 
          bg: 'from-green-500 to-emerald-500', 
          text: 'text-green-800 dark:text-green-200',
          icon: 'fas fa-store'
        };
      case 'warehouse':
        return { 
          bg: 'from-orange-500 to-red-500', 
          text: 'text-orange-800 dark:text-orange-200',
          icon: 'fas fa-warehouse'
        };
      case 'service':
        return { 
          bg: 'from-purple-500 to-pink-500', 
          text: 'text-purple-800 dark:text-purple-200',
          icon: 'fas fa-tools'
        };
      default:
        return { 
          bg: 'from-gray-500 to-gray-600', 
          text: 'text-gray-800 dark:text-gray-200',
          icon: 'fas fa-map-marker-alt'
        };
    }
  }, []);

  const typeStyle = getLocationTypeStyle(locationData.type);

  // Render compact variant
  if (variant === 'compact') {
    return (
      <div className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${className}`}>
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 bg-gradient-to-r ${typeStyle.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <i className={`${typeStyle.icon} text-white text-lg`}></i>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
              {locationData.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              {formatAddress(locationData.address)}
            </p>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-1 ${status.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                <span className="text-sm font-medium">{status.status}</span>
              </div>
              
              <button
                onClick={() => handleContactAction('phone', locationData.contact.phone)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                title="Call"
              >
                <i className="fas fa-phone text-sm"></i>
              </button>
              
              <button
                onClick={() => handleContactAction('directions')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                title="Get Directions"
              >
                <i className="fas fa-directions text-sm"></i>
              </button>
            </div>
          </div>
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
      
      {/* Location Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={locationData.image}
          alt={locationData.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            status.isOpen 
              ? 'bg-green-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          } backdrop-blur-lg`}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-green-200' : 'bg-red-200'} animate-pulse`}></div>
              <span>{status.status}</span>
            </div>
          </div>
        </div>

        {/* Location Type Badge */}
        <div className="absolute top-4 left-4">
          <div className={`bg-gradient-to-r ${typeStyle.bg} px-3 py-1 rounded-full text-white text-sm font-semibold backdrop-blur-lg`}>
            <i className={`${typeStyle.icon} mr-2`}></i>
            {locationData.type.charAt(0).toUpperCase() + locationData.type.slice(1)}
          </div>
        </div>

        {/* Main/Featured Badge */}
        {locationData.isMain && (
          <div className="absolute bottom-4 left-4">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 rounded-full text-white text-sm font-bold backdrop-blur-lg">
              <i className="fas fa-crown mr-2"></i>
              Main Office
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {locationData.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg flex items-center">
            <i className="fas fa-map-marker-alt mr-2 text-red-500"></i>
            {formatAddress(locationData.address)}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-white/10 backdrop-blur-lg rounded-2xl p-1">
          {[
            { id: 'info', label: 'Info', icon: 'fa-info-circle' },
            { id: 'hours', label: 'Hours', icon: 'fa-clock' },
            { id: 'contact', label: 'Contact', icon: 'fa-phone' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 flex items-center justify-center py-2 px-4 rounded-xl transition-all duration-200 ${
                activeSection === tab.id
                  ? 'bg-white/20 text-blue-600 dark:text-blue-400 shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <i className={`fas ${tab.icon} mr-2 text-sm`}></i>
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mb-6">
          
          {/* Info Tab */}
          {activeSection === 'info' && (
            <div className="animate-fade-in space-y-4">
              {/* Manager Info */}
              {locationData.manager && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <i className="fas fa-user-tie mr-2 text-blue-500"></i>
                    Location Manager
                  </h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {locationData.manager.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{locationData.manager.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{locationData.manager.title}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Amenities */}
              {locationData.amenities && locationData.amenities.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <i className="fas fa-star mr-2 text-yellow-500"></i>
                    Amenities & Services
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {locationData.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <i className="fas fa-check text-green-500 mr-2 text-xs"></i>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hours Tab */}
          {activeSection === 'hours' && (
            <div className="animate-fade-in">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <i className="fas fa-business-time mr-2 text-green-500"></i>
                Business Hours
              </h4>
              <div className="space-y-2">
                {Object.entries(locationData.hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center py-2 px-3 bg-white/10 backdrop-blur-lg rounded-xl">
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {day}
                    </span>
                    <span className={`text-sm ${
                      hours === 'Closed' 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {hours}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Next Status */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center text-blue-800 dark:text-blue-200">
                  <i className="fas fa-info-circle mr-2"></i>
                  <span className="text-sm">{status.nextOpen}</span>
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeSection === 'contact' && (
            <div className="animate-fade-in space-y-4">
              
              {/* Contact Methods */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleContactAction('phone', locationData.contact.phone)}
                  className="flex items-center justify-center p-3 bg-green-500/20 border border-green-300/50 rounded-2xl text-green-800 dark:text-green-200 hover:bg-green-500/30 transition-all duration-200 hover:scale-105"
                >
                  <i className="fas fa-phone mr-2"></i>
                  <span className="text-sm font-medium">Call</span>
                </button>
                
                <button
                  onClick={() => handleContactAction('email', locationData.contact.email)}
                  className="flex items-center justify-center p-3 bg-blue-500/20 border border-blue-300/50 rounded-2xl text-blue-800 dark:text-blue-200 hover:bg-blue-500/30 transition-all duration-200 hover:scale-105"
                >
                  <i className="fas fa-envelope mr-2"></i>
                  <span className="text-sm font-medium">Email</span>
                </button>
              </div>

              {/* Contact Details */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <i className="fas fa-phone w-5 text-green-500"></i>
                  <span className="ml-3 text-sm">{locationData.contact.phone}</span>
                </div>
                
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <i className="fas fa-envelope w-5 text-blue-500"></i>
                  <span className="ml-3 text-sm">{locationData.contact.email}</span>
                </div>
                
                {locationData.contact.fax && (
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <i className="fas fa-fax w-5 text-purple-500"></i>
                    <span className="ml-3 text-sm">{locationData.contact.fax}</span>
                  </div>
                )}
              </div>

              {/* Social Media */}
              {locationData.social && (
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">Follow Us</h5>
                  <div className="flex space-x-3">
                    {Object.entries(locationData.social).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110"
                      >
                        <i className={`fab fa-${platform}`}></i>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleContactAction('directions')}
            className="flex items-center justify-center py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <i className="fas fa-directions mr-2"></i>
            Get Directions
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center py-3 px-4 bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-semibold rounded-2xl hover:bg-white/30 transition-all duration-200 transform hover:scale-105"
          >
            <i className={`fas ${isExpanded ? 'fa-compress' : 'fa-expand'} mr-2`}></i>
            {isExpanded ? 'Less Info' : 'More Info'}
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-white/20 dark:border-gray-700/20 animate-fade-in">
            
            {/* Map Placeholder */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center mb-6">
              <i className="fas fa-map-marked-alt text-gray-400 text-4xl mb-4"></i>
              <h4 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">Interactive Map</h4>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Map integration coming soon...
              </p>
              <button
                onClick={() => handleContactAction('directions')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors text-sm"
              >
                Open in Google Maps
              </button>
            </div>

            {/* Additional Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Visit Information</h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <i className="fas fa-car w-5 text-blue-500"></i>
                  <span className="ml-3">Free parking available</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-wheelchair w-5 text-green-500"></i>
                  <span className="ml-3">Wheelchair accessible</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-wifi w-5 text-purple-500"></i>
                  <span className="ml-3">Free WiFi for visitors</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
    </div>
  );
};

export default OfficeLocationCard;
