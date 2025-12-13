import React, { useState } from 'react';
import { FaSliders } from 'react-icons/fa6';

const PriceRangeSlider = ({
  min = 0,
  max = 1000,
  value = [0, 1000],
  onChange,
  step = 10,
  formatValue = (val) => `$${val}`,
  className = ""
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  const handleMinChange = (e) => {
    const newMin = Math.min(Number(e.target.value), localValue[1] - step);
    const newValue = [newMin, localValue[1]];
    setLocalValue(newValue);
    onChange && onChange(newValue);
  };

  const handleMaxChange = (e) => {
    const newMax = Math.max(Number(e.target.value), localValue[0] + step);
    const newValue = [localValue[0], newMax];
    setLocalValue(newValue);
    onChange && onChange(newValue);
  };

  const getPercent = (value, min, max) => {
    return ((value - min) / (max - min)) * 100;
  };

  const minPercent = getPercent(localValue[0], min, max);
  const maxPercent = getPercent(localValue[1], min, max);

  return (
    <div className={`price-range-slider ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center text-sm font-medium text-gray-700">
          <FaSliders className="mr-2" />
          Price Range
        </label>
        <div className="text-sm text-gray-600">
          {formatValue(localValue[0])} - {formatValue(localValue[1])}
        </div>
      </div>

      <div className="relative mb-6">
        {/* Track */}
        <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-2 bg-gray-200 rounded-full">
          {/* Active range */}
          <div
            className="absolute h-full bg-blue-600 rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`
            }}
          />
        </div>

        {/* Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
          style={{ zIndex: 1 }}
        />

        {/* Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
          style={{ zIndex: 2 }}
        />

        {/* Min value indicator */}
        <div
          className="absolute top-6 transform -translate-x-1/2 text-xs text-gray-600"
          style={{ left: `${minPercent}%` }}
        >
          {formatValue(localValue[0])}
        </div>

        {/* Max value indicator */}
        <div
          className="absolute top-6 transform -translate-x-1/2 text-xs text-gray-600"
          style={{ left: `${maxPercent}%` }}
        >
          {formatValue(localValue[1])}
        </div>
      </div>

      {/* Input fields */}
      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Min</label>
          <input
            type="number"
            min={min}
            max={localValue[1] - step}
            step={step}
            value={localValue[0]}
            onChange={(e) => {
              const newMin = Math.max(min, Math.min(Number(e.target.value), localValue[1] - step));
              const newValue = [newMin, localValue[1]];
              setLocalValue(newValue);
              onChange && onChange(newValue);
            }}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <div className="text-gray-400">-</div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Max</label>
          <input
            type="number"
            min={localValue[0] + step}
            max={max}
            step={step}
            value={localValue[1]}
            onChange={(e) => {
              const newMax = Math.min(max, Math.max(Number(e.target.value), localValue[0] + step));
              const newValue = [localValue[0], newMax];
              setLocalValue(newValue);
              onChange && onChange(newValue);
            }}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

    </div>
  );
};

export default PriceRangeSlider;
