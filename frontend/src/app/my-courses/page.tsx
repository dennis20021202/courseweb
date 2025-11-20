"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Course {
  id: number;
  title: string;
  image: string;
  author: string;
}

interface Order {
    id: number;
    course: Course;
    status: string;
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        // 這裡我們重用 orders API 來過濾已付款的課程
        // 理想上後端應該有一個 /api/my-courses 端點，但為了節省時間我們先用 orders
        const res = await fetch(`${API_URL}/api/orders/my`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            const orders: Order[] = await res.json();
            // 過濾出已付款 (PAID) 的課程，並去重 (避免重複購買顯示兩次)
            const uniqueCourses = new Map<number, Course>();
            orders.forEach(o => {
                if (o.status === 'PAID') {
                    uniqueCourses.set(o.course.id, o.course);
                }
            });
            setCourses(Array.from(uniqueCourses.values()));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  if (loading) return <div className="text-white text-center py-20">載入中...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8 border-l-4 border-[#fbbf24] pl-4">我的課程</h1>
      
      {courses.length === 0 ? (
        <div className="text-center py-16 bg-[#20222e] rounded-2xl border border-white/10">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-bold text-white mb-2">還沒有參加任何課程</h2>
            <p className="text-gray-400 mb-6">開始你的學習旅程吧！</p>
            <Link href="/" className="px-6 py-2 bg-[#fbbf24] text-black rounded-lg font-bold hover:bg-yellow-300 transition">
                前往選課
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
                <Link key={course.id} href={`/courses/${course.id}/learn`} className="group block bg-[#20222e] rounded-xl overflow-hidden border border-white/10 hover:border-[#fbbf24] transition hover:-translate-y-1 duration-300">
                    <div className="aspect-video bg-black relative">
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition"></div>
                        <div className="absolute bottom-3 right-3 bg-black/80 text-[#fbbf24] text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                            繼續上課
                        </div>
                    </div>
                    <div className="p-5">
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{course.title}</h3>
                        <p className="text-gray-400 text-sm">{course.author}</p>
                    </div>
                </Link>
            ))}
        </div>
      )}
    </div>
  );
}