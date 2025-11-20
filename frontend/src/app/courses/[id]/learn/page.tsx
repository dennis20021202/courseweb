"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- 介面定義 ---
interface Unit {
  id: string;
  title: string;
  videoId?: string; 
}

interface Chapter {
  id: string;
  title: string;
  units: Unit[];
}

interface Course {
  id: number;
  title: string;
  syllabusJson?: string;
}

interface Progress {
  unitId: string;
  progressPercent: number;
  lastPositionSeconds: number;
  completed: boolean;
}

// --- 進度圓環元件 ---
const CircularProgress = ({ percent, completed, onClick }: { percent: number; completed: boolean; onClick?: (e: React.MouseEvent) => void }) => {
    const radius = 16; // 稍微縮小一點以適應 Layout
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;
    
    const handleClick = (e: React.MouseEvent) => {
        if (completed && onClick) {
            e.stopPropagation(); // 阻止冒泡，避免觸發單元切換
            onClick(e);
        }
    };

    return (
        <div 
            className={`relative w-10 h-10 flex items-center justify-center flex-shrink-0 transition-transform ${completed ? "cursor-pointer hover:scale-110" : ""}`}
            onClick={handleClick}
            title={completed ? "點擊交付單元" : `目前進度: ${percent}%`}
        >
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                {/* 背景圓圈 (深色) */}
                <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    fill="transparent"
                    stroke="#374151" // gray-700
                    strokeWidth="3"
                />
                {/* 進度圓圈 (黃色，未完成時) */}
                {!completed && percent > 0 && (
                    <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        fill="transparent"
                        stroke="#FBBF24" 
                        strokeWidth="3"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                    />
                )}
                {/* 完成後的實心圓 (綠色) */}
                {completed && (
                    <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        fill="#10B981" // green-500
                        stroke="#10B981"
                        strokeWidth="0"
                    />
                )}
            </svg>
            
            {/* 中間文字 */}
            <div className="absolute inset-0 flex items-center justify-center">
                {completed ? (
                    <span className="text-[8px] font-bold text-black leading-tight text-center">已<br/>完成</span>
                ) : (
                    <span className={`text-[9px] font-mono font-bold ${percent > 0 ? "text-[#FBBF24]" : "text-gray-500"}`}>
                        {percent}%
                    </span>
                )}
            </div>
        </div>
    );
};

export default function LearnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseId = Number(id);
  const router = useRouter();

  // --- State ---
  const [course, setCourse] = useState<Course | null>(null);
  const [syllabus, setSyllabus] = useState<Chapter[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, Progress>>(new Map());
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoSrc, setVideoSrc] = useState("");
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [videoError, setVideoError] = useState(false); // 關鍵狀態：影片是否掛了
  
  // 預設展開第一個章節
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const videoRef = useRef<HTMLVideoElement>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const hasRestoredPosition = useRef(false);

  useEffect(() => {
    const init = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
             window.location.href = "/login";
             return;
        }
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

        // 1. 獲取課程
        const courseRes = await fetch(`${API_URL}/api/courses/${courseId}`);
        if (!courseRes.ok) throw new Error("Course not found");
        const courseData = await courseRes.json();
        setCourse(courseData);

        let parsedSyllabus: Chapter[] = [];
        if (courseData.syllabusJson) {
          parsedSyllabus = JSON.parse(courseData.syllabusJson);
          setSyllabus(parsedSyllabus);
          
          // 初始化展開第一個章節
          if (parsedSyllabus.length > 0) {
              setExpandedChapters(new Set([parsedSyllabus[0].id]));
          }
        }

        // 2. 獲取進度
        const progressRes = await fetch(`${API_URL}/api/progress/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (progressRes.ok) {
          const progressData: Progress[] = await progressRes.json();
          const map = new Map<string, Progress>();
          progressData.forEach((p) => map.set(p.unitId, p));
          setProgressMap(map);
        }

        // 3. 預設選取第一個
        if (parsedSyllabus.length > 0 && parsedSyllabus[0].units.length > 0) {
            handleUnitSelect(parsedSyllabus[0].units[0]);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
    return () => { if (heartbeatInterval.current) clearInterval(heartbeatInterval.current); };
  }, [courseId]);

  const handleUnitSelect = (unit: Unit) => {
    setActiveUnit(unit);
    hasRestoredPosition.current = false;
    setVideoError(false); // 重置錯誤，假設影片存在
    
    // 直接設定路徑，讓 onError 決定是否顯示 "尚未開課"
    if (unit.videoId) {
        setVideoSrc(`/videos/${unit.videoId}.mp4`);
    } else {
        // 防呆：如果資料庫連 videoId 都沒有，直接視為錯誤
        setVideoError(true);
    }

    if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
    }
  };

  const toggleChapter = (chapterId: string) => {
      setExpandedChapters(prev => {
          const newSet = new Set(prev);
          if (newSet.has(chapterId)) newSet.delete(chapterId);
          else newSet.add(chapterId);
          return newSet;
      });
  };

  const handleDeliverUnit = (unitId: string) => {
      // 模擬交付 (實際會打 API)
      alert(`🎉 交付成功！\n您已獲得單元經驗值。`);
  };

  // --- 影片事件 ---
  const onLoadedMetadata = () => {
      if (!videoRef.current || !activeUnit) return;
      const record = progressMap.get(activeUnit.id);
      if (record && record.lastPositionSeconds > 0 && !hasRestoredPosition.current) {
          videoRef.current.currentTime = record.lastPositionSeconds;
          hasRestoredPosition.current = true;
      }
  };

  const onPlay = () => {
      if (!heartbeatInterval.current) heartbeatInterval.current = setInterval(syncProgress, 10000);
  };

  const onPause = () => {
      syncProgress();
      if (heartbeatInterval.current) { clearInterval(heartbeatInterval.current); heartbeatInterval.current = null; }
  };

  const onEnded = () => {
      syncProgress(true);
      if (heartbeatInterval.current) { clearInterval(heartbeatInterval.current); heartbeatInterval.current = null; }
  };

  // 關鍵：當影片檔案不存在 (404) 時觸發
  const onVideoError = () => {
      console.warn(`Video file not found: ${videoSrc}`);
      setVideoError(true); // 切換到「尚未開課」畫面
  };

  const syncProgress = async (forceComplete = false) => {
      if (!activeUnit || !videoRef.current || !user || videoError) return;
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      if (!duration) return;
      
      let progressPercent = Math.floor((currentTime / duration) * 100);
      if (forceComplete) progressPercent = 100;
      
      try {
          const token = sessionStorage.getItem("token");
          if (!token) return;
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
          
          // 呼叫後端更新
          await fetch(`${API_URL}/api/progress/courses/${courseId}/units/${activeUnit.id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify({ position: Math.floor(currentTime), progress: progressPercent })
          });

          // 更新本地 State
          setProgressMap(prev => {
              const newMap = new Map(prev);
              const old = newMap.get(activeUnit.id) || { unitId: activeUnit.id, completed: false, lastPositionSeconds: 0, progressPercent: 0 };
              newMap.set(activeUnit.id, { 
                  ...old, 
                  lastPositionSeconds: Math.floor(currentTime), 
                  progressPercent: Math.max(old.progressPercent, progressPercent), 
                  completed: forceComplete || old.completed || progressPercent >= 100 
              });
              return newMap;
          });
      } catch (err) { console.error(err); }
  };

  if (loading) return <div className="min-h-screen bg-[#12141c] flex items-center justify-center text-white">載入中...</div>;

  return (
    <div className="flex flex-col h-screen bg-[#12141c] text-white overflow-hidden">
      <header className="h-16 bg-[#181a25] border-b border-white/10 flex items-center px-6 flex-shrink-0 justify-between z-30">
        <div className="flex items-center gap-4">
           <Link href="/my-courses" className="text-gray-400 hover:text-white transition">← 返回我的課程</Link>
           <div className="h-6 w-px bg-white/10 mx-2"></div>
           <h1 className="font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-md">{course?.title}</h1>
           {activeUnit && <><span className="text-gray-600">/</span><span className="text-[#fbbf24] text-sm truncate">{activeUnit.title}</span></>}
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-gray-400">{isSidebarOpen ? '✕' : '☰'} 目錄</button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 播放器區域 */}
        <main className="flex-1 bg-black relative flex items-center justify-center group">
            {activeUnit ? (
                <div className="w-full h-full relative flex items-center justify-center">
                    {videoError ? (
                        // 尚未開課畫面 (當 videoId 對應的檔案不存在時顯示)
                        <div className="flex flex-col items-center gap-6 text-center p-8 animate-in fade-in zoom-in duration-500">
                            <div className="relative">
                                <div className="text-6xl opacity-80">🚧</div>
                                <div className="absolute -bottom-2 -right-2 bg-[#fbbf24] text-black text-xs font-bold px-2 py-1 rounded-full">WIP</div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">此單元尚未開課</h2>
                                <p className="text-gray-400 text-sm">講師正在努力製作中，敬請期待！</p>
                                {/* Debug 用，正式版可隱藏 */}
                                <p className="text-xs text-gray-600 mt-4 font-mono">Missing: /videos/{activeUnit.videoId}.mp4</p>
                            </div>
                        </div>
                    ) : (
                        // 正常播放器
                        <video
                            ref={videoRef}
                            src={videoSrc}
                            className="w-full h-full object-contain"
                            controls
                            controlsList="nodownload"
                            onLoadedMetadata={onLoadedMetadata}
                            onPlay={onPlay}
                            onPause={onPause}
                            onEnded={onEnded}
                            onError={onVideoError} // 綁定錯誤處理
                        >
                            <p>您的瀏覽器不支援影片播放</p>
                        </video>
                    )}
                </div>
            ) : (
                <div className="text-gray-500">請選擇單元開始上課</div>
            )}
        </main>

        {/* 側邊欄 (課程大綱) */}
        <aside className={`bg-[#181a25] border-l border-white/10 w-96 flex-shrink-0 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full w-0 opacity-0 overflow-hidden'} fixed md:relative right-0 h-full z-20 md:z-auto`}>
            <div className="p-5 border-b border-white/10 flex-shrink-0">
                <h2 className="font-bold text-white text-lg">課程大綱</h2>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">共 {syllabus.reduce((acc, ch) => acc + ch.units.length, 0)} 個單元</span>
                    {/* 計算總進度 */}
                    <span className="text-xs text-[#fbbf24]">
                        總進度 {Math.round((Array.from(progressMap.values()).filter(p => p.completed).length / Math.max(1, syllabus.reduce((acc, ch) => acc + ch.units.length, 0))) * 100)}%
                    </span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {syllabus.map((chapter) => {
                    const isExpanded = expandedChapters.has(chapter.id);
                    return (
                        <div key={chapter.id} className="border-b border-white/5">
                            <button 
                                onClick={() => toggleChapter(chapter.id)}
                                className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition text-left group select-none"
                            >
                                <h3 className="text-sm font-bold text-gray-300 group-hover:text-white">{chapter.title}</h3>
                                <span className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                            </button>
                            
                            {/* 章節內容 (Accordion) */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="pb-2">
                                    {chapter.units.map((unit) => {
                                        // 修正判斷：只有當前點選的才是 active
                                        const isActive = activeUnit?.id === unit.id;
                                        const progress = progressMap.get(unit.id);
                                        const isCompleted = progress?.completed || false;
                                        const percent = progress?.progressPercent || 0;
                                        
                                        return (
                                            <div 
                                                key={unit.id} 
                                                className={`
                                                    relative flex gap-4 px-5 py-4 transition cursor-pointer border-l-4
                                                    ${isActive ? "bg-[#fbbf24]/5 border-[#fbbf24]" : "border-transparent hover:bg-white/5"}
                                                `}
                                                onClick={() => handleUnitSelect(unit)}
                                            >
                                                {/* 左側：進度圓環 */}
                                                <div className="flex-shrink-0 pt-0.5">
                                                    <CircularProgress 
                                                        percent={percent} 
                                                        completed={isCompleted} 
                                                        onClick={() => handleDeliverUnit(unit.id)}
                                                    />
                                                </div>

                                                {/* 右側：標題與資訊 */}
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <p className={`text-sm font-medium mb-1 leading-snug ${isActive ? "text-[#fbbf24]" : "text-gray-300"}`}>
                                                        {unit.title}
                                                    </p>
                                                    
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] bg-white/10 text-gray-500 px-1.5 py-0.5 rounded border border-white/5">影片</span>
                                                        {isActive && !videoError && (
                                                            <span className="text-[10px] text-[#fbbf24] flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24] animate-pulse"></span> 播放中
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* 交付提示語 */}
                                                    {isCompleted && (
                                                        <p className="text-[10px] text-[#10B981] mt-2 font-medium animate-in slide-in-from-left-2 fade-in duration-500">
                                                            ✨ 交付單元以獲得該單元的經驗值
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
      </div>
    </div>
  );
}