import { Fragment } from "react";

/**
 * 把文本里用 `反引号` 包住的部分渲染成行内代码。
 * 这样章节数据里就可以直接写 `page.tsx` 这类标记，而不必拆成 JSX。
 */
export default function InlineText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-slate-800"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
