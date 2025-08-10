import React from 'react';

const SocialLoginButton = ({ 
  provider, 
  onClick, 
  disabled = false, 
  className = '',
  children 
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(provider)}
      disabled={disabled}
      className={className}
      aria-label={`Sign in with ${provider}`}
    >
      {children}
    </button>
  );
};

export default SocialLoginButton;
