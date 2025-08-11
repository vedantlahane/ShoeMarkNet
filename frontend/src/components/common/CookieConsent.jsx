import React, { useState } from 'react';
import { FaCheck, FaGift, FaCookieBite, FaTimes, FaCog } from 'react-icons/fa';

const CookieConsent = ({ 
  onAccept, 
  onDecline, 
  onCustomize,
  position = 'bottom',
  theme = 'light'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const handleAcceptAll = () => {
    setIsVisible(false);
    onAccept && onAccept('all');
  };

  const handleDecline = () => {
    setIsVisible(false);
    onDecline && onDecline();
  };

  const handleCustomize = () => {
    setShowDetails(!showDetails);
    onCustomize && onCustomize();
  };

  if (!isVisible) return null;

  const positionClasses = {
    bottom: 'fixed bottom-0 left-0 right-0',
    top: 'fixed top-0 left-0 right-0',
    'bottom-left': 'fixed bottom-4 left-4 max-w-sm',
    'bottom-right': 'fixed bottom-4 right-4 max-w-sm'
  };

  const themeClasses = {
    light: 'bg-white border-gray-200 text-gray-800',
    dark: 'bg-gray-800 border-gray-700 text-white'
  };

  return (
    <div className={`${positionClasses[position]} z-50 border-t border-gray-200 shadow-lg`}>
      <div className={`${themeClasses[theme]} p-4 md:p-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className={`p-2 rounded-full ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-900'}`}>
                <FaCookieBite className={`w-5 h-5 ${theme === 'light' ? 'text-blue-600' : 'text-blue-300'}`} />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  We use cookies to enhance your experience
                </h3>
                <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'} mb-4`}>
                  We use cookies to personalize content, provide social media features, 
                  and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                </p>

                {showDetails && (
                  <div className={`mb-4 p-3 rounded-lg ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'}`}>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Essential Cookies</span>
                        <span className={`px-2 py-1 rounded text-xs ${theme === 'light' ? 'bg-green-100 text-green-800' : 'bg-green-900 text-green-200'}`}>
                          Required
                        </span>
                      </div>
                      <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                        These cookies are necessary for the website to function properly.
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Analytics Cookies</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Marketing Cookies</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaCheck className="w-4 h-4 mr-2" />
                    Accept All
                  </button>
                  
                  <button
                    onClick={handleDecline}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      theme === 'light' 
                        ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                        : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Decline
                  </button>
                  
                  <button
                    onClick={handleCustomize}
                    className={`flex items-center px-4 py-2 transition-colors ${
                      theme === 'light' 
                        ? 'text-blue-600 hover:text-blue-700' 
                        : 'text-blue-400 hover:text-blue-300'
                    }`}
                  >
                    <FaCog className="w-4 h-4 mr-2" />
                    Customize
                  </button>
                </div>

                <p className={`text-xs mt-3 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Learn more in our{' '}
                  <a href="/privacy" className={`underline ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="/cookies" className={`underline ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
                    Cookie Policy
                  </a>
                </p>
              </div>
            </div>

            {position.includes('bottom') && (
              <button
                onClick={() => setIsVisible(false)}
                className={`ml-4 p-1 rounded-full transition-colors ${
                  theme === 'light' 
                    ? 'text-gray-400 hover:text-gray-600' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <FaTimes className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
