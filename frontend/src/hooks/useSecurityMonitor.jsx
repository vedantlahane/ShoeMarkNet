import { useState, useEffect, useCallback } from 'react';

const useSecurityMonitor = () => {
  const [securityScore, setSecurityScore] = useState(85);
  const [threats, setThreats] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isSecure, setIsSecure] = useState(true);

  const calculateSecurityScore = useCallback(() => {
    let score = 100;
    
    // Check HTTPS
    if (window.location.protocol !== 'https:') {
      score -= 20;
    }
    
    // Check for mixed content
    if (document.querySelectorAll('img[src^="http:"], script[src^="http:"]').length > 0) {
      score -= 10;
    }
    
    // Check session storage
    if (!localStorage.getItem('token')) {
      score -= 5;
    }
    
    return Math.max(0, score);
  }, []);

  const detectThreats = useCallback(() => {
    const detectedThreats = [];
    
    if (window.location.protocol !== 'https:') {
      detectedThreats.push({
        id: 'insecure-connection',
        severity: 'high',
        title: 'Insecure Connection',
        description: 'Connection is not using HTTPS encryption'
      });
    }
    
    return detectedThreats;
  }, []);

  useEffect(() => {
    const score = calculateSecurityScore();
    const threats = detectThreats();
    
    setSecurityScore(score);
    setThreats(threats);
    setIsSecure(score >= 80 && threats.length === 0);
    
    if (score < 80) {
      setRecommendations([
        'Enable HTTPS encryption',
        'Update security certificates',
        'Review access permissions'
      ]);
    }
  }, [calculateSecurityScore, detectThreats]);

  return {
    securityScore,
    threats,
    recommendations,
    isSecure
  };
};

export default useSecurityMonitor;
