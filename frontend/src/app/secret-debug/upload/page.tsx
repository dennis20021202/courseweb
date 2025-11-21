"use client";

import { useState } from "react";

// 設定限制為 500MB
const MAX_FILE_SIZE_MB = 500;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function SecretUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [customName, setCustomName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const [unlockCount, setUnlockCount] = useState(0);
    const isUnlocked = unlockCount >= 5;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResult(null); // 清除舊訊息

        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // 檢查檔案大小
            if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
                setFile(null);
                setResult({ 
                    success: false, 
                    error: `檔案太大囉！限制為 ${MAX_FILE_SIZE_MB}MB，目前檔案大小: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB` 
                });
                // 清空 input 讓使用者可以重新選擇同一個檔案 (若他有縮小後)
                e.target.value = "";
                return;
            }

            setFile(selectedFile);
            // 預設使用檔名 (去除副檔名)
            if (!customName) {
                const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
                setCustomName(nameWithoutExt);
            }
        }
    };

    const handleUpload = async () => {
        if (!file || !customName) return;

        setUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", customName);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            const res = await fetch(`${API_URL}/api/test/upload/video`, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setResult({ success: true, data });
            } else {
                const text = await res.text();
                setResult({ success: false, error: text });
            }
        } catch (err) {
            setResult({ success: false, error: "連線錯誤" });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#12141c] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#181a25] border border-white/10 rounded-xl p-8 shadow-2xl">
                <h1 
                    className={`text-2xl font-bold mb-6 text-center select-none cursor-pointer transition-colors ${isUnlocked ? "text-red-500" : "text-gray-500"}`}
                    onClick={() => setUnlockCount(c => c + 1)}
                >
                    {isUnlocked ? "⚠️ 開發者測試後台" : "404 Not Found"}
                </h1>

                {!isUnlocked ? (
                    <div className="text-center text-gray-600 text-sm">
                        這裡什麼都沒有，請回上一頁。
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-xs text-yellow-500">
                            注意：這是測試用的上傳功能。影片會直接存入 public/videos 資料夾。
                            請勿在上線環境濫用。<br/>
                            <strong>單檔限制：{MAX_FILE_SIZE_MB} MB</strong>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">選擇影片 (MP4)</label>
                            <input 
                                type="file" 
                                accept="video/mp4"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-[#fbbf24] file:text-black
                                hover:file:bg-yellow-300
                                cursor-pointer"
                            />
                            {file && (
                                <p className="mt-2 text-xs text-green-400">
                                    已選擇: {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                影片 ID (不用副檔名)
                                <span className="block text-xs text-gray-600">這將作為 DataSeeder 中的 videoId</span>
                            </label>
                            <input 
                                type="text" 
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#fbbf24] outline-none"
                                placeholder="例如: c101"
                            />
                        </div>

                        <button 
                            onClick={handleUpload}
                            disabled={!file || !customName || uploading}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {uploading ? "上傳中..." : "確認上傳"}
                        </button>

                        {result && (
                            <div className={`p-4 rounded-lg text-sm break-all ${result.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                                {result.success ? (
                                    <>
                                        <p className="font-bold mb-1">✅ 上傳成功</p>
                                        <p>路徑: {result.data.path}</p>
                                        <p className="text-xs text-gray-500 mt-1">請重新整理頁面或等待 Docker 同步</p>
                                    </>
                                ) : (
                                    <p>❌ 失敗: {result.error}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}