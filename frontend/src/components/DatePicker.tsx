'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  X
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { 
  MONTH_NAMES_LOCALIZATION, 
  getLocalizedMonth, 
  getLocalizedWeekday, 
  formatDisplayDate 
} from '../lib/weatherConditions';

interface DatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: string; // default to today if not specified
  maxDate?: string;
  className?: string;
  hasError?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder,
  minDate,
  maxDate,
  className = '',
  hasError = false,
}) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Today in YYYY-MM-DD
  const todayStr = React.useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const effectiveMin = minDate !== undefined ? minDate : todayStr;

  // Internal view year and month (0-indexed)
  const [viewYear, setViewYear] = useState<number>(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) return parseInt(parts[0], 10);
    }
    return new Date().getFullYear();
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) return parseInt(parts[1], 10) - 1;
    }
    return new Date().getMonth();
  });

  // Sync view when value changes
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setViewYear(parseInt(parts[0], 10));
        setViewMonth(parseInt(parts[1], 10) - 1);
      }
    }
  }, [value]);

  // Click outside listener to close popover
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Select a specific day
  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const selected = `${viewYear}-${mm}-${dd}`;
    onChange(selected);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    onChange(todayStr);
    const d = new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  // Calendar grid calculation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Year options: current year - 1 to current year + 10
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 12 }, (_, i) => currentYear - 1 + i);

  // Weekday abbreviations
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button / Input */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition w-full sm:w-auto min-w-[140px] justify-between ${
          hasError
            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/50'
            : isOpen
            ? 'border-sky-500 bg-sky-50/40 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100 ring-1 ring-sky-500/50'
            : value
            ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 truncate">
          <CalendarIcon className={`w-3.5 h-3.5 shrink-0 ${value ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
          <span className="truncate">
            {value ? formatDisplayDate(value, language) : (placeholder || t.pers_select_date || 'Select Date')}
          </span>
        </div>

        {value ? (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            className="p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition shrink-0"
            title={t.date_clear || 'Clear'}
          >
            <X className="w-3 h-3" />
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">▼</span>
        )}
      </button>

      {/* Date Picker Popover */}
      {isOpen && (
        <div 
          role="dialog"
          aria-label={t.pers_select_date || 'Date Picker'}
          className="absolute z-50 mt-2 left-0 sm:left-auto sm:right-0 w-72 sm:w-80 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-1 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Month and Year Quick Selectors */}
            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {MONTH_NAMES_LOCALIZATION.map((_, idx) => (
                  <option key={idx} value={idx}>
                    {getLocalizedMonth(idx, language)}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer font-mono"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekdays.map((w, idx) => (
              <span key={idx} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1">
                {getLocalizedWeekday(w, language).slice(0, 3)}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Previous month filler days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const dayNum = daysInPrevMonth - firstDayIndex + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="p-2 text-xs text-slate-300 dark:text-slate-600 cursor-not-allowed select-none rounded-xl"
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const mm = String(viewMonth + 1).padStart(2, '0');
              const dd = String(day).padStart(2, '0');
              const dayIso = `${viewYear}-${mm}-${dd}`;

              const isPast = effectiveMin ? dayIso < effectiveMin : false;
              const isFutureBlocked = maxDate ? dayIso > maxDate : false;
              const isDisabled = isPast || isFutureBlocked;

              const isSelected = value === dayIso;
              const isToday = todayStr === dayIso;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(day)}
                  className={`p-2 text-xs font-semibold rounded-xl transition flex flex-col items-center justify-center relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black shadow-md shadow-sky-500/30 scale-105'
                      : isToday
                      ? 'border border-sky-500/80 text-sky-600 dark:text-sky-400 font-bold bg-sky-50/50 dark:bg-sky-950/30'
                      : isDisabled
                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed line-through opacity-40'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{day}</span>
                  {isToday && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-sky-500 absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Footer Action Buttons */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="px-2.5 py-1 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/50 text-sky-600 dark:text-sky-400 font-bold transition flex items-center gap-1"
            >
              <span>{t.date_today || 'Today'}</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-medium transition"
              >
                {t.date_clear || 'Clear'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
