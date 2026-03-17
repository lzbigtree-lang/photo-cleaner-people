"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  imageUrl: string;
  maskUrl: string;
  onClick: (x: number, y: number, width: number, height: number) => void;
}

export default function ImageCanvas({ imageUrl, maskUrl, onClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => {
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!maskUrl || !overlayRef.current) return;
    const overlay = overlayRef.current;
    overlay.width = imgSize.w;
    overlay.height = imgSize.h;
    const ctx = overlay.getContext("2d")!;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      ctx.globalAlpha = 0.45;
      ctx.drawImage(img, 0, 0, overlay.width, overlay.height);
      ctx.globalAlpha = 1;
    };
    img.src = maskUrl;
  }, [maskUrl, imgSize]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const rect = overlay.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (overlay.width / rect.width));
    const y = Math.round((e.clientY - rect.top) * (overlay.height / rect.height));
    onClick(x, y, overlay.width, overlay.height);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold mb-2 text-sm text-gray-700">
        原图 <span className="font-normal text-gray-400">— 点击要保留的人物</span>
      </h3>
      <div className="relative w-full rounded-lg overflow-hidden bg-gray-100 cursor-crosshair">
        <canvas ref={canvasRef} className="block w-full h-auto" />
        <canvas
          ref={overlayRef}
          className="absolute inset-0 w-full h-full"
          onClick={handleClick}
        />
      </div>
    </div>
  );
}
