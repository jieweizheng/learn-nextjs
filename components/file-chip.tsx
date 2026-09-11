"use client";

import { useState } from "react";
import { buildEditorUrl, editorLabel, toAbsolutePath } from "@/lib/editor-links";
import { useEditorEnv } from "@/lib/use-editor-env";

/**
 * 可点击的文件路径。
 *
 * - 点路径 → 用**自动探测到的**编辑器打开（Cursor / VS Code / JetBrains …），
 *   编辑器与项目根目录都由服务端探测，用户无需配置；
 * - 点后面的 ⧉ → 复制绝对路径（没探测到编辑器时的兜底方式）。
 */
export default function FileChip({ path }: { path: string }) {
  const env = useEditorEnv();
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");

  const root = env?.root ?? "";
  const absolute = toAbsolutePath(root, path);
  const url = env ? buildEditorUrl(env.editor, absolute) : null;
  const canOpen = Boolean(url);

  async function copyPath() {
    try {
      await navigator.clipboard.writeText(absolute || path);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
    window.setTimeout(() => setCopied("idle"), 1600);
  }

  const title = canOpen
    ? `在 ${editorLabel(env!.editor)} 中打开：${absolute}`
    : env
      ? `点击复制路径（没检测到可唤起的编辑器）：${absolute}`
      : "正在识别本机编辑器…";

  const textClass =
    "cursor-pointer underline decoration-indigo-300 decoration-dotted underline-offset-2 hover:decoration-solid";

  return (
    <span className="inline-flex items-baseline gap-1 rounded-md border border-indigo-200/70 bg-indigo-50/70 px-1.5 py-0.5 font-mono text-[0.85em] leading-relaxed text-indigo-700">
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
        className="cursor-pointer rounded px-0.5 text-indigo-400 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
      >
        ⧉
      </button>

      {copied === "ok" ? (
        <span className="font-sans text-[0.75em] text-emerald-600">已复制</span>
      ) : null}
      {copied === "fail" ? (
        <span className="font-sans text-[0.75em] text-rose-500">复制失败</span>
      ) : null}
    </span>
  );
}
