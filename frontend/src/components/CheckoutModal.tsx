"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Course } from "@/data/courses";

interface CheckoutModalProps {
    course: Course;
    onClose: () => void;
}

// --- 服務契約內容 (長文本) ---
const SERVICE_AGREEMENT = `本網際網路課程購買暨服務契約（以下簡稱本契約），指水球球特務有限公司（以下簡稱「水球球」、「我們」、「我們的」）授權您於 waterballsa.tw 網域之網站或水球球所有之移動裝置平台（以下合稱本平台），使用水球球透過網際網路連線、或移動裝置平台離線進行之教學、評量或其他相關服務(以下簡稱「本服務」)。

1. 契約審閱期間及當事人基本資料
   您已審閱本契約全部條款內容超過 3 日以上。您即於本平台經下列程序與水球球成功締約者（以下簡稱會員）。

2. 本服務內容
   本服務內容包括水球球提供本服務之網站：waterballsa.tw，適用對象不限，教學內容為「AI x BDD：規格驅動全自動開發術」。

3. 設備規格
   為締造您使用本服務之良好體驗，您的電腦或手機應具備課程頁面建議及軟硬體設備基本規格及要求。建議使用最新版本 Chrome、Firefox、Safari、Edge 瀏覽器，並具備 10 Mbps 以上網路速度。

4. 契約之成立生效
   您經由網際網路購買本服務者，於水球球所指定之網頁上「建立訂單」，在付款、及發送付款通知信之後，即表示同意購買本服務並同意以電子文件作為表示方式。

5. 課程提供與服務期間
   買斷制（終身使用）：您於收受水球球提供使用本服務所需之開課日當日起，即享有本課程（影音內容）之永久使用權限。

6. 擔保授權
   水球球應確保其就本契約所授權您使用之服務內容，為合法權利人。

7. 授權使用費
   本服務授權使用費之金額如已購內容清單所記載，實際金額依購買當時平台所載為準。

8. 退費政策
   依《消費者保護法》第 19 條規定，您於開課日起 7 日內，且僅於您或您購買課程時所指定之人，未超過試看單元或特定預覽部分以外之範圍使用課程者，得以書面或電子郵件通知水球球終止契約，水球球不得拒絕，並應全額退還您所支付之授權使用費金額。
   (詳細退費規定請參閱完整條款)

... (更多條款請參閱完整文件)
`;

export default function CheckoutModal({ course, onClose }: CheckoutModalProps) {
    const [step, setStep] = useState(1); // 1: 課程詳情, 2: 付款資訊, 3: 成功
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [mounted, setMounted] = useState(false);
    
    // 付款頁面狀態
    const [paymentMethod, setPaymentMethod] = useState<"atm" | "credit" | "installments" | null>(null);
    const [isInvoiceExpanded, setIsInvoiceExpanded] = useState(false);
    const [isAgreementExpanded, setIsAgreementExpanded] = useState(false);

    // 發票類型狀態
    const [invoiceType, setInvoiceType] = useState<"gui" | "mobile" | "citizen" | "donation">("gui");

    // 1. 確保組件已掛載
    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "unset"; };
    }, []);

    const toggleChapter = (chapterId: string) => {
        setExpandedChapters((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(chapterId)) newSet.delete(chapterId);
            else newSet.add(chapterId);
            return newSet;
        });
    };

    const handlePayment = () => {
        // 模擬付款處理延遲 (1秒後跳轉成功)
        setTimeout(() => {
            setStep(3);
        }, 1000);
    };

    // 假訂單資訊
    const orderInfo = {
        id: "20251120105605a256",
        deadline: "2025年11月23日 12:00 AM"
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            {/* 背景遮罩：bg-black/50 */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-4xl bg-[#12141c] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/10 animate-in fade-in zoom-in duration-200">
                
                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/70 hover:text-white transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {/* Header / Steps */}
                    <div className="bg-[#2563eb] pt-10 pb-12 px-6 md:px-10">
                        <div className="flex items-center justify-between mb-10 relative max-w-2xl mx-auto">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/30 -translate-y-1/2 z-0"></div>
                            
                            {/* Step 1 */}
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-colors ${step >= 1 ? 'bg-white text-[#2563eb]' : 'bg-[#60a5fa] text-white ring-4 ring-[#2563eb]'}`}>
                                    {step > 1 ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : '1'}
                                </div>
                                <span className={`font-bold text-sm ${step >= 1 ? 'text-white' : 'text-white/80'}`}>建立訂單</span>
                            </div>
                            {/* Step 2 */}
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-colors ${step >= 2 ? 'bg-white text-[#2563eb]' : 'bg-[#60a5fa] text-white ring-4 ring-[#2563eb]'}`}>
                                     {step > 2 ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : '2'}
                                </div>
                                <span className={`font-bold text-sm ${step >= 2 ? 'text-white' : 'text-white/80'}`}>完成支付</span>
                            </div>
                            {/* Step 3 */}
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-colors ${step >= 3 ? 'bg-white text-[#2563eb]' : 'bg-[#60a5fa] text-white ring-4 ring-[#2563eb]'}`}>
                                    3
                                </div>
                                <span className={`font-bold text-sm ${step >= 3 ? 'text-white' : 'text-white/80'}`}>開始上課！</span>
                            </div>
                        </div>

                        {/* 只有 Step 1 顯示完整標題， Step 2,3 隱藏以節省空間 */}
                        {step === 1 ? (
                             <div className="space-y-4">
                                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{course.title}</h1>
                                <div className="text-white/90 text-sm md:text-base leading-relaxed whitespace-pre-line">{course.longDescription || course.description}</div>
                            </div>
                        ) : (
                            <div className="h-2"></div> 
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="bg-[#12141c] pb-32 min-h-[400px]">
                        
                        {/* --- Step 1: 課程詳情 --- */}
                        {step === 1 && (
                            <>
                                <div className="bg-[#fffbeb] border-l-4 border-[#fbbf24] text-[#92400e] p-4 px-6 md:px-10">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#fbbf24]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <p className="text-sm font-medium">若你曾購買過相關課程，請私訊 <a href="#" className="underline text-[#b45309] hover:text-[#d97706]">LINE 客服</a> 索取折價券。</p>
                                    </div>
                                </div>

                                <div className="p-6 md:p-10 space-y-12">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-white"></span>
                                                教材保證：完整章節單元
                                            </h2>
                                        </div>
                                        <div className="border border-white/10 rounded-lg overflow-hidden">
                                            {course.syllabus.map((chapter) => {
                                                const isExpanded = expandedChapters.has(chapter.id);
                                                return (
                                                    <div key={chapter.id} className="border-b border-white/10 last:border-none bg-[#181a25]">
                                                        <button onClick={() => toggleChapter(chapter.id)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition text-left">
                                                            <div>
                                                                <h3 className="text-base font-medium text-gray-200 mb-1">{chapter.title}</h3>
                                                                {chapter.date && <p className="text-xs text-gray-500">預計開課：{chapter.date}</p>}
                                                            </div>
                                                            <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                        </button>
                                                        {isExpanded && (
                                                            <div className="bg-[#0f1119] px-5 py-3 space-y-2 border-t border-white/5 shadow-inner">
                                                                {chapter.units.map((unit) => (
                                                                    <div key={unit.id} className="flex items-center gap-3 text-gray-400 hover:text-white transition py-1.5 pl-2">
                                                                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-mono text-gray-300">{unit.id}</div>
                                                                        <span className="text-sm">{unit.title}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-white"></span>
                                            你將獲得一個充滿行動力的線上學習環境
                                        </h2>
                                        <div className="space-y-3">
                                            {["充滿行動力的線上學習環境", "專屬於你的技能評級成長系統"].map((item, i) => (
                                                <div key={i} className="border border-white/10 rounded-lg p-5 flex items-center justify-between bg-[#181a25] hover:bg-[#20222e] transition cursor-pointer group">
                                                    <span className="text-gray-200 group-hover:text-white transition">{item}</span>
                                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* --- Step 2: 付款資訊 --- */}
                        {step === 2 && (
                            <div className="p-6 md:p-10 space-y-10">
                                {/* 訂單資訊卡 */}
                                <div className="bg-[#181a25] border border-white/10 rounded-lg p-6">
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="space-y-1">
                                            <p className="text-gray-400 text-sm">訂單編號</p>
                                            <p className="text-white font-mono text-lg tracking-wide">{orderInfo.id}</p>
                                        </div>
                                        <div className="space-y-1 md:text-right">
                                            <p className="text-gray-400 text-sm">付款截止時間</p>
                                            <p className="text-white font-mono text-lg tracking-wide">{orderInfo.deadline}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 付款說明 */}
                                <div className="space-y-2">
                                    <h3 className="text-white font-bold text-lg">付款說明</h3>
                                    <p className="text-gray-400 text-sm">恭喜你，訂單已建立完成，請你於三日內付款。</p>
                                </div>

                                {/* 付款方式選擇 */}
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold text-lg">付款方式</h3>
                                    <p className="text-gray-400 text-sm">選取付款方式</p>
                                    
                                    <div className="space-y-3">
                                        {[
                                            { id: "atm", label: "ATM 匯款", icon: "💳" },
                                            { id: "credit", label: "信用卡 (一次付清)", icon: "💳" },
                                            { id: "installments", label: "銀角零卡分期", icon: "📱" }
                                        ].map((method) => (
                                            <label 
                                                key={method.id}
                                                className={`flex items-center gap-4 p-5 rounded-lg border cursor-pointer transition-all ${
                                                    paymentMethod === method.id 
                                                        ? "border-[#3b82f6] bg-[#1e293b] shadow-[0_0_0_1px_#3b82f6]" 
                                                        : "border-white/10 bg-[#181a25] hover:bg-[#20222e] hover:border-white/20"
                                                }`}
                                            >
                                                <input 
                                                    type="radio" 
                                                    name="payment" 
                                                    value={method.id} 
                                                    checked={paymentMethod === method.id}
                                                    onChange={() => setPaymentMethod(method.id as any)}
                                                    className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-600 focus:ring-offset-gray-800"
                                                />
                                                <span className="text-2xl">{method.icon}</span>
                                                <span className="text-white font-medium">{method.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* 發票資訊 (可展開) */}
                                <div className="border border-white/10 rounded-lg overflow-hidden">
                                     <button 
                                        onClick={() => setIsInvoiceExpanded(!isInvoiceExpanded)}
                                        className="w-full px-6 py-4 flex items-center justify-between bg-[#181a25] hover:bg-[#20222e] transition"
                                     >
                                        <h3 className="text-white font-bold text-lg">發票資訊 ( 選填 )</h3>
                                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isInvoiceExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                     </button>
                                     {isInvoiceExpanded && (
                                         <div className="p-6 bg-[#12141c] border-t border-white/10 space-y-6">
                                             <div>
                                                 <p className="text-gray-400 text-sm mb-3">發票類型</p>
                                                 <div className="flex flex-wrap gap-2">
                                                     {[
                                                         { id: "gui", label: "統一編號" },
                                                         { id: "mobile", label: "手機載具" },
                                                         { id: "citizen", label: "自然人憑證" },
                                                         { id: "donation", label: "捐贈碼" },
                                                     ].map(type => (
                                                         <button 
                                                            key={type.id}
                                                            onClick={() => setInvoiceType(type.id as any)}
                                                            className={`px-4 py-2 rounded-lg text-sm transition border ${
                                                                invoiceType === type.id
                                                                    ? "bg-[#1e293b] border-[#3b82f6] text-[#3b82f6]"
                                                                    : "border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                                                            }`}
                                                         >
                                                             {type.label}
                                                         </button>
                                                     ))}
                                                 </div>
                                             </div>
                                             
                                             {/* 根據類型動態顯示輸入框 */}
                                             <div>
                                                 {invoiceType === "gui" && (
                                                     <>
                                                        <p className="text-gray-400 text-sm mb-2">統一編號</p>
                                                        <input type="text" placeholder="例: 12345678" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#3b82f6]" />
                                                     </>
                                                 )}
                                                 {invoiceType === "mobile" && (
                                                     <>
                                                        <p className="text-gray-400 text-sm mb-2">載具編號</p>
                                                        <input type="text" placeholder="例: /AB12-+." className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#3b82f6]" />
                                                     </>
                                                 )}
                                                 {invoiceType === "citizen" && (
                                                     <>
                                                        <p className="text-gray-400 text-sm mb-2">憑證編號</p>
                                                        <input type="text" placeholder="例: AB12345678901234" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#3b82f6]" />
                                                     </>
                                                 )}
                                                 {invoiceType === "donation" && (
                                                     <>
                                                        <p className="text-gray-400 text-sm mb-2">捐贈碼</p>
                                                        <input type="text" placeholder="例: 123" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#3b82f6]" />
                                                     </>
                                                 )}
                                             </div>
                                         </div>
                                     )}
                                </div>

                                {/* 付款前最後按鈕 */}
                                <button 
                                    onClick={handlePayment}
                                    disabled={!paymentMethod} // 沒選付款方式不能按
                                    className={`w-full font-bold py-4 rounded-lg transition shadow-lg text-lg
                                        ${paymentMethod 
                                            ? "bg-[#3b82f6] hover:bg-blue-600 text-white shadow-blue-500/20" 
                                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    進行支付
                                </button>

                                {/* 注意事項 */}
                                <div className="text-sm text-gray-400 space-y-2 leading-relaxed">
                                    <p>付款後的平日一天內，系統會自動幫您啟動此帳號本課程的正式使用資格，您即可開始享受學習旅程。如遇系統錯誤則在一日內請聯絡客服 (sales@waterballsa.tw)，客服在平日會在一日內幫您對帳並且確認您享有所 有權益。</p>
                                    <p>若您有其他購買相關的問題，歡迎寄信至 <a href="mailto:sales@waterballsa.tw" className="text-[#3b82f6] hover:underline">sales@waterballsa.tw</a> 詢問。</p>
                                </div>

                                {/* 課程服務契約 (可展開) */}
                                <div className="space-y-2">
                                    <button 
                                        onClick={() => setIsAgreementExpanded(!isAgreementExpanded)}
                                        className="flex items-center gap-2 text-[#3b82f6] hover:text-blue-400 transition font-medium"
                                    >
                                        <svg className={`w-4 h-4 transition-transform ${isAgreementExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        AI x BDD 課程服務契約
                                    </button>
                                    {isAgreementExpanded && (
                                        <div className="text-gray-400 text-xs leading-relaxed p-4 bg-[#181a25] rounded-lg border border-white/10 whitespace-pre-line h-64 overflow-y-auto custom-scrollbar">
                                            {SERVICE_AGREEMENT}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- Step 3: 成功 --- */}
                        {step === 3 && (
                             <div className="p-10 md:p-16 flex flex-col items-center text-center space-y-8">
                                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                                    <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-4">付款成功！</h2>
                                    <p className="text-gray-400 text-lg max-w-md mx-auto">
                                        感謝您的購買，您現在已經擁有此課程的完整權限。
                                        準備好開始學習了嗎？
                                    </p>
                                </div>

                                <div className="w-full max-w-sm bg-[#181a25] p-6 rounded-xl border border-white/10">
                                    <h3 className="text-gray-300 font-medium mb-2">購買項目</h3>
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-16 h-10 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                            <img src={course.image} alt="Course" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm line-clamp-1">{course.title}</p>
                                            <p className="text-[#22c55e] text-sm">已付款</p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={onClose}
                                    className="bg-[#fbbf24] text-black px-10 py-3 rounded-lg text-lg font-bold hover:bg-yellow-300 transition shadow-lg shadow-yellow-500/20"
                                >
                                    開始上課
                                </button>
                             </div>
                        )}
                    </div>
                </div>

                {/* Footer (僅在 Step 1 顯示) */}
                {step === 1 && (
                    <div className="border-t border-white/10 bg-[#181a25] p-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
                        <div className="flex items-baseline gap-3">
                            <span className="text-white font-bold">售價</span>
                            <span className="text-gray-500 line-through text-sm">NT${course.originalPrice.toLocaleString()}</span>
                            <span className="text-[#22c55e] font-bold text-2xl">NT${course.price.toLocaleString()}</span>
                        </div>
                        <button 
                            className="w-full sm:w-auto bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-2.5 px-8 rounded-lg transition shadow-lg shadow-blue-500/20"
                            onClick={() => setStep(2)}
                        >
                            下一步：選取付款方式
                        </button>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}