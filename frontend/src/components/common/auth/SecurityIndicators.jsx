import React from 'react';

const SecurityIndicators = ({ 
  user, 
  securityScore, 
  isConnected, 
  connectionQuality, 
  threats, 
  deviceFingerprint,
  suspiciousActivity 
}) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConnectionColor = (quality) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      default: return 'text-red-500';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-30 space-y-2">
      {/* Security Score */}
      <div 
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-3 py-2 shadow-lg"
        title={`Security Score: ${securityScore}/100`}
      >
        <div className="flex items-center space-x-2 text-xs">
          <i className={`fas fa-shield-alt ${getScoreColor(securityScore)}`}></i>
          <span className="text-gray-900 dark:text-white font-medium">{securityScore}</span>
        </div>
      </div>

      {/* Connection Status */}
      <div 
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-3 py-2 shadow-lg"
        title={`Connection: ${isConnected ? 'Connected' : 'Disconnected'} (${connectionQuality})`}
      >
        <div className="flex items-center space-x-2 text-xs">
          <i className={`fas fa-wifi ${isConnected ? 'text-green-500' : 'text-red-500'}`}></i>
          <span className={`${getConnectionColor(connectionQuality)}`}>
            {connectionQuality?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Threat Indicator */}
      {threats.length > 0 && (
        <div 
          className="bg-red-500/20 backdrop-blur-lg border border-red-300/50 rounded-lg px-3 py-2 shadow-lg animate-pulse"
          title={`${threats.length} security threats detected`}
        >
          <div className="flex items-center space-x-2 text-xs">
            <i className="fas fa-exclamation-triangle text-red-500"></i>
            <span className="text-red-800 dark:text-red-200 font-medium">{threats.length}</span>
          </div>
        </div>
      )}

      {/* Suspicious Activity Indicator */}
      {suspiciousActivity && (
        <div 
          className="bg-yellow-500/20 backdrop-blur-lg border border-yellow-300/50 rounded-lg px-3 py-2 shadow-lg animate-pulse"
          title="Suspicious activity detected"
        >
          <div className="flex items-center space-x-2 text-xs">
            <i className="fas fa-eye text-yellow-500"></i>
            <span className="text-yellow-800 dark:text-yellow-200 font-medium">ALERT</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityIndicators;
