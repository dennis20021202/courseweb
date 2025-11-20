"use client"; 
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // 修正 import
import CheckoutModal from "@/components/CheckoutModal"; 

interface Course {
    id: number;
    title: string;
    author: string;
    description: string;
    image: string;
    tags: string;
    price: number;
    originalPrice: number;
    longDescription?: string;
    highlight: boolean;
    promoText: string | null;
    syllabusJson?: string; 
    recommended: boolean;
    hasTrial: boolean;
}

const FEATURES = [
    {
        title: "軟體設計模式之旅課程",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        ),
        description: "「用一趟旅程的時間，成為硬核的 Coding 高手」—— 精通一套高效能的 OOAD 思路。",
        action: "查看課程",
        href: "/courses"
    },
    {
        title: "水球潘的部落格",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
        ),
        description: "觀看水球撰寫的軟體工程師職涯、軟體設計模式及架構學問，以及領域驅動設計等公開文章。",
        action: "閱讀文章",
        href: "/blog"
    },
    {
        title: "直接與老師或是其他工程師交流",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        ),
        description: "加入水球成立的工程師 Discord 社群，與水球以及其他工程師線上交流，培養學習習慣及樂趣。",
        action: "加入 Discord",
        href: "https://discord.gg/waterballsa", 
        extraAction: "加入 Facebook 社團"
    },
    {
        title: "技能評級及證書系統",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
        ),
        description: "通過技能評級、獲取證書，打造你的職涯籌碼，讓你在就業市場上脫穎而出。",
        action: "了解更多",
        href: "/certificates"
    }
];

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<Set<number>>(new Set());
  const [pendingOrderMap, setPendingOrderMap] = useState<Map<number, number>>(new Map());
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [existingOrderId, setExistingOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchCoursesAndStatus = async () => {
          try {
              const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
              
              // 1. 取得所有課程，並在前端過濾 "recommended"
              const res = await fetch(`${API_URL}/api/courses`);
              if (res.ok) {
                  const data = await res.json();
                  setCourses(data.filter((c: Course) => c.recommended));
              }

              // 2. 如果已登入，檢查購買狀態
              const token = sessionStorage.getItem("token");
              if (token) {
                  const orderRes = await fetch(`${API_URL}/api/orders/my`, {
                       headers: { "Authorization": `Bearer ${token}` }
                  });
                  if (orderRes.ok) {
                      const orders: any[] = await orderRes.json();
                      const paidIds = new Set<number>();
                      const pendingMap = new Map<number, number>();

                      orders.forEach(o => {
                          if (o.status === 'PAID') paidIds.add(o.course.id);
                          else if (o.status === 'PENDING') pendingMap.set(o.course.id, o.id);
                      });
                      
                      setPurchasedCourseIds(paidIds);
                      setPendingOrderMap(pendingMap);
                  }
              }
          } catch (err) {
              console.error("載入失敗:", err);
          } finally {
              setLoading(false);
          }
      };
      
      fetchCoursesAndStatus();
  }, []);

  const handlePurchase = (course: Course) => {
    if (purchasedCourseIds.has(course.id)) {
        window.location.href = `/courses/${course.id}/learn`;
    } else if (pendingOrderMap.has(course.id)) {
        setExistingOrderId(pendingOrderMap.get(course.id) || null);
        setSelectedCourse(course);
    } else {
        setExistingOrderId(null);
        setSelectedCourse(course);
    }
  };

  const handleTrial = (courseId: number) => {
      window.location.href = `/courses/${courseId}/learn`;
  };

  return (
    <div className="space-y-16"> 
      
      {selectedCourse && (
          <CheckoutModal 
            course={selectedCourse} 
            existingOrderId={existingOrderId}
            onClose={() => { setSelectedCourse(null); setExistingOrderId(null); }}
          />
      )}

      {/* Banner */}
      <div className="space-y-8">
        <div className="space-y-4 py-4">
            <h2 className="text-4xl font-bold text-white tracking-tight">歡迎來到水球軟體學院</h2>
            <p className="text-gray-400 max-w-4xl leading-relaxed text-lg">
            水球軟體學院提供最先進的軟體設計思路教材，並透過線上 Code Review 來帶你掌握進階軟體架構能力。
            只要每週投資 5 小時，就能打造不平等的優勢，成為硬核的 Coding 實戰高手。
            </p>
        </div>

        <div className="mb-6">
             <h3 className="text-2xl font-bold text-[#fbbf24] border-b border-white/10 pb-4 mb-6 flex items-center gap-2">
                🔥 推薦課程
                <Link href="/courses" className="text-xs text-gray-500 hover:text-white ml-auto font-normal transition">查看所有課程 →</Link>
             </h3>
             {loading ? (
                <div className="text-center text-gray-500 py-20">資料庫載入中...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((course) => {
                        const isPurchased = purchasedCourseIds.has(course.id);
                        const isPending = pendingOrderMap.has(course.id);
                        const showTrial = course.hasTrial && !isPurchased;
                        
                        return (
                            <div key={course.id} className={`group relative bg-[#20222e] rounded-xl overflow-hidden border ${course.highlight ? 'border-[#fbbf24]/50 shadow-[0_0_15px_rgba(251,191,36,0.1)]' : 'border-white/10'} hover:border-[#fbbf24]/80 transition cursor-pointer flex flex-col h-full`}>
                                
                                {/* 試聽懸浮標籤 */}
                                {showTrial && (
                                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                        <div className="bg-[#fbbf24] text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                            <span>🎁</span>
                                            <span>免費試聽第一章</span>
                                        </div>
                                    </div>
                                )}

                                <div className="relative w-full aspect-[16/9] bg-black">
                                    <img 
                                        src={course.image} 
                                        alt={course.title} 
                                        className="w-full h-full object-cover absolute inset-0"
                                        onError={(e) => e.currentTarget.src = '/images/course_0.png'} 
                                    />
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#fbbf24] transition">{course.title}</h3>
                                    
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="bg-[#fbbf24] text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">潘</span>
                                        <span className="text-[#fbbf24] text-sm font-bold">{course.author}</span>
                                    </div>

                                    <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
                                        {course.description}
                                    </p>

                                    <div className="flex gap-2 flex-wrap mb-8">
                                        {course.tags && course.tags.split(',').map(tag => (
                                        <span key={tag} className="px-3 py-1.5 bg-[#2a2d3e] rounded-md text-xs text-gray-400 border border-white/5 hover:text-white hover:border-white/20 transition">
                                            #{tag}
                                        </span>
                                        ))}
                                    </div>

                                    <div className="mt-auto space-y-4">
                                        {course.promoText && (
                                            <div className="text-[#fbbf24] text-sm text-center font-medium">
                                                {course.promoText}
                                            </div>
                                        )}
                                        
                                        <div className="flex gap-3">
                                            {showTrial && (
                                                <button 
                                                    onClick={() => handleTrial(course.id)}
                                                    className="flex-1 py-3 rounded-lg text-sm font-bold border border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24]/10 transition"
                                                >
                                                    立刻體驗
                                                </button>
                                            )}
                                            
                                            <button 
                                                onClick={() => handlePurchase(course)}
                                                className={`flex-1 py-3 rounded-lg text-sm font-bold transition shadow-lg
                                                    ${isPurchased 
                                                        ? 'bg-green-600 text-white hover:bg-green-500' 
                                                        : isPending
                                                            ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                                                            : 'bg-[#fbbf24] text-black hover:bg-yellow-300 shadow-yellow-500/20'
                                                    }`}
                                            >
                                                {isPurchased ? "去上課" : isPending ? "繼續付款" : "立刻購買"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {FEATURES.map((feature, idx) => (
            <div key={idx} className="bg-[#181a25] border border-white/5 rounded-2xl p-8 flex flex-col hover:bg-[#20222e] transition duration-300">
                <div className="flex items-center gap-3 mb-4 text-white">
                    {feature.icon}
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                </div>
                <p className="text-gray-400 leading-relaxed mb-8 flex-1">
                    {feature.description}
                </p>
                <div className="flex gap-4">
                    {feature.href.startsWith("http") ? (
                        <a href={feature.href} target="_blank" rel="noopener noreferrer" className="bg-[#fbbf24] text-black px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-yellow-300 transition flex items-center gap-2">
                             {feature.action}
                        </a>
                    ) : (
                        <Link href={feature.href} className="bg-[#fbbf24] text-black px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-yellow-300 transition flex items-center gap-2">
                            {feature.action}
                        </Link>
                    )}
                </div>
            </div>
         ))}
      </div>
      
      {/* 水球潘個人介紹 */}
      <section className="bg-[#181a25] border border-white/5 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-shrink-0 relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-[#fbbf24]/20 shadow-2xl shadow-[#fbbf24]/10">
            <img
              src="/images/avatar.webp"
              alt="水球潘"
              className="w-full h-full object-cover absolute inset-0"
            />
        </div>
        <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">水球潘</h2>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                    七年程式教育者 & 軟體設計學講師，致力於將複雜的軟體設計概念轉化為易於理解和實踐的教學內容。
                </p>
            </div>
            <ul className="space-y-3">
                {[
                    "主修 Christopher Alexander 設計模式、軟體架構、分散式系統架構、Clean Architecture、領域驅動設計等領域",
                    "過去 40 多場 Talk 平均 93 位觀眾參與",
                    "主辦的學院社群一年內成長超過 6000 位成員",
                    "帶領軟體工程方法論學習組織「GaaS」超過 200 多位成員，引領 30 組自組織團隊",
                    "領域驅動設計社群核心志工 & 講師"
                ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm md:text-base">
                        <span className="flex-shrink-0 mt-1 text-[#fbbf24]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
      </section>
      
      <footer className="border-t border-white/10 pt-8 pb-12 text-center text-gray-500 text-sm">
         <p>&copy; 2025 水球軟體學院. All rights reserved.</p>
      </footer>
    </div>
  );
}