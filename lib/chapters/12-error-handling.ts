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
      why: "数据库会挂、查询会超时、id 可能不存在 —— 不处理，用户看到的就是一整页崩溃。",
      explain: [
        "在上一章的代码里，`sql` 调用没有任何保护。一旦数据库连接失败（网络抖动、连接串写错、配额用尽），Server Action 会直接抛出一个**未捕获异常**，用户看到的是错误页或空白，完全不知道发生了什么。",
        "建议把错误分成两类对待：**异常（unexpected）** —— 意料之外的故障，应该被捕获、记录、并给用户一个「稍后再试」的兜底界面；**预期情况（expected）** —— 比如「发票不存在」「搜索没结果」，这不是 bug，应该走正常的业务分支（例如 404 页面）。",
        "本章分别处理这两类：异常交给 `try/catch` + `error.tsx`；「没找到」交给 `notFound()` + `not-found.tsx`。",
      ],
      check: "能区分「异常」与「预期情况」，并说出它们各自适合的处理方式。",
    },
    {
      title: "用 try/catch 包住数据库操作",
      why: "把「可能失败的一段」圈出来，失败时给出明确信息，而不是把原始错误抛给用户。",
      explain: [
        "在 `createInvoice`、`updateInvoice`、`deleteInvoice` 里，把 `sql` 调用放进 `try` 块。捕获后做两件事：`console.error(error)` 记录真实错误（给你自己排查用），然后 `throw new Error('Failed to create invoice.')` 抛出一个**对用户友好**的错误（给用户看）。",
        "为什么还要再 `throw`？因为这样上层的 `error.tsx` 才能接到它并渲染兜底界面 —— 错误不能「吞掉」，否则用户提交失败却什么反馈都没有。",
        "真实项目里你还会想区分错误类型（比如唯一键冲突、权限不足），但课程这个模式先把「不让页面崩」这件事做好。",
      ],
      code:
        "// app/lib/actions.ts\nexport async function createInvoice(formData: FormData) {\n  const { customerId, amount, status } = CreateInvoice.parse({ /* ... */ });\n  const amountInCents = Math.round(amount * 100);\n  const date = new Date().toISOString().split('T')[0];\n\n  try {\n    await sql`INSERT INTO invoices (customer_id, amount, status, date)\n      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;\n  } catch (error) {\n    console.error(error);\n    throw new Error('Failed to create invoice.');\n  }\n\n  revalidatePath('/dashboard/invoices');\n  redirect('/dashboard/invoices');\n}",
      check: "把连接串临时改错再提交一次，终端能看到原始错误，而不再是一整页崩掉。",
    },
    {
      title: "⚠️ redirect() 必须放在 try/catch 之外",
      why: "这是一个非常隐蔽、非常容易踩的坑，理解机制才能记住。",
      explain: [
        "`redirect()` 的实现方式是**抛出一个特殊的内部错误**（类似 `NEXT_REDIRECT`），Next.js 在更外层捕获它、然后发起跳转。也就是说：**它靠抛错来工作。**",
        "因此，如果它写在 `try` 块里，你紧接着的 `catch (error)` 会把这个「跳转信号」当成异常抓到 —— 结果是：数据写成功了，用户却没有任何跳转，页面停在原地，你还以为程序是对的。",
        "正确做法：`try/catch` **只包住数据库操作**，`revalidatePath` 与 `redirect` 都写在 `catch` 之后（`try/catch` 外面）。这个坑在社区里出现的频率非常高，值得单独记一条。",
      ],
      check: "能解释「为什么把 redirect 放进 try 里会导致跳转失效」，并检查自己的三个 Action 都写对了位置。",
      pitfalls: [
        "报错信息里出现奇怪的东西（比如未被识别的 redirect 错误）时，先检查是不是 `try/catch` 把它兜住了。",
      ],
    },
    {
      title: "用 error.tsx 做路由级兜底",
      why: "这样即使出问题，用户看到的也是「一条友好的提示 + 一个再试按钮」，而不是崩溃页。",
      explain: [
        "在需要保护的路由段目录下新建 `error.tsx`（课程建在 `app/dashboard/invoices/`）。它必须是一个**客户端组件**（文件顶部 `'use client'`），因为要用到交互（按钮点击）与 `reset` 回调。",
        "它接收两个 props：`error`（错误对象）与 `reset`（一个函数，调用后尝试重新渲染这一段）。课程用它渲染成一个卡片 `<div className=\"flex w-full flex-col ...\">`，里面显示标题、一句提示与一个 `<button onClick={() => reset()}>Try again</button>`。",
        "两个需要知道的事实：一是 `error.tsx` 只在**生产模式**下生效 —— 开发环境里 Next.js 会显示带堆栈的调试覆盖层（那是为了帮你排查，不是 bug）；二是它是**就近生效**的，`error.tsx` 只保护它所在段及其子段，所以你可以在不同层级放多个。",
        "另外，未捕获的异常也会被最近的 `error.tsx` 捕获 —— 所以它是「异常」的最终防线。",
      ],
      code:
        "// app/dashboard/invoices/error.tsx\n'use client';\n\nimport { useEffect } from 'react';\n\nexport default function Error({\n  error,\n  reset,\n}: {\n  error: Error & { digest?: string };\n  reset: () => void;\n}) {\n  useEffect(() => {\n    console.error(error);\n  }, [error]);\n\n  return (\n    <main className=\"flex h-full flex-col items-center justify-center\">\n      <h2 className=\"text-center\">Something went wrong!</h2>\n      <button\n        className=\"mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400\"\n        onClick={() => reset()}\n      >\n        Try again\n      </button>\n    </main>\n  );\n}",
      check: "在开发模式下你能看到调试覆盖层；用 `next build && next start` 跑生产模式时，看到的是你写的这个友好界面。",
      pitfalls: [
        "`error.tsx` 是客户端组件，不能在里面直接用 `sql` 或任何服务端代码。",
        "开发环境看不到自己的 error 界面时不要慌 —— 那是 Next.js 故意用调试覆盖层替代的。",
      ],
    },
    {
      title: "处理 404：notFound() + not-found.tsx",
      why: "「你要找的东西不存在」是正常业务分支，不该当成系统异常。",
      explain: [
        "场景：`/dashboard/invoices/[id]/edit` 的 id 在数据库里查不到。此时 `fetchInvoiceById(id)` 返回空数组，页面若直接渲染会崩。",
        "正确做法是在页面里判断：`if (!invoice) { notFound(); }`，从 `next/navigation` 导入 `notFound`。它会中断当前渲染，并去找**最近的** `not-found.tsx` 来显示。",
        "在 `app/dashboard/invoices/[id]/edit/` 目录下新建 `not-found.tsx`，返回一段简单内容，例如 `<p>Invoice not found.</p>`（课程也提到它可以渲染得更讲究些）。",
        "优先级要记住：**`notFound()` 的优先级高于 `error.tsx`**。也就是说，调用了 `notFound()` 时，即使外层有 `error.tsx`，也会走 404 分支 —— 这是好事，因为「不存在」不是系统故障。",
      ],
      code:
        "// app/dashboard/invoices/[id]/edit/page.tsx\nimport { notFound } from 'next/navigation';\n\nconst invoice = await fetchInvoiceById(id);\nif (!invoice) {\n  notFound();\n}\n\n// app/dashboard/invoices/[id]/edit/not-found.tsx\nexport default function NotFound() {\n  return <p>Invoice not found.</p>;\n}",
      check: "访问一个不存在的发票 id（例如 `/dashboard/invoices/99999/edit`），看到的是 `Invoice not found.` 而不是崩溃页。",
    },
  ],
  tips: [
    "记忆口诀：**写库要 try/catch，跳转放出 try/catch，不存在就用 notFound()**。",
    "`error.tsx` 与 `not-found.tsx` 都是「就近生效」且可以放在不同层级，按你的容错粒度放置即可。",
    "上线前记得用 `next build && next start` 体验一次生产模式，很多错误界面在开发模式下看不到。",
  ],
};
