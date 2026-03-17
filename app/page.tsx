"use client";

import { useRef, useState, useCallback } from "react";
import UploadArea from "@/components/UploadArea";
import TokenInput from "@/components/TokenInput";
import ImageCanvas from "@/components/ImageCanvas";
import ResultPanel from "@/components/ResultPanel";

export default function Home() {
  const [token, setToken] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("replicate_token") || "";
    }
    return "";
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [tip, setTip] = useState("");
  const [maskUrl, setMaskUrl] = useState("");

  const handleFile = useCallback((file: File) => {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setTip("仅支持 JPG / PNG");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setTip("图片超过 10MB，请压缩后上传");
      return;
    }
    setTip("");
    setResultUrl("");
    setMaskUrl("");
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  }, []);

  const handleCanvasClick = useCallback(
    async (x: number, y: number, width: number, height: number) => {
      if (!token) { setTip("请先填写并保存 Replicate API Token"); return; }
      if (!imageFile) return;

      setTip("");
      setLoading(true);
      setLoadingText("正在分割人物...");

      try {
        // Convert file to base64
        const base64 = await fileToBase64(imageFile);

        // Step 1: SAM 2
        const samRes = await fetch("/api/sam2", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, image: base64, x: x / width, y: y / height }),
        });
        const samData = await samRes.json();
        if (!samRes.ok) throw new Error(samData.error || "SAM 2 失败");
        if (!samData.mask) { setTip("未检测到人物，请重新点击"); setLoading(false); return; }

        setMaskUrl(samData.mask);
        setLoadingText("正在修复背景...");

        // Step 2: LaMa
        const lamaRes = await fetch("/api/lama", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, image: base64, mask: samData.mask }),
        });
        const lamaData = await lamaRes.json();
        if (!lamaRes.ok) throw new Error(lamaData.error || "背景修复失败");

        setResultUrl(lamaData.result);
      } catch (err: unknown) {
        setTip("处理失败：" + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    },
    [token, imageFile]
  );

  const handleReset = () => {
    setImageFile(null);
    setImageUrl("");
    setResultUrl("");
    setMaskUrl("");
    setTip("");
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-1">🖼️ 照片人物清除工具</h1>
      <p className="text-gray-500 mb-6">上传照片，点击要保留的人物，自动去除其他人</p>

      <TokenInput token={token} onChange={setToken} />

      {!imageFile ? (
        <UploadArea onFile={handleFile} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <ImageCanvas
              imageUrl={imageUrl}
              maskUrl={maskUrl}
              onClick={handleCanvasClick}
            />
            <ResultPanel resultUrl={resultUrl} loading={loading} loadingText={loadingText} />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleReset}
              className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
            >
              重新选择
            </button>
            {resultUrl && (
              <a
                href={resultUrl}
                download="photo-cleaner-result.png"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 rounded-lg bg-gray-900 hover:bg-gray-700 text-white transition"
              >
                下载结果
              </a>
            )}
          </div>
        </>
      )}

      {tip && <p className="mt-3 text-red-500 text-sm">{tip}</p>}
    </main>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
