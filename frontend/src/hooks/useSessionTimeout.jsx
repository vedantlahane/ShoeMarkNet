import { useState, useEffect, useCallback } from 'react';

const useSessionTimeout = (sessionExpiry, warningTime = 5 * 60 * 1000) => {
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    if (!sessionExpiry) return 0;
    const now = new Date().getTime();
    const expiry = new Date(sessionExpiry).getTime();
    return Math.max(0, expiry - now);
  }, [sessionExpiry]);

  const extendSession = useCallback(() => {
    const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return Promise.resolve(newExpiry);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const timeLeft = calculateTimeLeft();
      setTimeUntilExpiry(timeLeft);
      
      if (timeLeft <= 0) {
        setIsExpired(true);
        setShowWarning(false);
      } else if (timeLeft <= warningTime) {
        setShowWarning(true);
        setIsExpired(false);
      } else {
        setShowWarning(false);
        setIsExpired(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft, warningTime]);

  return {
    timeUntilExpiry,
    showWarning,
    isExpired,
    extendSession
  };
};

export default useSessionTimeout;
