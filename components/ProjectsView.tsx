
import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus, Category } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  categories: Category[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'progress' | 'status'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  updateProgress: (id: string, delta: number) => void;
  onAddCategory: (name: string) => Promise<string>;
  startProjectCreation?: boolean;
  onProjectCreationStarted?: () => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = (props) => {
  const { projects, categories, addProject, updateProject, deleteProject, onAddCategory } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: new Date().toISOString().split('T')[0],
    categoryId: categories[0]?.id || 'work',
  });

  const calculateProgress = (createdAt: string, deadline: string) => {
    const start = new Date(createdAt).getTime();
    const end = new Date(deadline).getTime();
    const now = new Date().getTime();
    if (now >= end) return 100;
    if (now <= start) return 0;
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const projectIcons = ['🎯', '💎', '🚀', '🎨', '💼', '🏡'];

  const openAddModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      deadline: new Date().toISOString().split('T')[0],
      categoryId: '',
    });
    setIsAddingCategory(false);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      deadline: project.deadline,
      categoryId: project.categoryId || categories[0]?.id || 'work',
    });
    setIsAddingCategory(false);
    setIsModalOpen(true);
  };

  /* New state for custom confirmation modal */
  const [confirmData, setConfirmData] = useState<{ type: 'delete' | 'complete', projectId: string } | null>(null);

  const handleConfirmAction = () => {
    if (!confirmData) return;

    if (confirmData.type === 'delete') {
      deleteProject(confirmData.projectId);
      setIsModalOpen(false);
    } else if (confirmData.type === 'complete') {
      updateProject(confirmData.projectId, { status: ProjectStatus.COMPLETED });
      setIsModalOpen(false);
    }
    setConfirmData(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    let finalCategoryId = formData.categoryId;
    if (isAddingCategory && newCategoryName.trim()) {
      finalCategoryId = await onAddCategory(newCategoryName.trim());
    }
    const payload = { ...formData, categoryId: finalCategoryId };
    if (editingProject) {
      updateProject(editingProject.id, payload);
    } else {
      addProject(payload);
    }
    setIsModalOpen(false);
  };

  // Auto-open modal if requested via prop
  React.useEffect(() => {
    if (props.startProjectCreation) {
      openAddModal();
      props.onProjectCreationStarted && props.onProjectCreationStarted();
    }
  }, [props.startProjectCreation]);

  const sortedProjects = useMemo(() => {
    return projects
      .filter(p => p.status !== ProjectStatus.COMPLETED)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [projects]);


  return (
    <div className="fade-in space-y-10 py-2 relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2">Project Portfolio</h2>
          <p className="text-gray-400 font-medium">모든 프로젝트의 진행 상황을 한눈에 파악하고 체계적으로 관리하세요.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#4ade80] text-[#0f1712] px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>＋</span> 새로운 프로젝트
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {sortedProjects.map((project, idx) => {
          const progress = calculateProgress(project.createdAt, project.deadline);
          const category = categories.find(c => c.id === project.categoryId);
          const daysLeft = Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const isUrgent = daysLeft <= 7 && daysLeft >= 0;

          return (
            <div
              key={project.id}
              onClick={() => openEditModal(project)}
              className={`group relative bg-[#1c2621]/40 border ${isUrgent ? 'border-red-500/30' : 'border-white/5'} rounded-[2rem] p-6 hover:border-[#4ade80]/40 transition-all duration-500 cursor-pointer shadow-2xl overflow-hidden`}
            >
              {/* Card Decor */}
              <div className={`absolute top-0 right-0 w-32 h-32 ${isUrgent ? 'bg-red-500/10' : 'bg-[#4ade80]/5'} blur-[60px] group-hover:bg-[#4ade80]/10 transition-colors`} />

              {isUrgent && (
                <div className="absolute top-6 right-6 animate-pulse">
                  <span className="text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/30 px-1.5 py-0.5 rounded bg-red-500/10">Urgent</span>
                </div>
              )}

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0d1310] border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:border-[#4ade80]/30 transition-all duration-500">
                    {projectIcons[idx % projectIcons.length]}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-black text-white group-hover:text-[#4ade80] transition-colors">{project.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[9px] font-black text-gray-400 uppercase tracking-widest">{category?.name || 'Category'}</span>
                      <span className={`text-[9px] font-bold flex items-center gap-1 ${isUrgent ? 'text-red-400' : 'text-gray-600'}`}>
                        <span className={`w-1 h-1 rounded-full ${isUrgent ? 'bg-red-500' : 'bg-gray-700'}`} />
                        {daysLeft < 0 ? `D+${Math.abs(daysLeft)}` : `D-${daysLeft}`}일 남음
                      </span>
                    </div>
                  </div>
                </div>
                {!isUrgent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('프로젝트를 완료하시겠습니까? 완료된 프로젝트는 아카이브로 이동합니다.')) {
                        updateProject(project.id, { status: ProjectStatus.COMPLETED });
                      }
                    }}
                    className="px-3 py-1 rounded-full text-[9px] font-black border tracking-widest bg-[#4ade80]/10 border-[#4ade80]/20 text-[#4ade80] hover:bg-[#4ade80] hover:text-[#0f1712] transition-colors"
                  >
                    COMPLETE
                  </button>
                )}
              </div>

              <div className="space-y-3 mb-4 relative z-10">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Maturity</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-black text-white">{progress}</span>
                    <span className="text-xs font-black text-[#4ade80] opacity-50">%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-[#0d1310] rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-[#4ade80] to-[#a7f3d0] rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(74,222,128,0.3)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="bg-black/20 p-4 rounded-xl border border-white/5 group-hover:bg-black/30 transition-colors">
                <p className="text-xs text-gray-400 font-medium leading-relaxed italic line-clamp-2">
                  "{project.description || '정의된 상세 설명이 없습니다.'}"
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Improvement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0d1310]/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#1c2621] w-full max-w-xl rounded-[2.5rem] border border-[#4ade80]/20 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-10 pb-6 flex justify-between items-center border-b border-white/5">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">{editingProject ? '프로젝트 정보 수정' : '새로운 프로젝트 생성'}</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Project Configuration</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-500 transition-colors">✕</button>
            </div>

            <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#4ade80] uppercase tracking-widest ml-1">프로젝트 명칭</label>
                <input
                  type="text"
                  className="w-full bg-[#0d1310] border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#4ade80]/50 text-white transition-all font-bold text-lg"
                  placeholder="프로젝트의 명칭을 입력하세요"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3 min-w-0">
                  <label className="text-[10px] font-black text-[#4ade80] uppercase tracking-widest ml-1">카테고리</label>
                  {!isAddingCategory ? (
                    <div className="relative group w-full">
                      <select
                        className="w-full bg-[#0d1310] border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#4ade80]/50 text-white transition-all font-bold appearance-none cursor-pointer pr-12 truncate"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      >
                        <option value="" disabled>카테고리 선택</option>
                        {categories.filter(c => !['work', 'personal', 'health', 'home'].includes(c.id)).map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setIsAddingCategory(true)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#4ade80] hover:scale-110 transition-transform bg-[#0d1310] px-2 py-1 rounded"
                      >추가</button>
                    </div>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <input
                        autoFocus
                        type="text"
                        className="w-full min-w-0 bg-[#0d1310] border border-white/10 rounded-2xl px-4 py-4 outline-none focus:border-[#4ade80]/50 text-white transition-all font-bold"
                        placeholder="새 카테고리"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                      <button onClick={() => setIsAddingCategory(false)} className="shrink-0 text-xs font-bold text-gray-500 whitespace-nowrap px-2">취소</button>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#4ade80] uppercase tracking-widest ml-1">목표 마감일</label>
                  <input
                    type="date"
                    className="w-full bg-[#0d1310] border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#4ade80]/50 text-white transition-all font-bold"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#4ade80] uppercase tracking-widest ml-1">요약 및 설명</label>
                <textarea
                  rows={4}
                  className="w-full bg-[#0d1310] border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#4ade80]/50 text-white transition-all font-medium leading-relaxed"
                  placeholder="달성하고자 하는 비전을 상세히 기록하세요..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="p-10 bg-[#0d1310]/30 border-t border-white/5 flex gap-4">
              {editingProject && (
                <>
                  <button
                    onClick={() => setConfirmData({ type: 'delete', projectId: editingProject.id })}
                    className="px-6 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-xs hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                  >제거</button>
                  <button
                    onClick={() => setConfirmData({ type: 'complete', projectId: editingProject.id })}
                    className="px-6 py-4 bg-[#4ade80]/10 text-[#4ade80] rounded-2xl font-black text-xs hover:bg-[#4ade80] hover:text-[#0f1712] transition-all border border-[#4ade80]/20 whitespace-nowrap"
                  >
                    프로젝트 완료
                  </button>
                </>
              )}
              <div className="flex-1" />
              <button
                onClick={handleSave}
                className="px-10 py-4 bg-[#4ade80] text-[#0f1712] rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all whitespace-nowrap"
              >
                {editingProject ? '완료' : '프로젝트 런칭'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={(e) => e.stopPropagation()}>
          <div className="bg-[#1c2621] w-full max-w-sm rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden transform transition-all scale-100">
            <div className="p-8 text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border text-3xl ${confirmData.type === 'delete'
                ? 'bg-red-500/10 border-red-500/20'
                : 'bg-[#4ade80]/10 border-[#4ade80]/20'
                }`}>
                {confirmData.type === 'delete' ? '🗑️' : '🎉'}
              </div>
              <h3 className="text-xl font-black text-white">
                {confirmData.type === 'delete' ? '프로젝트 영구 삭제' : '프로젝트 완료'}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                {confirmData.type === 'delete'
                  ? '이 작업은 되돌릴 수 없습니다.\n정말로 이 프로젝트를 삭제하시겠습니까?'
                  : '축하합니다! 프로젝트를 완료 처리하고\n아카이브로 이동시키시겠습니까?'}
              </p>
            </div>
            <div className="flex border-t border-white/5 bg-black/20">
              <button
                onClick={() => setConfirmData(null)}
                className="flex-1 py-4 text-xs font-bold text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                취소
              </button>
              <div className="w-px bg-white/5" />
              <button
                onClick={handleConfirmAction}
                className={`flex-1 py-4 text-xs font-black transition-colors ${confirmData.type === 'delete'
                  ? 'text-red-500 hover:bg-red-500/10'
                  : 'text-[#4ade80] hover:bg-[#4ade80]/10'
                  }`}
              >
                {confirmData.type === 'delete' ? '삭제하기' : '완료하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsView;
