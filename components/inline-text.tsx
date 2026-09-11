import { Fragment } from "react";
import FileChip from "@/components/file-chip";
import { looksLikeFilePath } from "@/lib/editor-links";

/**
 * 把讲解文本里的**轻量标记**渲染成 HTML（只支持讲解里真正用到的两种）：
 *
 * - `` `反引号` `` → 行内代码；如果里面看起来是**项目内的文件路径**（如 `app/lib/definitions.ts`），
 *   就渲染成可点击的 FileChip —— 点一下在编辑器里打开（编辑器由服务端自动识别）；
 * - `**双星号**` → 加粗，用来强调关键词。
 */
export default function InlineText({ text }: { text: string }) {
  // 加粗用「非贪婪」匹配，这样 `**…aria-*…**` 这种带单个星号的内容也能正确闭合
  const parts = text.split(/(`[^`]+`|\*\*[\s\S]+?\*\*)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;

        // **加粗**（内容里若还有反引号，交给递归处理）
        if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-slate-800">
              <InlineText text={part.slice(2, -2)} />
            </strong>
          );
        }

        // `行内代码` / 可点击文件路径
        if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
          const inner = part.slice(1, -1);

          if (looksLikeFilePath(inner)) {
            return <FileChip key={i} path={inner} />;
          }

          return (
            <code
              key={i}
              className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-slate-800"
            >
              {inner}
            </code>
          );
        }

        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
