"use client";

import { useState, useEffect } from "react";
import CheckoutModal, { Course } from "@/components/CheckoutModal";

interface Order {
    id: number;
    course: Course;
    status: string;
    createdAt: string;
}

interface UserLevel {
    level: number;
    currentExp: number;
    nextLevelThreshold: number;
}

export default function ProfilePage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
    const [selectedPaymentOrder, setSelectedPaymentOrder] = useState<Order | null>(null);

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const storedUser = sessionStorage.getItem("user");
        
        if (!token) {
            window.location.href = "/login";
            return;
        }
        
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        fetchData(token);
    }, []);

    const fetchData = async (token: string) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            
            // 1. 獲取訂單
            const ordersRes = await fetch(`${API_URL}/api/orders/my`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (ordersRes.ok) {
                setOrders(await ordersRes.json());
            }

            // 2. 獲取等級資訊
            const levelRes = await fetch(`${API_URL}/api/users/level`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (levelRes.ok) {
                setUserLevel(await levelRes.json());
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId: number) => {
        if (!confirm("確定要取消此訂單嗎？")) return;
        const token = sessionStorage.getItem("token");
        if (!token) return;

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            const res = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                alert("訂單已取消");
                fetchData(token);
            } else {
                alert("取消失敗");
            }
        } catch (err) {
            alert("連線錯誤");
        }
    };

    if (loading) return <div className="text-white p-8 text-center">載入中...</div>;

    // 計算進度百分比
    const progressPercent = userLevel 
        ? Math.min(100, Math.round((userLevel.currentExp / userLevel.nextLevelThreshold) * 100)) 
        : 0;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {selectedPaymentOrder && (
                <CheckoutModal
                    course={selectedPaymentOrder.course}
                    existingOrderId={selectedPaymentOrder.id}
                    onClose={() => setSelectedPaymentOrder(null)}
                    onPaymentSuccess={() => {
                        const token = sessionStorage.getItem("token");
                        if (token) fetchData(token); 
                    }}
                />
            )}

            <div className="flex justify-between items-end mb-8">
                <h1 className="text-3xl font-bold text-white">個人檔案</h1>
                <div className="text-gray-400 text-sm">
                    {userLevel && `離下一級還差 ${userLevel.nextLevelThreshold - userLevel.currentExp} EXP`}
                </div>
            </div>
            
            {/* 基本資料與等級卡片 */}
            <div className="bg-[#20222e] border border-white/10 rounded-xl p-8 mb-10 relative overflow-hidden">
                {/* 裝飾背景 */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#fbbf24]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                    {/* 左側：基本資訊 */}
                    <div className="flex-1">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-24 h-24 rounded-full border-4 border-[#fbbf24]/20 overflow-hidden bg-gray-800 shadow-lg flex-shrink-0">
                                {user?.avatar ? (
                                    <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500">
                                        {user?.name?.[0]}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
                                <p className="text-[#fbbf24] font-medium text-sm">{user?.role || "初級工程師"}</p>
                                <div className="flex gap-3 mt-3">
                                    <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs text-gray-400">
                                        突破道館數 <span className="text-white font-bold ml-1">0</span>
                                    </div>
                                    <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs text-gray-400">
                                        證書 <span className="text-white font-bold ml-1">0</span>
                                    </div>
                                </div>
                            </div>
                            <div className="ml-auto self-start">
                                <button className="text-xs border border-[#fbbf24] text-[#fbbf24] px-3 py-1.5 rounded hover:bg-[#fbbf24]/10 transition flex items-center gap-1">
                                    ✏️ 編輯資料
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm border-t border-white/5 pt-6">
                            <div>
                                <span className="block text-gray-500 mb-1">Email</span>
                                <span className="text-gray-300">{user?.email || "hidden@example.com"}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 mb-1">GitHub</span>
                                <span className="text-gray-300 hover:text-white cursor-pointer">未綁定</span>
                            </div>
                        </div>
                    </div>

                    {/* 右側：等級與經驗值 */}
                    <div className="w-full md:w-80 bg-[#181a25] rounded-lg border border-white/5 p-6 flex flex-col justify-center shadow-inner">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-gray-400 text-xs font-bold tracking-wider uppercase">Current Level</span>
                            <span className="text-3xl font-bold text-[#fbbf24] italic">Lv.{userLevel?.level || 1}</span>
                        </div>
                        
                        <div className="relative h-4 bg-gray-700/50 rounded-full overflow-hidden mb-2 shadow-inner border border-white/5">
                            <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-600 to-[#fbbf24] transition-all duration-1000 ease-out rounded-full"
                                style={{ width: `${progressPercent}%` }}
                            >
                                {/* 光暈效果 */}
                                <div className="absolute top-0 right-0 h-full w-2 bg-white/50 blur-[2px]"></div>
                            </div>
                        </div>
                        
                        <div className="flex justify-between text-xs font-mono">
                            <span className="text-[#fbbf24] font-bold">{userLevel?.currentExp || 0} EXP</span>
                            <span className="text-gray-500">/ {userLevel?.nextLevelThreshold || 100} EXP</span>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-white/5 text-center">
                            <p className="text-gray-500 text-xs">繼續完成課程單元以獲取經驗值！</p>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#fbbf24] rounded-full"></span>
                購買紀錄
            </h2>
            
            {orders.length === 0 ? (
                <div className="text-gray-400 text-center py-16 bg-[#20222e] rounded-xl border border-white/5 border-dashed">
                    <div className="text-4xl mb-3">🛒</div>
                    尚無訂單紀錄
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-[#20222e] border border-white/5 rounded-xl p-5 flex flex-col md:flex-row items-center gap-6 hover:border-white/20 transition group">
                            <div className="w-full md:w-40 aspect-video bg-black rounded-lg overflow-hidden relative flex-shrink-0 shadow-lg group-hover:shadow-xl transition">
                                <img src={order.course.image} alt={order.course.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" />
                            </div>
                            
                            <div className="flex-1 w-full text-center md:text-left">
                                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-[#fbbf24] transition">{order.course.title}</h3>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs text-gray-400 mb-2">
                                    <span className="bg-white/5 px-2 py-0.5 rounded">訂單 #{order.id}</span>
                                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 min-w-[100px] w-full md:w-auto">
                                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                                    <span className="text-white font-bold text-lg">NT${order.course.price.toLocaleString()}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold
                                        ${order.status === 'PAID' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : ''}
                                        ${order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : ''}
                                        ${order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : ''}
                                    `}>
                                        {order.status === 'PAID' ? '已付款' : order.status === 'PENDING' ? '待付款' : '已取消'}
                                    </span>
                                </div>
                                
                                {order.status === 'PENDING' && (
                                    <button 
                                        onClick={() => setSelectedPaymentOrder(order)}
                                        className="w-full md:w-auto bg-[#3b82f6] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-500/20"
                                    >
                                        去付款
                                    </button>
                                )}

                                {(order.status != 'PAID') && (
                                    <button 
                                        onClick={() => handleCancelOrder(order.id)}
                                        className="text-gray-500 text-xs hover:text-red-400 transition"
                                    >
                                        取消訂單
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}