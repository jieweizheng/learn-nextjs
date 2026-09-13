# 第 11 章 · 修改数据（Server Actions）

> 英文标题：Mutating Data
> 官方文档：https://nextjs.org/learn/dashboard-app/mutating-data
> 本章目录：`chapters/11-mutating-data/`
> 📚 **知识点与详细讲解**：`lib/chapters/11-mutating-data.ts`（章节页 `/chapters/mutating-data` 渲染的就是它，每项都可勾选）。
> 引导用户时请按该文件里的知识点**逐条展开讲解**（含示例代码、自检标准、常见坑），**不要只说「去看官方文档」** —— 见 `AGENTS.md` 规则 3、4。

用 React **Server Actions** 创建、更新、删除发票，并用 `revalidatePath` 刷新缓存。

## 🎯 学习目标

- 理解 Server Actions 与 `'use server'`
- 表单提交直接调用 Server Action
- 用 `zod` 校验 `FormData`
- 用 `revalidatePath` 失效缓存并 `redirect`
- 用 `bind` 把 `id` 传给 Action

## 📋 步骤清单

### 1. 创建路由与表单

新建 `app/dashboard/invoices/create/page.tsx`，取 `customers` 并渲染 `<Form customers={customers} />`。

### 2. 创建 Server Action

新建 `app/lib/actions.ts`，**顶部**加 `'use server'`：

```ts
'use server';

export async function createInvoice(formData: FormData) {}
```

表单改为 `<form action={createInvoice}>`。

### 3. 校验并准备数据

先安装 zod（**钉 v3**，与课程一致）：`npm install zod@3`。Zod 4 移除了 `invalid_type_error`，课程代码会编译报错。

用 zod schema 解析表单字段；金额转成分（`amount * 100`），生成 `YYYY-MM-DD` 日期：

```ts
const amountInCents = amount * 100;
const date = new Date().toISOString().split('T')[0];
```

### 4. 写入数据库

用 `sql` 执行 `INSERT`，把新发票写入数据库。

### 5. 刷新并跳转

```ts
revalidatePath('/dashboard/invoices');
redirect('/dashboard/invoices');
```

提交后应跳回列表，并在顶部看到新发票。

### 6. 编辑发票

新建 `app/dashboard/invoices/[id]/edit/page.tsx`：用 `params` 取 `id`（要 `await`），`Promise.all` 并行取 `fetchInvoiceById(id)` 与 `fetchCustomers()`，渲染 `<Breadcrumbs>` + `<Form invoice customers>`。
在 `app/lib/actions.ts` 里加 `updateInvoice(id, formData)`（解析 → `UPDATE` → `revalidatePath` → `redirect`）。
把 `app/ui/invoices/buttons.tsx` 里 `UpdateInvoice` 的 `href` 改成 `/dashboard/invoices/${id}/edit`（starter 是占位链接，否则点铅笔进不了编辑页）。
用 `bind` 把 `id` 传给 Action，而不是直接传参：

```tsx
const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);
// <form action={updateInvoiceWithId}>
```

### 7. 删除发票

把删除按钮包在 `<form action={deleteInvoiceWithId}>` 里，用 `bind` 传 `id`；Action 内执行 `DELETE` 并 `revalidatePath('/dashboard/invoices')`（因为当前就在该路由，无需 `redirect`）。

## 💡 提示 / 易错点

- 不能写成 `updateInvoice(id)` 传参，必须用 `.bind(null, id)`，或用隐藏 `input`。
- 金额用**分**存储，避免浮点误差。
- 用 UUID 而非自增主键可降低被枚举的风险。
- zod 要装 **v3**（`npm install zod@3`）：v4 删掉了 `invalid_type_error` / `required_error`（统一成 `error`），课程代码是 v3 写法。

## ✅ 完成标准

- [ ] 能创建新发票，提交后跳回列表并看到它
- [ ] 编辑页表单是预填的，保存后数据更新
- [ ] 能删除发票，列表自动刷新

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 让 Agent 解释「Server Action 和普通 API 路由相比省了什么」。
