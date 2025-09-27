import React from 'react';
import PropTypes from 'prop-types';

const backgroundStyles = {
  gradient: 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950',
  subtle: 'bg-slate-50 dark:bg-slate-950',
  plain: ''
};

const PageLayout = ({
  title,
  eyebrow,
  description,
  actions,
  children,
  maxWidth = 'max-w-7xl',
  background = 'gradient',
  paddingY = 'py-12 md:py-16',
  headerSpacing = 'gap-4',
  className = '',
  innerClassName = '',
  headerClassName = '',
  afterHeader,
  breadcrumbs,
  footer
}) => {
  const backgroundClass = backgroundStyles[background] ?? backgroundStyles.gradient;

  return (
    <div className={`min-h-screen w-full ${backgroundClass} transition-colors duration-500 ${className}`}>
      <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${maxWidth} ${paddingY} ${innerClassName}`}>
        {(breadcrumbs || title || description || actions || afterHeader || eyebrow) && (
          <header className={`flex flex-col ${headerSpacing} md:flex-row md:items-start md:justify-between ${headerClassName}`}>
            <div className="max-w-3xl space-y-3">
              {breadcrumbs}
              {eyebrow && (
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  {description}
                </p>
              )}
              {afterHeader}
            </div>
            {actions && (
              <div className="w-full md:w-auto md:pl-8 flex-shrink-0">
                {typeof actions === 'function' ? actions() : actions}
              </div>
            )}
          </header>
        )}

        {children && (
          <div className="mt-10 md:mt-12">
            {children}
          </div>
        )}

        {footer && (
          <footer className="mt-16 md:mt-24">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

PageLayout.propTypes = {
  title: PropTypes.node,
  eyebrow: PropTypes.node,
  description: PropTypes.node,
  actions: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  children: PropTypes.node,
  maxWidth: PropTypes.string,
  background: PropTypes.oneOf(['gradient', 'subtle', 'plain']),
  paddingY: PropTypes.string,
  headerSpacing: PropTypes.string,
  className: PropTypes.string,
  innerClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  afterHeader: PropTypes.node,
  breadcrumbs: PropTypes.node,
  footer: PropTypes.node,
};

export default PageLayout;
