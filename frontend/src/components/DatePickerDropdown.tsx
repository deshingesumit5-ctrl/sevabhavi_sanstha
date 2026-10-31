import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface DatePickerDropdownProps {
  name?: string;
  value: string; // ISO format "YYYY-MM-DD" or ""
  onChange: (e: { target: { name: string; value: string } }) => void;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
}

const MARATHI_MONTHS = [
  { value: '01', label: 'जानेवारी' },
  { value: '02', label: 'फेब्रुवारी' },
  { value: '03', label: 'मार्च' },
  { value: '04', label: 'एप्रिल' },
  { value: '05', label: 'मे' },
  { value: '06', label: 'जून' },
  { value: '07', label: 'जुलै' },
  { value: '08', label: 'ऑगस्ट' },
  { value: '09', label: 'सप्टेंबर' },
  { value: '10', label: 'ऑक्टोबर' },
  { value: '11', label: 'नोव्हेंबर' },
  { value: '12', label: 'डिसेंबर' },
];

export const formatBirthDate = (iso: string): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const month = MARATHI_MONTHS.find((x) => x.value === m)?.label;
  return y && m && d && month ? `${d} ${month} ${y}` : iso;
};

export const DatePickerDropdown: React.FC<DatePickerDropdownProps> = ({
  name = 'birthDate',
  value,
  onChange,
  hasError = false,
  disabled = false,
  className = '',
}) => {
  const parseValue = (v: string): [string, string, string] => {
    if (!v || typeof v !== 'string') return ['', '', ''];
    const parts = v.split('-');
    if (parts.length === 3) return [parts[0] || '', parts[1] || '', parts[2] || ''];
    return ['', '', ''];
  };

  // Local state keeps partial selections (e.g. only day chosen) alive
  const [selectedYear, setSelectedYear] = useState<string>(() => parseValue(value)[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => parseValue(value)[1]);
  const [selectedDay, setSelectedDay] = useState<string>(() => parseValue(value)[2]);

  // Sync from parent only when it holds a full date (draft load) or is cleared after a full date (form reset)
  useEffect(() => {
    if (value) {
      const [y, m, d] = parseValue(value);
      setSelectedYear(y);
      setSelectedMonth(m);
      setSelectedDay(d);
    } else if (selectedYear && selectedMonth && selectedDay) {
      setSelectedYear('');
      setSelectedMonth('');
      setSelectedDay('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  // Compute number of days in the selected month & year (accounting for leap years)
  const daysInMonth = useMemo(() => {
    if (!selectedMonth) return 31;
    const m = parseInt(selectedMonth, 10);
    if ([4, 6, 9, 11].includes(m)) {
      return 30;
    }
    if (m === 2) {
      if (selectedYear) {
        const y = parseInt(selectedYear, 10);
        const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
        return isLeap ? 29 : 28;
      }
      return 29;
    }
    return 31;
  }, [selectedMonth, selectedYear]);

  // Generate Year options: 2026 down to 1940
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = 2026; y >= 1940; y--) {
      years.push(y);
    }
    return years;
  }, []);

  const triggerChange = (newYear: string, newMonth: string, newDay: string) => {
    let finalDay = newDay;

    // Validate day against month/year
    if (newMonth && finalDay) {
      const m = parseInt(newMonth, 10);
      let maxD = 31;
      if ([4, 6, 9, 11].includes(m)) {
        maxD = 30;
      } else if (m === 2) {
        if (newYear) {
          const y = parseInt(newYear, 10);
          const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
          maxD = isLeap ? 29 : 28;
        } else {
          maxD = 29;
        }
      }
      if (parseInt(finalDay, 10) > maxD) {
        finalDay = '';
      }
    }

    // Remember the partial selection locally
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    setSelectedDay(finalDay);

    // Only emit ISO string if all 3 parts are present
    const isoString = newYear && newMonth && finalDay ? `${newYear}-${newMonth}-${finalDay}` : '';
    onChange({ target: { name, value: isoString } });
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const d = e.target.value;
    triggerChange(selectedYear, selectedMonth, d);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = e.target.value;
    triggerChange(selectedYear, m, selectedDay);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const y = e.target.value;
    triggerChange(y, selectedMonth, selectedDay);
  };

  const borderClass = hasError
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron';

  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {/* 1. दिवस (Day: 1 to daysInMonth) */}
      <div className="relative">
        <select
          value={selectedDay}
          onChange={handleDayChange}
          disabled={disabled}
          className={`w-full appearance-none px-3 py-2.5 rounded-card border text-sm outline-none bg-white transition-all pr-8 ${borderClass}`}
        >
          <option value="">दिवस</option>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            const dayVal = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
            return (
              <option key={dayVal} value={dayVal}>
                {dayVal}
              </option>
            );
          })}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
      </div>

      {/* 2. महिना (Month: जानेवारी to डिसेंबर) */}
      <div className="relative">
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          disabled={disabled}
          className={`w-full appearance-none px-3 py-2.5 rounded-card border text-sm outline-none bg-white transition-all pr-8 ${borderClass}`}
        >
          <option value="">महिना</option>
          {MARATHI_MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
      </div>

      {/* 3. वर्ष (Year: 2026 down to 1940) */}
      <div className="relative">
        <select
          value={selectedYear}
          onChange={handleYearChange}
          disabled={disabled}
          className={`w-full appearance-none px-3 py-2.5 rounded-card border text-sm outline-none bg-white transition-all pr-8 ${borderClass}`}
        >
          <option value="">वर्ष</option>
          {yearOptions.map((y) => (
            <option key={y} value={y.toString()}>
              {y}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
      </div>
    </div>
  );
};

export default DatePickerDropdown;
