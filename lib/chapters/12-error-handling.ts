import type { Chapter } from "./types";

export const chapter12: Chapter = {
  num: 12,
  slug: "error-handling",
  title: "Handling Errors",
  titleZh: "错误处理",
  officialUrl: "https://nextjs.org/learn/dashboard-app/error-handling",
  summary:
    "用 `try/catch` 兜住数据库异常，用 `error.tsx` 做路由级兜底，用 `notFound()` + `not-found.tsx` 处理 404。",
  goals: [
    "会在 Server Action 里用 `try/catch` 并向上抛出友好错误",
    "知道 `redirect()` 为什么必须放在 `try/catch` 之外",
    "会用 `error.tsx` 给路由段做错误兜底，并理解 `reset()`",
    "会用 `notFound()` 与 `not-found.tsx` 处理「资源不存在」",
  ],
  points: [
    {
      title: "为什么必须处理错误",
      why: "数据库会挂、查询会超时、id 可能不存在 —— 不处理，用户看到的就是整页崩溃。",
      explain: [
        "上一章的 `sql` 调用没有任何保护。连接一旦失败，Server Action 抛出**未捕获异常**，用户看到错误页或空白。",
        "把错误分两类对待：",
        "- **异常（unexpected）**：意料之外的故障 → 捕获、记录、给「稍后再试」的兜底界面",
        "- **预期情况（expected）**：如「发票不存在」→ 这不是 bug，走正常业务分支（404 页面）",
        "本章分别处理：异常交给 `try/catch` + `error.tsx`；「没找到」交给 `notFound()` + `not-found.tsx`。",
      ],
      check: "能区分「异常」与「预期情况」，并说出各自适合的处理方式。",
    },
    {
      title: "用 try/catch 包住数据库操作",
      why: "把「可能失败的一段」圈出来，失败时给明确信息，而不是把原始错误抛给用户。",
      explain: [
        "在 `createInvoice`、`updateInvoice`、`deleteInvoice` 里把 `sql` 调用放进 `try`。捕获后做两件事：",
        "- `console.error(error)` 记录真实错误（给自己排查）",
        "- `throw new Error('Failed to create invoice.')` 抛**对用户友好**的错误",
        "为什么还要再 `throw`？这样上层 `error.tsx` 才能接到并渲染兜底界面 —— 错误不能「吞掉」，否则用户提交失败却没有任何反馈。",
      ],
      code:
        "// app/lib/actions.ts —— 在第 11 章那个版本上改：只动函数体，\n// 文件顶部的 'use server'、import、FormSchema / CreateInvoice 定义都不动\nexport async function createInvoice(formData: FormData) {\n  const { customerId, amount, status } = CreateInvoice.parse({ /* ... */ });\n  const amountInCents = Math.round(amount * 100);\n  const date = new Date().toISOString().split('T')[0];\n\n  try {\n    await sql`INSERT INTO invoices (customer_id, amount, status, date)\n      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;\n  } catch (error) {\n    console.error(error);\n    throw new Error('Failed to create invoice.');\n  }\n\n  revalidatePath('/dashboard/invoices');\n  redirect('/dashboard/invoices');\n}",
      check: "把连接串临时改错再提交一次，终端能看到原始错误，而不再是一整页崩掉。",
    },
    {
      title: "⚠️ redirect() 必须放在 try/catch 之外",
      why: "非常隐蔽、非常容易踩的坑。",
      explain: [
        "`redirect()` 的实现是**抛出一个特殊的内部错误**（类似 `NEXT_REDIRECT`），Next 在更外层捕获它、然后跳转。也就是：**它靠抛错来工作。**",
        "所以写在 `try` 里，紧跟着的 `catch` 会把这个「跳转信号」当异常抓到 —— 结果：数据写成功了，却不跳转，页面停在原地。",
        "正确做法：`try/catch` **只包住数据库操作**，`revalidatePath` 与 `redirect` 写在 `catch` 之后。",
      ],
      check: "能解释「为什么 redirect 放进 try 会导致跳转失效」，并检查自己的三个 Action 都写对位置。",
      pitfalls: [
        "报错信息里出现未被识别的 redirect 错误时，先检查是不是 `try/catch` 把它兜住了。",
      ],
    },
    {
      title: "用 error.tsx 做路由级兜底",
      why: "即使出问题，用户看到的也是「友好提示 + 再试按钮」，而不是崩溃页。",
      explain: [
        "在需要保护的路由段目录新建 `error.tsx`（课程建在 `app/dashboard/invoices/error.tsx`）。它必须是**客户端组件**（顶部 `'use client'`），因为要用交互与 `reset` 回调。",
        "接收两个 props：`error`（错误对象）与 `reset`（调用后尝试重新渲染这一段）。",
        "两个要知道的事实：",
        "- `error.tsx` 只在**生产模式**生效，开发环境 Next 会显示带堆栈的调试覆盖层（帮你排查，不是 bug）",
        "- 它**就近生效**，只保护所在段及子段，所以可以在不同层级放多个",
        "未捕获的异常也会被最近的 `error.tsx` 捕获 —— 它是「异常」的最终防线。",
      ],
      code:
        "// app/dashboard/invoices/error.tsx\n'use client';\n\nimport { useEffect } from 'react';\n\nexport default function Error({\n  error,\n  reset,\n}: {\n  error: Error & { digest?: string };\n  reset: () => void;\n}) {\n  useEffect(() => {\n    console.error(error);\n  }, [error]);\n\n  return (\n    <main className=\"flex h-full flex-col items-center justify-center\">\n      <h2 className=\"text-center\">Something went wrong!</h2>\n      <button\n        className=\"mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400\"\n        onClick={() => reset()}\n      >\n        Try again\n      </button>\n    </main>\n  );\n}",
      check: "开发模式看到调试覆盖层；用 `next build && next start` 跑生产模式时看到自己写的友好界面。",
      pitfalls: [
        "`error.tsx` 是客户端组件，不能直接用 `sql` 或任何服务端代码。",
        "开发环境看不到自己的 error 界面不要慌 —— Next 故意用调试覆盖层替代了。",
      ],
    },
    {
      title: "处理 404：notFound() + not-found.tsx",
      why: "「你要找的东西不存在」是正常业务分支，不该当系统异常。",
      explain: [
        "场景：`/dashboard/invoices/[id]/edit` 的 id 查不到，`fetchInvoiceById(id)` 返回空，页面直接渲染会崩。",
        "正确做法：`if (!invoice) { notFound(); }`（从 `next/navigation` 导入）。它中断当前渲染，去找**最近的** `not-found.tsx`。",
        "在 `app/dashboard/invoices/[id]/edit/` 下新建 `not-found.tsx`，返回 `<p>Invoice not found.</p>` 之类内容。",
        "优先级：**`notFound()` 高于 `error.tsx`** —— 调用 `notFound()` 时即使外层有 `error.tsx` 也走 404 分支。这是好事，「不存在」不是系统故障。",
      ],
      code:
        "// app/dashboard/invoices/[id]/edit/page.tsx —— 在第 11 章那个编辑页基础上加两处：\n// ① 顶部加 import  ② 在 await 取到 invoice 之后加这个判断\nimport { notFound } from 'next/navigation';\n\nconst invoice = await fetchInvoiceById(id);\nif (!invoice) {\n  notFound();\n}\n\n// app/dashboard/invoices/[id]/edit/not-found.tsx\nexport default function NotFound() {\n  return <p>Invoice not found.</p>;\n}",
      check: "访问不存在的发票 id（如 `/dashboard/invoices/99999/edit`），看到 `Invoice not found.` 而不是崩溃页。",
    },
  ],
  tips: [
    "口诀：**写库要 try/catch，跳转放出 try/catch，不存在就用 notFound()**。",
    "`error.tsx` 与 `not-found.tsx` 都「就近生效」，可按容错粒度放在不同层级。",
    "上线前用 `next build && next start` 体验一次生产模式，很多错误界面在开发模式看不到。",
  ],
};
