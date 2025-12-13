import React from 'react';
import PropTypes from 'prop-types';

const backgroundStyles = {
  gradient: 'bg-slate-50 dark:bg-slate-950',
  subtle: 'bg-white dark:bg-slate-950',
  plain: 'bg-white dark:bg-slate-950'
};

const PageLayout = ({
  title,
  eyebrow,
  description,
  actions,
  children,
  background = 'gradient',
  paddingY = 'py-6 md:py-8',
  headerSpacing = 'gap-2',
  className = '',
  innerClassName = '',
  headerClassName = '',
  afterHeader,
  breadcrumbs,
  footer
}) => {
  const backgroundClass = backgroundStyles[background] ?? backgroundStyles.gradient;

  return (
    <div className={`min-h-screen w-full ${backgroundClass} ${className}`}>
      {/* Use container-app to match Header and Footer width */}
      <div className={`container-app ${paddingY} ${innerClassName}`}>
        {(breadcrumbs || title || description || actions || afterHeader || eyebrow) && (
          <header className={`flex flex-col ${headerSpacing} md:flex-row md:items-start md:justify-between mb-6 ${headerClassName}`}>
            <div className="max-w-2xl space-y-1">
              {breadcrumbs}
              {eyebrow && (
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {description}
                </p>
              )}
              {afterHeader}
            </div>
            {actions && (
              <div className="w-full md:w-auto md:pl-6 flex-shrink-0 mt-3 md:mt-0">
                {typeof actions === 'function' ? actions() : actions}
              </div>
            )}
          </header>
        )}

        {children && (
          <div>
            {children}
          </div>
        )}

        {footer && (
          <footer className="mt-12 md:mt-16">
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
