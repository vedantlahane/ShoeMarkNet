import React from 'react';

const ContactMethodCard = ({ 
  method, 
  isActive, 
  onClick, 
  animateElements, 
  animationDelay 
}) => {
  return (
    <div
      className={`glass rounded-3xl p-6 text-center hover-lift transition-all duration-500 cursor-pointer group relative overflow-hidden border border-theme ${
        isActive ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-theme' : ''
      } ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}
      style={{ animationDelay: `${animationDelay}s` }}
      onClick={onClick}
    >
      {/* Background shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      
      <div className={`w-16 h-16 bg-gradient-to-r ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}>
        <i className={`fas ${method.icon} text-2xl text-theme`}></i>
        {method.available && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-theme"></div>
        )}
      </div>
      
  <h3 className="text-xl font-bold text-theme mb-2 relative z-10">{method.title}</h3>
  <p className="text-muted-theme text-sm mb-3 relative z-10">{method.description}</p>
  <p className="text-theme font-semibold mb-3 relative z-10">{method.contact}</p>
      <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-4 relative z-10">
        <i className="fas fa-clock mr-1"></i>
        {method.responseTime}
      </p>
      
      {/* Features */}
      <div className="space-y-1 relative z-10">
        {method.features.slice(0, 2).map((feature, index) => (
          <div key={index} className="text-xs text-muted-theme flex items-center justify-center">
            <i className="fas fa-check text-green-500 mr-1"></i>
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactMethodCard;
