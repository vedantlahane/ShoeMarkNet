import React from 'react';

const ProfileCompleteness = ({ completeness, className = '' }) => {
  const getColor = () => {
    if (completeness < 50) return 'from-red-500 to-rose-500';
    if (completeness < 80) return 'from-yellow-500 to-orange-500';
    return 'from-sky-500 via-indigo-500 to-rose-500';
  };

  const getTextColor = () => {
    if (completeness < 50) return 'text-red-700 dark:text-red-300';
    if (completeness < 80) return 'text-yellow-700 dark:text-yellow-300';
    return 'text-sky-700 dark:text-sky-300';
  };

  const getMessage = () => {
    if (completeness < 50) return 'Your profile needs attention';
    if (completeness < 80) return 'You\'re almost there!';
    return 'Great! Your profile is complete';
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl shadow-slate-900/10 dark:shadow-slate-900/30 ${className}`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-indigo-500/5 to-rose-500/5" />
      
      <div className="relative p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Profile Completeness</h3>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm ${getTextColor()}`}>
            {completeness}% complete
          </span>
        </div>
        
        <div className="w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-4 mb-4 overflow-hidden backdrop-blur-sm">
          <div 
            className={`h-4 rounded-full bg-gradient-to-r ${getColor()} transition-all duration-700 ease-out shadow-lg`}
            style={{ width: `${completeness}%` }}
          />
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{getMessage()}</p>
        
        {completeness < 100 && (
          <div className="mt-4 p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/50 border border-sky-200/50 dark:border-sky-800/50 backdrop-blur-sm">
            <div className="flex items-center text-xs text-sky-700 dark:text-sky-300 font-medium">
              <div className="w-5 h-5 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full flex items-center justify-center mr-2">
                <i className="fas fa-lightbulb text-white text-xs"></i>
              </div>
              Complete your profile to get personalized recommendations and better service.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCompleteness;
