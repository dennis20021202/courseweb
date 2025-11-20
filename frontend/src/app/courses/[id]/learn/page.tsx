"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Unit {
  id: string;
  title: string;
  videoId?: string; // videoId 可能為 undefined (代表尚未開課)
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

export default function LearnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseId = Number(id);
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [syllabus, setSyllabus] = useState<Chapter[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, Progress>>(new Map());
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoSrc, setVideoSrc] = useState("");
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // 新增：影片錯誤狀態
  const [videoError, setVideoError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const hasRestoredPosition = useRef(false);

  useEffect(() => {
    const init = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
             // 強制導回登入，保護學習頁面
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

        // 3. 預設選取上次觀看的單元，或是第一個
        // (簡單起見，這裡先選第一個有 videoId 的，或者就是第一個單元)
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
    setVideoError(false); // 重置錯誤狀態
    
    if (unit.videoId) {
        setVideoSrc(`/videos/${unit.videoId}.mp4`);
    } else {
        setVideoSrc(""); // 無影片
    }

    if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
    }
  };

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

  // 新增：處理影片載入錯誤
  const onVideoError = () => {
      console.log("影片載入失敗");
      setVideoError(true);
  };

  const syncProgress = async (forceComplete = false) => {
      if (!activeUnit || !videoRef.current || !user || !activeUnit.videoId || videoError) return;
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
              newMap.set(activeUnit.id, { ...old, lastPositionSeconds: Math.floor(currentTime), progressPercent: Math.max(old.progressPercent, progressPercent), completed: forceComplete || old.completed || progressPercent >= 100 });
              return newMap;
          });
      } catch (err) { console.error(err); }
  };

  if (loading) return <div className="min-h-screen bg-[#12141c] flex items-center justify-center text-white">載入中...</div>;

  return (
    <div className="flex flex-col h-screen bg-[#12141c] text-white overflow-hidden">
      <header className="h-16 bg-[#181a25] border-b border-white/10 flex items-center px-6 flex-shrink-0 justify-between">
        <div className="flex items-center gap-4">
           <Link href="/my-courses" className="text-gray-400 hover:text-white transition">← 返回我的課程</Link>
           <div className="h-6 w-px bg-white/10 mx-2"></div>
           <h1 className="font-bold text-sm md:text-base truncate max-w-[200px] md:max-w-md">{course?.title}</h1>
           {activeUnit && <><span className="text-gray-600">/</span><span className="text-[#fbbf24] text-sm truncate">{activeUnit.title}</span></>}
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-gray-400">{isSidebarOpen ? '✕' : '☰'} 目錄</button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 bg-black relative flex items-center justify-center group">
            {activeUnit ? (
                <div className="w-full h-full relative flex items-center justify-center">
                    {/* 狀態判斷邏輯 */}
                    {!activeUnit.videoId ? (
                        // 情況 A: 沒有 videoId -> 尚未開課
                        <div className="flex flex-col items-center gap-4 text-gray-400 p-8 text-center">
                            <div className="text-6xl">🚧</div>
                            <h2 className="text-2xl font-bold text-white">此單元尚未開課</h2>
                            <p className="text-sm">講師正在努力製作中，敬請期待！</p>
                        </div>
                    ) : videoError ? (
                        // 情況 B: 有 videoId 但載入失敗 -> 顯示錯誤
                        <div className="flex flex-col items-center gap-4 text-gray-400 p-8 text-center">
                            <div className="text-6xl">⚠️</div>
                            <h2 className="text-2xl font-bold text-white">影片暫時無法播放</h2>
                            <p className="text-sm max-w-md">
                                系統找不到檔案 <code>/videos/{activeUnit.videoId}.mp4</code>。
                                <br />請確認檔案是否已上傳至 public 資料夾。
                            </p>
                            <button onClick={() => { setVideoError(false); setVideoSrc(`/videos/${activeUnit.videoId}.mp4?t=${Date.now()}`); }} className="mt-4 px-4 py-2 bg-white/10 rounded hover:bg-white/20 transition">重試</button>
                        </div>
                    ) : (
                        // 情況 C: 正常播放
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

        <aside className={`bg-[#181a25] border-l border-white/10 w-80 flex-shrink-0 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full w-0 opacity-0 overflow-hidden'} fixed md:relative right-0 h-full z-20 md:z-auto`}>
            <div className="p-5 border-b border-white/10">
                <h2 className="font-bold text-white">課程大綱</h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {syllabus.map((chapter) => (
                    <div key={chapter.id} className="mb-4">
                        <h3 className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-2">{chapter.title}</h3>
                        <div className="space-y-0.5">
                            {chapter.units.map((unit) => {
                                const isActive = activeUnit?.id === unit.id;
                                const isCompleted = progressMap.get(unit.id)?.completed;
                                
                                return (
                                    <button
                                        key={unit.id}
                                        onClick={() => handleUnitSelect(unit)}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition relative group ${isActive ? "bg-[#fbbf24]/10 text-[#fbbf24]" : "hover:bg-white/5 text-gray-300"}`}
                                    >
                                        <div className="flex-shrink-0">
                                            {isCompleted ? <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">✓</div> : <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isActive ? "border-[#fbbf24]" : "border-gray-600"}`}></div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{unit.title}</p>
                                            {/* 在側邊欄標示狀態 */}
                                            <p className="text-[10px] text-gray-500 flex items-center gap-2">
                                                {unit.videoId ? (
                                                    <span>影片</span>
                                                ) : (
                                                    <span className="text-orange-400 border border-orange-400/30 px-1 rounded">尚未開課</span>
                                                )}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
      </div>
    </div>
  );
}