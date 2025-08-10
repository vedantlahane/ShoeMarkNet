import React from 'react';

const ProfileCompleteness = ({ completeness, className = '' }) => {
  const getColor = () => {
    if (completeness < 50) return 'from-red-500 to-red-600';
    if (completeness < 80) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  const getTextColor = () => {
    if (completeness < 50) return 'text-red-700';
    if (completeness < 80) return 'text-yellow-700';
    return 'text-green-700';
  };

  const getMessage = () => {
    if (completeness < 50) return 'Your profile needs attention';
    if (completeness < 80) return 'You\'re almost there!';
    return 'Great! Your profile is complete';
  };

  return (
    <div className={`bg-white shadow-sm rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Profile Completeness</h3>
        <span className={`text-sm font-medium ${getTextColor()}`}>
          {completeness}% complete
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div 
          className={`h-3 rounded-full bg-gradient-to-r ${getColor()} transition-all duration-500 ease-out`}
          style={{ width: `${completeness}%` }}
        />
      </div>
      
      <p className="text-sm text-gray-600">{getMessage()}</p>
      
      {completeness < 100 && (
        <div className="mt-3 text-xs text-gray-500">
          <i className="fas fa-lightbulb mr-1"></i>
          Complete your profile to get personalized recommendations and better service.
        </div>
      )}
    </div>
  );
};

export default ProfileCompleteness;
