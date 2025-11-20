"use client"; // 轉為 Client Component 以使用 State

import { useState } from "react";
import Image from "next/image";
import { COURSES, Course } from "@/data/courses";
import CheckoutModal from "@/components/CheckoutModal"; // 引入 Modal

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
  // State 來控制當前選中的課程 Modal
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // 處理按鈕點擊
  const handleCourseAction = (course: Course) => {
    if (course.buttonStyle === 'solid') {
        // 只有樣式為 solid (立刻購買) 時，才開啟購買 Modal
        setSelectedCourse(course);
    } else {
        // 其他按鈕 (例如 "立刻體驗") 可以在此定義行為，目前暫時跳提示
        alert("體驗課程功能即將上線！");
    }
  };

  return (
    <div className="space-y-16"> 
      
      {/* 彈出式購買視窗 Modal */}
      {selectedCourse && (
          <CheckoutModal 
            course={selectedCourse} 
            onClose={() => setSelectedCourse(null)} 
          />
      )}

      {/* Section 1: Banner & Welcome */}
      <div className="space-y-8">
        {/* 優惠 Banner */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
            <div className="text-gray-200 text-sm flex items-center gap-2">
            <span className="text-gray-400 border-b border-gray-400 text-xs pb-0.5">最新消息</span>
            <span>將軟體設計精通之旅體驗課程的全部影片看完就可以獲得 <span className="text-[#fbbf24] font-bold border-b border-[#fbbf24] pb-0.5">3000 元課程折價券！</span></span>
            </div>
            <button className="bg-[#fbbf24] text-black px-6 py-1.5 rounded-lg text-sm font-bold hover:bg-yellow-300 transition">
            前往
            </button>
        </div>

        {/* 歡迎標題 */}
        <div className="space-y-4 py-4">
            <h2 className="text-4xl font-bold text-white tracking-tight">歡迎來到水球軟體學院</h2>
            <p className="text-gray-400 max-w-4xl leading-relaxed text-lg">
            水球軟體學院提供最先進的軟體設計思路教材，並透過線上 Code Review 來帶你掌握進階軟體架構能力。
            只要每週投資 5 小時，就能打造不平等的優勢，成為硬核的 Coding 實戰高手。
            </p>
        </div>

        {/* 課程列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COURSES.map((course) => (
            <div key={course.id} className={`group bg-[#20222e] rounded-xl overflow-hidden border ${course.highlight ? 'border-[#fbbf24]/50 shadow-[0_0_15px_rgba(251,191,36,0.1)]' : 'border-white/10'} hover:border-[#fbbf24]/80 transition cursor-pointer flex flex-col h-full`}>
                {/* 1. 圖片區塊 */}
                <div className="relative w-full aspect-[16/9] bg-black">
                    <Image 
                        src={course.image} 
                        alt={course.title} 
                        fill 
                        className="object-cover"
                        unoptimized
                    />
                </div>

                {/* 2. 內容區塊 */}
                <div className="p-6 flex-1 flex flex-col">
                    {/* 標題 */}
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#fbbf24] transition">{course.title}</h3>
                    
                    {/* 講師 */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-[#fbbf24] text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">潘</span>
                        <span className="text-[#fbbf24] text-sm font-bold">{course.author}</span>
                    </div>

                    {/* 描述 */}
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
                        {course.description}
                    </p>

                    {/* 標籤 */}
                    <div className="flex gap-2 flex-wrap mb-8">
                        {course.tags.map(tag => (
                        <span key={tag} className="px-3 py-1.5 bg-[#2a2d3e] rounded-md text-xs text-gray-400 border border-white/5 hover:text-white hover:border-white/20 transition">
                            #{tag}
                        </span>
                        ))}
                    </div>

                    {/* 底部按鈕與促銷文字區塊 */}
                    <div className="mt-auto space-y-4">
                        {course.promoText && (
                            <div className="text-[#fbbf24] text-sm text-center font-medium">
                                {course.promoText}
                            </div>
                        )}
                        
                        {/* 修改為 Button 並綁定 click 事件 */}
                        <button 
                            onClick={() => handleCourseAction(course)}
                            className={`w-full py-3 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2
                                ${course.buttonStyle === 'solid' 
                                    ? 'bg-[#fbbf24] text-black hover:bg-yellow-300 shadow-lg shadow-yellow-500/20' 
                                    : 'bg-transparent text-[#fbbf24] border border-[#fbbf24] hover:bg-[#fbbf24]/10'
                                }`}>
                            {course.buttonText}
                        </button>
                    </div>
                </div>
            </div>
            ))}
        </div>
      </div>

      {/* Section 2: Features Grid */}
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
                    {feature.extraAction && (
                        <button className="bg-[#fbbf24] text-black px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-yellow-300 transition flex items-center gap-2">
                            {feature.extraAction}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    )}
                    <button className={`${feature.extraAction ? 'border border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24]/10' : 'bg-[#fbbf24] text-black hover:bg-yellow-300'} px-6 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2`}>
                        {feature.action}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
            </div>
         ))}
      </div>

      {/* 水球潘個人介紹區塊 */}
      <section className="bg-[#181a25] border border-white/5 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* 左側：頭像 */}
        <div className="flex-shrink-0 relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-[#fbbf24]/20 shadow-2xl shadow-[#fbbf24]/10">
            <Image
              src="/images/avatar.webp"
              alt="水球潘"
              fill
              className="object-cover"
              unoptimized 
            />
        </div>

        {/* 右側：文字內容 */}
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
      
      {/* Footer */}
      <footer className="border-t border-white/10 pt-8 pb-12 text-center text-gray-500 text-sm">
         <p>&copy; 2025 水球軟體學院. All rights reserved.</p>
      </footer>
    </div>
  );
}