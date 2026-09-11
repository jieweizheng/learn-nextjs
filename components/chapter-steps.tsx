"use client";

import { useEffect, useState } from "react";
import InlineText from "@/components/inline-text";
import CodeBlock from "@/components/code-block";
import { notesStorageKey, pointsStorageKey } from "@/lib/storage-keys";
import type { KnowledgePoint } from "@/lib/chapters";

/**
 * 知识点清单：每一项都可勾选（进度存 localStorage），
 * 并带具体讲解、示例代码（可一键复制）、自检标准与常见坑。
 */
export default function ChapterSteps({
  slug,
  points,
}: {
  slug: string;
  points: KnowledgePoint[];
}) {
  const stepsKey = pointsStorageKey(slug);
  const notesKey = notesStorageKey(slug);

  const [done, setDone] = useState<Record<number, boolean>>({});
  const [notes, setNotes] = useState("");
  const [ready, setReady] = useState(false);
  /** 每一项的讲解是否展开（默认全部展开，方便通读） */
  const [open, setOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(stepsKey);
      if (raw) setDone(JSON.parse(raw) as Record<number, boolean>);
      setNotes(window.localStorage.getItem(notesKey) ?? "");
    } catch {
      /* 忽略 */
    }
    setReady(true);
  }, [stepsKey, notesKey]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(stepsKey, JSON.stringify(done));
    } catch {
      /* 忽略 */
    }
  }, [done, ready, stepsKey]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(notesKey, notes);
    } catch {
      /* 忽略 */
    }
  }, [notes, ready, notesKey]);

  const completed = points.filter((_, i) => done[i]).length;
  const total = points.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  const allOpen = points.every((_, i) => open[i] !== false);

  function setAll(value: boolean) {
    const next: Record<number, boolean> = {};
    points.forEach((_, i) => {
      next[i] = value;
    });
    setOpen(next);
  }

  return (
    <div className="space-y-6">
      {/* 进度 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          知识点完成：
          <span className="font-semibold text-slate-900">
            {" "}
            {completed} / {total}
          </span>
        </p>
        <div className="flex items-center gap-3">
          <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => setAll(!allOpen)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-slate-50"
          >
            {allOpen ? "全部收起讲解" : "全部展开讲解"}
          </button>
        </div>
      </div>

      {/* 知识点列表 */}
      <ol className="space-y-4">
        {points.map((point, i) => {
          const isDone = !!done[i];
          const isOpen = open[i] !== false;
          const bodyId = `point-body-${i + 1}`;

          return (
            <li
              key={i}
              id={`point-${i + 1}`}
              className={`scroll-mt-6 rounded-2xl border p-4 transition-colors ${
                isDone
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-slate-200 bg-white"
              }`}
            >
              {/* 头部：勾选 + 标题 */}
              <div className="flex items-start gap-3">
                <input
                  id={`point-check-${i + 1}`}
                  type="checkbox"
                  checked={isDone}
                  onChange={() =>
                    setDone((prev) => ({ ...prev, [i]: !prev[i] }))
                  }
                  className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-emerald-500"
                  aria-label={`标记知识点：${point.title}`}
                />
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={`point-check-${i + 1}`}
                    className={`block cursor-pointer font-semibold ${
                      isDone ? "text-emerald-900" : "text-slate-900"
                    }`}
                  >
                    <span className="mr-1 text-slate-400">{i + 1}.</span>
                    <InlineText text={point.title} />
                  </label>
                  {point.why ? (
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      <span className="font-medium text-slate-400">
                        为什么要学：
                      </span>
                      <InlineText text={point.why} />
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen((prev) => ({ ...prev, [i]: !isOpen }))}
                  aria-expanded={isOpen}
                  aria-controls={bodyId}
                  className="shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-50"
                >
                  {isOpen ? "收起讲解" : "展开讲解"}
                </button>
              </div>

              {/* 讲解正文 */}
              <div
                id={bodyId}
                hidden={!isOpen}
                className="mt-3 space-y-3 border-l-2 border-slate-100 pl-4 sm:pl-6"
              >
                {point.explain.map((paragraph, pi) => (
                  <p
                    key={pi}
                    className="text-sm leading-relaxed text-slate-600"
                  >
                    <InlineText text={paragraph} />
                  </p>
                ))}

                {point.code ? <CodeBlock code={point.code} /> : null}

                {point.check ? (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                    <span className="font-semibold">✅ 自检：</span>
                    <InlineText text={point.check} />
                  </p>
                ) : null}

                {point.pitfalls?.length ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                    <p className="text-sm font-semibold text-amber-900">
                      ⚠️ 常见坑
                    </p>
                    <ul className="mt-1 space-y-1">
                      {point.pitfalls.map((p, pi) => (
                        <li
                          key={pi}
                          className="flex gap-2 text-sm leading-relaxed text-amber-900/90"
                        >
                          <span>·</span>
                          <span>
                            <InlineText text={p} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {/* 笔记 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label
          htmlFor={`notes-${slug}`}
          className="text-sm font-semibold text-slate-900"
        >
          我的笔记 / 遇到的问题
        </label>
        <p className="mt-1 text-xs text-slate-400">
          自动保存在本地浏览器，方便下次继续。
        </p>
        <textarea
          id={`notes-${slug}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="例：npm run dev 报错 EADDRINUSE 3000，原来是端口被占用……"
          className="mt-2 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    </div>
  );
}
