import React, { useState, useMemo } from 'react';
import { Reminder } from '../types';

interface ReminderViewProps {
    reminders: Reminder[];
    saveReminder: (reminder: Omit<Reminder, 'createdAt' | 'userId'>) => void;
    deleteReminder: (id: string) => void;
    toggleReminder: (id: string) => void;
}

const ReminderView: React.FC<ReminderViewProps> = ({ reminders, saveReminder, deleteReminder, toggleReminder }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

    // Active Reminders Only
    const activeReminders = useMemo(() => reminders.filter(r => !r.completed), [reminders]);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [selectedAlerts, setSelectedAlerts] = useState<number[]>([]); // [0, 1, 3]

    const monthData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push({ day: 0, dateStr: '' });
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            const yearStr = d.getFullYear();
            const monthStr = String(d.getMonth() + 1).padStart(2, '0');
            const dayStr = String(d.getDate()).padStart(2, '0');
            days.push({ day: i, dateStr: `${yearStr}-${monthStr}-${dayStr}` });
        }
        return days;
    }, [currentDate]);

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const remindersForDate = useMemo(() => {
        return activeReminders.filter(r => r.date === selectedDateStr);
    }, [activeReminders, selectedDateStr]);

    const toggleAlert = (days: number) => {
        setSelectedAlerts(prev =>
            prev.includes(days) ? prev.filter(d => d !== days) : [...prev, days]
        );
    };

    const handleSave = () => {
        if (title.trim()) {
            saveReminder({
                id: editingId || Date.now().toString(),
                title,
                date: selectedDateStr,
                alerts: selectedAlerts,
                isRead: false
            });
            // Reset form
            startNew();
        }
    };

    const startNew = () => {
        setEditingId(null);
        setTitle('');
        setSelectedAlerts([]);
    };

    const startEdit = (r: Reminder) => {
        setEditingId(r.id);
        setTitle(r.title);
        setSelectedAlerts(r.alerts || []);
        // Ensure we are viewing the date of the reminder being edited? 
        // Maybe better to keep current view but user clicked it so they can see it.
        // If reminder is on different date than selected, maybe warn? 
        // For now, assume list is only showing selected date's reminders so it matches.
    };

    const getAlertLabel = (days: number) => {
        if (days === 0) return '당일';
        return `${days}일 전`;
    };

    const allRemindersSorted = useMemo(() => {
        return [...activeReminders].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [activeReminders]);

    const ALERT_OPTIONS = [0, 1, 3, 7]; // Options for buttons

    return (
        <div className="flex flex-col gap-6 fade-in h-full py-2">
            {/* Top Section: Calendar & Form */}
            <div className="flex-[2] flex flex-col xl:flex-row gap-6 min-h-0">
                {/* Calendar */}
                <div className="flex-[2] bg-[#1c2621]/40 border border-white/5 rounded-[2rem] p-6 shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-white tracking-tighter">
                                Scheduler
                            </h2>
                            <p className="text-[9px] font-black text-[#facc15] uppercase tracking-widest opacity-60">Monthly Overview</p>
                        </div>
                        <div className="flex items-center gap-1 p-1 bg-black/30 rounded-xl border border-white/5 shadow-inner">
                            <button onClick={() => changeMonth(-1)} className="w-12 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-white transition-all text-sm">◀</button>
                            <span className="px-4 text-sm font-bold text-white">{currentDate.getFullYear()}.{currentDate.getMonth() + 1}</span>
                            <button onClick={() => changeMonth(1)} className="w-12 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-white transition-all text-sm">▶</button>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-7 gap-2 auto-rows-fr">
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
                            <div key={d} className={`text-center text-[9px] font-black uppercase tracking-[0.25em] mb-2 ${i === 0 ? 'text-red-500' : 'text-gray-600'}`}>{d}</div>
                        ))}
                        {monthData.map((dayObj, idx) => {
                            if (dayObj.day === 0) return <div key={`empty-${idx}`} />;

                            const dayReminders = activeReminders.filter(r => r.date === dayObj.dateStr);
                            const isSelected = selectedDateStr === dayObj.dateStr;
                            const isToday = new Date().toISOString().split('T')[0] === dayObj.dateStr;

                            return (
                                <button
                                    key={dayObj.dateStr}
                                    onClick={() => { setSelectedDateStr(dayObj.dateStr); startNew(); }}
                                    className={`group rounded-2xl p-2 flex flex-col items-start gap-1 transition-all border text-left relative overflow-hidden ${isSelected
                                        ? 'bg-[#facc15]/10 border-[#facc15] shadow-yellow-500/10'
                                        : 'bg-black/20 border-white/5 hover:border-[#facc15]/30'
                                        }`}
                                >
                                    <span className={`text-[10px] font-black ${isToday ? 'text-[#facc15]' : 'text-gray-500'}`}>{dayObj.day}</span>
                                    <div className="w-full space-y-1 mt-1">
                                        {dayReminders.slice(0, 3).map(r => (
                                            <div key={r.id} className="h-1.5 w-full rounded-full bg-[#facc15] shadow-[0_0_5px_rgba(250,204,21,0.5)]" />
                                        ))}
                                        {dayReminders.length > 3 && <p className="text-[8px] text-gray-500">+{dayReminders.length - 3}</p>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Form & Daily List */}
                <div className="flex-1 xl:w-96 bg-[#1c2621]/40 rounded-[2rem] p-6 border border-white/5 shadow-2xl flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-white">
                            {selectedDateStr} <span className="text-[#facc15]">{editingId ? 'Edit' : 'New'}</span>
                        </h3>
                        {editingId && <button onClick={startNew} className="text-xs text-gray-500 hover:text-white underline">Cancel</button>}
                    </div>

                    <div className="space-y-4 mb-8">
                        <input
                            type="text"
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#facc15]/50 outline-none transition-all placeholder:text-gray-600"
                            placeholder="알림 내용 입력..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />

                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">알림 시기 (복수 선택)</p>
                            <div className="flex flex-wrap gap-2">
                                {ALERT_OPTIONS.map(days => {
                                    const active = selectedAlerts.includes(days);
                                    return (
                                        <button
                                            key={days}
                                            onClick={() => toggleAlert(days)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${active
                                                ? 'bg-[#facc15] text-black border-[#facc15] shadow-lg shadow-yellow-500/20'
                                                : 'bg-black/20 text-gray-500 border-white/10 hover:border-white/30'
                                                }`}
                                        >
                                            {getAlertLabel(days)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full bg-[#facc15] text-black font-black px-6 py-3 rounded-xl hover:bg-[#fbbf24] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                            {editingId ? '업데이트 (Update)' : '등록하기 (Add)'}
                        </button>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar border-t border-white/5 pt-4">
                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Selected Date Reminders</h4>
                        {remindersForDate.length === 0 ? (
                            <p className="text-center text-gray-600 text-xs py-10 border border-dashed border-white/5 rounded-xl">알림 없음</p>
                        ) : (
                            remindersForDate.map(r => (
                                <div
                                    key={r.id}
                                    onClick={() => startEdit(r)}
                                    className={`p-3 bg-white/5 border rounded-xl group hover:bg-white/10 transition-all cursor-pointer ${editingId === r.id ? 'border-[#facc15] bg-[#facc15]/5' : 'border-white/5 hover:border-[#facc15]/30'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <p className={`text-sm font-bold truncate ${editingId === r.id ? 'text-[#facc15]' : 'text-white'}`}>{r.title}</p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteReminder(r.id); }}
                                            className="text-gray-600 hover:text-red-400 p-1"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section: All Reminders List */}
            <div className="flex-1 bg-[#1c2621]/40 border border-white/5 rounded-[2rem] p-6 shadow-2xl flex flex-col min-h-0">
                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                    <span>📋</span> All Reminders
                    <span className="text-xs font-normal text-gray-500 ml-2">({activeReminders.length})</span>
                </h3>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {activeReminders.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                            <span className="text-3xl">📭</span>
                            <p className="text-sm">등록된 알림이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {allRemindersSorted.map(r => (
                                <div
                                    key={r.id}
                                    onClick={() => { setSelectedDateStr(r.date); startEdit(r); }}
                                    className="bg-black/20 border border-white/5 hover:border-[#facc15]/50 p-4 rounded-2xl cursor-pointer group transition-all relative"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-[#facc15] bg-[#facc15]/10 px-2 py-0.5 rounded-lg border border-[#facc15]/10">
                                            {r.date}
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteReminder(r.id); }}
                                            className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <h4 className="font-bold text-white mb-2 line-clamp-1 group-hover:text-[#facc15] transition-colors">{r.title}</h4>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {r.alerts && r.alerts.length > 0 ? (
                                            r.alerts.sort((a, b) => a - b).map(d => (
                                                <span key={d} className="text-[9px] text-gray-400 bg-white/5 px-1.5 rounded">
                                                    {getAlertLabel(d)}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[9px] text-gray-600">No Alert</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleReminder(r.id); }}
                                        className="w-full py-1.5 mt-2 bg-[#facc15]/10 hover:bg-[#facc15] text-[#facc15] hover:text-black border border-[#facc15]/20 rounded-lg text-xs font-bold transition-all text-center"
                                    >
                                        완료 (Archive)
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReminderView;
