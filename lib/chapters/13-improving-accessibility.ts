import type { Chapter } from "./types";

export const chapter13: Chapter = {
  num: 13,
  slug: "improving-accessibility",
  title: "Improving Accessibility",
  titleZh: "提升可访问性",
  officialUrl: "https://nextjs.org/learn/dashboard-app/improving-accessibility",
  summary:
    "用 `useActionState` + 服务端 `safeParse` 做表单校验，并用 `aria-*` 属性让错误既能看见、也能被读出来。",
  goals: [
    "认识可访问性的三类抓手（语义化 HTML、ARIA、错误反馈）",
    "会用 `useActionState` 管理表单状态",
    "会用 zod `safeParse` 返回结构化错误",
    "会用 `aria-describedby` / `aria-live` 让错误可被朗读",
  ],
  points: [
    {
      title: "可访问性（a11y）是什么，为什么要做",
      why: "「对屏幕阅读器友好」往往等价于「结构清晰、语义正确」，顺手也提升代码质量。",
      explain: [
        "可访问性指让**所有人都能用**：使用屏幕阅读器的视障用户、只用键盘的用户、色觉障碍用户等。官方专门有一章讲它，说明这不是可选项。",
        "三类抓手：",
        "- **语义化 HTML**：该用 `<button>` 就别用 `<div>`",
        "- **ARIA 属性**：补充说明元素之间的关系与状态",
        "- **表单校验反馈**：错误必须能被读出来，而不只是变红",
        "自查手段：用 `Tab` 走一遍页面（能到每个可操作元素吗？焦点看得见吗？）、用浏览器无障碍面板看名称与角色、跑 `npm run lint`（Next 的 ESLint 带 `jsx-a11y` 规则）。",
      ],
      check: "能说出三种自查方式，并指出页面上至少一个「用 div 冒充按钮」或「图标按钮没有名字」的问题。",
    },
    {
      title: "客户端校验：先了解，再看它的局限",
      why: "浏览器原生校验很好用，但救不了「有人绕过前端」。",
      explain: [
        "给输入框加 `required`，浏览器提交时**原生阻止**并弹提示，不用写一行 JS。课程让你先加上体验一下。",
        "局限很明确：用户可以在开发者工具删掉这个属性，也可以绕过页面直接调接口。**客户端校验是体验优化，服务端校验才是安全底线。**",
        "所以课程随后就去掉它，改用 `useActionState` + 服务端校验返回错误 —— 错误信息来自服务端、无法绕过，体验也不差。",
      ],
      code: "// 在 app/ui/invoices/create-form.tsx 里，给金额那个 <input> 先加上 required（之后按课程去掉）\n<input id=\"amount\" name=\"amount\" type=\"number\" step=\"0.01\" required />",
      check: "点提交时空表单被浏览器拦住；然后能说出「为什么这不够」。",
    },
    {
      title: "用 useActionState 管理表单状态",
      why: "它把「上次提交结果」和「提交中」两个状态直接交给你。",
      explain: [
        "`useActionState` 来自 `react-dom`：`const [state, formAction, isPending] = useActionState(action, initialState)`。",
        "- `state`：action 的返回值（如错误信息）",
        "- `formAction`：包装好的函数，直接给 `<form action={formAction}>`",
        "- `isPending`：是否正在提交",
        "因此 `app/ui/invoices/create-form.tsx` 要改成**客户端组件**（顶部 `'use client'`），按钮用 `disabled={isPending}` 并显示 `isPending ? 'Submitting...' : 'Create Invoice'`。",
      ],
      code:
        "// app/ui/invoices/create-form.tsx —— 在第 11 章接好 createInvoice 的那个版本上改：\n// ① 文件最顶部加 'use client' 与下面两个 import\n'use client';\n\nimport { useActionState } from 'react';\nimport { createInvoice } from '@/app/lib/actions';\n\n// 下面 3 行放在组件函数体内部（export default function 的 { } 里）\nconst initialState = { message: '', errors: {} };\nconst [state, formAction, isPending] = useActionState(createInvoice, initialState);\n\n// 再把 return 里最外层的 <form> 换成这段（中间那些输入框保持不动）\n<form action={formAction}>\n  {/* …… 原来的输入框 …… */}\n  <button type=\"submit\" disabled={isPending}>\n    {isPending ? 'Submitting...' : 'Create Invoice'}\n  </button>\n</form>",
      check: "提交时按钮立刻显示 `Submitting...` 并禁用；结束后恢复。",
      pitfalls: [
        "`useActionState` 从 `react-dom` 导入（React 19）；旧写法 `useFormState` 已过时。",
        "`initialState` 的形状要与 action 返回值一致，否则渲染错误时取到 undefined。",
      ],
    },
    {
      title: "服务端校验：用 safeParse 返回错误而不是抛错",
      why: "`parse` 抛错会中断流程、只能靠 error.tsx 兜底；`safeParse` 能把「哪个字段错了」精确送回界面。",
      explain: [
        "先定义状态形状：`export type State = { errors?: { customerId?: string[]; amount?: string[]; status?: string[] }; message?: string | null; };`。",
        "把 `CreateInvoice.parse(...)` 换成 `safeParse({...})`，判断 `if (!validatedFields.success) { return { errors: validatedFields.error.flatten().fieldErrors, message: '...' }; }`。",
        "`safeParse` 返回**结果对象**而不是抛错，所以校验失败时函数直接 `return` 错误状态，界面用 `state.errors`、`state.message` 分别显示。注意把 action 的入参与返回值类型标注清楚，`useActionState` 才能正确推断。",
      ],
      code:
        "// app/lib/actions.ts —— 在第 12 章那个版本上改：\n// 文件顶部照旧（'use server'、import、FormSchema 都不动），只有 createInvoice 变了：\n// ① 新增 State 类型 ② 函数签名加 prevState ③ parse → safeParse\n// ⚠️ 第 12 章加的 try/catch 要保留，它包的是下面「写库」那一步\nexport type State = {\n  errors?: {\n    customerId?: string[];\n    amount?: string[];\n    status?: string[];\n  };\n  message?: string | null;\n};\n\nexport async function createInvoice(prevState: State, formData: FormData) {\n  const validatedFields = CreateInvoice.safeParse({\n    customerId: formData.get('customerId'),\n    amount: formData.get('amount'),\n    status: formData.get('status'),\n  });\n\n  if (!validatedFields.success) {\n    return {\n      errors: validatedFields.error.flatten().fieldErrors,\n      message: 'Missing Fields. Failed to Create Invoice.',\n    };\n  }\n\n  const { customerId, amount, status } = validatedFields.data;\n  const amountInCents = Math.round(amount * 100);\n  const date = new Date().toISOString().split('T')[0];\n\n  try {\n    await sql`INSERT INTO invoices (customer_id, amount, status, date)\n      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;\n  } catch (error) {\n    // 第 12 章加的：数据库错误仍然抛给 error.tsx 兜底\n    throw new Error('Failed to Create Invoice');\n  }\n\n  revalidatePath('/dashboard/invoices');\n  redirect('/dashboard/invoices');\n}",
      check: "提交空表单后，服务端返回结构化错误（而不是抛异常），界面拿到 `state.errors`。",
    },
    {
      title: "把错误显示出来，并让它能被朗读（aria）",
      why: "视觉上变红只是「一半」的可访问性 —— 错误必须同时以文本与播报的形式存在。",
      explain: [
        "按字段渲染错误，并给控件加三个属性：",
        "- `aria-describedby`：值填错误容器的 id（这里是 `customer-error`），把「这个元素」与「那条错误说明」关联",
        "- `aria-invalid`：值为 true 或 false，让辅助技术知道当前值非法",
        "- 错误容器加 `aria-live` 并设为 polite：内容变化时会朗读，但不打断用户（对比 assertive 会立刻打断）",
        "组合起来，屏幕阅读器用户能听到「Please select a customer」，而不仅是看到红字。",
      ],
      code:
        "// 在 app/ui/invoices/create-form.tsx 里，把客户下拉框换成这段（只看 aria 三个属性的加法）\n<select\n  id=\"customer\"\n  name=\"customerId\"\n  defaultValue=\"\"\n  aria-describedby=\"customer-error\"\n  aria-invalid={state.errors?.customerId ? 'true' : 'false'}\n>\n  {/* options 保持原样 */}\n</select>\n\n// 并在这段下面紧跟着新增这个错误容器：\n<div id=\"customer-error\" aria-live=\"polite\">\n  {state.errors?.customerId &&\n    state.errors.customerId.map((error) => (\n      <p className=\"mt-2 text-sm text-red-500\" key={error}>\n        {error}\n      </p>\n    ))}\n</div>",
      check: "用 `Tab` 走到下拉框时能听到/看到它被标记为无效；错误出现时 `aria-live` 区域会播报。",
      pitfalls: [
        "`aria-describedby` 的值是元素的 `id`（不是类名），写错就关联不上。",
        "只把边框变红、不给文字错误，屏幕阅读器用户什么都感知不到。",
      ],
    },
    {
      title: "练习：给其余字段补齐错误提示，并跑一次 lint",
      why: "把模式练熟，另外让工具帮你查出遗漏的无障碍问题。",
      explain: [
        "照 `customerId` 的写法，给 `amount` 与 `status` 也加错误显示与 `aria-describedby`（错误 id 用 `amount-error`、`status-error`）。",
        "然后跑 `npm run lint`。Next 的 ESLint 配置含 `eslint-plugin-jsx-a11y`，会提示「图片缺 alt」「可点击元素不可聚焦」等。**本项目尚未安装 ESLint 依赖**，报找不到就先 `npm install -D eslint eslint-config-next`。",
        "有精力把同样模式套到 `app/ui/invoices/edit-form.tsx` —— 换个地方也能落地才是真学会。",
      ],
      code: "npm install -D eslint eslint-config-next\nnpm run lint",
      check: "三个字段都能显示各自的错误；`npm run lint` 里没有无障碍相关报错。",
    },
  ],
  tips: [
    "本章模式：**服务端 zod `safeParse` 返回错误 → `useActionState` 接管状态 → 界面用 `aria-` 系列属性把错误讲清楚**。",
    "无障碍不是额外负担：语义化 HTML + 明确反馈，既帮助辅助技术用户，也让所有用户出错时更清楚发生了什么。",
  ],
};
