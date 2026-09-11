"use client";

import { useEffect, useState } from "react";
import type { ChapterStep } from "@/lib/chapters";

export default function ChapterSteps({
  slug,
  steps,
}: {
  slug: string;
  steps: ChapterStep[];
}) {
  const stepsKey = `nextjs-learn:steps:${slug}`;
  const notesKey = `nextjs-learn:notes:${slug}`;

  const [done, setDone] = useState<Record<number, boolean>>({});
  const [notes, setNotes] = useState("");
  const [ready, setReady] = useState(false);

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

  const completed = steps.filter((_, i) => done[i]).length;
  const total = steps.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          本章步骤完成：
          <span className="font-semibold text-slate-900">
            {" "}
            {completed} / {total}
          </span>
        </p>
        <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ol className="space-y-4">
        {steps.map((step, i) => {
          const isDone = !!done[i];
          return (
            <li
              key={i}
              className={`rounded-2xl border p-4 transition-colors ${
                isDone
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() =>
                    setDone((prev) => ({ ...prev, [i]: !prev[i] }))
                  }
                  className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-emerald-500"
                />
                <div className="min-w-0">
                  <p
                    className={`font-semibold ${
                      isDone ? "text-emerald-900" : "text-slate-900"
                    }`}
                  >
                    {i + 1}. {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {step.detail}
                  </p>
                </div>
              </label>

              {step.code ? (
                <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
                  <code>{step.code}</code>
                </pre>
              ) : null}

              {step.code ? (
                <p className="mt-2 text-xs text-slate-400">
                  这段命令请你自己在终端里执行（助手不会替你运行）。
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

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
