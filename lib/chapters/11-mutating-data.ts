import type { Chapter } from "./types";

export const chapter11: Chapter = {
  num: 11,
  slug: "mutating-data",
  title: "Mutating Data",
  titleZh: "写入数据",
  officialUrl: "https://nextjs.org/learn/dashboard-app/mutating-data",
  summary:
    "用 Server Actions 完成发票的创建、编辑与删除：校验 → 写库 → revalidatePath → redirect。",
  goals: [
    "理解 Server Actions 是什么、为什么能省掉 API 层",
    "会用 zod 做服务端校验",
    "会写库并刷新缓存、跳转",
    "会用 `.bind()` 把额外参数传给 Action",
  ],
  points: [
    {
      title: "Server Actions 是什么",
      why: "它大幅降低了「表单提交」的复杂度，是 App Router 最重要的数据写入方式。",
      explain: [
        "**Server Action** 是**在服务端执行、但能像普通函数一样从客户端调用**的异步函数。写法：文件顶部加 `'use server'`，导出 `async function`。",
        "⚠️ **为什么非要 `'use server'` 这一行？** 因为**函数本体无法跨过服务端/客户端边界**：两端是两个进程，唯一通道是网络，而网络上只能传「能变成字节再还原」的数据（字符串、数字、纯对象、数组……）。**函数没有这种数据表示** —— `JSON.stringify(() => {})` 得到的是 `undefined`；它还带着**闭包与模块引用**，那些东西在另一端根本不存在。所以编译器换个办法：**函数留在服务端**，只给它一个 id，客户端拿到的是「按这个 id 发请求」的桩函数。`'use server'` 就是**显式声明**「这个函数允许这样被引用」—— 没有它，编译器不会替你生成 id 与端点（所以你把普通函数塞进 `action={...}` 时 React 会直接报错）。",
        "传统做法要：写 API 路由 → 前端 `fetch` → 手动处理 JSON 与错误。Server Action 让表单直接 `action={createInvoice}`，浏览器把 `FormData` 交给服务端函数执行，**不用写任何 fetch、不用手写接口**。",
        "它还是**渐进增强**的：JS 没加载完或失败时表单也能提交。Next 编译时会为 Action 生成安全引用标识，不会把服务端代码泄露给客户端。",
      ],
      check: "能说出「用 Server Action 相比手写 API 路由」省掉哪几步，以及 `'use server'` 写在哪。",
    },
    {
      title: "创建发票页面与表单",
      why: "先有界面才能有提交。",
      explain: [
        "新建 `app/dashboard/invoices/create/page.tsx`：`async` 服务端页面，用 `fetchCustomers()` 取客户列表，渲染 `<Form customers={customers} />`。",
        "页面顶部的 `<Breadcrumbs />` 要传一个 `breadcrumbs` 数组，每项形如 `{ label, href, active? }`，用来显示「Invoices / Create Invoice」面包屑导航。",
        "`<Form />` 在 `app/ui/invoices/create-form.tsx`：`<select name=\"customerId\">` + 金额、状态、日期输入框。**每个输入框都要有 `name`** —— 它就是 `FormData` 里的键，服务端靠它取值。",
      ],
      code:
        "// app/dashboard/invoices/create/page.tsx\nimport Form from '@/app/ui/invoices/create-form';\nimport Breadcrumbs from '@/app/ui/invoices/breadcrumbs';\nimport { fetchCustomers } from '@/app/lib/data';\n\nexport default async function Page() {\n  const customers = await fetchCustomers();\n\n  return (\n    <main>\n      <Breadcrumbs\n        breadcrumbs={[\n          { label: 'Invoices', href: '/dashboard/invoices' },\n          {\n            label: 'Create Invoice',\n            href: '/dashboard/invoices/create',\n            active: true,\n          },\n        ]}\n      />\n      <Form customers={customers} />\n    </main>\n  );\n}",
      check: "`/dashboard/invoices/create` 能打开，客户下拉框里有真实数据。",
      pitfalls: [
        "输入框漏写 `name`，服务端就取不到该字段 —— 表单类 bug 的第一嫌疑人。",
      ],
    },
    {
      title: "写第一个 Server Action，并接到表单上",
      why: "把「提交表单」变成「调用一个服务端函数」。",
      explain: [
        "新建 `app/lib/actions.ts`，**第一行**写 `'use server';`，导出 `createInvoice(formData: FormData)`。",
        "在 `app/ui/invoices/create-form.tsx` 里 `import { createInvoice } from '@/app/lib/actions'`，把表单改成 `<form action={createInvoice}>`。",
        "先只写 `console.log(formData)` 跑一次：点提交，你会在**终端**（不是浏览器控制台）看到 FormData —— 这本身就证明了函数在服务端执行。",
        "补充概念：`FormData` 取出的值**全是字符串**（含金额、日期），所以下一步必须先校验与转换。",
      ],
      code:
        "// app/lib/actions.ts\n'use server';\n\nexport async function createInvoice(formData: FormData) {\n  console.log(formData);\n}\n\n// app/ui/invoices/create-form.tsx\n'use client';\n\nimport { createInvoice } from '@/app/lib/actions';\n\n<form action={createInvoice}>",
      check: "提交表单后**终端**打印出 FormData；浏览器控制台没有输出。",
    },
    {
      title: "用 zod 校验并准备数据",
      why: "永远不要信任客户端传来的数据 —— 校验必须在服务端做。",
      explain: [
        "先安装 zod：`npm install zod@3`。**务必钉在 v3** —— 课程用的是 Zod 3 语法；若直接 `npm install zod`（会装到 v4），`invalid_type_error` 已被移除、编译会报类型错误。",
        "用 zod 定义 schema：`customerId` 用 `z.string()`、`amount` 用 `z.coerce.number().gt(0)`、`status` 用 `z.enum(['pending', 'paid'])`，然后 `schema.parse({...})` 取出校验后的值；失败会抛错（第 12 章讲怎么优雅处理）。",
        "两个转换细节：",
        "- **金额转成分**（`Math.round(amount * 100)`），库里存整数分，避免浮点误差",
        "- **日期转 `YYYY-MM-DD`**：`new Date().toISOString().split('T')[0]`",
        "安全细节：`id`、`date` 这类由服务端决定的字段**不要**从表单取。文档的做法是不用表单传 id，而在服务端生成或用数据库默认值 —— 避免用户篡改。",
      ],
      code:
        "// app/lib/actions.ts —— 在上一步那个文件里继续加（'use server' 那行保留在最顶部）\n'use server';\n\nimport { z } from 'zod';\nimport { revalidatePath } from 'next/cache';\nimport { redirect } from 'next/navigation';\nimport postgres from 'postgres';\n\nconst sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });\n\nconst FormSchema = z.object({\n  id: z.string(),\n  customerId: z.string({ invalid_type_error: 'Please select a customer.' }),\n  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),\n  status: z.enum(['pending', 'paid'], { invalid_type_error: 'Please select an invoice status.' }),\n  date: z.string(),\n});\n\nconst CreateInvoice = FormSchema.omit({ id: true, date: true });\n\nexport async function createInvoice(formData: FormData) {\n  const { customerId, amount, status } = CreateInvoice.parse({\n    customerId: formData.get('customerId'),\n    amount: formData.get('amount'),\n    status: formData.get('status'),\n  });\n  const amountInCents = Math.round(amount * 100);\n  const date = new Date().toISOString().split('T')[0];\n  // 下一步在这里执行 INSERT\n}",
      check: "提交金额为 0 或空的表单，服务端抛出 zod 校验错误（终端可见）；填对则通过。",
      pitfalls: [
        "`formData.get(...)` 得到 `string | File | null`，所以要用 `z.coerce.number()` 之类转换。",
        "Zod 版本别装错：v4 删掉了 `invalid_type_error` / `required_error`（统一成 `error`），而课程代码是 v3 写法 —— 装 `zod@3` 最省事。",
      ],
    },
    {
      title: "把数据写进数据库（INSERT）",
      why: "校验之后才是真正的写入，顺序不能颠倒。",
      explain: [
        "用模板字符串 + 参数插值执行 INSERT：`sql`INSERT INTO invoices (...) VALUES (${customerId}, ...)``。",
        "这种写法自带**参数化**：`postgres.js` 把插值当参数传给数据库，而不是拼进 SQL 字符串，因此天然避免 **SQL 注入**。永远不要字符串拼接 SQL。",
        "`sql` 只能在服务端用 —— Server Action 正是服务端，所以在 `app/lib/actions.ts` 里建连接是安全的。",
      ],
      code:
        "// app/lib/actions.ts（接在上一步之后）\nawait sql`INSERT INTO invoices (customer_id, amount, status, date)\n  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;",
      check: "提交后到数据库 Data 标签刷新，能看到新插入的那行记录。",
    },
    {
      title: "刷新缓存并跳转：revalidatePath + redirect",
      why: "写进数据库不等于界面会更新 —— 缓存与导航都要显式告诉 Next。",
      explain: [
        "**`revalidatePath('/dashboard/invoices')`**：告诉 Next「这个路径的缓存作废，下次访问重新取」。少这步，回到列表页可能仍是旧数据。",
        "**`redirect('/dashboard/invoices')`**：写完跳回列表页，只能用在服务端组件或 Server Action 里。",
        "⚠️ `redirect()` 内部是**通过抛出特殊错误**实现跳转的，所以**必须放在 `try/catch` 之外** —— 否则被 `catch` 吞掉，提交成功却停在原地。",
      ],
      code:
        "// app/lib/actions.ts（createInvoice 结尾）\nawait sql`INSERT INTO invoices (customer_id, amount, status, date)\n  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;\n\nrevalidatePath('/dashboard/invoices');\nredirect('/dashboard/invoices');",
      check: "提交成功后自动跳回发票列表，且列表里**立刻**能看到新发票。",
    },
    {
      title: "编辑发票：动态路由取 id，用 .bind() 传参",
      why: "更新要知道「改哪一条」，涉及 Server Action 传参的写法坑。",
      explain: [
        "新建 `app/dashboard/invoices/[id]/edit/page.tsx`：从 `params` 取 `id`（Next.js 16 里 `params` 是 Promise，要 `await`），**并行**取数 `const [invoice, customers] = await Promise.all([fetchInvoiceById(id), fetchCustomers()])`，再用 `<Breadcrumbs>`（这次是「Invoices / Edit Invoice」）与 `<Form invoice={invoice} customers={customers} />` 渲染。",
        "服务端在 `app/lib/actions.ts` 里加 `updateInvoice(id, formData)`：解析表单 → `UPDATE` 写库 → `revalidatePath` + `redirect`（与 `createInvoice` 同一套路，只多一个 `id` 参数）。",
        "还要接上入口：列表里每行的**编辑铅笔**来自 `app/ui/invoices/buttons.tsx` 的 `UpdateInvoice`，要把它的 `href` 指向编辑页 —— `/dashboard/invoices/${id}/edit`。starter 里是占位链接（指向列表页自身），不改的话点铅笔不会进编辑页。",
        "接 Action 有个坑：客户端**不能**写 `action={updateInvoice(invoice.id)}`（会在渲染时立刻调用）。正确写法用 **`.bind()`** 预填第一个参数：`const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);`，再把 `<form>` 的 action 设成它。",
        "另一种等价方案是隐藏域 `<input type=\"hidden\" name=\"id\" value={invoice.id} />` 再从 `formData.get('id')` 取。课程都提了，`bind` 更干净。",
      ],
      code:
        "// ① app/dashboard/invoices/[id]/edit/page.tsx —— 新建这个文件，完整代码\nimport Form from '@/app/ui/invoices/edit-form';\nimport Breadcrumbs from '@/app/ui/invoices/breadcrumbs';\nimport { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';\n\nexport default async function Page(props: { params: Promise<{ id: string }> }) {\n  const params = await props.params;\n  const id = params.id;\n  const [invoice, customers] = await Promise.all([\n    fetchInvoiceById(id),\n    fetchCustomers(),\n  ]);\n\n  return (\n    <main>\n      <Breadcrumbs\n        breadcrumbs={[\n          { label: 'Invoices', href: '/dashboard/invoices' },\n          {\n            label: 'Edit Invoice',\n            href: `/dashboard/invoices/${id}/edit`,\n            active: true,\n          },\n        ]}\n      />\n      <Form invoice={invoice} customers={customers} />\n    </main>\n  );\n}\n\n// ② app/ui/invoices/edit-form.tsx —— 改已有文件，只动三处\n// 改动 1：顶部导入\nimport { updateInvoice } from '@/app/lib/actions';\n\n// 改动 2：组件体内、return 之前加这一行（.bind 把 id 预填成第一个参数）\nconst updateInvoiceWithId = updateInvoice.bind(null, invoice.id);\n\n// 改动 3：把原来的 <form> 换成带 action 的形式\n<form action={updateInvoiceWithId}>\n\n// ③ app/lib/actions.ts —— 在 createInvoice 后面继续加这个函数\nconst UpdateInvoice = FormSchema.omit({ id: true, date: true });\n\nexport async function updateInvoice(id: string, formData: FormData) {\n  const { customerId, amount, status } = UpdateInvoice.parse({\n    customerId: formData.get('customerId'),\n    amount: formData.get('amount'),\n    status: formData.get('status'),\n  });\n  const amountInCents = Math.round(amount * 100);\n\n  await sql`\n    UPDATE invoices\n    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}\n    WHERE id = ${id}\n  `;\n\n  revalidatePath('/dashboard/invoices');\n  redirect('/dashboard/invoices');\n}\n\n// ④ app/ui/invoices/buttons.tsx —— 把 UpdateInvoice 的链接指向编辑页（否则点铅笔不会进编辑页）\nexport function UpdateInvoice({ id }: { id: string }) {\n  return (\n    <Link\n      href={`/dashboard/invoices/${id}/edit`}\n      className='rounded-md border p-2 hover:bg-gray-100'\n    >\n      <PencilIcon className='w-5' />\n    </Link>\n  );\n}",
      check: "打开某张发票的编辑页，改金额保存后，列表页显示新值。",
      pitfalls: [
        "写成 `action={updateInvoice(invoice.id)}` 会在渲染时立刻执行，表单提交反而失败。",
        "Next.js 16 里 `params` 是 Promise，忘记 `await` 会拿到 Promise 对象。",
      ],
    },
    {
      title: "删除发票：表单包裹 + 确认删除",
      why: "删除是最需要小心、也最需要无障碍处理的写操作。",
      explain: [
        "把删除按钮包进表单：`<form action={deleteInvoiceWithId}>`。Action 里 `DELETE FROM invoices WHERE id = ${id}`，然后 `revalidatePath('/dashboard/invoices')`。",
        "用 `<form>` 包按钮是为了**渐进增强**（JS 未就绪也能删），也不必给按钮写 `onClick`。",
        "无障碍：只放垃圾桶图标，屏幕阅读器只知道「按钮」。课程用 `sr-only` 隐藏文字或 `aria-label` 给出可读名称。",
      ],
      code:
        "// ① app/ui/invoices/buttons.tsx —— 把 DeleteInvoice 改成这样：用 <form> 包住按钮 + .bind 预填 id\nimport { deleteInvoice } from '@/app/lib/actions';\n\nexport function DeleteInvoice({ id }: { id: string }) {\n  const deleteInvoiceWithId = deleteInvoice.bind(null, id);\n\n  return (\n    <form action={deleteInvoiceWithId}>\n      <button className='rounded-md border p-2 hover:bg-gray-100'>\n        <span className='sr-only'>Delete</span>\n        <TrashIcon className='w-5' />\n      </button>\n    </form>\n  );\n}\n\n// ② app/lib/actions.ts —— 继续加 deleteInvoice（删除后停在当前路由，不需要 redirect）\nexport async function deleteInvoice(id: string) {\n  await sql`DELETE FROM invoices WHERE id = ${id}`;\n  revalidatePath('/dashboard/invoices');\n}",
      check: "点击删除后该行从列表消失；刷新后仍然不在。",
    },
  ],
  tips: [
    "写入类操作固定四步：**校验（zod）→ 写库 → revalidatePath → redirect**。",
    "Server Action 不要 import 到纯客户端逻辑里当普通函数用；它只能由表单 `action` 或事件处理器调用。",
    "课程演示的删除没有二次确认；真实项目通常要加确认弹窗或软删除。",
  ],
};
