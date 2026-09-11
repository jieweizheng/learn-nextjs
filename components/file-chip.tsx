"use client";

import { useEffect, useState } from "react";
import { buildEditorUrl, editorLabel, toAbsolutePath } from "@/lib/editor-links";
import { useEditorEnv } from "@/lib/use-editor-env";
import { checkPathExists } from "@/lib/file-exists";

/**
 * 可点击的文件路径。
 *
 * - 点路径 → 用**自动探测到的**编辑器打开（Cursor / VS Code / JetBrains …），
 *   编辑器与项目根目录都由服务端探测，用户无需配置；
 * - 点后面的 ⧉ → 复制绝对路径（没探测到编辑器时的兜底方式）。
 * - 如果这个文件在本项目里**还不存在**（课程后面才让你创建），标成「待创建」，
 *   点击直接复制路径，不让编辑器弹出「文件不存在」。
 */
export default function FileChip({ path }: { path: string }) {
  const env = useEditorEnv();
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  /** null = 还在查；false = 本项目里还没这个文件 */
  const [exists, setExists] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    void checkPathExists(path).then((value) => {
      if (alive) setExists(value);
    });
    return () => {
      alive = false;
    };
  }, [path]);

  const root = env?.root ?? "";
  const absolute = toAbsolutePath(root, path);
  const missing = exists === false;
  const url = env ? buildEditorUrl(env.editor, absolute) : null;
  const canOpen = Boolean(url) && !missing;

  async function copyPath() {
    try {
      await navigator.clipboard.writeText(absolute || path);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
    window.setTimeout(() => setCopied("idle"), 1600);
  }

  const title = missing
    ? `本项目里还没有这个文件（按这一步创建后就能点击跳转）：${absolute}`
    : canOpen
      ? `在 ${editorLabel(env!.editor)} 中打开：${absolute}`
      : env
        ? `点击复制路径（没检测到可唤起的编辑器）：${absolute}`
        : "正在识别本机编辑器…";

  const textClass = missing
    ? "cursor-pointer underline decoration-slate-300 decoration-dotted underline-offset-2 hover:decoration-solid"
    : "cursor-pointer underline decoration-indigo-300 decoration-dotted underline-offset-2 hover:decoration-solid";

  const boxClass = missing
    ? "border-slate-200 bg-slate-50 text-slate-500"
    : "border-indigo-200/70 bg-indigo-50/70 text-indigo-700";

  return (
    <span
      className={`inline-flex items-baseline gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[0.85em] leading-relaxed ${boxClass}`}
    >
      {canOpen ? (
        <a href={url ?? undefined} title={title} className={textClass}>
          {path}
        </a>
      ) : (
        <button type="button" onClick={copyPath} title={title} className={textClass}>
          {path}
        </button>
      )}

      <button
        type="button"
        onClick={copyPath}
        title={`复制绝对路径：${absolute || path}`}
        aria-label={`复制路径 ${path}`}
        className={`cursor-pointer rounded px-0.5 transition-colors ${
          missing
            ? "text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            : "text-indigo-400 hover:bg-indigo-100 hover:text-indigo-700"
        }`}
      >
        ⧉
      </button>

      {missing ? (
        <span
          className="font-sans text-[0.75em] text-slate-400"
          title="这一步还没做到，文件还没创建；创建后这里就能点击跳转"
        >
          待创建
        </span>
      ) : null}

      {copied === "ok" ? (
        <span className="font-sans text-[0.75em] text-emerald-600">已复制</span>
      ) : null}
      {copied === "fail" ? (
        <span className="font-sans text-[0.75em] text-rose-500">复制失败</span>
      ) : null}
    </span>
  );
}
