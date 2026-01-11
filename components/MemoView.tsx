
import React, { useState, useMemo, useEffect } from 'react';
import { Memo } from '../types';

interface MemoViewProps {
    memos: Memo[];
    addMemo: (title: string) => Promise<string>;
    updateMemo: (id: string, updates: Partial<Memo>) => void;
    deleteMemo: (id: string) => void;
}

const MemoView: React.FC<MemoViewProps> = ({ memos, addMemo, updateMemo, deleteMemo }) => {
    const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');

    // Local state for editing to prevent IME issues
    const [localContent, setLocalContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const confirmDelete = () => {
        if (deleteId) {
            deleteMemo(deleteId);
            setSelectedMemoId(null);
            setDeleteId(null);
        }
    };

    const filteredMemos = useMemo(() => {
        return memos
            .filter(m =>
                m.title.toLowerCase().includes(searchText.toLowerCase()) ||
                m.content.toLowerCase().includes(searchText.toLowerCase())
            )
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }, [memos, searchText]);

    // Auto-select latest memo on mount or when memos change if none selected
    // Auto-select latest memo on mount or when memos change if none selected (Desktop only)
    useEffect(() => {
        const isDesktop = window.innerWidth >= 768; // Tailwind md breakpoint
        if (isDesktop && !selectedMemoId && filteredMemos.length > 0 && !isEditing) {
            setSelectedMemoId(filteredMemos[0].id);
        }
    }, [filteredMemos, selectedMemoId, isEditing]);

    const selectedMemo = useMemo(() =>
        memos.find(m => m.id === selectedMemoId) || null
        , [memos, selectedMemoId]);

    // Sync local state when selected memo changes
    useEffect(() => {
        if (selectedMemo) {
            if (!isEditing) {
                setLocalContent(selectedMemo.content || '');
            }
        } else {
            setLocalContent('');
        }
    }, [selectedMemoId, selectedMemo, isEditing]);

    // Debounced Save
    useEffect(() => {
        if (!selectedMemoId || !isEditing) return;

        const timer = setTimeout(() => {
            const lines = localContent.split('\n');
            const newTitle = lines[0]?.trim() || '';

            updateMemo(selectedMemoId, {
                title: newTitle,
                content: localContent,
                updatedAt: new Date().toISOString()
            });
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
    }, [localContent, selectedMemoId, isEditing, updateMemo]);

    const handleAddMemo = async () => {
        const id = await addMemo("");
        setSelectedMemoId(id);
        setIsEditing(false);
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setIsEditing(true);
        setLocalContent(e.target.value);
    };

    const handleSelectMemo = (id: string) => {
        if (selectedMemoId === id) return;
        setIsEditing(false);
        setSelectedMemoId(id);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return (
        <div className="flex h-full gap-6 fade-in py-2">
            {/* Sidebar List - Hidden on mobile if memo selected */}
            <div className={`
                bg-[#1c2621]/40 border border-white/5 rounded-[2rem] flex-col overflow-hidden shadow-2xl shrink-0
                ${selectedMemoId ? 'hidden md:flex' : 'flex'}
                w-full md:w-80
            `}>
                <div className="p-5 border-b border-white/5 bg-[#1c2621]/60">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-white">메모장</h2>
                        <button
                            onClick={handleAddMemo}
                            className="w-8 h-8 flex items-center justify-center bg-[#4ade80] hover:bg-[#22c55e] text-[#0f1712] rounded-lg transition-all shadow-lg text-lg font-bold"
                        >
                            +
                        </button>
                    </div>

                    <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">🔍</span>
                        <input
                            type="text"
                            placeholder="검색"
                            className="w-full bg-black/20 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white outline-none focus:border-[#4ade80]/30 transition-all placeholder:text-gray-600"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                    {filteredMemos.length === 0 ? (
                        <div className="text-center py-10 text-gray-600 text-[10px] italic">메모가 없습니다.</div>
                    ) : (
                        filteredMemos.map(memo => (
                            <button
                                key={memo.id}
                                onClick={() => handleSelectMemo(memo.id)}
                                className={`w-full text-left p-4 rounded-xl transition-all border group ${selectedMemoId === memo.id
                                    ? 'bg-[#4ade80]/10 border-[#4ade80]/30'
                                    : 'bg-transparent border-transparent hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`text-sm font-bold truncate pr-2 ${selectedMemoId === memo.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                        {memo.title || "제목 미정"}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-medium text-gray-500 min-w-fit">{formatDate(memo.updatedAt)}</span>
                                    <p className="text-[10px] text-gray-600 truncate flex-1">{memo.content?.replace(/\n/g, ' ') || "내용 없음"}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Editor Main - Hidden on mobile if NO memo selected */}
            <div className={`
                bg-[#1c2621]/40 border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden flex-col relative
                ${!selectedMemoId ? 'hidden md:flex' : 'flex'}
                flex-1
            `}>
                {selectedMemo ? (
                    <>
                        <div className="p-8 pb-4">
                            <div className="flex items-center justify-between mb-4 opacity-50">
                                <div className="flex items-center gap-4">
                                    {/* Mobile Back Button */}
                                    <button
                                        onClick={() => setSelectedMemoId(null)}
                                        className="md:hidden text-white font-bold text-lg"
                                    >
                                        ←
                                    </button>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#4ade80]">Last Edited: {new Date(selectedMemo.updatedAt).toLocaleString('ko-KR')}</span>
                                </div>
                                <button
                                    onClick={() => setDeleteId(selectedMemo.id)}
                                    className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-8 pt-0">
                            <textarea
                                className="w-full h-full bg-transparent text-sm font-medium text-gray-300 outline-none resize-none leading-relaxed placeholder:text-gray-700 custom-scrollbar whitespace-pre-wrap"
                                placeholder="내용을 입력하세요..."
                                value={localContent}
                                onChange={handleContentChange}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                        <div className="text-6xl mb-4">📝</div>
                        <p className="text-xl font-black text-white">메모를 선택하거나 새로 만드세요.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#1c2621] w-full max-w-sm rounded-[2rem] border border-red-500/20 shadow-2xl overflow-hidden">
                        <div className="p-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 text-3xl">
                                🗑️
                            </div>
                            <h3 className="text-xl font-black text-white">메모 영구 삭제</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                이 작업은 되돌릴 수 없습니다.<br />
                                정말로 이 메모를 삭제하시겠습니까?
                            </p>
                        </div>
                        <div className="flex border-t border-white/5 bg-black/20">
                            <button
                                onClick={() => setDeleteId(null)}
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

export default MemoView;
