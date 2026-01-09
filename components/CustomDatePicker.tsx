import React, { useState, useEffect, useRef } from 'react';

interface DatePickerProps {
    value: string; // YYYY-MM-DD format
    onChange: (value: string) => void;
    label?: string;
}

const CustomDatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date()); // For navigation
    const datePickerRef = useRef<HTMLDivElement>(null);

    // Parse value to set initial navigation date
    useEffect(() => {
        if (value) {
            setCurrentDate(new Date(value));
        }
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const selected = new Date(currentYear, currentMonth, day);
        // Format to YYYY-MM-DD manually to avoid timezone issues
        const year = selected.getFullYear();
        const month = String(selected.getMonth() + 1).padStart(2, '0');
        const d = String(selected.getDate()).padStart(2, '0');
        onChange(`${year}-${month}-${d}`);
        setIsOpen(false);
    };

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Generate days array with padding for first row
    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    // Formatting for display
    const displayDate = value ? new Date(value).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '날짜 선택';

    return (
        <div className="relative w-full" ref={datePickerRef}>
            {/* Input Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-[#0d1310] border rounded-2xl px-6 py-4 flex items-center justify-between cursor-pointer transition-all hover:border-[#4ade80]/30 ${isOpen ? 'border-[#4ade80]/50 ring-1 ring-[#4ade80]/20' : 'border-white/10'}`}
            >
                <span className={`font-bold text-lg ${value ? 'text-white' : 'text-gray-500'}`}>
                    {displayDate}
                </span>
                <span className="text-[#4ade80] text-xl">🗓️</span>
            </div>

            {/* Calendar Dropdown */}
            {isOpen && (
                <div className="absolute top-[110%] left-0 z-50 w-full min-w-[300px] bg-[#1c2621]/95 backdrop-blur-xl border border-[#4ade80]/20 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                            ←
                        </button>
                        <div className="text-white font-black text-lg">
                            {currentYear}년 {currentMonth + 1}월
                        </div>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                            →
                        </button>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 mb-2">
                        {weekDays.map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest py-2">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, idx) => {
                            if (day === null) return <div key={`empty-${idx}`} />;

                            const isSelected = value === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();

                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDateClick(day)}
                                    className={`
                    h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all relative
                    ${isSelected
                                            ? 'bg-[#4ade80] text-[#0f1712] shadow-[0_0_15px_rgba(74,222,128,0.4)] scale-110 z-10'
                                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                        }
                    ${!isSelected && isToday ? 'border border-[#4ade80]/50 text-[#4ade80]' : ''}
                  `}
                                >
                                    {day}
                                    {/* Dot indicator for today if not selected */}
                                    {!isSelected && isToday && (
                                        <div className="absolute bottom-1.5 w-1 h-1 bg-[#4ade80] rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;
