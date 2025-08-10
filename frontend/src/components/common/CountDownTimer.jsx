import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ 
  targetDate, 
  title = "Time Remaining:",
  className = "",
  onExpire 
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const distance = target - now;

      if (distance < 0) {
        setIsExpired(true);
        setTimeLeft({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00'
        });
        
        if (onExpire && !isExpired) {
          onExpire();
        }
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [targetDate, onExpire, isExpired]);

  return (
    <div className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 ${className}`}>
      <h3 className="text-lg font-bold mb-4 text-center text-white flex items-center justify-center">
        <i className="fas fa-clock mr-2 text-yellow-400"></i>
        <i className="fas fa-bolt mr-2"></i>
        {isExpired ? 'Sale Ended!' : title}
      </h3>
      
      {!isExpired ? (
        <div className="grid grid-cols-4 gap-3 text-center">
          {Object.entries(timeLeft).map(([key, value]) => (
            <div key={key} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-3">
              <div className="text-2xl lg:text-3xl font-bold text-white">{value}</div>
              <div className="text-xs lg:text-sm text-blue-100 capitalize">
                {key === 'minutes' ? 'Min' : key === 'seconds' ? 'Sec' : key}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400 mb-2">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Expired
          </div>
          <p className="text-blue-100">Check back for new deals!</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(CountdownTimer);
