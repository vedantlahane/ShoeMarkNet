import React, { memo } from 'react';

const BackgroundEffects = memo(({ routeConfig, reducedMotion, isVisible }) => {
  return (
    <div className={`fixed inset-0 bg-gradient-to-br transition-all duration-1000 ${routeConfig.background}`}>
      {/* Animated Background Elements */}
      {!reducedMotion && isVisible && (
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float opacity-20"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `linear-gradient(45deg, 
                  hsl(${Math.random() * 360}, 70%, 60%), 
                  hsl(${Math.random() * 360}, 70%, 80%))`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 20}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 dark:from-black/20 dark:via-transparent dark:to-black/40"></div>
    </div>
  );
});

BackgroundEffects.displayName = 'BackgroundEffects';

export default BackgroundEffects;
