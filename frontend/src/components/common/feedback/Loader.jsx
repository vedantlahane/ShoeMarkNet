import React, { useState, useEffect, useMemo, useCallback, forwardRef } from 'react';
import { useSelector } from 'react-redux';

// Hooks
import useLocalStorage from '../../../hooks/useLocalStorage';

// Utils
import { trackEvent } from '../../../utils/analytics';

// Constants
const LOADER_TYPES = {
  SPINNER: 'spinner',
  DOTS: 'dots',
  PULSE: 'pulse',
  BARS: 'bars',
  RING: 'ring',
  WAVE: 'wave',
  SKELETON: 'skeleton',
  PROGRESS: 'progress'
};

const SIZES = {
  small: { container: 'h-32', spinner: 'h-6 w-6', text: 'text-sm' },
  medium: { container: 'h-48', spinner: 'h-8 w-8', text: 'text-base' },
  large: { container: 'h-64', spinner: 'h-12 w-12', text: 'text-lg' },
  'extra-large': { container: 'h-96', spinner: 'h-16 w-16', text: 'text-xl' },
  fullscreen: { container: 'min-h-screen', spinner: 'h-20 w-20', text: 'text-2xl' }
};

const THEMES = {
  primary: 'border-blue-500 text-blue-500',
  secondary: 'border-purple-500 text-purple-500',
  success: 'border-green-500 text-green-500',
  warning: 'border-yellow-500 text-yellow-500',
  danger: 'border-red-500 text-red-500',
  info: 'border-cyan-500 text-cyan-500',
  gradient: 'border-gradient-to-r from-blue-500 to-purple-500'
};

const LOADING_MESSAGES = [
  'Loading awesome content...',
  'Preparing your experience...',
  'Almost ready...',
  'Getting things ready...',
  'Loading premium content...',
  'Fetching data...',
  'Processing request...',
  'Initializing...',
  'Please wait...',
  'Loading...'
];

const Loader = forwardRef(({
  type = LOADER_TYPES.SPINNER,
  size = 'medium',
  theme = 'primary',
  message = '',
  submessage = '',
  showProgress = false,
  progress = 0,
  duration = null,
  overlay = false,
  blur = false,
  center = true,
  fullscreen = false,
  showIcon = true,
  showMessage = true,
  showElapsedTime = false,
  animate = true,
  onComplete = null,
  className = '',
  style = {},
  'data-testid': testId = 'loader',
  // Advanced props
  randomMessage = false,
  messageRotation = false,
  messageInterval = 3000,
  showTips = false,
  tips = [],
  showStats = false,
  customSpinner = null,
  pulseOnLoad = true,
  reduceMotion = false,
  highContrast = false
}, ref) => {
  // Redux state
  const { loading: globalLoading, loadingMessage } = useSelector(state => state.ui || {});
  const { user } = useSelector(state => state.auth || {});

  // Hooks
  const [reducedMotionPreference] = useLocalStorage('prefersReducedMotion', false);

  // Local state
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentTip, setCurrentTip] = useState(0);
  const [animationPhase, setAnimationPhase] = useState('enter');
  const [messageIndex, setMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [loadingStats, setLoadingStats] = useState({
    startTime: Date.now(),
    dataLoaded: 0,
    totalData: 100
  });

  // Determine actual motion preference
  const shouldReduceMotion = reduceMotion || reducedMotionPreference;

  // Size configuration
  const sizeConfig = useMemo(() => {
    if (fullscreen) return SIZES.fullscreen;
    return SIZES[size] || SIZES.medium;
  }, [size, fullscreen]);

  // Theme configuration
  const themeConfig = useMemo(() => {
    return THEMES[theme] || THEMES.primary;
  }, [theme]);

  // Determine message to display
  const displayMessage = useMemo(() => {
    if (message) return message;
    if (globalLoading && loadingMessage) return loadingMessage;
    if (randomMessage) return LOADING_MESSAGES[messageIndex];
    return currentMessage || 'Loading...';
  }, [message, globalLoading, loadingMessage, randomMessage, messageIndex, currentMessage]);

  // Initialize component
  useEffect(() => {
    setIsVisible(true);
    
    // Set initial message
    if (!message && !globalLoading) {
      setCurrentMessage(LOADING_MESSAGES[0]);
    }
    
    // Track loading event
    trackEvent('loader_displayed', {
      type,
      size,
      theme,
      has_message: !!displayMessage,
      user_authenticated: !!user,
      timestamp: new Date().toISOString()
    });

    // Pulse effect on load
    if (pulseOnLoad && !shouldReduceMotion) {
      setAnimationPhase('pulse');
      setTimeout(() => setAnimationPhase('spin'), 500);
    }
  }, [type, size, theme, displayMessage, user, pulseOnLoad, shouldReduceMotion, message, globalLoading]);

  // Elapsed time counter
  useEffect(() => {
    if (!showElapsedTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [showElapsedTime, startTime]);

  // Message rotation
  useEffect(() => {
    if (!messageRotation && !randomMessage) return;

    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, messageInterval);

    return () => clearInterval(interval);
  }, [messageRotation, randomMessage, messageInterval]);

  // Tips rotation
  useEffect(() => {
    if (!showTips || !tips.length) return;

    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [showTips, tips]);

  // Progress completion
  useEffect(() => {
    if (showProgress && progress >= 100 && onComplete) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [showProgress, progress, onComplete]);

  // Format elapsed time
  const formatElapsedTime = useCallback((time) => {
    const seconds = Math.floor(time / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  }, []);

  // Render different loader types
  const renderLoader = useCallback(() => {
    const baseClasses = `${sizeConfig.spinner} ${themeConfig}`;
    const animationClasses = shouldReduceMotion ? '' : 'transition-all duration-500';

    if (customSpinner) {
      return customSpinner;
    }

    switch (type) {
      case LOADER_TYPES.SPINNER:
        return (
          <div className={`${baseClasses} ${animationClasses} ${
            shouldReduceMotion ? '' : 'animate-spin'
          } rounded-full border-2 border-transparent border-t-current border-r-current`}>
          </div>
        );

      case LOADER_TYPES.DOTS:
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full bg-current ${
                  shouldReduceMotion ? '' : 'animate-bounce'
                }`}
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        );

      case LOADER_TYPES.PULSE:
        return (
          <div className={`${baseClasses} ${
            shouldReduceMotion ? '' : 'animate-pulse'
          } rounded-full bg-current opacity-75`}>
          </div>
        );

      case LOADER_TYPES.BARS:
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-1 bg-current ${
                  shouldReduceMotion ? 'h-8' : 'animate-pulse'
                }`}
                style={{
                  height: shouldReduceMotion ? '32px' : `${20 + Math.sin(Date.now() / 200 + i) * 12}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        );

      case LOADER_TYPES.RING:
        return (
          <div className="relative">
            <div className={`${baseClasses} rounded-full border-2 border-gray-200 dark:border-gray-700`}></div>
            <div className={`absolute top-0 left-0 ${baseClasses} ${
              shouldReduceMotion ? '' : 'animate-spin'
            } rounded-full border-2 border-transparent border-t-current`}></div>
          </div>
        );

      case LOADER_TYPES.WAVE:
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2 h-8 bg-current ${
                  shouldReduceMotion ? '' : 'animate-pulse'
                }`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  transform: shouldReduceMotion ? 'none' : `scaleY(${0.5 + Math.sin(Date.now() / 300 + i) * 0.5})`
                }}
              ></div>
            ))}
          </div>
        );

      case LOADER_TYPES.SKELETON:
        return (
          <div className="space-y-4 w-full max-w-md">
            <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
              shouldReduceMotion ? '' : 'animate-pulse'
            }`}></div>
            <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 ${
              shouldReduceMotion ? '' : 'animate-pulse'
            }`}></div>
            <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 ${
              shouldReduceMotion ? '' : 'animate-pulse'
            }`}></div>
          </div>
        );

      case LOADER_TYPES.PROGRESS:
        return (
          <div className="w-full max-w-md">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 ${
                  shouldReduceMotion ? '' : 'transition-all duration-300'
                }`}
                style={{ width: `${Math.max(progress, 5)}%` }}
              ></div>
            </div>
            {showProgress && (
              <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                {Math.round(progress)}%
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className={`${baseClasses} ${
            shouldReduceMotion ? '' : 'animate-spin'
          } rounded-full border-2 border-transparent border-t-current`}>
          </div>
        );
    }
  }, [type, sizeConfig, themeConfig, shouldReduceMotion, customSpinner, progress, showProgress]);

  // Container classes
  const containerClasses = useMemo(() => {
    const base = center ? 'flex flex-col justify-center items-center' : '';
    const height = sizeConfig.container;
    const spacing = showMessage || submessage ? 'space-y-4' : '';
    const background = overlay 
      ? 'fixed inset-0 bg-black/50 z-50' 
      : fullscreen 
        ? 'min-h-screen' 
        : height;
    const blurEffect = blur ? 'backdrop-blur-sm' : '';
    const visibility = isVisible ? 'opacity-100' : 'opacity-0';
    const transition = shouldReduceMotion ? '' : 'transition-opacity duration-500';
    
    return `${base} ${background} ${spacing} ${blurEffect} ${visibility} ${transition} ${className}`;
  }, [
    center, 
    sizeConfig.container, 
    showMessage, 
    submessage, 
    overlay, 
    fullscreen, 
    blur, 
    isVisible, 
    shouldReduceMotion, 
    className
  ]);

  return (
    <div 
      ref={ref}
      className={containerClasses}
      style={style}
      data-testid={testId}
      role="status"
      aria-live="polite"
      aria-label={displayMessage}
    >
      
      {/* Main Content Container */}
      <div className={`${
        overlay || fullscreen 
          ? 'bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl' 
          : ''
      } text-center max-w-md`}>
        
        {/* Loading Icon */}
        {showIcon && (
          <div className="mb-6">
            {renderLoader()}
          </div>
        )}

        {/* Main Message */}
        {showMessage && displayMessage && (
          <div className="mb-4">
            <h3 className={`font-semibold text-gray-900 dark:text-white ${sizeConfig.text} ${
              shouldReduceMotion ? '' : 'animate-fade-in'
            }`}>
              {displayMessage}
            </h3>
          </div>
        )}

        {/* Submessage */}
        {submessage && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {submessage}
            </p>
          </div>
        )}

        {/* Progress Bar (when not using progress loader type) */}
        {showProgress && type !== LOADER_TYPES.PROGRESS && (
          <div className="mb-4 w-full max-w-xs mx-auto">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div 
                className={`h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 ${
                  shouldReduceMotion ? '' : 'transition-all duration-300'
                }`}
                style={{ width: `${Math.max(progress, 2)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {Math.round(progress)}% complete
            </div>
          </div>
        )}

        {/* Elapsed Time */}
        {showElapsedTime && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <i className="fas fa-clock mr-2"></i>
              {formatElapsedTime(elapsedTime)}
            </p>
          </div>
        )}

        {/* Loading Tips */}
        {showTips && tips.length > 0 && (
          <div className="mb-4">
            <div className={`bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-2xl p-4 ${
              shouldReduceMotion ? '' : 'animate-fade-in'
            }`}>
              <div className="flex items-start space-x-2">
                <i className="fas fa-lightbulb text-blue-500 mt-0.5"></i>
                <div className="flex-1">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Tip:</strong> {tips[currentTip]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Stats */}
        {showStats && (
          <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">
                {Math.round(loadingStats.dataLoaded)}%
              </div>
              <div>Data Loaded</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatElapsedTime(elapsedTime)}
              </div>
              <div>Time Elapsed</div>
            </div>
          </div>
        )}

        {/* High Contrast Indicator */}
        {highContrast && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-black dark:bg-white rounded-full border-2 border-white dark:border-black"></div>
          </div>
        )}
      </div>

      {/* Screen Reader Content */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {displayMessage}
        {showProgress && ` ${Math.round(progress)}% complete`}
        {showElapsedTime && ` (${formatElapsedTime(elapsedTime)} elapsed)`}
      </div>

      {/* Enhanced Custom Styles */}
    </div>
  );
});

Loader.displayName = 'Loader';

// Enhanced LoadingSpinner component for backward compatibility
export const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  message = '',
  className = '' 
}) => {
  return (
    <Loader
      type={LOADER_TYPES.SPINNER}
      size={size}
      theme={color}
      message={message}
      className={className}
      showMessage={!!message}
    />
  );
};

// Specialized loader components
export const SkeletonLoader = ({ className = '' }) => (
  <Loader type={LOADER_TYPES.SKELETON} showIcon={false} showMessage={false} className={className} />
);

export const ProgressLoader = ({ progress = 0, message = '', className = '' }) => (
  <Loader 
    type={LOADER_TYPES.PROGRESS} 
    progress={progress} 
    message={message}
    showProgress={true}
    className={className}
  />
);

export const FullscreenLoader = ({ message = 'Loading...', submessage = '', tips = [] }) => (
  <Loader
    type={LOADER_TYPES.SPINNER}
    size="large"
    message={message}
    submessage={submessage}
    tips={tips}
    showTips={tips.length > 0}
    fullscreen={true}
    overlay={true}
    blur={true}
    showElapsedTime={true}
    showStats={true}
  />
);

export const DotLoader = ({ size = 'medium', theme = 'primary', className = '' }) => (
  <Loader type={LOADER_TYPES.DOTS} size={size} theme={theme} className={className} />
);

export const PulseLoader = ({ size = 'medium', theme = 'primary', className = '' }) => (
  <Loader type={LOADER_TYPES.PULSE} size={size} theme={theme} className={className} />
);

// Export constants for external use
export { LOADER_TYPES, SIZES, THEMES };

export default Loader;
