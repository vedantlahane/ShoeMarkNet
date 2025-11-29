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
  const hoverClasses = hover ? 'transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg' : '';
  const borderClasses = border ? 'border border-slate-200/70 dark:border-slate-700/60' : '';
  const backgroundClasses = highlight
    ? 'bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900'
    : 'bg-white dark:bg-slate-900';

  const baseClasses = 'relative rounded-2xl shadow-md dark:shadow-none text-slate-900 dark:text-slate-100';

  return (
    <Component
      className={`${baseClasses} ${backgroundClasses} ${borderClasses} ${hoverClasses} ${padding} ${className}`.trim()}
      {...rest}
    >
      {children}
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
