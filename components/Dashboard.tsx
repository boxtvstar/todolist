
import React, { useState, useMemo } from 'react';
import { Task, Category } from '../types';
import TaskItem from './TaskItem';

interface DashboardProps {
  tasks: Task[];
  toggleTask: (id: string) => void;
  addTask: (title: string, catId: string) => void;
  categories: Category[];
  selectedProjectId: string | null;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  tasks, toggleTask, addTask, categories, selectedProjectId, updateTask, deleteTask
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const today = new Date().toLocaleDateString('en-CA');

  const filteredTasks = useMemo(() => {
    // Show all tasks if selectedProjectId is active
    // If no project, show tasks due on or before today (overdue included)
    // Actually user said: 'active tasks should persistent'. My current logic due <= today handles overdue.
    // I will stick to due <= today logic but with correct local date.
    let list = tasks.filter(t => t.dueDate <= today);
    if (selectedProjectId) {
      list = list.filter(t => t.projectId === selectedProjectId);
    }
    return list;
  }, [tasks, selectedProjectId, today]);

  const activeTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  const completionRate = useMemo(() => {
    if (filteredTasks.length === 0) return 0;
    return Math.round((completedTasks.length / filteredTasks.length) * 100);
  }, [filteredTasks, completedTasks]);

  const handleAdd = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle, categories[0].id);
      setNewTaskTitle('');
    }
  };

  return (
    <div className="space-y-10 fade-in py-2">
      {/* Header Summary Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1c2621] to-[#0f1712] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#4ade80]/5 blur-[80px] -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20 text-[10px] font-black text-[#4ade80] uppercase tracking-widest">
              Today's Focus
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight whitespace-nowrap">
              {selectedProjectId ? '프로젝트를' : '오늘의 과업을'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ade80] to-[#a7f3d0]">성공적으로 완료</span>하세요.
            </h2>
            <p className="text-gray-400 font-medium text-base">
              현재 <span className="text-white font-bold">{activeTasks.length}개</span>의 할 일이 남았습니다.
            </p>
          </div>

          <div className="flex items-center gap-5 bg-black/20 p-5 rounded-[1.5rem] border border-white/5 backdrop-blur-md">
            <div className="relative w-20 h-20">
              {/* SVG Circular Progress */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="32" stroke="rgba(74, 222, 128, 0.1)" strokeWidth="6" fill="transparent" />
                <circle cx="40" cy="40" r="32" stroke="#4ade80" strokeWidth="6" fill="transparent"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - completionRate / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-white">{completionRate}<span className="text-[10px] opacity-50">%</span></span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Progress</p>
              <p className="text-2xl font-bold text-white">훌륭합니다!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Task Input */}
      <div className="relative group max-w-3xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-[#4ade80]/20 to-transparent blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <div className="relative bg-[#1c2621]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-2xl focus-within:border-[#4ade80]/50 transition-all">
          <input
            type="text"
            placeholder={selectedProjectId ? "프로젝트의 세부 과업을 입력하세요..." : "오늘 정복할 새로운 목표를 입력하세요..."}
            className="w-full bg-transparent px-6 py-4 outline-none text-lg text-white placeholder:text-gray-600 font-semibold"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#4ade80] hover:bg-[#22c55e] text-[#0f1712] font-black px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95 text-sm"
          >
            기록하기
          </button>
        </div>
      </div>

      {/* Task List Section */}
      <div className="space-y-12">
        <section>
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-white">진행 중인 과업</h3>
              <span className="bg-[#4ade80]/10 text-[#4ade80] px-3 py-1 rounded-full text-[10px] font-black border border-[#4ade80]/20">{activeTasks.length}</span>
            </div>
          </div>

          {activeTasks.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.02] flex flex-col items-center">
              <div className="w-16 h-16 bg-[#4ade80]/10 rounded-full flex items-center justify-center text-3xl mb-4 border border-[#4ade80]/20">✨</div>
              <p className="text-gray-400 font-bold text-lg mb-1">모든 준비가 끝났습니다!</p>
              <p className="text-gray-600 text-sm">새로운 목표를 추가하고 하루를 설계해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  toggle={() => toggleTask(task.id)}
                  categories={categories}
                  onUpdate={(u) => updateTask(task.id, u)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </div>
          )}
        </section>

        {completedTasks.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6 px-4">
              <h3 className="text-xl font-black text-gray-500">완료된 아카이브</h3>
              <span className="text-gray-600 text-[10px] font-bold">{completedTasks.length} Success</span>
            </div>
            <div className="grid grid-cols-1 gap-3 opacity-60 hover:opacity-100 transition-opacity">
              {completedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  toggle={() => toggleTask(task.id)}
                  categories={categories}
                  onUpdate={(u) => updateTask(task.id, u)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
