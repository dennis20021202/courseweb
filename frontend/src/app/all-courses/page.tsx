"use client"; 
import { useState, useEffect } from "react";
import Link from "next/link";
import CheckoutModal from "@/components/CheckoutModal"; 

// 從後端 API 獲取的資料結構
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

export default function AllCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState<Set<number>>(new Set());
  const [pendingOrderMap, setPendingOrderMap] = useState<Map<number, number>>(new Map());
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [existingOrderId, setExistingOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchCourses = async () => {
          try {
              const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
              
              // 1. 取得所有課程 (不需過濾推薦)
              const res = await fetch(`${API_URL}/api/courses`);
              if (res.ok) {
                  const data = await res.json();
                  setCourses(data);
              }

              // 2. 檢查購買狀態
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
      fetchCourses();
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
    <div className="max-w-7xl mx-auto">
       {selectedCourse && (
          <CheckoutModal 
            course={selectedCourse} 
            existingOrderId={existingOrderId}
            onClose={() => { setSelectedCourse(null); setExistingOrderId(null); }}
          />
       )}
       
       <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-4 border-l-4 border-[#fbbf24] pl-4">所有課程</h1>
          <p className="text-gray-400">探索學院內的所有課程，找到適合你的修練之路。</p>
       </div>

       {loading ? (
           <div className="text-center text-gray-500 py-20">載入中...</div>
       ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {courses.map((course) => {
                   const isPurchased = purchasedCourseIds.has(course.id);
                   const isPending = pendingOrderMap.has(course.id);

                   return (
                       <div key={course.id} className="bg-[#20222e] rounded-xl overflow-hidden border border-white/10 hover:border-[#fbbf24]/50 transition flex flex-col">
                           <div className="aspect-video bg-black relative">
                               <img 
                                   src={course.image} 
                                   alt={course.title} 
                                   className="w-full h-full object-cover opacity-90"
                                   onError={(e) => e.currentTarget.src = '/images/course_0.png'} 
                               />
                               {course.hasTrial && !isPurchased && (
                                   <div className="absolute top-3 right-3 bg-[#fbbf24] text-black text-xs font-bold px-2 py-1 rounded">
                                       可試聽
                                   </div>
                               )}
                           </div>
                           
                           <div className="p-5 flex-1 flex flex-col">
                               <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                               <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-2">{course.description}</p>
                               
                               <div className="flex items-center justify-between mb-4">
                                   <div className="flex items-center gap-2">
                                        <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded">{course.author}</span>
                                   </div>
                                   <span className="text-[#22c55e] font-bold">NT${course.price.toLocaleString()}</span>
                               </div>

                               <div className="flex gap-3 mt-auto">
                                   {/* 如果有試聽功能且未購買，顯示試聽按鈕 */}
                                   {course.hasTrial && !isPurchased && (
                                       <button 
                                            onClick={() => handleTrial(course.id)}
                                            className="flex-1 py-2 border border-[#fbbf24] text-[#fbbf24] rounded-lg text-sm font-bold hover:bg-[#fbbf24]/10 transition"
                                       >
                                           試聽
                                       </button>
                                   )}
                                   <button 
                                       onClick={() => handlePurchase(course)}
                                       className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                                           isPurchased 
                                             ? "bg-green-600 text-white hover:bg-green-500"
                                             : isPending 
                                                ? "bg-yellow-500 text-black"
                                                : "bg-[#fbbf24] text-black hover:bg-yellow-300"
                                       }`}
                                   >
                                       {isPurchased ? "去上課" : isPending ? "繼續付款" : "購買"}
                                   </button>
                               </div>
                           </div>
                       </div>
                   );
               })}
           </div>
       )}
    </div>
  );
}