"use client";

import { useState, useEffect } from "react";
import CheckoutModal, { Course } from "@/components/CheckoutModal"; // 引入 Modal

// 定義本地的 Order 介面
interface Order {
    id: number;
    course: Course; // 使用匯出的 Course 定義
    status: string;
    createdAt: string;
}

export default function ProfilePage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    
    // 新增：用於付款的選定訂單
    const [selectedPaymentOrder, setSelectedPaymentOrder] = useState<Order | null>(null);
    
    // 移除 next/navigation 避免編譯問題，改用 window.location
    // const router = useRouter();

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

        fetchOrders(token);
    }, []);

    const fetchOrders = async (token: string) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            const res = await fetch(`${API_URL}/api/orders/my`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
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
                fetchOrders(token); // 重新整理列表
            } else {
                alert("取消失敗");
            }
        } catch (err) {
            alert("連線錯誤");
        }
    };

    if (loading) return <div className="text-white p-8 text-center">載入中...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            {/* 付款 Modal */}
            {selectedPaymentOrder && (
                <CheckoutModal
                    course={selectedPaymentOrder.course}
                    existingOrderId={selectedPaymentOrder.id} // 傳入訂單 ID 以跳過建立步驟
                    onClose={() => setSelectedPaymentOrder(null)}
                    onPaymentSuccess={() => {
                        // 付款成功後：只刷新訂單，不關閉 Modal
                        // 讓使用者能在 Modal 看到「付款成功」並手動按按鈕離開
                        const token = sessionStorage.getItem("token");
                        if (token) fetchOrders(token); 
                    }}
                />
            )}

            <h1 className="text-3xl font-bold text-white mb-8">個人檔案</h1>
            
            {/* 用戶資訊卡片 */}
            <div className="bg-[#20222e] border border-white/10 rounded-xl p-6 mb-8 flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                    {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.name?.[0]}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                    <span className="text-gray-400 text-sm bg-white/10 px-2 py-1 rounded mt-2 inline-block">{user?.role || "學員"}</span>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-[#fbbf24] pl-3">購買紀錄</h2>
            
            {orders.length === 0 ? (
                <div className="text-gray-400 text-center py-10 bg-[#181a25] rounded-xl border border-white/5">
                    尚無訂單紀錄
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-[#181a25] border border-white/5 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 hover:border-white/20 transition">
                            <div className="w-full md:w-32 aspect-video bg-black rounded-lg overflow-hidden relative flex-shrink-0">
                                <img src={order.course.image} alt={order.course.title} className="w-full h-full object-cover" />
                            </div>
                            
                            <div className="flex-1 w-full text-center md:text-left">
                                <h3 className="text-white font-bold text-lg mb-1">{order.course.title}</h3>
                                <p className="text-gray-400 text-sm">訂單編號: #{order.id}</p>
                                <p className="text-gray-500 text-xs mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>

                            <div className="flex flex-col items-end gap-2 min-w-[100px]">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold
                                    ${order.status === 'PAID' ? 'bg-green-500/20 text-green-400' : ''}
                                    ${order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                                    ${order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' : ''}
                                `}>
                                    {order.status === 'PAID' ? '已付款' : order.status === 'PENDING' ? '待付款' : '已取消'}
                                </span>
                                <span className="text-white font-bold">NT${order.course.price.toLocaleString()}</span>
                                
                                {/* 待付款狀態：顯示「去付款」按鈕 */}
                                {order.status === 'PENDING' && (
                                    <button 
                                        onClick={() => setSelectedPaymentOrder(order)}
                                        className="bg-[#3b82f6] text-white px-3 py-1 rounded text-xs hover:bg-blue-500 transition shadow-lg shadow-blue-500/20 mb-1"
                                    >
                                        去付款
                                    </button>
                                )}

                                {(order.status != 'PAID') && (
                                    <button 
                                        onClick={() => handleCancelOrder(order.id)}
                                        className="text-red-400 text-xs hover:underline"
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