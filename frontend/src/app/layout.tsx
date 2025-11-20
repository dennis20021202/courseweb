"use client";

import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const NAV_ITEMS = [
  { name: "首頁", href: "/", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  ), protected: false },
  { name: "課程", href: "/courses", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
  ), protected: false },
  { name: "個人檔案", href: "/profile", icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  ), protected: true },
];

const SECONDARY_NAV_ITEMS = [
    { name: "排行榜", href: "/leaderboard", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    ), protected: false },
    { name: "獎勵任務", href: "/missions", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
    ), protected: true },
    { name: "挑戰歷程", href: "/history", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ), protected: true },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [user, setUser] = useState<{name: string; role: string; avatar: string} | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // [關鍵修正]：改為讀取 sessionStorage
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const getLinkProps = (item: { href: string; protected: boolean }) => {
      if (item.protected && !user) {
          return { href: "/login" }; 
      }
      return { href: item.href };
  };
  
  if (!mounted) {
      return (
        <html lang="zh-TW">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen bg-[#12141c]`}>
            </body>
        </html>
      );
  }

  return (
    <html lang="zh-TW">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen bg-[#12141c]`}>
        
        {!isAuthPage && (
          <aside className="w-64 bg-[#181a25] flex-shrink-0 flex flex-col border-r border-white/5 fixed h-full left-0 top-0 z-10">
            <div className="p-6 flex items-center gap-3 border-b border-white/5">
               <div className="relative w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
                 <img 
                   src="/images/logo.png" 
                   alt="Logo" 
                   className="w-full h-full object-cover"
                 />
               </div>
               <div>
                 <h1 className="font-bold text-sky-300 text-lg leading-none mb-1 tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                   水球軟體學院
                 </h1>
                 <p className="text-[11px] font-bold text-sky-300 tracking-[0.05em] leading-none font-mono uppercase">
                   WATERBALLSA.TW
                 </p>
               </div>
            </div>

            <nav className="flex-1 px-4 space-y-8 overflow-y-auto py-4">
              <div className="space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.name}
                      {...getLinkProps(item)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                        pathname === item.href
                          ? "bg-[#fbbf24] text-black shadow-lg shadow-[#fbbf24]/20"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      } ${item.protected && !user ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                      {item.protected && !user && <span className="ml-auto text-xs">🔒</span>}
                    </Link>
                  ))}
              </div>

              <div className="space-y-1 border-t border-white/10 pt-6">
                {SECONDARY_NAV_ITEMS.map((item) => (
                    <Link
                    key={item.name}
                    {...getLinkProps(item)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white
                     ${item.protected && !user ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                    {item.icon}
                    <span>{item.name}</span>
                    {item.protected && !user && <span className="ml-auto text-xs">🔒</span>}
                    </Link>
                ))}
              </div>

              {/* 底部選單 (Mock) */}
              <div className="space-y-1 border-t border-white/10 pt-6">
                   <Link href="#" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm">
                     所有單元
                   </Link>
                   <Link href="#" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm">
                     挑戰地圖
                   </Link>
                   <Link href="#" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm">
                     SOP 寶典
                   </Link>
              </div>

              {user && (
                <div className="pt-4 border-t border-white/10 mt-4 pb-4">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-white/5 hover:text-red-300 rounded-xl transition-colors text-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span>登出</span>
                  </button>
                </div>
              )}
            </nav>
          </aside>
        )}

        <main className={`flex-1 p-8 ${!isAuthPage ? "ml-64" : "w-full mx-auto max-w-7xl"}`}>
          {!isAuthPage && (
            <header className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button className="flex items-center gap-2 bg-[#20222e] hover:bg-white/10 transition px-4 py-2.5 rounded-lg text-sm font-medium border border-white/10 text-gray-200">
                    <span>軟體設計模式精通之旅</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <button className="px-4 py-2 border border-white/20 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/5 transition flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      前往挑戰
                    </button>
                    
                    <button className="w-10 h-10 rounded-full border border-[#fbbf24] text-[#fbbf24] flex items-center justify-center hover:bg-[#fbbf24] hover:text-black transition">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </button>

                    <div className="w-10 h-10 rounded-full bg-blue-600 overflow-hidden border-2 border-[#20222e] cursor-pointer hover:opacity-80 transition">
                       {user.avatar && user.avatar !== "" ? (
                         <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                           {user.name.charAt(0)}
                         </div>
                       )}
                    </div>
                  </>
                ) : (
                  <>
                     <Link href="/login">
                        <button className="bg-[#fbbf24] text-black px-6 py-2 rounded-lg text-sm font-bold hover:bg-yellow-300 transition shadow-lg shadow-yellow-500/20">
                          登入
                        </button>
                     </Link>
                  </>
                )}
              </div>
            </header>
          )}

          {children}
        </main>
      </body>
    </html>
  );
}