"use client";

interface Props {
  resultUrl: string;
  loading: boolean;
  loadingText: string;
}

export default function ResultPanel({ resultUrl, loading, loadingText }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold mb-2 text-sm text-gray-700">处理结果</h3>
      <div className="relative w-full rounded-lg overflow-hidden bg-gray-100 min-h-[200px] flex items-center justify-center">
        {resultUrl && !loading && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resultUrl} alt="处理结果" className="block w-full h-auto" crossOrigin="anonymous" />
        )}
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-3">
            <div className="w-9 h-9 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
            <p className="text-sm text-gray-600">{loadingText}</p>
          </div>
        )}
        {!resultUrl && !loading && (
          <p className="text-gray-400 text-sm">点击左侧图片中要保留的人物</p>
        )}
      </div>
    </div>
  );
}
