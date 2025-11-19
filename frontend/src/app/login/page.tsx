"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 使用環境變數或預設 localhost
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        // 登入成功，將 Token 存入 localStorage
        localStorage.setItem("token", data.token);
        
        // [修正]：這裡原本漏了 avatar，現在補上
        localStorage.setItem("user", JSON.stringify({ 
            name: data.name, 
            role: data.role,
            avatar: data.avatar 
        }));
        
        // 強制重新整理以觸發 Layout 狀態更新，並跳轉回首頁
        window.location.href = "/"; 
      } else {
        const msg = await res.text();
        setError(msg || "登入失敗，請檢查帳號密碼");
      }
    } catch (err) {
      setError("無法連接伺服器，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-card border border-white/10 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">歡迎回來</h1>
          <p className="text-gray-400 text-sm">登入以繼續你的學習之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">密碼</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "登入中..." : "登入"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          還沒有帳號？{" "}
          <Link href="/register" className="text-primary hover:underline">
            立即註冊
          </Link>
        </div>
      </div>
    </div>
  );
}