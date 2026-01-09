
import React, { useState, useMemo } from 'react';
import { Task, Category } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  categories: Category[];
  toggleTask: (id: string) => void;
  addTask: (title: string, catId: string, dueDate: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, categories, toggleTask, addTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push({ day: 0, dateStr: '' });
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ day: i, dateStr: d.toISOString().split('T')[0] });
    }
    return days;
  }, [currentDate]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter(t => t.dueDate === selectedDateStr);
  }, [tasks, selectedDateStr]);

  const activeTasksForDate = tasksForSelectedDate.filter(t => !t.completed);
  const completedTasksForDate = tasksForSelectedDate.filter(t => t.completed);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle, selectedCategoryId, selectedDateStr);
      setNewTaskTitle('');
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 fade-in h-full py-2">
      {/* Calendar Grid Container */}
      <div className="flex-1 bg-[#1c2621]/40 border border-white/5 rounded-[2rem] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white tracking-tighter">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </h2>
            <p className="text-[9px] font-black text-[#4ade80] uppercase tracking-widest opacity-60">Visual Scheduler</p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-black/30 rounded-xl border border-white/5 shadow-inner">
            <button onClick={() => changeMonth(-1)} className="w-12 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-white transition-all text-sm">◀</button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 hover:bg-[#4ade80] hover:text-[#0f1712] rounded-lg text-[10px] font-black text-[#4ade80] transition-all">오늘</button>
            <button onClick={() => changeMonth(1)} className="w-12 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg text-white transition-all text-sm">▶</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 h-full content-start">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
            <div key={d} className={`text-center text-[9px] font-black uppercase tracking-[0.25em] mb-2 ${i === 0 ? 'text-red-900/50' : 'text-gray-600'}`}>{d}</div>
          ))}
          {monthData.map((dayObj, idx) => {
            if (dayObj.day === 0) return <div key={`empty-${idx}`} />;

            const dayTasks = tasks.filter(t => t.dueDate === dayObj.dateStr);
            const isSelected = selectedDateStr === dayObj.dateStr;
            const isToday = new Date().toISOString().split('T')[0] === dayObj.dateStr;

            return (
              <button
                key={dayObj.dateStr}
                onClick={() => setSelectedDateStr(dayObj.dateStr)}
                className={`group min-h-[12vh] rounded-2xl p-2 flex flex-col items-start gap-1 transition-all border text-left relative overflow-hidden ${isSelected
                  ? 'bg-[#4ade80]/10 border-[#4ade80] shadow-emerald-500/10'
                  : 'bg-black/20 border-white/5 hover:border-[#4ade80]/30'
                  }`}
              >
                <span className={`text-[10px] font-black ${isToday ? 'bg-[#4ade80] text-[#0f1712] px-2 py-0.5 rounded-md shadow-lg' : 'text-gray-500 group-hover:text-gray-300'}`}>
                  {dayObj.day}
                </span>
                <div className="w-full space-y-1 mt-1">
                  {dayTasks.slice(0, 3).map(t => (
                    <div key={t.id} className={`h-1 w-full rounded-full ${t.completed ? 'bg-gray-800' : 'bg-[#4ade80]'}`} />
                  ))}
                  {dayTasks.length > 3 && <p className="text-[8px] font-black text-gray-600 mt-0.5">+{dayTasks.length - 3}</p>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side Detail List */}
      <div className="w-full xl:w-72 flex flex-col gap-5">
        <div className="bg-[#1c2621]/40 rounded-[2rem] p-6 border border-white/5 flex-1 shadow-2xl overflow-y-auto custom-scrollbar flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-black text-white mb-1">{selectedDateStr.split('-')[1]}월 {selectedDateStr.split('-')[2]}일</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
              <p className="text-[9px] font-black text-[#4ade80] uppercase tracking-widest opacity-60">Daily Focus</p>
            </div>
          </div>

          <div className="mb-8 space-y-2">
            <div className="flex gap-2 w-full">
              <input
                type="text"
                placeholder="일정 추가..."
                className="flex-1 min-w-0 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-[#4ade80]/50 transition-all"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              />
              <button onClick={handleAddTask} className="w-10 shrink-0 bg-[#4ade80] hover:bg-[#22c55e] text-[#0f1712] rounded-xl font-black text-lg transition-all shadow-lg shadow-emerald-500/10 active:scale-95 flex items-center justify-center">+</button>
            </div>

          </div>

          <div className="flex-1 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Active</p>
                <span className="text-[9px] font-black text-[#4ade80]">{activeTasksForDate.length}</span>
              </div>
              <div className="space-y-2">
                {activeTasksForDate.length === 0 ? (
                  <p className="text-[10px] text-gray-700 font-bold italic text-center py-4 border border-dashed border-white/5 rounded-xl">비어 있음</p>
                ) : (
                  activeTasksForDate.map(t => (
                    <button key={t.id} onClick={() => toggleTask(t.id)} className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#4ade80]/30 transition-all group">
                      <p className="text-xs font-bold text-gray-200 truncate group-hover:text-white">{t.title}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {completedTasksForDate.length > 0 && (
              <div className="opacity-50 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Archived</p>
                </div>
                <div className="space-y-1.5">
                  {completedTasksForDate.map(t => (
                    <button key={t.id} onClick={() => toggleTask(t.id)} className="w-full text-left p-2 rounded-lg bg-black/20 border border-transparent text-[10px] font-bold text-gray-600 line-through">
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
