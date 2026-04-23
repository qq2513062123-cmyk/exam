import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "在线考试与管理系统",
  description: "在线考试与管理系统统一入口，包含学生端与管理端。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
