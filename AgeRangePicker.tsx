import React, { useState, useCallback, useEffect } from 'react';

interface AgeRangePickerProps {
  minAge?: number;
  maxAge?: number;
  currentAge: number;
  retirementAge: number;
  onChange: (values: { currentAge: number; retirementAge: number }) => void;
}

const DEFAULT_MIN_AGE = 18;
const DEFAULT_MAX_AGE = 100;
const MIN_RANGE_GAP = 1;

/**
 * AgeRangePicker: A compact dual-thumb range slider for selecting current age and retirement age.
 * Features:
 * - Dual-thumb slider with visible handles
 * - Two numeric inputs for direct typing
 * - Enforces currentAge < retirementAge at all times
 * - Fully accessible with keyboard support
 * - Clean, compact Tailwind CSS styling
 */
export const AgeRangePicker: React.FC<AgeRangePickerProps> = ({
  minAge = DEFAULT_MIN_AGE,
  maxAge = DEFAULT_MAX_AGE,
  currentAge,
  retirementAge,
  onChange,
}) => {
  const [localCurrentAge, setLocalCurrentAge] = useState<string>(String(currentAge));
  const [localRetirementAge, setLocalRetirementAge] = useState<string>(String(retirementAge));

  // Sync local state when props change
  useEffect(() => {
    setLocalCurrentAge(String(currentAge));
  }, [currentAge]);

  useEffect(() => {
    setLocalRetirementAge(String(retirementAge));
  }, [retirementAge]);

  // Clamp value between min and max
  const clamp = useCallback((value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
  }, []);

  // Parse and validate numeric input
  const parseAndValidate = useCallback(
    (value: string, isCurrentAge: boolean): number => {
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) return isCurrentAge ? currentAge : retirementAge;

      const clamped = clamp(parsed, minAge, maxAge);

      // Enforce range constraint
      if (isCurrentAge) {
        // Current age must be less than retirement age
        if (clamped >= retirementAge) {
          return Math.max(retirementAge - MIN_RANGE_GAP, minAge);
        }
      } else {
        // Retirement age must be greater than current age
        if (clamped <= currentAge) {
          return Math.min(currentAge + MIN_RANGE_GAP, maxAge);
        }
      }

      return clamped;
    },
    [currentAge, retirementAge, minAge, maxAge, clamp]
  );

  // Handle numeric input blur for current age
  const handleCurrentAgeBlur = useCallback(() => {
    const validated = parseAndValidate(localCurrentAge, true);
    setLocalCurrentAge(String(validated));
    if (validated !== currentAge) {
      onChange({ currentAge: validated, retirementAge });
    }
  }, [localCurrentAge, currentAge, retirementAge, parseAndValidate, onChange]);

  // Handle numeric input blur for retirement age
  const handleRetirementAgeBlur = useCallback(() => {
    const validated = parseAndValidate(localRetirementAge, false);
    setLocalRetirementAge(String(validated));
    if (validated !== retirementAge) {
      onChange({ currentAge, retirementAge: validated });
    }
  }, [localRetirementAge, currentAge, retirementAge, parseAndValidate, onChange]);

  // Handle slider change for current age (left thumb)
  const handleCurrentAgeSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newCurrentAge = parseInt(e.target.value, 10);
      let newRetirementAge = retirementAge;

      // If current age meets or exceeds retirement age, adjust retirement age
      if (newCurrentAge >= retirementAge) {
        newRetirementAge = Math.min(newCurrentAge + MIN_RANGE_GAP, maxAge);
      }

      setLocalCurrentAge(String(newCurrentAge));
      setLocalRetirementAge(String(newRetirementAge));
      onChange({ currentAge: newCurrentAge, retirementAge: newRetirementAge });
    },
    [retirementAge, maxAge, onChange]
  );

  // Handle slider change for retirement age (right thumb)
  const handleRetirementAgeSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newRetirementAge = parseInt(e.target.value, 10);
      let newCurrentAge = currentAge;

      // If retirement age meets or goes below current age, adjust current age
      if (newRetirementAge <= currentAge) {
        newCurrentAge = Math.max(newRetirementAge - MIN_RANGE_GAP, minAge);
      }

      setLocalCurrentAge(String(newCurrentAge));
      setLocalRetirementAge(String(newRetirementAge));
      onChange({ currentAge: newCurrentAge, retirementAge: newRetirementAge });
    },
    [currentAge, minAge, onChange]
  );

  // Calculate percentage positions for visual styling
  const range = maxAge - minAge;
  const currentAgePercent = ((currentAge - minAge) / range) * 100;
  const retirementAgePercent = ((retirementAge - minAge) / range) * 100;
  const yearsToRetirement = retirementAge - currentAge;

  return (
    <div className="space-y-3">
      {/* Numeric Inputs */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current Age Input */}
        <div>
          <label htmlFor="currentAgeInput" className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
            Current Age
          </label>
          <input
            id="currentAgeInput"
            type="number"
            value={localCurrentAge}
            onChange={(e) => setLocalCurrentAge(e.target.value)}
            onBlur={handleCurrentAgeBlur}
            min={minAge}
            max={maxAge}
            className="w-full px-3 py-2.5 text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            aria-label="Current Age"
          />
        </div>

        {/* Retirement Age Input */}
        <div>
          <label htmlFor="retirementAgeInput" className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
            Retirement Age
          </label>
          <input
            id="retirementAgeInput"
            type="number"
            value={localRetirementAge}
            onChange={(e) => setLocalRetirementAge(e.target.value)}
            onBlur={handleRetirementAgeBlur}
            min={minAge}
            max={maxAge}
            className="w-full px-3 py-2.5 text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            aria-label="Retirement Age"
          />
        </div>
      </div>

      {/* Dual-Thumb Range Slider */}
      <div className="relative pt-4 pb-2">
        {/* Slider Container */}
        <div className="relative h-8 flex items-center slider-container">
          {/* Track Background */}
          <div className="absolute w-full h-2 bg-gray-300 rounded-full top-1/2 -translate-y-1/2 pointer-events-none" />

          {/* Filled Range (between two thumbs) */}
          <div
            className="absolute h-2 bg-blue-500 rounded-full top-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${currentAgePercent}%`,
              right: `${100 - retirementAgePercent}%`,
            }}
          />

          {/* Left Thumb (Current Age) - Range Input */}
          <input
            type="range"
            min={minAge}
            max={maxAge}
            value={currentAge}
            onChange={handleCurrentAgeSliderChange}
            className="slider-input slider-input-left absolute w-full h-full opacity-0"
            style={{ zIndex: currentAge > maxAge - 10 ? 5 : 3 }}
            aria-label="Current Age Slider"
          />

          {/* Right Thumb (Retirement Age) - Range Input */}
          <input
            type="range"
            min={minAge}
            max={maxAge}
            value={retirementAge}
            onChange={handleRetirementAgeSliderChange}
            className="slider-input slider-input-right absolute w-full h-full opacity-0"
            style={{ zIndex: retirementAge < minAge + 10 ? 5 : 4 }}
            aria-label="Retirement Age Slider"
          />

          {/* Left Thumb Visual */}
          <div
            className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md pointer-events-none top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{
              left: `${currentAgePercent}%`,
              zIndex: 10,
            }}
          />

          {/* Right Thumb Visual */}
          <div
            className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md pointer-events-none top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{
              left: `${retirementAgePercent}%`,
              zIndex: 10,
            }}
          />
        </div>
      </div>

      <style jsx>{`
        /* Hide default number input spinners/arrows */
        input[type='number']::-webkit-outer-spin-button,
        input[type='number']::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type='number'] {
          -moz-appearance: textfield;
        }

        /* Dual-thumb range slider styling */
        .slider-input {
          pointer-events: none;
        }

        /* Enable pointer events on the thumbs only */
        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          cursor: grab;
        }

        .slider-input::-moz-range-thumb {
          pointer-events: auto;
          cursor: grab;
        }

        .slider-input::-moz-range-thumb:active,
        .slider-input::-webkit-slider-thumb:active {
          cursor: grabbing;
        }

        /* Hide the track appearance for both webkit and moz */
        .slider-input::-webkit-slider-runnable-track {
          background: transparent;
          border: transparent;
          height: 0;
        }

        .slider-input::-moz-range-track {
          background: transparent;
          border: transparent;
        }

        .slider-input::-moz-range-progress {
          background: transparent;
          border: transparent;
        }
      `}</style>
    </div>
  );
};

export default AgeRangePicker;
