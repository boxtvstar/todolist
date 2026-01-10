import React, { useState, useMemo } from 'react';
import { Task, Project, ProjectStatus, Reminder } from '../types';

interface HistoryViewProps {
  tasks: Task[];
  projects: Project[];
  reminders: Reminder[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  tasks, projects, reminders,
  toggleTask, deleteTask,
  updateProject, deleteProject,
  toggleReminder, deleteReminder
}) => {
  const [deleteData, setDeleteData] = useState<{ type: 'task' | 'project' | 'reminder', id: string } | null>(null);

  const handleDeleteClick = (type: 'task' | 'project' | 'reminder', id: string) => {
    setDeleteData({ type, id });
  };

  const confirmDelete = () => {
    if (!deleteData) return;
    if (deleteData.type === 'task') {
      deleteTask(deleteData.id);
    } else if (deleteData.type === 'project') {
      deleteProject(deleteData.id);
    } else if (deleteData.type === 'reminder') {
      deleteReminder(deleteData.id);
    }
    setDeleteData(null);
  };

  const [search, setSearch] = useState('');

  const completedTasks = useMemo(() => {
    return tasks
      .filter(t => t.completed)
      .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tasks, search]);


  const completedProjects = useMemo(() => {
    return projects
      .filter(p => p.status === ProjectStatus.COMPLETED)
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [projects, search]);

  const completedReminders = useMemo(() => {
    return reminders
      .filter(r => r.completed)
      .filter(r => r.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime());
  }, [reminders, search]);

  return (
    <div className="fade-in space-y-12 py-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-[#1c2621] to-transparent p-6 rounded-[2rem] border border-white/5">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-white tracking-tighter">Archive of Excellence</h2>
          <p className="text-gray-400 font-medium text-sm">지금까지 달성한 모든 성공의 발자취를 확인하세요.</p>
        </div>
        <div className="flex flex-col items-center bg-[#0d1310] p-4 rounded-2xl border border-white/10 shadow-xl min-w-[150px]">
          <p className="text-[9px] font-black text-[#4ade80] uppercase tracking-[0.2em] mb-1 opacity-60">Total Victories</p>
          <div className="text-3xl font-black text-[#4ade80] tracking-tighter shadow-emerald-500/20">{completedTasks.length + completedProjects.length + completedReminders.length}</div>
        </div>
      </div>

      <div className="relative group max-w-2xl mx-auto px-4">
        <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
          <span className="text-xl opacity-30 group-focus-within:opacity-100 transition-opacity">🔍</span>
        </div>
        <input
          type="text"
          placeholder="성취 기록을 키워드로 검색..."
          className="w-full bg-[#1c2621]/40 border border-white/10 rounded-[1.5rem] pl-16 pr-8 py-4 outline-none focus:border-[#4ade80]/50 transition-all text-base font-bold text-white placeholder:text-gray-700 shadow-2xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-8 px-2">
        {/* Projects Section */}
        {completedProjects.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest pl-2">Completed Projects</h3>
            {completedProjects.map(project => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 bg-[#1c2621]/20 border border-white/5 rounded-2xl group transition-all duration-500 hover:bg-[#4ade80]/5 hover:border-[#4ade80]/20 shadow-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#4ade80]/10 flex items-center justify-center text-xl shadow-lg border border-[#4ade80]/20 shrink-0">🏆</div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-bold text-white truncate group-hover:text-[#4ade80] transition-colors">{project.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-gray-600 font-bold">
                          {new Date(project.deadline).toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' })} 완료
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                  <button
                    onClick={() => updateProject(project.id, { status: ProjectStatus.ON_TRACK })}
                    className="px-3 py-1.5 bg-[#4ade80]/10 hover:bg-[#4ade80] border border-[#4ade80]/20 rounded-lg text-[10px] font-black text-[#4ade80] hover:text-[#0f1712] transition-all"
                  >
                    복원
                  </button>
                  <button
                    onClick={() => handleDeleteClick('project', project.id)}
                    className="px-3 py-1.5 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-[10px] font-black border border-red-500/10 transition-all"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reminders Section */}
        {completedReminders.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest pl-2">Completed Reminders</h3>
            {completedReminders.map(reminder => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-3 bg-[#1c2621]/20 border border-white/5 rounded-2xl group transition-all duration-500 hover:bg-[#facc15]/5 hover:border-[#facc15]/20 shadow-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#facc15]/10 flex items-center justify-center text-[#facc15] text-sm shadow-lg border border-[#facc15]/20 shrink-0">🔔</div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-gray-500 line-through decoration-gray-700 truncate group-hover:text-gray-300 transition-colors">{reminder.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-[#facc15] font-black bg-[#facc15]/5 border border-[#facc15]/10 px-1.5 py-0.5 rounded text-[8px]">{reminder.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    className="px-3 py-1.5 bg-[#facc15]/10 hover:bg-[#facc15] border border-[#facc15]/20 rounded-lg text-[10px] font-black text-[#facc15] hover:text-[#0f1712] transition-all"
                  >
                    복원
                  </button>
                  <button
                    onClick={() => handleDeleteClick('reminder', reminder.id)}
                    className="px-3 py-1.5 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-[10px] font-black border border-red-500/10 transition-all"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tasks Section */}
        {completedTasks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest pl-2">Completed Tasks</h3>
            {completedTasks.map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-[#1c2621]/20 border border-white/5 rounded-2xl group transition-all duration-500 hover:bg-[#4ade80]/5 hover:border-[#4ade80]/20 shadow-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#4ade80]/10 flex items-center justify-center text-[#4ade80] text-sm shadow-lg border border-[#4ade80]/20 shrink-0">✓</div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-gray-500 line-through decoration-gray-700 truncate group-hover:text-gray-300 transition-colors">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-[#4ade80] font-black uppercase tracking-widest bg-[#4ade80]/5 border border-[#4ade80]/10 px-1.5 py-0.5 rounded text-[8px]">{task.categoryId}</span>
                        <span className="text-[8px] text-gray-600 font-bold">
                          {new Date(task.dueDate).toLocaleDateString('ko-KR', { year: '2-digit', month: 'numeric', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="px-3 py-1.5 bg-[#4ade80]/10 hover:bg-[#4ade80] border border-[#4ade80]/20 rounded-lg text-[10px] font-black text-[#4ade80] hover:text-[#0f1712] transition-all"
                  >
                    복원
                  </button>
                  <button
                    onClick={() => handleDeleteClick('task', task.id)}
                    className="px-3 py-1.5 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-[10px] font-black border border-red-500/10 transition-all"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {completedProjects.length === 0 && completedTasks.length === 0 && completedReminders.length === 0 && (
          <div className="py-32 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
            <div className="text-6xl mb-6 opacity-10">🏺</div>
            <p className="text-gray-600 font-black text-xl">아직 기록된 성취가 없습니다.</p>
            <p className="text-gray-700 text-sm mt-2">오늘의 과업을 완료하고 역사를 만들어보세요.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1c2621] w-full max-w-sm rounded-[2rem] border border-red-500/20 shadow-2xl overflow-hidden">
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 text-3xl">
                🗑️
              </div>
              <h3 className="text-xl font-black text-white">기록 영구 삭제</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                이 작업은 되돌릴 수 없습니다.<br />
                정말로 이 {deleteData.type === 'project' ? '프로젝트' : deleteData.type === 'reminder' ? '리마인더' : '과업'} 기록을 삭제하시겠습니까?
              </p>
            </div>
            <div className="flex border-t border-white/5 bg-black/20">
              <button
                onClick={() => setDeleteData(null)}
                className="flex-1 py-4 text-xs font-bold text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                취소
              </button>
              <div className="w-px bg-white/5" />
              <button
                onClick={confirmDelete}
                className="flex-1 py-4 text-xs font-black text-red-500 hover:bg-red-500/10 transition-colors"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;


