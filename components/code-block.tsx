"use client";

import { useState } from "react";

/**
 * 代码块（带「复制」按钮）。
 *
 * - 点「复制」拿到的是**屏幕上展示的全部代码**，原样复制、不做删减；
 * - 顶部小标签显示代码块第一行的注释，通常就是「这段代码写在哪个文件」。
 */

/** 取第一行注释当标题；不是注释就显示「示例代码」 */
function codeLabel(code: string): string {
  const first = code.split("\n")[0]?.trim() ?? "";
  const isComment =
    first.startsWith("//") ||
    first.startsWith("/*") ||
    first.startsWith("<!--") ||
    first.startsWith("#");

  if (!isComment) return "示例代码";

  return first
    .replace(/^\/\/\s*/, "")
    .replace(/^\/\*\s*/, "")
    .replace(/^<!--\s*/, "")
    .replace(/^#\s*/, "")
    .replace(/\s*\*\/$/, "")
    .replace(/\s*-->$/, "")
    .slice(0, 90);
}

export default function CodeBlock({ code }: { code: string }) {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  const label = codeLabel(code);

  async function copy() {
    const ok = await copyText(code);
    setState(ok ? "ok" : "fail");
    window.setTimeout(() => setState("idle"), 1600);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-3 py-1.5">
        <span
          className="min-w-0 truncate font-mono text-[11px] text-slate-400"
          title={label}
        >
          {label}
        </span>
        <button
          type="button"
          onClick={copy}
          title="复制这段代码"
          aria-label="复制代码"
          className="shrink-0 cursor-pointer rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
        >
          {state === "ok" ? "已复制" : state === "fail" ? "复制失败" : "复制"}
        </button>
      </div>

      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** 复制文本：优先用剪贴板 API，非 https / 非 localhost 时退回到 execCommand */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* 继续尝试兜底方案 */
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}
