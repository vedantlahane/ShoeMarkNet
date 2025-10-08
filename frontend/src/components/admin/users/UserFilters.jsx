import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const ToggleButton = ({ active, children, onClick, title }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 rounded-2xl border transition-all duration-200 flex items-center space-x-2 ${
      active
        ? 'border-blue-500 text-blue-600 bg-blue-500/10'
        : 'border-transparent hover:border-white/40 text-gray-600 dark:text-gray-300 hover:bg-white/10'
    }`}
    title={title}
  >
    {children}
  </button>
);

const SelectControl = ({ label, icon, value, options, onChange }) => (
  <label className="flex flex-col lg:flex-row lg:items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
    <span className="flex items-center gap-2 font-semibold">
      <i className={`fas ${icon}`}></i>
      {label}
    </span>
    <select
      value={value}
      onChange={onChange}
      className="bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const UserFilters = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  usersPerPage,
  onUsersPerPageChange,
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  dateRange,
  onDateRangeChange,
  leadScoreRange,
  onLeadScoreRangeChange,
  locationFilter,
  onLocationFilterChange,
  roleFilters,
  statusFilters,
  sortOptions,
  perPageOptions,
  animateCards = false,
  className = '',
  searchInputRef
}) => {
  const sortValue = useMemo(() => `${sortBy}-${sortOrder}`, [sortBy, sortOrder]);

  const handleSortChange = (event) => {
    const value = event.target.value;
    const [field, order] = value.split('-');
    onSortChange(field, order);
  };

  return (
    <section
      className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl p-6 space-y-6 transition-transform duration-300 ${
        animateCards ? 'animate-fade-in-up' : ''
      } ${className}`}
    >
      {/* Top row */}
      <div className="flex flex-col xl:flex-row xl:items-center gap-4 justify-between">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 min-w-[220px]">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              ref={searchInputRef}
              type="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search users by name, email, or ID..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <ToggleButton
              active={viewMode === 'cards'}
              onClick={() => onViewModeChange('cards')}
              title="Card view"
            >
              <i className="fas fa-th-large"></i>
              <span className="hidden sm:inline">Cards</span>
            </ToggleButton>
            <ToggleButton
              active={viewMode === 'table'}
              onClick={() => onViewModeChange('table')}
              title="Table view"
            >
              <i className="fas fa-table"></i>
              <span className="hidden sm:inline">Table</span>
            </ToggleButton>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <span>
            {selectedCount > 0
              ? `${selectedCount} selected`
              : `${totalCount} total users`
            }
          </span>
          {selectedCount > 0 && (
            <>
              <button
                type="button"
                onClick={onSelectAll}
                className="px-3 py-1 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 dark:border-gray-700/20"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={onClearSelection}
                className="px-3 py-1 rounded-2xl bg-transparent hover:bg-white/10 text-red-500"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SelectControl
          label="Role"
          icon="fa-user-tag"
          value={roleFilter}
          options={roleFilters}
          onChange={(e) => onRoleFilterChange(e.target.value)}
        />
        <SelectControl
          label="Status"
          icon="fa-user-check"
          value={statusFilter}
          options={statusFilters}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        />
        <SelectControl
          label="Sort"
          icon="fa-sort"
          value={sortValue}
          options={sortOptions}
          onChange={handleSortChange}
        />
        <SelectControl
          label="Per Page"
          icon="fa-layer-group"
          value={usersPerPage}
          options={perPageOptions.map(option => ({ value: option, label: option }))}
          onChange={(e) => onUsersPerPageChange(Number(e.target.value))}
        />
      </div>

      {/* Advanced filters */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="font-semibold flex items-center gap-2">
            <i className="fas fa-calendar"></i>
            Registered After
          </span>
          <input
            type="date"
            value={dateRange.start || ''}
            onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
            className="bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="font-semibold flex items-center gap-2">
            <i className="fas fa-calendar-day"></i>
            Registered Before
          </span>
          <input
            type="date"
            value={dateRange.end || ''}
            onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
            className="bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="font-semibold flex items-center gap-2">
            <i className="fas fa-bullseye"></i>
            Lead Score Range
          </span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={100}
              value={leadScoreRange.min}
              onChange={(e) => onLeadScoreRangeChange({ ...leadScoreRange, min: Number(e.target.value) })}
              className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400">to</span>
            <input
              type="number"
              min={0}
              max={100}
              value={leadScoreRange.max}
              onChange={(e) => onLeadScoreRangeChange({ ...leadScoreRange, max: Number(e.target.value) })}
              className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </label>
        <label className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="font-semibold flex items-center gap-2">
            <i className="fas fa-map-marker-alt"></i>
            Location
          </span>
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => onLocationFilterChange(e.target.value)}
            placeholder="City, state, or country"
            className="bg-white/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 rounded-2xl px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
      </div>
    </section>
  );
};

ToggleButton.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.node,
  onClick: PropTypes.func,
  title: PropTypes.string
};

SelectControl.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired
};

UserFilters.propTypes = {
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  roleFilter: PropTypes.string.isRequired,
  onRoleFilterChange: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  onStatusFilterChange: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
  viewMode: PropTypes.oneOf(['cards', 'table']).isRequired,
  onViewModeChange: PropTypes.func.isRequired,
  usersPerPage: PropTypes.number.isRequired,
  onUsersPerPageChange: PropTypes.func.isRequired,
  selectedCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func.isRequired,
  dateRange: PropTypes.shape({ start: PropTypes.string, end: PropTypes.string }).isRequired,
  onDateRangeChange: PropTypes.func.isRequired,
  leadScoreRange: PropTypes.shape({ min: PropTypes.number, max: PropTypes.number }).isRequired,
  onLeadScoreRangeChange: PropTypes.func.isRequired,
  locationFilter: PropTypes.string.isRequired,
  onLocationFilterChange: PropTypes.func.isRequired,
  roleFilters: PropTypes.array.isRequired,
  statusFilters: PropTypes.array.isRequired,
  sortOptions: PropTypes.array.isRequired,
  perPageOptions: PropTypes.array.isRequired,
  animateCards: PropTypes.bool,
  className: PropTypes.string,
  searchInputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ])
};

export default UserFilters;
