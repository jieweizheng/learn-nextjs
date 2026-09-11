"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Chapter } from "@/lib/chapters";

const STORAGE_KEY = "nextjs-learn:chapters";

export default function ChapterChecklist({
  chapters,
}: {
  chapters: Chapter[];
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  // 从 localStorage 读取已完成状态（挂载后再读，避免服务端/客户端不一致）
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* 忽略解析错误 */
    }
    setReady(true);
  }, []);

  // 状态变化后写回 localStorage
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {
      /* 忽略写入错误 */
    }
  }, [done, ready]);

  const total = chapters.length;
  const completed = chapters.filter((c) => done[c.slug]).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  function toggle(slug: string) {
    setDone((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }

  function reset() {
    if (window.confirm("确定要清空所有章节的完成进度吗？此操作只影响本页打勾记录。")) {
      setDone({});
    }
  }

  return (
    <div className="space-y-8">
      {/* 进度卡片 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">学习进度</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {completed}
              <span className="text-lg font-medium text-slate-400">
                {" "}
                / {total} 章
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold text-indigo-600">
              {percent}%
            </span>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
            >
              重置进度
            </button>
          </div>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        {completed === total && total > 0 ? (
          <p className="mt-3 text-sm font-medium text-emerald-600">
            🎉 16 章全部完成，恭喜！可以去做自己的 Next.js 项目了。
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            完成一章后回来打勾，进度会自动保存在本地浏览器里。
          </p>
        )}
      </section>

      {/* 使用说明 */}
      <section className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6">
        <h2 className="text-base font-semibold text-indigo-900">
          怎么用这个工作台？
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-indigo-900/80">
          <li>
            · 每一章都在 <code className="rounded bg-white/70 px-1.5 py-0.5">chapters/</code>{" "}
            下有对应目录和一份学习计划（PLAN.md）。
          </li>
          <li>
            · 打开某一章的「学习计划」，让 AI 助手按步骤<b>引导</b>你完成——它只讲解和提醒，<b>不会替你改代码、也不会替你运行命令</b>。
          </li>
          <li>
            · 代码要你自己敲、命令要你自己跑，遇到报错可以把信息贴给助手，一起排查。
          </li>
        </ul>
      </section>

      {/* 章节清单 */}
      <section className="space-y-3">
        <h2 className="px-1 text-lg font-semibold text-slate-900">章节清单</h2>
        {chapters.map((c) => {
          const isDone = !!done[c.slug];
          return (
            <div
              key={c.slug}
              className={`flex flex-wrap items-start gap-4 rounded-2xl border p-4 transition-colors sm:flex-nowrap ${
                isDone
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-slate-200 bg-white hover:border-indigo-200"
              }`}
            >
              {/* 打勾 */}
              <label className="flex cursor-pointer select-none items-center gap-3 pt-0.5">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggle(c.slug)}
                  className="h-5 w-5 shrink-0 cursor-pointer accent-emerald-500"
                  aria-label={`标记第 ${c.num} 章为已完成`}
                />
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {c.num}
                </span>
              </label>

              {/* 标题与说明 */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3
                    className={`font-semibold ${
                      isDone ? "text-emerald-900" : "text-slate-900"
                    }`}
                  >
                    {c.titleZh}
                  </h3>
                  <span className="text-xs font-medium text-slate-400">
                    {c.title}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {c.summary}
                </p>
              </div>

              {/* 操作 */}
              <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                <Link
                  href={`/chapters/${c.slug}`}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                >
                  学习计划
                </Link>
                <a
                  href={c.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                >
                  官方文档 ↗
                </a>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
