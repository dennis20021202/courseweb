"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("/images/default-avatar.png"); // 預設頭貼
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 處理圖片上傳，轉為 Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 限制檔案大小 (例如 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("圖片大小請勿超過 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, avatar }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({ 
          name: data.name, 
          role: data.role, 
          avatar: data.avatar 
        }));
        
        window.location.href = "/"; 
      } else {
        const msg = await res.text();
        setError(msg || "註冊失敗，請稍後再試");
      }
    } catch (err) {
      setError("無法連接伺服器");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-[#20222e] border border-white/10 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">加入學院</h1>
          <p className="text-gray-400 text-sm">建立帳號，開始你的修練</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 頭貼上傳預覽 */}
          <div className="flex flex-col items-center mb-6">
             <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#fbbf24] bg-gray-700 mb-4 group">
                <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150'}/>
                {/* 遮罩提示 */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs text-white pointer-events-none">
                  更換
                </div>
             </div>
             
             <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition">
                <span>上傳頭貼</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
             </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">暱稱</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#fbbf24] transition"
              placeholder="水球學員"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#fbbf24] transition"
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
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#fbbf24] transition"
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
            className="w-full bg-[#fbbf24] text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20"
          >
            {loading ? "建立帳號中..." : "註冊"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          已經有帳號了？{" "}
          <Link href="/login" className="text-[#fbbf24] hover:underline">
            直接登入
          </Link>
        </div>
      </div>
    </div>
  );
}