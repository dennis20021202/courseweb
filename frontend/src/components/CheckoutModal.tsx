"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface Unit {
    id: string;
    title: string;
}

interface Chapter {
    id: string;
    title: string;
    date?: string;
    units: Unit[];
}

interface Course {
    id: number;
    title: string;
    price: number;
    originalPrice: number;
    image: string;
    longDescription?: string;
    description: string;
    syllabusJson?: string;
}

interface CheckoutModalProps {
    course: Course;
    onClose: () => void;
}

export default function CheckoutModal({ course, onClose }: CheckoutModalProps) {
    const [step, setStep] = useState(1); 
    const [mounted, setMounted] = useState(false);
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
    const [agreementContent, setAgreementContent] = useState("");
    const [isAgreementExpanded, setIsAgreementExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // --- 表單狀態 ---
    const [paymentMethod, setPaymentMethod] = useState<"ATM" | "CREDIT" | "INSTALLMENT" | null>(null);
    const [isInvoiceExpanded, setIsInvoiceExpanded] = useState(false);
    const [invoiceType, setInvoiceType] = useState<"GUI" | "MOBILE" | "CITIZEN" | "DONATION">("GUI");
    const [invoiceCarrier, setInvoiceCarrier] = useState("");

    // 解析課綱資料
    let syllabus: Chapter[] = [];
    try {
        if (course.syllabusJson) {
            syllabus = JSON.parse(course.syllabusJson);
        }
    } catch (e) {
        console.error("解析課綱失敗", e);
    }

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = "hidden";

        fetch("/data/agreement.json")
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(data => setAgreementContent(data.content))
            .catch(err => {
                console.warn("無法讀取契約 JSON:", err);
                setAgreementContent("無法載入契約內容，請確認 /data/agreement.json 是否存在於 public 資料夾。");
            });

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

    const handlePayment = async () => {
        setIsLoading(true);
        
        // [關鍵修正]：從 sessionStorage 讀取 Token
        const token = sessionStorage.getItem("token"); 

        if (!token) {
            alert("請先登入！");
            window.location.href = "/login";
            return;
        }

        if (!paymentMethod) {
             alert("請選擇付款方式");
             setIsLoading(false);
             return;
        }

        // 簡單驗證：如果不是捐贈碼，且有展開發票區塊，則需要輸入內容
        if (isInvoiceExpanded && !invoiceCarrier && invoiceType !== "DONATION") {
            // 這裡只是簡單示意，實際邏輯可依需求調整
        }

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            const res = await fetch(`${API_URL}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    courseId: course.id,
                    paymentMethod,
                    invoiceType,
                    invoiceCarrier
                })
            });

            if (res.ok) {
                setStep(3); // 成功
            } else {
                alert("購買失敗，請稍後再試");
            }
        } catch (error) {
            console.error(error);
            alert("連線錯誤，請確認後端是否正常運作");
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-4xl bg-[#12141c] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/10 animate-in fade-in zoom-in duration-200">
                
                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/70 hover:text-white transition">
                    ✕
                </button>

                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    <div className="bg-[#2563eb] pt-10 pb-12 px-6 md:px-10">
                        <div className="flex items-center justify-between mb-10 relative max-w-2xl mx-auto">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/30 -translate-y-1/2 z-0"></div>
                            {[
                                { step: 1, label: "建立訂單" },
                                { step: 2, label: "完成支付" },
                                { step: 3, label: "開始上課！" }
                            ].map((s) => (
                                <div key={s.step} className="relative z-10 flex flex-col items-center gap-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-colors ${step >= s.step ? 'bg-white text-[#2563eb]' : 'bg-[#60a5fa] text-white ring-4 ring-[#2563eb]'}`}>
                                        {step > s.step ? "✓" : s.step}
                                    </div>
                                    <span className={`font-bold text-sm ${step >= s.step ? 'text-white' : 'text-white/80'}`}>{s.label}</span>
                                </div>
                            ))}
                        </div>

                        {step === 1 ? (
                             <div className="space-y-4">
                                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{course.title}</h1>
                                <div className="text-white/90 text-sm md:text-base leading-relaxed whitespace-pre-line">{course.longDescription || course.description}</div>
                            </div>
                        ) : (
                            <div className="h-2"></div> 
                        )}
                    </div>

                    <div className="bg-[#12141c] pb-32 min-h-[400px]">
                        {step === 1 && (
                            <div className="p-6 md:p-10 space-y-12">
                                <div className="space-y-4">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-white"></span>
                                        教材保證：完整章節單元
                                    </h2>
                                    {syllabus.length > 0 ? (
                                        <div className="border border-white/10 rounded-lg overflow-hidden">
                                            {syllabus.map((chapter) => {
                                                const isExpanded = expandedChapters.has(chapter.id);
                                                return (
                                                    <div key={chapter.id} className="border-b border-white/10 last:border-none bg-[#181a25]">
                                                        <button onClick={() => toggleChapter(chapter.id)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition text-left">
                                                            <div>
                                                                <h3 className="text-base font-medium text-gray-200 mb-1">{chapter.title}</h3>
                                                                {chapter.date && <p className="text-xs text-gray-500">預計開課：{chapter.date}</p>}
                                                            </div>
                                                            <span className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                                                        </button>
                                                        {isExpanded && (
                                                            <div className="bg-[#0f1119] px-5 py-3 space-y-2 border-t border-white/5 shadow-inner">
                                                                {chapter.units.map((unit) => (
                                                                    <div key={unit.id} className="flex items-center gap-3 text-gray-400 hover:text-white transition py-1.5 pl-2">
                                                                        <span className="text-xs font-mono bg-white/10 px-1.5 py-0.5 rounded">{unit.id}</span>
                                                                        <span className="text-sm">{unit.title}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 text-center py-4 border border-white/10 rounded-lg">暫無課綱資料</div>
                                    )}
                                </div>
                                {/* 特色區塊 (原本設計圖的下方區塊) */}
                                    <div className="space-y-4">
                                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-white"></span>
                                            你將獲得一個充滿行動力的線上學習環境
                                        </h2>
                                        <div className="space-y-3">
                                            {["充滿行動力的線上學習環境", "專屬於你的技能評級成長系統"].map((item, i) => (
                                                <div key={i} className="border border-white/10 rounded-lg p-5 flex items-center justify-between bg-[#181a25] hover:bg-[#20222e] transition cursor-pointer group">
                                                    <span className="text-gray-200 group-hover:text-white transition">{item}</span>
                                                    <span className="text-gray-400 group-hover:text-white transition">›</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="p-6 md:p-10 space-y-8">
                                
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold text-lg">付款方式</h3>
                                    <div className="grid gap-3">
                                        {[
                                            { id: "ATM", label: "ATM 匯款", icon: "💳" },
                                            { id: "CREDIT", label: "信用卡 (一次付清)", icon: "💳" },
                                            { id: "INSTALLMENT", label: "銀角零卡分期", icon: "📱" }
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
                                                    className="w-5 h-5 text-blue-600"
                                                />
                                                <span className="text-2xl">{method.icon}</span>
                                                <span className="text-white font-medium">{method.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="border border-white/10 rounded-lg overflow-hidden">
                                     <button 
                                        onClick={() => setIsInvoiceExpanded(!isInvoiceExpanded)}
                                        className="w-full px-6 py-4 flex items-center justify-between bg-[#181a25] hover:bg-[#20222e] transition"
                                     >
                                        <h3 className="text-white font-bold text-lg">發票資訊 (選填)</h3>
                                        <span className={`text-gray-400 transition-transform ${isInvoiceExpanded ? 'rotate-180' : ''}`}>▼</span>
                                     </button>
                                     {isInvoiceExpanded && (
                                         <div className="p-6 bg-[#12141c] border-t border-white/10 space-y-6">
                                             <div>
                                                 <p className="text-gray-400 text-sm mb-3">發票類型</p>
                                                 <div className="flex flex-wrap gap-2">
                                                     {[
                                                         { id: "GUI", label: "統一編號" },
                                                         { id: "MOBILE", label: "手機載具" },
                                                         { id: "CITIZEN", label: "自然人憑證" },
                                                         { id: "DONATION", label: "捐贈碼" },
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
                                             
                                             <div>
                                                 <p className="text-gray-400 text-sm mb-2">
                                                     {invoiceType === "GUI" && "統一編號"}
                                                     {invoiceType === "MOBILE" && "手機載具編號 (例: /AB1234)"}
                                                     {invoiceType === "CITIZEN" && "自然人憑證編號"}
                                                     {invoiceType === "DONATION" && "捐贈碼"}
                                                 </p>
                                                 <input 
                                                    type="text" 
                                                    value={invoiceCarrier}
                                                    onChange={(e) => setInvoiceCarrier(e.target.value)}
                                                    placeholder="請輸入..." 
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#3b82f6]" 
                                                 />
                                             </div>
                                         </div>
                                     )}
                                </div>

                                <div className="space-y-2">
                                    <button 
                                        onClick={() => setIsAgreementExpanded(!isAgreementExpanded)}
                                        className="flex items-center gap-2 text-[#3b82f6] hover:text-blue-400 transition font-medium"
                                    >
                                        <span>{isAgreementExpanded ? "▲" : "▼"}</span>
                                        {course.title} 服務契約
                                    </button>
                                    {isAgreementExpanded && (
                                        <div className="text-gray-400 text-xs leading-relaxed p-4 bg-[#181a25] rounded-lg border border-white/10 whitespace-pre-line h-64 overflow-y-auto custom-scrollbar">
                                            {agreementContent}
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={handlePayment}
                                    disabled={!paymentMethod || isLoading}
                                    className={`w-full font-bold py-4 rounded-lg transition shadow-lg text-lg
                                        ${paymentMethod 
                                            ? "bg-[#3b82f6] hover:bg-blue-600 text-white shadow-blue-500/20" 
                                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    {isLoading ? "處理中..." : "進行支付"}
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                             <div className="p-10 md:p-16 flex flex-col items-center text-center space-y-8">
                                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                                    <span className="text-4xl text-green-500">✓</span>
                                </div>
                                
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-4">付款成功！</h2>
                                    <p className="text-gray-400 text-lg max-w-md mx-auto">
                                        感謝您的購買，發票將寄送至您的信箱。
                                    </p>
                                </div>

                                <button 
                                    onClick={() => window.location.href = "/profile"}
                                    className="bg-[#fbbf24] text-black px-10 py-3 rounded-lg text-lg font-bold hover:bg-yellow-300 transition shadow-lg shadow-yellow-500/20"
                                >
                                    查看我的訂單
                                </button>
                             </div>
                        )}
                    </div>
                </div>

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