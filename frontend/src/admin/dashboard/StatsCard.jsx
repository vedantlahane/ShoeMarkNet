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
      className={`group flex w-full flex-col gap-3 border-l-4 px-4 py-3 text-left transition ${
        isActive
          ? 'border-blue-500 bg-blue-50/60 dark:border-blue-500 dark:bg-blue-900/20'
          : 'border-slate-200 hover:border-blue-400 hover:bg-slate-100/60 dark:border-slate-700 dark:hover:border-blue-500 dark:hover:bg-slate-800/50'
      } ${animateStats ? 'animate-fade-in-up' : ''}`}
      style={{ animationDelay }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <i className={`fa-solid ${icon}`} />
          </span>
          <div className="space-y-1">
            {subtitle && (
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{subtitle}</p>
            )}
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {formattedChange && (
            <span className={`flex items-center gap-1 text-xs font-semibold ${changePositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              <i className={`fa-solid ${changePositive ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`} />
              {formattedChange}
            </span>
          )}
          {badge && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:border-slate-600 dark:text-slate-300">
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
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 px-2 py-0.5 text-[11px] font-semibold text-rose-500 dark:border-rose-500/50">
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
