import React from 'react';

const SocialLink = ({ icon, href }) => {
  const apiBaseUrl = import.meta.env.MODE === 'production' 
    ? import.meta.env.VITE_API_URL_PROD 
    : import.meta.env.VITE_API_URL_DEV;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <img
        src={`${apiBaseUrl}/${icon}`} 
        alt="icon/social"
        className="w-8 h-8 flex items-center cursor-pointer md:w-6 md:h-6 sm:w-5 sm:h-5 transition-all duration-200 hover:scale-110"
      />
    </a>
  );
};

export default SocialLink;