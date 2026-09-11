import type { Chapter } from "./types";

export const chapter11: Chapter = {
  num: 11,
  slug: "mutating-data",
  title: "Mutating Data",
  titleZh: "修改数据（Server Actions）",
  officialUrl: "https://nextjs.org/learn/dashboard-app/mutating-data",
  summary:
    "用 React Server Actions 完成发票的创建、编辑、删除，并理解 `revalidatePath`、`redirect` 与 `bind`。",
  goals: [
    "理解 Server Actions 是什么、为什么不需要手写 API 路由",
    "会用表单的 `action` 属性直接调用服务端函数",
    "会用 zod 校验 `FormData`",
    "会用 `revalidatePath` 刷新缓存、用 `redirect` 跳转",
    "会用 `.bind()` 把额外参数传给 Action",
  ],
  points: [
    {
      title: "Server Actions 是什么",
      why: "它把「表单提交」这件事的复杂度大幅降低，是 App Router 里最重要的数据写入方式。",
      explain: [
        "**Server Action** 是一个**在服务端执行、但能像普通函数一样从客户端调用**的异步函数。写法就是在一个文件顶部加 `'use server'`，然后导出 `async function`。",
        "为什么这样很省事？传统做法要：写一个 API 路由 → 前端 `fetch` 提交 → 手动处理 JSON 与错误。Server Action 让表单直接 `action={createInvoice}`，浏览器会把 `FormData` 交给服务端函数执行，**你不需要写任何 fetch、也不需要手写接口**。",
        "它还是**渐进增强**的：即使 JS 还没加载完或加载失败，表单也能提交（走浏览器原生提交路径）。Next.js 在编译时会为 Action 生成一个安全的引用标识，避免把服务端代码泄露给客户端。",
      ],
      check: "能说出「用 Server Action 相比手写 API 路由」省掉了哪几步，以及 `'use server'` 写在哪里。",
    },
    {
      title: "创建发票页面与表单",
      why: "先有界面才能有提交；同时认识「页面自己取数、再把数据传给表单」的模式。",
      explain: [
        "新建 `app/dashboard/invoices/create/page.tsx`：它是一个 `async` 服务端页面，用 `fetchCustomers()` 取出客户列表（下拉框的选项），渲染 `<Form customers={customers} />`。",
        "`<Form />` 在 `app/ui/invoices/create-form.tsx`，里面是一个 `<select name=\"customerId\">`（遍历 customers 生成 `<option>`）以及金额、状态、日期几个输入框。**注意每个输入框都有 `name`** —— 这个名字就是 `FormData` 里的键，服务端靠它取值。",
      ],
      code:
        "// app/dashboard/invoices/create/page.tsx\nimport Form from '@/app/ui/invoices/create-form';\nimport Breadcrumbs from '@/app/ui/invoices/breadcrumbs';\nimport { fetchCustomers } from '@/app/lib/data';\n\nexport default async function Page() {\n  const customers = await fetchCustomers();\n\n  return (\n    <main>\n      <Breadcrumbs /* ... */ />\n      <Form customers={customers} />\n    </main>\n  );\n}",
      check: "`/dashboard/invoices/create` 能打开，客户下拉框里有真实数据。",
      pitfalls: [
        "输入框漏写 `name`，服务端就取不到这个字段 —— 这是表单类 bug 的第一嫌疑人。",
      ],
    },
    {
      title: "写第一个 Server Action，并接到表单上",
      why: "这是本章的核心动作：把「提交表单」变成「调用一个服务端函数」。",
      explain: [
        "新建 `app/lib/actions.ts`，**第一行**写 `'use server';`，然后导出 `createInvoice(formData: FormData)`。",
        "在 `app/ui/invoices/create-form.tsx` 里 `import { createInvoice } from '@/app/lib/actions'`，并把表单改成 `<form action={createInvoice}>`（这个文件因此也可以加上 `'use client'`，课程就是这么做的）。",
        "先只写一句 `console.log(formData)` 跑一次也行：点提交按钮，你会在**终端**（不是浏览器控制台）看到打印的 FormData —— 这个现象本身就证明了「函数在服务端执行」。",
        "补充一个概念：`FormData` 从表单取出来的值**全是字符串**（包括金额、日期）。所以下一步必须先校验与转换，不能直接塞进数据库。",
      ],
      code:
        "// app/lib/actions.ts\n'use server';\n\nexport async function createInvoice(formData: FormData) {\n  console.log(formData);\n}\n\n// app/ui/invoices/create-form.tsx\n'use client';\n\nimport { createInvoice } from '@/app/lib/actions';\n\n<form action={createInvoice}>",
      check: "提交表单后，**终端**打印出 FormData；浏览器控制台没有输出（说明确实跑在服务端）。",
    },
    {
      title: "用 zod 校验并准备数据",
      why: "永远不要信任客户端传来的数据 —— 校验必须在服务端做，这是本章最该带走的工程习惯。",
      explain: [
        "课程用 `zod` 定义 schema：例如 `customerId` 必须是 `z.string().min(1, ...)`、`amount` 先 `z.coerce.number().gt(0)`、`status` 用 `z.enum(['pending', 'paid'])`、日期用字符串并校验格式。然后用 `schema.parse({...})` 把 FormData 里的值取出来、校验、得到类型正确的对象；校验失败会抛错（下一章会讲怎么优雅处理）。",
        "两个转换细节：**金额要转成分**（`Math.round(amount * 100)`），数据库里存整数分，避免浮点误差；**日期要转成 `YYYY-MM-DD`**，用 `new Date().toISOString().split('T')[0]`。",
        "课程还提到一个安全细节：把 `id`、`date` 这类由服务端决定的字段**不要**直接从表单取（比如表单里放一个隐藏的 `UUID`）。文档里的做法是**不用**表单传 id，而是用 `crypto.randomUUID()` 在服务端生成，或直接交给数据库默认值 —— 避免用户篡改。",
      ],
      code:
        "// app/lib/actions.ts\nimport { z } from 'zod';\nimport { revalidatePath } from 'next/cache';\nimport { redirect } from 'next/navigation';\nimport postgres from 'postgres';\n\nconst sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });\n\nconst FormSchema = z.object({\n  id: z.string(),\n  customerId: z.string({ invalid_type_error: 'Please select a customer.' }),\n  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),\n  status: z.enum(['pending', 'paid'], { invalid_type_error: 'Please select an invoice status.' }),\n  date: z.string(),\n});\n\nconst CreateInvoice = FormSchema.omit({ id: true, date: true });\n\nexport async function createInvoice(formData: FormData) {\n  const { customerId, amount, status } = CreateInvoice.parse({\n    customerId: formData.get('customerId'),\n    amount: formData.get('amount'),\n    status: formData.get('status'),\n  });\n  const amountInCents = Math.round(amount * 100);\n  const date = new Date().toISOString().split('T')[0];\n  // ……下一步写入数据库\n}",
      check: "提交一个金额为 0 或空的表单，服务端会抛出 zod 校验错误（终端可见）；填对了则顺利通过。",
      pitfalls: [
        "`zod` 直接读 `formData.get(...)` 得到的是 `string | File | null`，所以要用 `z.coerce.number()` 之类的转换。",
      ],
    },
    {
      title: "把数据写进数据库（INSERT）",
      why: "校验之后才是真正的写入，顺序不能颠倒。",
      explain: [
        "用 `sql` 执行 INSERT，字段名与数据库表一致。写法是模板字符串 + 参数插值：`sql`INSERT INTO invoices (customer_id, amount, status, date) VALUES (${customerId}, ${amountInCents}, ${status}, ${date})``。",
        "这种写法自带**参数化**：`postgres.js` 会把插值当作参数传给数据库，而不是拼进 SQL 字符串，因此天然避免 **SQL 注入**。永远不要用字符串拼接去拼 SQL。",
        "`sql` 只能在服务端用 —— 而 Server Action 正是服务端，所以在 `app/lib/actions.ts` 里直接建连接是安全的。",
      ],
      check: "提交表单后到数据库的 Data 标签里刷新，能看到新插入的那行记录。",
    },
    {
      title: "刷新缓存并跳转：revalidatePath + redirect",
      why: "写进数据库不等于界面会更新 —— 缓存与导航都需要你显式告诉 Next.js。",
      explain: [
        "**`revalidatePath('/dashboard/invoices')`**：告诉 Next.js「这个路径的缓存数据作废了，下次访问重新取」。少了这一步，你回到列表页可能仍看到旧数据，然后开始怀疑人生。",
        "**`redirect('/dashboard/invoices')`**：写完数据跳回列表页。它是从 `next/navigation` 导入的函数，只能用在服务端组件或 Server Action 里。",
        "⚠️ 一个非常重要的细节（第 12 章会再讲）：`redirect()` 内部是**通过抛出一个特殊错误**来实现跳转的，所以它**必须放在 `try/catch` 之外** —— 否则会被你的 `catch` 吞掉，用户提交成功却停在原地。",
      ],
      code:
        "// app/lib/actions.ts（createInvoice 结尾）\nawait sql`INSERT INTO invoices (customer_id, amount, status, date)\n  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;\n\nrevalidatePath('/dashboard/invoices');\nredirect('/dashboard/invoices');",
      check: "提交成功后自动跳回发票列表，并且列表里**立刻**能看到新发票。",
    },
    {
      title: "编辑发票：动态路由取 id，用 .bind() 传参",
      why: "更新操作要知道「改哪一条」，这就涉及 Server Action 传参的写法坑。",
      explain: [
        "新建 `app/dashboard/invoices/[id]/edit/page.tsx`：从 `params` 里取 `id`（在 Next.js 16 里 `params` 也是 Promise，需要 `await`），然后**并行**取数据：`const [invoice, customers] = await Promise.all([fetchInvoiceById(id), fetchCustomers()])`，再用 `<Form invoice={invoice} customers={customers} />` 渲染。",
        "服务端写 `updateInvoice(id: string, formData: FormData)`。客户端**不能**写成 `action={updateInvoice(invoice.id)}` —— 那样会在渲染时就调用函数。正确写法是用 **`.bind()`** 创建一个「预填了第一个参数」的新函数：`const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);` 然后 `action={updateInvoiceWithId}`。",
        "`.bind(null, id)` 里的 `null` 是 `this`（这里用不到）。另一种等价方案是在表单里放 `<input type=\"hidden\" name=\"id\" value={invoice.id} />`，再从 `formData.get('id')` 取 —— 课程都提到了，`bind` 更干净、也更不容易被篡改。",
      ],
      code:
        "// app/dashboard/invoices/[id]/edit/page.tsx\nimport { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';\n\nexport default async function Page(props: { params: Promise<{ id: string }> }) {\n  const params = await props.params;\n  const id = params.id;\n  const [invoice, customers] = await Promise.all([\n    fetchInvoiceById(id),\n    fetchCustomers(),\n  ]);\n  // ……\n  <Form invoice={invoice} customers={customers} />\n}\n\n// app/ui/invoices/edit-form.tsx\nconst updateInvoiceWithId = updateInvoice.bind(null, invoice.id);\n<form action={updateInvoiceWithId}>",
      check: "打开某张发票的编辑页，改动金额保存后，列表页显示的是新值。",
      pitfalls: [
        "写成 `action={updateInvoice(invoice.id)}` 会在渲染时立刻执行函数，表单提交反而失败。",
        "`params` / `searchParams` 在 Next.js 16 中都是 Promise，忘记 `await` 会拿到 Promise 对象。",
      ],
    },
    {
      title: "删除发票：表单包裹 + 确认删除",
      why: "删除是最需要小心、也最需要无障碍处理的写操作。",
      explain: [
        "把删除按钮包进一个表单里：`<form action={deleteInvoiceWithId}>`，按钮用 `<button className=\"rounded-md border p-2 hover:bg-gray-100\">`。Action 里执行 `DELETE FROM invoices WHERE id = ${id}`，然后 `revalidatePath('/dashboard/invoices')`。",
        "用 `<form>` 包按钮，是为了**在 JS 未就绪时也能删**（渐进增强），同时也不需要给按钮写 `onClick`。",
        "无障碍细节：只放一个垃圾桶图标，屏幕阅读器只知道「按钮」。课程用 `sr-only` 的隐藏文字让按钮有可读名称，或者用 `aria-label`。第 13 章会把无障碍系统讲一遍，这里先养成习惯。",
      ],
      code:
        "// app/ui/invoices/buttons.tsx\nconst deleteInvoiceWithId = deleteInvoice.bind(null, id);\n\n<form action={deleteInvoiceWithId}>\n  <button className=\"rounded-md border p-2 hover:bg-gray-100\">\n    <span className=\"sr-only\">Delete</span>\n    <TrashIcon className=\"w-5\" />\n  </button>\n</form>\n\n// app/lib/actions.ts\nexport async function deleteInvoice(id: string) {\n  await sql`DELETE FROM invoices WHERE id = ${id}`;\n  revalidatePath('/dashboard/invoices');\n}",
      check: "点击删除后该行从列表消失；刷新页面后仍然不在（说明真的写进数据库了）。",
    },
  ],
  tips: [
    "写入类操作的模式固定为四步：**校验（zod）→ 写库 → revalidatePath → redirect**。把这条链路记牢，后面写任何表单都快。",
    "Server Action 必须在服务端运行，所以不要把它 import 到纯客户端逻辑里当普通函数用；它只能由表单 `action`、`formAction` 或事件处理器调用。",
    "课程演示的删除没有二次确认；真实项目通常要加确认弹窗或软删除，可以自己试着加上。",
  ],
};
