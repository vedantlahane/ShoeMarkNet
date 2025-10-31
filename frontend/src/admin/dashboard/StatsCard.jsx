import React from 'react';
import { formatPercentage } from '../../utils/helpers';

const StatsCard = ({
  title,
  value,
  icon,
  change,
  badge,
  subtitle,
  urgent,
  animateStats,
  animationDelay,
  onClick,
  isActive
}) => {
  const hasChange = change !== undefined && change !== null;
  const isChangeNumeric = typeof change === 'number';
  const changePositive = isChangeNumeric ? change >= 0 : true;
  const formattedChange = hasChange
    ? isChangeNumeric
      ? `${changePositive ? '' : '-'}${formatPercentage(Math.abs(change))}`
      : change
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full border border-slate-200 px-3 py-2 text-left transition ${
        isActive
          ? 'border-blue-500 bg-slate-100/40 dark:border-blue-400 dark:bg-slate-800/40'
          : 'hover:border-blue-400 hover:bg-slate-100/40 dark:border-slate-700 dark:hover:border-blue-400 dark:hover:bg-slate-800/40'
      } ${animateStats ? 'animate-fade-in-up' : ''}`}
      style={{ animationDelay }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center border border-slate-300 text-[13px] text-slate-600 dark:border-slate-600 dark:text-slate-300">
            <i className={`fa-solid ${icon}`} />
          </span>
          <div className="space-y-1">
            {subtitle && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">{subtitle}</p>
            )}
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{value}</p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">{title}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {formattedChange && (
            <span className={`flex items-center gap-1 text-[11px] font-semibold ${changePositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              <i className={`fa-solid ${changePositive ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`} />
              {formattedChange}
            </span>
          )}
          {badge && (
            <span className="admin-badge">
              <i className={`fa-solid ${
                badge.type === 'success' ? 'fa-circle-check' :
                badge.type === 'warning' ? 'fa-triangle-exclamation' :
                badge.type === 'danger' ? 'fa-circle-xmark' :
                'fa-circle-info'
              }`} />
              {badge.text}
            </span>
          )}
          {urgent && (
            <span className="admin-badge border-rose-400 text-rose-500 dark:border-rose-500/60">
              <i className="fa-solid fa-circle-exclamation" />
              Urgent
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default StatsCard;
