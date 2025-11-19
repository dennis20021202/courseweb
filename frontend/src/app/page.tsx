import Image from "next/image";

const COURSES = [
  {
    id: 1,
    title: "軟體設計模式精通之旅",
    author: "水球潘",
    description: "用一趟旅程的時間，成為硬核的 Coding 實戰高手。",
    image: "/course-pattern.jpg",
    tags: ["設計模式", "架構設計"],
    highlight: true
  },
  {
    id: 2,
    title: "AI x BDD：規格驅動全自動開發術",
    author: "水球潘",
    description: "AI Top 1% 工程師必修課，掌握規格驅動的全自動化開發。",
    image: "/course-ai.jpg",
    tags: ["AI", "BDD", "Cucumber"],
    highlight: false
  }
];

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
        href: "https://discord.gg/waterballsa", // 假連結
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
  return (
    <div className="space-y-16"> 
      
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
            <div key={course.id} className="group bg-[#20222e] rounded-2xl overflow-hidden border border-white/5 hover:border-[#fbbf24]/50 transition cursor-pointer flex flex-col h-full">
                <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-900 relative flex items-center justify-center overflow-hidden">
                    <div className="text-center transform group-hover:scale-105 transition duration-500">
                        <div className="text-5xl mb-3 drop-shadow-lg">{course.tags[0] === "AI" ? "🤖" : "🧩"}</div>
                        <div className="font-bold text-xl text-white/90 px-4">{course.title}</div>
                    </div>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition"></div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#fbbf24] transition line-clamp-2">{course.title}</h3>
                <div className="text-[#fbbf24] text-sm font-medium mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">潘</span>
                    {course.author}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed flex-1 mb-6">
                    {course.description}
                </p>
                <div className="flex gap-2 flex-wrap">
                    {course.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400 border border-white/5">
                        #{tag}
                    </span>
                    ))}
                </div>
                </div>
            </div>
            ))}
        </div>
      </div>

      {/* Section 2: Features Grid (新截圖的內容) */}
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
      
      {/* Footer */}
      <footer className="border-t border-white/10 pt-8 pb-12 text-center text-gray-500 text-sm">
         <p>&copy; 2025 水球軟體學院. All rights reserved.</p>
      </footer>
    </div>
  );
}