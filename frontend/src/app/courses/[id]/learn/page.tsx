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
  hasTrial: boolean; 
}

interface Progress {
  unitId: string;
  progressPercent: number;
  lastPositionSeconds: number;
  completed: boolean;
}

// --- 進度圓環元件 ---
const CircularProgress = ({ percent, completed, onClick, locked }: { percent: number; completed: boolean; onClick?: (e: React.MouseEvent) => void, locked?: boolean }) => {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;
    
    const handleClick = (e: React.MouseEvent) => {
        if (completed && onClick && !locked) {
            e.stopPropagation(); 
            onClick(e);
        }
    };

    if (locked) {
        return (
            <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full" viewBox="0 0 40 40">
                     <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#374151" strokeWidth="3" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">
                    🔒
                </div>
            </div>
        )
    }

    return (
        <div 
            className={`relative w-10 h-10 flex items-center justify-center flex-shrink-0 transition-transform ${completed ? "cursor-pointer hover:scale-110" : ""}`}
            onClick={handleClick}
            title={completed ? "點擊交付單元" : `目前進度: ${percent}%`}
        >
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#374151" strokeWidth="3" />
                {!completed && percent > 0 && (
                    <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#FBBF24" strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-500 ease-out" />
                )}
                {completed && (
                    <circle cx="20" cy="20" r={radius} fill="#10B981" stroke="#10B981" strokeWidth="0" />
                )}
            </svg>
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
  const [isPurchased, setIsPurchased] = useState(false); 
  const [isTrialMode, setIsTrialMode] = useState(false); // 標記是否為試聽狀態
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const videoRef = useRef<HTMLVideoElement>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const hasRestoredPosition = useRef(false);

  useEffect(() => {
    const init = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

        // 1. 獲取課程資訊
        const courseRes = await fetch(`${API_URL}/api/courses/${courseId}`);
        if (!courseRes.ok) throw new Error("Course not found");
        const courseData = await courseRes.json();
        setCourse(courseData);

        // 解析課綱
        let parsedSyllabus: Chapter[] = [];
        if (courseData.syllabusJson) {
          parsedSyllabus = JSON.parse(courseData.syllabusJson);
          setSyllabus(parsedSyllabus);
          if (parsedSyllabus.length > 0) {
              setExpandedChapters(new Set([parsedSyllabus[0].id]));
          }
        }

        // 2. 權限檢查邏輯
        let purchased = false;
        
        // 如果有 Token，檢查是否購買
        if (token) {
            try {
                const orderRes = await fetch(`${API_URL}/api/orders/my`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (orderRes.ok) {
                    const orders: any[] = await orderRes.json();
                    purchased = orders.some((o: any) => o.course.id === courseId && o.status === 'PAID');
                }
            } catch(e) { console.error("Check order failed", e); }
            
            // 已登入 (無論是否購買) 都獲取進度
            const progressRes = await fetch(`${API_URL}/api/progress/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (progressRes.ok) {
                const progressData: Progress[] = await progressRes.json();
                const map = new Map<string, Progress>();
                progressData.forEach((p) => map.set(p.unitId, p));
                setProgressMap(map);
            }
        }
        
        setIsPurchased(purchased);

        // 3. 綜合判斷：未購買 且 不開放試聽 -> 強制登入/踢出
        // 若開放試聽，則允許進入，但進入試聽模式
        if (!purchased && !courseData.hasTrial && !token) {
             window.location.href = "/login";
             return;
        }
        
        if (!purchased && courseData.hasTrial) {
            setIsTrialMode(true);
        }

        // 4. 預設播放單元
        if (parsedSyllabus.length > 0 && parsedSyllabus[0].units.length > 0) {
            handleUnitSelect(parsedSyllabus[0].units[0], purchased, courseData.hasTrial, parsedSyllabus);
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

  const handleUnitSelect = (unit: Unit, purchasedOverride?: boolean, hasTrialOverride?: boolean, syllabusOverride?: Chapter[]) => {
    const currentPurchased = purchasedOverride !== undefined ? purchasedOverride : isPurchased;
    const currentHasTrial = hasTrialOverride !== undefined ? hasTrialOverride : course?.hasTrial;
    const currentSyllabus = syllabusOverride || syllabus;

    // 權限判斷
    if (!currentPurchased) {
        if (currentHasTrial) {
            // 如果有試聽功能：只能看第一章第一節
            const firstUnitId = currentSyllabus[0]?.units[0]?.id;
            if (unit.id !== firstUnitId) {
                alert("🔒 這是付費內容，請購買課程以解鎖完整內容！");
                return;
            }
        } else {
            alert("請先購買課程！");
            return;
        }
    }

    setActiveUnit(unit);
    hasRestoredPosition.current = false;
    setVideoError(false);
    
    if (unit.videoId) {
        setVideoSrc(`/videos/${unit.videoId}.mp4`);
    } else {
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
      // 即使是試聽，如果有登入且進度滿了，也允許交付 (增加轉換率)
      // 或者維持原邏輯：試聽不能交付，必須購買。這邊維持原邏輯，鼓勵購買。
      if (!isPurchased) {
          alert("試聽模式無法交付單元喔！請購買課程以解鎖成就系統。");
          return;
      }
      alert(`🎉 交付成功！\n您已獲得單元經驗值。`);
  };

  // --- 播放器事件處理 ---
  // 修正：只要有 User (已登入)，即使是 TrialMode 也要同步進度
  
  const onLoadedMetadata = () => {
      if (!videoRef.current || !activeUnit) return;
      // 只要有 user 就嘗試恢復進度
      if (!user) return; 

      const record = progressMap.get(activeUnit.id);
      if (record && record.lastPositionSeconds > 0 && !hasRestoredPosition.current) {
          videoRef.current.currentTime = record.lastPositionSeconds;
          hasRestoredPosition.current = true;
      }
  };

  const onPlay = () => {
      if (!user) return; // 未登入不紀錄
      if (!heartbeatInterval.current) heartbeatInterval.current = setInterval(syncProgress, 10000);
  };

  const onPause = () => {
      if (user) syncProgress();
      if (heartbeatInterval.current) { clearInterval(heartbeatInterval.current); heartbeatInterval.current = null; }
  };

  const onEnded = () => {
      if (user) syncProgress(true);
      if (heartbeatInterval.current) { clearInterval(heartbeatInterval.current); heartbeatInterval.current = null; }
  };

  const onVideoError = () => {
      console.warn(`Video file not found: ${videoSrc}`);
      setVideoError(true);
  };

  const syncProgress = async (forceComplete = false) => {
      // 雙重確認：如果沒有 user (未登入)，絕對不打 API
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
          
          await fetch(`${API_URL}/api/progress/courses/${courseId}/units/${activeUnit.id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
              body: JSON.stringify({ position: Math.floor(currentTime), progress: progressPercent })
          });

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
           <Link href="/my-courses" className="text-gray-400 hover:text-white transition">← 返回課程列表</Link>
           <div className="h-6 w-px bg-white/10 mx-2"></div>
           <h1 className="font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-md">{course?.title}</h1>
           {activeUnit && <><span className="text-gray-600">/</span><span className="text-[#fbbf24] text-sm truncate">{activeUnit.title}</span></>}
        </div>
        <div className="flex items-center gap-4">
            {isTrialMode && (
                <span className="bg-[#fbbf24] text-black px-3 py-1 rounded text-xs font-bold animate-pulse">
                    {user ? "試聽模式 (已記錄進度)" : "試聽模式 (登入後可保存進度)"}
                </span>
            )}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-gray-400">{isSidebarOpen ? '✕' : '☰'} 目錄</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 bg-black relative flex items-center justify-center group">
            {activeUnit ? (
                <div className="w-full h-full relative flex items-center justify-center">
                    {videoError ? (
                        <div className="flex flex-col items-center gap-6 text-center p-8 animate-in fade-in zoom-in duration-500">
                            <div className="relative">
                                <div className="text-6xl opacity-80">🚧</div>
                                <div className="absolute -bottom-2 -right-2 bg-[#fbbf24] text-black text-xs font-bold px-2 py-1 rounded-full">WIP</div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">此單元尚未開課</h2>
                                <p className="text-gray-400 text-sm">講師正在努力製作中，敬請期待！</p>
                                <p className="text-xs text-gray-600 mt-4 font-mono">Missing: /videos/{activeUnit.videoId}.mp4</p>
                            </div>
                        </div>
                    ) : (
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
                            onError={onVideoError} 
                        >
                            <p>您的瀏覽器不支援影片播放</p>
                        </video>
                    )}
                </div>
            ) : (
                <div className="text-gray-500">請選擇單元開始上課</div>
            )}
        </main>

        <aside className={`bg-[#181a25] border-l border-white/10 w-96 flex-shrink-0 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full w-0 opacity-0 overflow-hidden'} fixed md:relative right-0 h-full z-20 md:z-auto`}>
            <div className="p-5 border-b border-white/10 flex-shrink-0">
                <h2 className="font-bold text-white text-lg">課程大綱</h2>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">共 {syllabus.reduce((acc, ch) => acc + ch.units.length, 0)} 個單元</span>
                    <span className="text-xs text-[#fbbf24]">
                        總進度 {Math.round((Array.from(progressMap.values()).filter(p => p.completed).length / Math.max(1, syllabus.reduce((acc, ch) => acc + ch.units.length, 0))) * 100)}%
                    </span>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {syllabus.map((chapter, cIndex) => {
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
                            
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="pb-2">
                                    {chapter.units.map((unit, uIndex) => {
                                        const isActive = activeUnit?.id === unit.id;
                                        const progress = progressMap.get(unit.id);
                                        const isCompleted = progress?.completed || false;
                                        const percent = progress?.progressPercent || 0;
                                        
                                        // 鎖定邏輯：如果是試聽模式 (isTrialMode=true)，只有第一章第一節不鎖
                                        const isLocked = isTrialMode && (cIndex !== 0 || uIndex !== 0);
                                        
                                        return (
                                            <div 
                                                key={unit.id} 
                                                className={`
                                                    relative flex gap-4 px-5 py-4 transition cursor-pointer border-l-4
                                                    ${isActive ? "bg-[#fbbf24]/5 border-[#fbbf24]" : "border-transparent hover:bg-white/5"}
                                                    ${isLocked ? "opacity-50" : ""}
                                                `}
                                                onClick={() => handleUnitSelect(unit)}
                                            >
                                                <div className="flex-shrink-0 pt-0.5">
                                                    <CircularProgress 
                                                        percent={percent} 
                                                        completed={isCompleted} 
                                                        locked={isLocked}
                                                        onClick={() => handleDeliverUnit(unit.id)}
                                                    />
                                                </div>

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
                                                        {isLocked && <span className="text-[10px] text-red-400">付費解鎖</span>}
                                                    </div>
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