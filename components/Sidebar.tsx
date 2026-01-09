
import React from 'react';
import { View, Category, Task, Project } from '../types';

import { User } from 'firebase/auth';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  categories: Category[];
  projects: Project[];
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  tasks: Task[];
  onAddCategory: (name: string, icon: string) => void;
  user: User | null;
  logout: () => void;
  onStartNewProject: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  projects,
  selectedProjectId,
  setSelectedProjectId,
  tasks,
  user,
  logout,
  onStartNewProject
}) => {
  const getProjectTaskCount = (projectId: string) => tasks.filter(t => t.projectId === projectId && !t.completed).length;

  const navItems = [
    { view: View.DASHBOARD, label: '오늘의 할 일', icon: '⚡' },
    { view: View.PROJECTS, label: '전체 프로젝트', icon: '📂' },
    { view: View.CALENDAR, label: '스케줄러', icon: '🗓️' },
    { view: View.MEMO, label: '메모장', icon: '📝' },
    { view: View.HISTORY, label: '완료 아카이브', icon: '🏆' },
  ];

  const statusColors = {
    PLANNING: '#c084fc',
    ON_TRACK: '#4ade80',
    AT_RISK: '#fb923c',
  };

  // Real-time Clock State
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      weekDay: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()],
      time: date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  };

  const timeData = formatDate(currentTime);

  return (
    <aside className="w-full bg-[#0d1310] border-r border-white/5 flex flex-col h-full shrink-0 relative overflow-hidden">
      {/* Decorative Background Glow */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#4ade80]/5 blur-[100px] pointer-events-none" />

      <div className="p-8 pb-4 relative z-10">
        <h1 className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#4ade80] to-[#22c55e] rounded-xl flex items-center justify-center text-black shadow-lg shadow-emerald-500/20">
            <span className="text-xl font-black italic">S</span>
          </div>
          <span className="text-lg font-black tracking-tight text-white uppercase">SMART PLANNER</span>
        </h1>
      </div>

      {/* Real-time Clock Widget */}
      <div className="px-6 pb-2">
        <div className="bg-[#1c2621]/50 border border-white/5 rounded-2xl p-3 text-center space-y-0.5 backdrop-blur-md">
          <div className="text-[9px] font-black text-[#4ade80] uppercase tracking-[0.3em] opacity-80">{timeData.weekDay}</div>
          <div className="text-xl font-black text-white tracking-widest font-mono">{timeData.time}</div>
          <div className="text-[9px] font-bold text-gray-500">{timeData.year}.{String(timeData.month).padStart(2, '0')}.{String(timeData.day).padStart(2, '0')}</div>
        </div>
      </div>

      <div className="px-6 py-4">
        <button
          onClick={onStartNewProject}
          className="w-full py-3.5 bg-white/5 hover:bg-[#4ade80] text-[#4ade80] hover:text-[#0d1310] font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 border border-[#4ade80]/20 hover:border-transparent group"
        >
          <span className="text-xl group-hover:rotate-90 transition-transform">+</span>
          <span>새 프로젝트 시작</span>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-10 overflow-y-auto custom-scrollbar pb-10 relative z-10">
        <section>
          <div className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.25em] mb-4">Dashboard</div>
          <div className="space-y-1">
            {navItems.map(item => {
              const isActive = activeView === item.view && !selectedProjectId;
              return (
                <button
                  key={item.view}
                  onClick={() => { setActiveView(item.view); setSelectedProjectId(null); }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                    ? 'bg-[#4ade80]/10 text-[#4ade80]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span className={`text-lg transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                  <span className="text-sm font-semibold">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]" />}
                </button>
              );
            })}
          </div>
        </section>

      </nav>

      {user && (
        <div className="p-4 border-t border-white/5 bg-[#0d1310]/50 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group relative">
            {user.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-9 h-9 rounded-full border border-white/10" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#4ade80] to-[#22c55e] flex items-center justify-center text-black font-bold text-sm">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate leading-tight">{user.displayName || 'User'}</p>
              <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all"
              title="로그아웃"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-gray-600 font-medium text-center opacity-50">제작 디스이즈머니</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
