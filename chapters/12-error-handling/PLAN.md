# 第 12 章 · 错误处理

> 英文标题：Handling Errors
> 官方文档：https://nextjs.org/learn/dashboard-app/error-handling
> 本章目录：`chapters/12-error-handling/`
> 📚 **知识点与详细讲解**：`lib/chapters/12-error-handling.ts`（章节页 `/chapters/error-handling` 渲染的就是它，每项都可勾选）。
> 引导用户时请按该文件里的知识点**逐条展开讲解**（含示例代码、自检标准、常见坑），**不要只说「去看官方文档」** —— 见 `AGENTS.md` 规则 3、4。

用 `try/catch`、`error.tsx` 与 `notFound` 优雅地处理错误与 404。

## 🎯 学习目标

- 在 Server Action 里使用 `try/catch`
- 用 `error.tsx` 做路由段的错误兜底
- 用 `notFound` + `not-found.tsx` 处理 404

## 📋 步骤清单

### 1. 给 Action 加 try/catch

把数据库操作放进 `try`，失败时返回友好错误信息。
**注意**：`redirect()` 要放在 `try/catch` **之外**——它靠抛错来工作，否则会被 `catch` 吃掉。

```ts
try {
  await sql`INSERT INTO ...`;
} catch (error) {
  return { message: 'Database Error: Failed to Create Invoice.' };
}
revalidatePath('/dashboard/invoices');
redirect('/dashboard/invoices');
```

### 2. 用 error.tsx 兜底

新建 `app/dashboard/invoices/error.tsx`（**必须是客户端组件**），接收 `error` 与 `reset`：

```tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">Something went wrong!</h2>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-400"
        onClick={() => reset()}
      >
        Try again
      </button>
    </main>
  );
}
```

可以在 `deleteInvoice` 里临时 `throw new Error(...)` 来测试，**测完记得删掉**。

### 3. 处理 404

在 `app/dashboard/invoices/[id]/edit/page.tsx` 里，当 `invoice` 不存在时调用 `notFound()`：

```ts
if (!invoice) {
  notFound();
}
```

再新建 `app/dashboard/invoices/[id]/edit/not-found.tsx` 显示 404 UI 与「返回」链接。

## 💡 提示 / 易错点

- `notFound` 的优先级**高于** `error.tsx`，用于更精确的「资源不存在」场景。
- 访问一个「**格式合法但库里不存在**的 UUID」（如 `00000000-0000-0000-0000-000000000000`）才能看到 404 页面；用 `99999` 这种非 UUID 会因 SQL 报错、被 catch 成异常，从而走到 `error.tsx`。
- `error.tsx` **开发和生产都生效**（`npm run dev` 下就能看到，不必非等 `build`）；开发/生产的差别在**错误信息**：生产环境服务端错误被脱敏、只剩 `error.digest`。真正「仅生产」的是根级 `global-error.tsx`（dev 被调试覆盖层替代）。

## ✅ 完成标准

- [ ] Server Action 里错误被优雅捕获，不会整页崩掉
- [ ] `error.tsx` 生效（可临时 throw 测试）
- [ ] 不存在的发票 id 会显示 `not-found.tsx`

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 让 Agent 解释「为什么 redirect 必须放在 try/catch 外面」。
