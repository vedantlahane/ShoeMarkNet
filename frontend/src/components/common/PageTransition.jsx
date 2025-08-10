import React, { memo } from 'react';

const PageTransition = memo(({ isActive, duration, reducedMotion }) => {
  if (!isActive) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center transition-opacity"
      style={{ 
        animationDuration: reducedMotion ? '0ms' : `${duration}ms`,
        transitionDuration: reducedMotion ? '0ms' : `${duration}ms`
      }}
    >
      <div className="text-center text-white">
        <div className={`w-16 h-16 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4 ${
          !reducedMotion ? 'animate-spin' : ''
        }`}></div>
        <h3 className="text-xl font-bold">Loading...</h3>
        <p className="text-white/80 mt-2">Please wait</p>
      </div>
    </div>
  );
});

PageTransition.displayName = 'PageTransition';

export default PageTransition;
