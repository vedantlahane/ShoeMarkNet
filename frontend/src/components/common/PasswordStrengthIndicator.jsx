import React, { useMemo } from 'react';

const PasswordStrengthIndicator = ({ password, className = '' }) => {
  const strength = useMemo(() => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    
    score = Object.values(checks).reduce((acc, passed) => acc + (passed ? 1 : 0), 0);
    
    let level = 'weak';
    let color = 'red';
    
    if (score >= 4) {
      level = 'strong';
      color = 'green';
    } else if (score >= 3) {
      level = 'medium';
      color = 'yellow';
    }
    
    return { score, level, color, checks };
  }, [password]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength bar */}
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              level <= strength.score
                ? `bg-${strength.color}-400`
                : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
      
      {/* Strength label */}
      <div className="flex justify-between items-center text-xs">
        <span className={`text-${strength.color}-400 font-medium capitalize`}>
          {strength.level} ({strength.score}/5)
        </span>
        <span className="text-blue-200">Password strength</span>
      </div>
      
      {/* Requirements */}
      {password && (
        <div className="grid grid-cols-2 gap-1 text-xs">
          {Object.entries(strength.checks).map(([key, passed]) => (
            <div
              key={key}
              className={`flex items-center space-x-1 ${
                passed ? 'text-green-400' : 'text-gray-400'
              }`}
            >
              <i className={`fas ${passed ? 'fa-check' : 'fa-times'} text-xs`}></i>
              <span className="capitalize">
                {key === 'length' ? '8+ chars' : key}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
