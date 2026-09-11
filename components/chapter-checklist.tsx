"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CHAPTERS_STORAGE_KEY, pointsStorageKey } from "@/lib/storage-keys";
import type { Chapter } from "@/lib/chapters";

const STORAGE_KEY = CHAPTERS_STORAGE_KEY;

export default function ChapterChecklist({
  chapters,
}: {
  chapters: Chapter[];
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  /** 每章已完成的「知识点」数（从章节页的本地进度推导） */
  const [pointDone, setPointDone] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  // 读取已完成的章节 + 每章的知识点进度（挂载后再读，避免服务端/客户端不一致）
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* 忽略解析错误 */
    }

    const next: Record<string, number> = {};
    for (const c of chapters) {
      try {
        const raw = window.localStorage.getItem(pointsStorageKey(c.slug));
        if (raw) {
          const parsed = JSON.parse(raw) as Record<string, boolean>;
          next[c.slug] = Object.values(parsed).filter(Boolean).length;
        }
      } catch {
        /* 忽略单个章节的解析错误 */
      }
    }
    setPointDone(next);
    setReady(true);
  }, [chapters]);

  // 章节勾选状态写回 localStorage
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

  const totalPoints = chapters.reduce((sum, c) => sum + c.points.length, 0);
  const donePoints = chapters.reduce(
    (sum, c) => sum + Math.min(pointDone[c.slug] ?? 0, c.points.length),
    0,
  );
  const pointPercent = totalPoints
    ? Math.round((donePoints / totalPoints) * 100)
    : 0;

  function toggle(slug: string) {
    setDone((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }

  function reset() {
    if (
      window.confirm(
        "确定要清空所有章节的完成进度吗？此操作只影响本页打勾记录（各章知识点进度请在章节页重置）。",
      )
    ) {
      setDone({});
    }
  }

  return (
    <div className="space-y-8">
      {/* 进度卡片 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-sm font-medium text-slate-500">章节进度</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {completed}
                <span className="text-lg font-medium text-slate-400">
                  {" "}
                  / {total} 章
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">知识点进度</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {donePoints}
                <span className="text-lg font-medium text-slate-400">
                  {" "}
                  / {totalPoints} 个
                </span>
              </p>
            </div>
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
              重置章节进度
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs text-slate-400">章节</span>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs text-slate-400">知识点</span>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${pointPercent}%` }}
              />
            </div>
            <span className="shrink-0 text-xs text-slate-400">
              {pointPercent}%
            </span>
          </div>
        </div>

        {completed === total && total > 0 ? (
          <p className="mt-3 text-sm font-medium text-emerald-600">
            🎉 16 章全部完成，恭喜！可以去做自己的 Next.js 项目了。
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            完成一章后回来打勾；知识点进度来自各章页面的勾选，同样只存在本地浏览器。
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
            · 每一章都在{" "}
            <code className="rounded bg-white/70 px-1.5 py-0.5">chapters/</code>{" "}
            下有目录与学习计划（PLAN.md）；点「学习计划」进入章节页。
          </li>
          <li>
            · 章节页把该章拆成一份<b>知识点清单（checklist）</b>
            ，每一项都带<b>具体讲解</b>、示例代码、自检标准与常见坑 ——
            不需要自己先去啃英文文档也能开始。
          </li>
          <li>
            · 打开某一章后，让 AI 助手<b>一次讲一个知识点</b>
            ，讲完由你自己动手、自己打勾；它<b>不会替你改代码、也不会替你运行命令</b>。
          </li>
          <li>
            · 代码要你自己敲、命令要你自己跑，遇到报错把信息贴给助手，一起排查。
          </li>
        </ul>
      </section>

      {/* 章节清单 */}
      <section className="space-y-3">
        <h2 className="px-1 text-lg font-semibold text-slate-900">章节清单</h2>
        {chapters.map((c) => {
          const isDone = !!done[c.slug];
          const pd = Math.min(pointDone[c.slug] ?? 0, c.points.length);
          const pdPercent = c.points.length
            ? Math.round((pd / c.points.length) * 100)
            : 0;
          const pointsAllDone = pd >= c.points.length && c.points.length > 0;

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
                  {pointsAllDone && !isDone ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      知识点已全部完成，可以打勾了
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {c.summary}
                </p>

                {/* 知识点进度 */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pointsAllDone ? "bg-emerald-500" : "bg-indigo-400"
                      }`}
                      style={{ width: `${pdPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    知识点 {pd} / {c.points.length}
                  </span>
                </div>
              </div>

              {/* 操作 */}
              <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                <Link
                  href={`/chapters/${c.slug}`}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                >
                  知识点清单
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
