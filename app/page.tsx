import ChapterChecklist from "@/components/chapter-checklist";
import { chapters } from "@/lib/chapters";

export default function Page() {
  const totalSteps = chapters.reduce((sum, c) => sum + c.steps.length, 0);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      {/* 头部 */}
      <header className="mb-10">
        <p className="text-sm font-medium text-indigo-600">
          Next.js 官方 Dashboard 课程 · 16 章
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
          Next.js 学习之旅
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
          这里是你的学习工作台。从 React 出发，跟着官方课程一步步构建一个完整的
          Dashboard 应用。每章都有清晰的学习计划，AI 助手会
          <b className="text-slate-900">引导</b>你自己动手完成——
          代码你自己写，命令你自己跑，它只负责讲解、提醒和陪你排错。
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
          <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
            {chapters.length} 个章节
          </span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
            约 {totalSteps} 个步骤
          </span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-slate-200">
            App Router + TypeScript
          </span>
        </div>
      </header>

      {/* 章节清单（可打勾） */}
      <ChapterChecklist chapters={chapters} />

      <footer className="mt-14 border-t border-slate-200 pt-6 text-sm text-slate-400">
        <p>
          学习计划在 <code className="rounded bg-slate-100 px-1.5 py-0.5">chapters/</code>{" "}
          目录下，Agent 引导规则见{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5">AGENTS.md</code>。
          课程内容版权归{" "}
          <a
            className="text-indigo-500 hover:underline"
            href="https://nextjs.org/learn"
            target="_blank"
            rel="noreferrer"
          >
            Next.js 官方文档
          </a>{" "}
          所有。
        </p>
      </footer>
    </main>
  );
}
