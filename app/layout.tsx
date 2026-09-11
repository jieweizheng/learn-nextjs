import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Next.js 学习之旅",
    default: "Next.js 学习之旅",
  },
  description:
    "根据 Next.js 官方 Dashboard 课程整理的 16 章学习工作台：章节清单、每章学习计划，以及引导式学习的 Agent 规则。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
