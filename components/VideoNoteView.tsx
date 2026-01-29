import React, { useState, useMemo, useEffect, useRef } from 'react';
import { VideoNote } from '../types';

interface VideoNoteViewProps {
  videoNotes: VideoNote[];
  addVideoNote: () => Promise<string>;
  updateVideoNote: (id: string, updates: Partial<VideoNote>) => void;
  deleteVideoNote: (id: string) => void;
}

const VideoNoteView: React.FC<VideoNoteViewProps> = ({
  videoNotes,
  addVideoNote,
  updateVideoNote,
  deleteVideoNote
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 로컬 상태로 입력 관리
  const [localScript, setLocalScript] = useState('');
  const [localMemo, setLocalMemo] = useState('');
  const scriptTimerRef = useRef<NodeJS.Timeout | null>(null);
  const memoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // 최신순 정렬 (미완료 노트만)
  const sortedNotes = useMemo(() => {
    return [...videoNotes]
      .filter(note => !note.completed)
      .sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [videoNotes]);

  const selectedNote = selectedNoteId 
    ? videoNotes.find(n => n.id === selectedNoteId) 
    : null;

  // 초기 로드 시 노트가 없으면 자동으로 첫 노트 생성
  useEffect(() => {
    if (!isInitialized && videoNotes.length === 0) {
      handleCreateNote();
      setIsInitialized(true);
    } else if (!isInitialized && videoNotes.length > 0) {
      // 노트가 있으면 첫 번째 노트 선택
      setSelectedNoteId(sortedNotes[0]?.id || null);
      setIsInitialized(true);
    }
  }, [videoNotes.length, isInitialized]);

  // selectedNote가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    if (selectedNote) {
      setLocalScript(selectedNote.script);
      setLocalMemo(selectedNote.memo);
    } else {
      setLocalScript('');
      setLocalMemo('');
    }
  }, [selectedNote?.id]);

  // 대본 첫 줄을 제목으로 추출
  const getTitle = (script: string) => {
    if (!script.trim()) return '(제목 없음)';
    const firstLine = script.split('\n')[0].trim();
    return firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine;
  };

  // 새 노트 생성
  const handleCreateNote = async () => {
    const newId = await addVideoNote();
    if (newId) {
      setSelectedNoteId(newId);
      setIsMobileDetailView(true);
    }
  };

  // URL 추가
  const handleAddUrl = () => {
    if (!selectedNote || !urlInput.trim()) return;
    
    const newUrls = [...selectedNote.videoUrls, urlInput.trim()];
    updateVideoNote(selectedNote.id, { 
      videoUrls: newUrls,
      updatedAt: new Date().toISOString()
    });
    setUrlInput('');
  };

  // URL 삭제
  const handleRemoveUrl = (index: number) => {
    if (!selectedNote) return;
    
    const newUrls = selectedNote.videoUrls.filter((_, i) => i !== index);
    updateVideoNote(selectedNote.id, { 
      videoUrls: newUrls,
      updatedAt: new Date().toISOString()
    });
  };

  // 대본 변경 (debounced)
  const handleScriptChange = (script: string) => {
    if (!selectedNote) return;
    setLocalScript(script);
    
    // 기존 타이머 취소
    if (scriptTimerRef.current) {
      clearTimeout(scriptTimerRef.current);
    }
    
    // 400ms 후 저장
    scriptTimerRef.current = setTimeout(() => {
      updateVideoNote(selectedNote.id, { 
        script,
        updatedAt: new Date().toISOString()
      });
    }, 400);
  };

  // 메모 변경 (debounced)
  const handleMemoChange = (memo: string) => {
    if (!selectedNote) return;
    setLocalMemo(memo);
    
    // 기존 타이머 취소
    if (memoTimerRef.current) {
      clearTimeout(memoTimerRef.current);
    }
    
    // 400ms 후 저장
    memoTimerRef.current = setTimeout(() => {
      updateVideoNote(selectedNote.id, { 
        memo,
        updatedAt: new Date().toISOString()
      });
    }, 400);
  };

  // 완료 토글
  const handleToggleComplete = () => {
    if (!selectedNote) return;
    updateVideoNote(selectedNote.id, { 
      completed: !selectedNote.completed,
      updatedAt: new Date().toISOString()
    });
  };

  // 노트 삭제
  const handleDelete = () => {
    if (!selectedNote) return;
    if (confirm('이 작업 노트를 삭제하시겠습니까?')) {
      deleteVideoNote(selectedNote.id);
      setSelectedNoteId(null);
      setIsMobileDetailView(false);
    }
  };

  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  // 대본 복사 함수
  const handleCopyScript = async () => {
    if (!localScript.trim()) return;
    
    try {
      await navigator.clipboard.writeText(localScript);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">🎬 영상 작업 노트</h2>
            <p className="text-gray-400 text-sm">아이디어와 대본을 빠르게 기록하세요</p>
          </div>
          <button
            onClick={handleCreateNote}
            className="bg-[#4ade80] hover:bg-[#22c55e] text-[#0f1712] font-black px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95"
          >
            + 새 노트
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 - 2단 레이아웃 */}
      <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
        {/* 왼쪽: 노트 리스트 - 폭 축소 */}
        <div className={`
          ${isMobileDetailView ? 'hidden md:block' : 'block'} 
          w-full md:w-[280px] flex-shrink-0 flex flex-col
        `}>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
            {sortedNotes.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="text-5xl mb-4 animate-pulse">📝</div>
                <p className="text-gray-400 font-bold mb-2">첫 노트 생성 중...</p>
                <p className="text-gray-600 text-sm">잠시만 기다려주세요</p>
              </div>
            ) : (
              sortedNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => {
                    setSelectedNoteId(note.id);
                    setIsMobileDetailView(true);
                  }}
                  className={`
                    w-full text-left p-4 rounded-xl border transition-all
                    ${selectedNoteId === note.id 
                      ? 'bg-[#4ade80]/10 border-[#4ade80]/50 shadow-lg' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className={`font-bold text-xs flex-1 line-clamp-2 ${note.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                      {getTitle(note.script)}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {note.videoUrls.length > 0 && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
                          🎥 {note.videoUrls.length}
                        </span>
                      )}
                      {note.completed && (
                        <span className="text-green-400 text-xs">✓</span>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    {formatDate(note.updatedAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 오른쪽: 상세 내용 */}
        <div className={`
          ${isMobileDetailView ? 'block' : 'hidden md:block'} 
          flex-1 flex flex-col min-w-0 bg-[#1c2621]/50 rounded-2xl border border-white/10 overflow-hidden relative
        `}>
          {selectedNote ? (
            <>
              {/* 모바일 뒤로가기 버튼 */}
              <button
                onClick={() => setIsMobileDetailView(false)}
                className="md:hidden absolute top-4 left-4 z-10 text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm border border-white/10"
              >
                ← 목록
              </button>

              {/* 우측 상단 액션 버튼들 (개선된 디자인) */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <button
                  onClick={handleToggleComplete}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all backdrop-blur-sm border shadow-lg
                    ${selectedNote.completed 
                      ? 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30' 
                      : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
                    }
                  `}
                >
                  {selectedNote.completed ? (
                    <>
                      <span className="text-base">✓</span>
                      <span className="hidden sm:inline">완료됨</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">○</span>
                      <span className="hidden sm:inline">미완료</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 font-bold text-sm transition-all backdrop-blur-sm shadow-lg"
                >
                  <span className="text-base">🗑️</span>
                  <span className="hidden sm:inline">삭제</span>
                </button>
              </div>

              {/* 스크롤 가능한 컨텐츠 영역 */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-20 pb-6 pr-6 md:pt-20 md:pr-6 space-y-6">
                {/* 참고 영상 주소 */}
                <div>
                  <label className="block text-sm font-black text-gray-400 mb-3 uppercase tracking-wider">
                    📹 참고 영상 주소
                  </label>
                  <div className="space-y-3">
                    {selectedNote.videoUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white/5 rounded-lg p-3 border border-white/10">
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 text-xs text-[#4ade80] hover:underline truncate"
                        >
                          {url}
                        </a>
                        <button
                          onClick={() => handleRemoveUrl(index)}
                          className="text-red-400 hover:text-red-300 text-sm px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="YouTube URL 추가..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600 outline-none focus:border-[#4ade80]/50"
                      />
                      <button
                        onClick={handleAddUrl}
                        className="bg-[#4ade80] hover:bg-[#22c55e] text-[#0f1712] font-bold px-4 rounded-lg text-sm"
                      >
                        추가
                      </button>
                    </div>
                  </div>
                </div>

                {/* 대본 (메인) - 로컬 상태 사용 + 복사 버튼 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-black text-gray-400 uppercase tracking-wider">
                      📄 대본
                    </label>
                    <button
                      onClick={handleCopyScript}
                      disabled={!localScript.trim()}
                      className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                        ${copySuccess 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
                        }
                        ${!localScript.trim() && 'opacity-50 cursor-not-allowed'}
                      `}
                    >
                      {copySuccess ? (
                        <>
                          <span>✓</span>
                          <span>복사됨</span>
                        </>
                      ) : (
                        <>
                          <span>📋</span>
                          <span>복사</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    placeholder="대본을 입력하세요... (첫 줄이 제목으로 표시됩니다)"
                    value={localScript}
                    onChange={(e) => handleScriptChange(e.target.value)}
                    className="w-full h-80 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-gray-600 outline-none focus:border-[#4ade80]/50 resize-none font-mono text-sm leading-relaxed"
                  />
                </div>

                {/* 메모 (서브) - 로컬 상태 사용 */}
                <div>
                  <label className="block text-sm font-black text-gray-400 mb-3 uppercase tracking-wider">
                    💭 메모 & 아이디어
                  </label>
                  <textarea
                    placeholder="짧은 생각, 보조 아이디어를 메모하세요..."
                    value={localMemo}
                    onChange={(e) => handleMemoChange(e.target.value)}
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-gray-600 outline-none focus:border-[#4ade80]/50 resize-none text-sm leading-relaxed"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="text-6xl mb-4 opacity-20 animate-pulse">📝</div>
                <p className="text-gray-500 font-bold">노트를 불러오는 중...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoNoteView;
