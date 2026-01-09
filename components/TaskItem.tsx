
import React, { useState } from 'react';
import { Task, Category } from '../types';
import { generateSubSteps } from '../services/geminiService';

interface TaskItemProps {
  task: Task;
  toggle: () => void;
  categories: Category[];
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, toggle, categories, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(task.title);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const category = categories.find(c => c.id === task.categoryId);

  const handleSave = () => {
    if (tempTitle.trim()) onUpdate({ title: tempTitle });
    setIsEditing(false);
  };

  const handleGenerateAI = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAIThinking(true);
    setIsExpanded(true);
    const steps = await generateSubSteps(task.title);
    onUpdate({ subSteps: steps });
    setIsAIThinking(false);
  };

  return (
    <div className={`group relative rounded-xl border transition-all duration-500 overflow-hidden ${task.completed
      ? 'bg-white/[0.02] border-white/5'
      : 'bg-[#1c2621]/40 border-white/5 hover:border-[#4ade80]/30 hover:bg-[#1c2621]/60 shadow-lg'
      }`}>
      <div className="flex items-center gap-3 p-3">
        {/* Custom Checkbox Design */}
        <button
          onClick={(e) => { e.stopPropagation(); toggle(); }}
          className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-500 active:scale-90 ${task.completed
            ? 'bg-[#4ade80] border-[#4ade80] text-[#0f1712]'
            : 'border-white/10 bg-black/20 group-hover:border-[#4ade80]/50'
            }`}
        >
          {task.completed && <span className="font-black text-xs">✓</span>}
        </button>

        <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !task.completed && setIsExpanded(!isExpanded)}>
            {isEditing ? (
              <input
                autoFocus
                className="bg-transparent border-b border-[#4ade80] w-full outline-none text-white font-medium text-sm py-0.5"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            ) : (
              <p className={`text-sm font-medium truncate transition-all duration-500 ${task.completed ? 'line-through text-gray-600' : 'text-white group-hover:text-[#4ade80]'
                }`}>
                {task.title}
              </p>
            )}
            {!task.completed && task.subSteps && task.subSteps.length > 0 && (
              <span className="text-[10px] text-gray-500 font-bold mt-1 inline-block">
                {task.subSteps.length}개의 실행 단계가 있습니다
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!task.completed && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">

                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <span className="text-xs">Edit</span>
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <span className="text-xs">✕</span>
                </button>
              </div>
            )}
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[10px] font-bold text-gray-500">
                {new Date(task.createdAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-steps Visualization */}
      {isExpanded && !task.completed && (
        <div className="px-6 pb-6 animate-in slide-in-from-top-4 duration-500">
          <div className="pt-5 border-t border-white/5">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-black text-[#4ade80] uppercase tracking-widest opacity-60">Execution Blueprint</span>
              <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {task.subSteps && task.subSteps.length > 0 ? (
                task.subSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-4 bg-black/30 p-4 rounded-2xl border border-white/[0.02] hover:border-[#4ade80]/20 transition-all group/step">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]/20 group-hover/step:bg-[#4ade80] transition-all" />
                    <span className="text-sm text-gray-400 font-medium group-hover/step:text-white transition-colors">{step}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 bg-black/20 rounded-2xl border border-dashed border-white/5">
                  <p className="text-xs text-gray-600 font-bold italic">✨ AI 실행 계획을 생성하려면 상단의 AI 버튼을 클릭하세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
