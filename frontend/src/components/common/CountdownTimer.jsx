import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ 
  targetDate, 
  onComplete,
  className = '',
  showDays = true,
  showHours = true,
  showMinutes = true,
  showSeconds = true 
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        if (onComplete) onComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const formatNumber = (num) => num.toString().padStart(2, '0');

  return (
    <div className={`flex space-x-4 ${className}`}>
      {showDays && (
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {formatNumber(timeLeft.days)}
          </div>
          <div className="text-sm text-gray-600">Days</div>
        </div>
      )}
      
      {showHours && (
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {formatNumber(timeLeft.hours)}
          </div>
          <div className="text-sm text-gray-600">Hours</div>
        </div>
      )}
      
      {showMinutes && (
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {formatNumber(timeLeft.minutes)}
          </div>
          <div className="text-sm text-gray-600">Minutes</div>
        </div>
      )}
      
      {showSeconds && (
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {formatNumber(timeLeft.seconds)}
          </div>
          <div className="text-sm text-gray-600">Seconds</div>
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;
