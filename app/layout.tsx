import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "照片人物清除工具",
  description: "上传照片，点击要保留的人物，自动去除其他人",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
