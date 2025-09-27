import React from 'react';
import PropTypes from 'prop-types';

const GlassPanel = ({
  as: Component = 'section',
  children,
  padding = 'p-6',
  className = '',
  hover = true,
  border = true,
  highlight = false,
  ...rest
}) => {
  const hoverClasses = hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-20px_rgba(30,64,175,0.45)]' : '';
  const borderClasses = border ? 'border border-white/40 dark:border-slate-700/50' : '';
  const backgroundClasses = highlight
    ? 'bg-gradient-to-r from-white/75 via-white/55 to-white/40 dark:from-slate-900/70 dark:via-slate-900/60 dark:to-slate-900/40'
    : 'bg-white/70 dark:bg-slate-900/60';

  return (
    <Component
      className={`relative rounded-3xl backdrop-blur-xl shadow-[0_25px_50px_-20px_rgba(30,41,59,0.65)] ${backgroundClasses} ${borderClasses} ${hoverClasses} ${padding} ${className}`.trim()}
      {...rest}
    >
  {children}
  <div className="pointer-events-none absolute inset-px rounded-[calc(1.5rem-1px)] border border-white/40 dark:border-white/5 opacity-40" aria-hidden />
    </Component>
  );
};

GlassPanel.propTypes = {
  as: PropTypes.elementType,
  children: PropTypes.node,
  padding: PropTypes.string,
  className: PropTypes.string,
  hover: PropTypes.bool,
  border: PropTypes.bool,
  highlight: PropTypes.bool,
};

export default GlassPanel;
