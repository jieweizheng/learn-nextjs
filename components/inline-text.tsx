import { Fragment } from "react";
import FileChip from "@/components/file-chip";
import { looksLikeFilePath } from "@/lib/editor-links";

/**
 * 把文本里用 `反引号` 包住的部分渲染成行内代码。
 * 这样章节数据里就可以直接写 `page.tsx` 这类标记，而不必拆成 JSX。
 *
 * 如果反引号里的内容**看起来是项目内的文件路径**（如 `app/lib/definitions.ts`），
 * 就渲染成可点击的 FileChip —— 点一下在编辑器里打开（编辑器由服务端自动识别）。
 */
export default function InlineText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);

  return (
    <>
      {parts.map((part, i) => {
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
