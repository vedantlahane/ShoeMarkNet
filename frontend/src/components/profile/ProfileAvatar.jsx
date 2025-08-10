import React, { useState } from 'react';

const ProfileAvatar = ({ user, size = 'medium', className = '' }) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-12 h-12 text-lg',
    large: 'w-20 h-20 text-2xl',
    xl: 'w-32 h-32 text-4xl'
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (user?.avatar && !imageError) {
    return (
      <img
        src={user.avatar}
        alt={`${user.name}'s profile`}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-lg ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-lg ${className}`}>
      {getInitials(user?.name)}
    </div>
  );
};

export default ProfileAvatar;
