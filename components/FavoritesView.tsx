
import React, { useState } from 'react';
import { FavoriteSite, Category } from '../types';

interface FavoritesViewProps {
  favorites: FavoriteSite[];
  categories: Category[];
  addFavorite: (title: string, url: string, description?: string, categoryId?: string) => Promise<string>;
  updateFavorite: (id: string, updates: Partial<FavoriteSite>) => Promise<void>;
  deleteFavorite: (id: string) => Promise<void>;
  onAddCategory: (name: string) => Promise<string>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  categories,
  addFavorite,
  updateFavorite,
  deleteFavorite,
  onAddCategory,
  updateCategory,
  deleteCategory
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategoryId, setNewCategoryId] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');

  // Initial categories (not deletable)
  const initialCategoryIds = ['dev', 'youtube', 'video'];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;
    
    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    await addFavorite(newTitle, url, newDescription || undefined, newCategoryId || undefined);
    setNewTitle('');
    setNewUrl('');
    setNewDescription('');
    setNewCategoryId('');
    setIsAdding(false);
  };

  const handleStartEdit = (site: FavoriteSite) => {
    setEditingId(site.id);
    setEditTitle(site.title);
    setEditUrl(site.url);
    setEditDescription(site.description || '');
    setEditCategoryId(site.categoryId || '');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle || !editUrl) return;
    
    let url = editUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    await updateFavorite(id, { 
      title: editTitle, 
      url, 
      description: editDescription || undefined,
      categoryId: editCategoryId || undefined 
    });
    setEditingId(null);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    const catId = await onAddCategory(newCategoryName.trim());
    if (catId) {
      if (editingId) setEditCategoryId(catId);
      else setNewCategoryId(catId);
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editCatName.trim()) return;
    await updateCategory(id, { name: editCatName.trim() });
    setEditingCatId(null);
  };

  const handleDeleteCategory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("이 카테고리를 정말 삭제하시겠습니까? 연결된 즐겨찾기의 카테고리 정보가 해제됩니다.")) {
      await deleteCategory(id);
      if (selectedFilterCategory === id) setSelectedFilterCategory('all');
      if (newCategoryId === id) setNewCategoryId('');
      if (editCategoryId === id) setEditCategoryId('');
    }
  };

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    } catch {
      return null;
    }
  };

  const filteredFavorites = selectedFilterCategory === 'all' 
    ? favorites 
    : favorites.filter(f => f.categoryId === selectedFilterCategory);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">즐겨찾기 사이트</h2>
          <p className="text-gray-400 font-medium">자주 방문하는 사이트를 카테고리별로 관리하세요.</p>
        </div>
        
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-emerald-500/10 ${
            isAdding 
            ? 'bg-white/10 text-white hover:bg-white/20' 
            : 'bg-[#4ade80] text-[#0d1310] hover:scale-105 active:scale-95'
          }`}
        >
          {isAdding ? '취소' : (
            <>
              <span className="text-xl">+</span>
              사이트 추가
            </>
          )}
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setSelectedFilterCategory('all')}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
            selectedFilterCategory === 'all' 
            ? 'bg-[#4ade80] text-[#0d1310]' 
            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          전체보기
        </button>
        {categories.map(cat => (
          <div key={cat.id} className="relative group/cat">
            {editingCatId === cat.id ? (
              <div className="flex items-center bg-white/10 rounded-full px-3 py-1 animate-in zoom-in-95 duration-200 border border-[#4ade80]/30">
                <input
                  autoFocus
                  type="text"
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  onBlur={() => setEditingCatId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateCategory(cat.id);
                    if (e.key === 'Escape') setEditingCatId(null);
                  }}
                  className="bg-transparent border-none outline-none text-white text-sm font-bold w-24"
                />
              </div>
            ) : (
              <button
                onClick={() => setSelectedFilterCategory(cat.id)}
                onDoubleClick={() => {
                  if (!initialCategoryIds.includes(cat.id)) {
                    setEditingCatId(cat.id);
                    setEditCatName(cat.name);
                  }
                }}
                title={!initialCategoryIds.includes(cat.id) ? "더블클릭하여 이름 수정" : ""}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                  selectedFilterCategory === cat.id 
                  ? 'bg-[#4ade80] text-[#0d1310]' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            )}
            {!initialCategoryIds.includes(cat.id) && editingCatId !== cat.id && (
              <button
                onClick={(e) => handleDeleteCategory(e, cat.id)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover/cat:opacity-100 transition-opacity shadow-lg"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">사이트 이름</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="예: 구글, 네이버 등"
                className="w-full bg-[#0d1310] border border-white/5 focus:border-[#4ade80]/50 rounded-2xl px-5 py-3.5 text-white placeholder-gray-600 outline-none transition-all"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">URL 주소</label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="www.example.com"
                className="w-full bg-[#0d1310] border border-white/5 focus:border-[#4ade80]/50 rounded-2xl px-5 py-3.5 text-white placeholder-gray-600 outline-none transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">사이트 설명</label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="간단한 설명을 입력하세요"
                className="w-full bg-[#0d1310] border border-white/5 focus:border-[#4ade80]/50 rounded-2xl px-5 py-3.5 text-white placeholder-gray-600 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">카테고리</label>
              <div className="flex gap-2">
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="flex-1 bg-[#0d1310] border border-white/5 focus:border-[#4ade80]/50 rounded-2xl px-4 py-3.5 text-white outline-none appearance-none transition-all"
                >
                  <option value="">카테고리 선택 (필수아님)</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-[#4ade80] transition-all"
                  title="카테고리 추가"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {isAddingCategory && (
            <div className="flex gap-2 items-center bg-black/20 p-3 rounded-2xl animate-in slide-in-from-top-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="새 카테고리 이름"
                className="flex-1 bg-[#0f1712] border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none"
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                className="px-4 py-2 bg-[#4ade80] text-[#0d1310] font-bold rounded-xl text-xs"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="px-4 py-2 bg-white/10 text-white font-bold rounded-xl text-xs"
              >
                취소
              </button>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newTitle || !newUrl}
              className="px-8 py-3 bg-[#4ade80] text-[#0d1310] font-black rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              저장하기
            </button>
          </div>
        </form>
      )}

      {filteredFavorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[40px]">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-4xl mb-6">🌐</div>
          <h3 className="text-xl font-bold text-white mb-2">등록된 사이트가 없습니다</h3>
          <p className="text-gray-500 max-w-sm">
            {selectedFilterCategory === 'all' 
              ? '자주 사용하는 웹사이트를 추가하여 빠르게 접속해보세요.'
              : '이 카테고리에 등록된 사이트가 없습니다.'}
          </p>
          {selectedFilterCategory !== 'all' && (
            <button
              onClick={() => setSelectedFilterCategory('all')}
              className="mt-6 text-[#4ade80] font-bold hover:underline"
            >
              전체보기로 돌아가기
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((site) => {
            const category = categories.find(c => c.id === site.categoryId);
            return (
              <div
                key={site.id}
                className="group relative bg-[#141d18] hover:bg-[#1a2520] border border-white/5 hover:border-[#4ade80]/30 p-6 rounded-[32px] transition-all duration-500 hover:-translate-y-1 shadow-xl hover:shadow-[#4ade80]/5"
              >
                {editingId === site.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">이름</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-[#0d1310] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#4ade80]/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">URL</label>
                        <input
                          type="text"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          className="w-full bg-[#0d1310] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#4ade80]/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">설명</label>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full bg-[#0d1310] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#4ade80]/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">카테고리</label>
                      <select
                        value={editCategoryId}
                        onChange={(e) => setEditCategoryId(e.target.value)}
                        className="w-full bg-[#0d1310] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#4ade80]/50 appearance-none"
                      >
                        <option value="">카테고리 없음</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleSaveEdit(site.id)}
                        className="flex-1 py-3 bg-[#4ade80] text-[#0d1310] font-black rounded-xl text-xs"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 py-3 bg-white/10 text-white font-black rounded-xl text-xs"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-4 relative">
                      <div className="w-14 h-14 bg-[#0d1310] rounded-2xl flex-shrink-0 flex items-center justify-center p-3 shadow-inner border border-white/5 relative">
                        <img
                          src={getFavicon(site.url) || ''}
                          alt=""
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-black text-white truncate leading-tight group-hover:text-[#4ade80] transition-colors">{site.title}</h4>
                        <p className="text-[10px] text-gray-500 hover:text-gray-400 truncate font-bold transition-colors cursor-default">
                          {new URL(site.url).hostname}
                        </p>
                      </div>
                      <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                        <button
                          onClick={() => handleStartEdit(site)}
                          className="p-1.5 bg-[#1a2520] hover:bg-white/10 border border-white/5 rounded-lg text-gray-400 hover:text-white transition-colors shadow-lg"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteFavorite(site.id)}
                          className="p-1.5 bg-[#1a2520] hover:bg-red-500/10 border border-white/5 rounded-lg text-gray-400 hover:text-red-400 transition-colors shadow-lg"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-4 h-[70px] flex flex-col justify-start">
                      {category && (
                        <div className="mb-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#4ade80]/10 text-[#4ade80] text-[9px] font-black uppercase tracking-wider rounded-md">
                            {category.icon} {category.name}
                          </span>
                        </div>
                      )}
                      {site.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 font-medium italic">
                          "{site.description}"
                        </p>
                      )}
                    </div>

                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full px-5 py-3 bg-white/5 hover:bg-[#4ade80] text-gray-400 hover:text-[#0d1310] font-black rounded-2xl transition-all duration-300 group/link shadow-lg hover:shadow-emerald-500/20"
                    >
                      <span className="text-xs uppercase tracking-tighter">방문하기</span>
                      <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesView;
