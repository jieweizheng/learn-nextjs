import type { Chapter } from "./types";

export const chapter13: Chapter = {
  num: 13,
  slug: "improving-accessibility",
  title: "Improving Accessibility",
  titleZh: "提升可访问性",
  officialUrl:
    "https://nextjs.org/learn/dashboard-app/improving-accessibility",
  summary:
    "补上服务端表单校验，用 `useActionState` 把错误反馈回界面，并加上 `aria-*` 属性让屏幕阅读器也能用。",
  goals: [
    "理解客户端校验与服务端校验的分工",
    "会用 `useActionState` 管理表单状态与 pending",
    "会用 zod 的 `safeParse` 把校验错误返回给界面",
    "会用 `aria-describedby`、`aria-live` 让错误可被朗读",
  ],
  points: [
    {
      title: "可访问性（a11y）是什么，为什么要做",
      why: "课程把它当成一等公民；而且「对屏幕阅读器友好」往往等价于「结构清晰、语义正确」，顺手也提升了代码质量。",
      explain: [
        "可访问性指让**所有人都能用**你的应用：使用屏幕阅读器的视障用户、只用键盘的用户、色觉障碍用户等。Next.js 官方文档专门有一章讲它，说明这不是「可选项」。",
        "做这件事的抓手主要有三类：**语义化 HTML**（该用 `<button>` 就别用 `<div>`）、**ARIA 属性**（补充说明元素之间的关系与状态）、**表单校验的反馈方式**（错误必须能被读出来，而不只是变红）。",
        "自查手段：用 `Tab` 键走一遍页面（能不能到每个可操作元素？焦点位置看得见吗？）、用浏览器的无障碍面板查看名称与角色，以及跑 `npm run lint`（Next.js 的 ESLint 配置带有 `jsx-a11y` 规则）。",
      ],
      check: "能说出三种自查方式，并指出自己页面上至少一个「用 div 冒充按钮」或「图标按钮没有名字」的问题。",
    },
    {
      title: "客户端校验：先了解，再看它的局限",
      why: "浏览器原生校验很好用，但它救不了「有人绕过前端」的情况，所以只能当辅助。",
      explain: [
        "给输入框加 `required` 属性，浏览器会在提交时**原生阻止**并弹出提示，不需要写一行 JS。课程让你先加上体验一下。",
        "局限很明确：用户可以在开发者工具里删掉这个属性，也可以完全绕过你的页面直接调用接口。**客户端校验是体验优化，服务端校验才是安全底线。**",
        "所以课程随后就把它去掉了，改用下面的 `useActionState` + 服务端校验返回错误 —— 这样错误信息来自服务端、无法被绕过，同时体验也不差。",
      ],
      code: "<!-- 先加上感受一下，之后按课程去掉 -->\n<input id=\"amount\" name=\"amount\" type=\"number\" step=\"0.01\" required />",
      check: "点提交时空表单会被浏览器拦住；然后能说出「为什么这不够」。",
    },
    {
      title: "用 useActionState 管理表单状态",
      why: "它把「上一次提交的结果」和「提交中」两个状态直接交给你，表单反馈从此不用自己造轮子。",
      explain: [
        "`useActionState` 来自 `react-dom`，用法是 `const [state, formAction, isPending] = useActionState(action, initialState)`：`state` 是 action 的返回值（比如错误信息），`formAction` 是包装好的函数（直接给 `<form action={formAction}>`），`isPending` 告诉你是否正在提交。",
        "因此 `app/ui/invoices/create-form.tsx` 需要改成**客户端组件**（顶部 `'use client'`），表单改成 `<form action={formAction}>`，提交按钮用 `disabled={isPending}`，并在按钮里显示 `isPending ? 'Submitting...' : 'Create Invoice'`。",
        "官方还有一条很实用的建议：按钮禁用后要让用户知道「事情在发生」，所以文字/图标要有变化，而不是只是变灰。",
      ],
      code:
        "'use client';\n\nimport { useActionState } from 'react';\nimport { createInvoice } from '@/app/lib/actions';\n\nconst initialState = { message: '', errors: {} };\n\nconst [state, formAction, isPending] = useActionState(createInvoice, initialState);\n\n<form action={formAction}>\n  {/* …… */}\n  <button type=\"submit\" disabled={isPending}>\n    {isPending ? 'Submitting...' : 'Create Invoice'}\n  </button>\n</form>",
      check: "提交时按钮立刻显示 `Submitting...` 并禁用；提交结束后恢复。",
      pitfalls: [
        "`useActionState` 从 `react-dom` 导入（React 19）；旧写法 `useFormState` 已过时。",
        "`initialState` 的形状要和 action 的返回值保持一致，否则渲染错误时会取到 undefined。",
      ],
    },
    {
      title: "服务端校验：用 safeParse 返回错误而不是抛错",
      why: "`parse` 抛错会让整个流程中断、只能靠 error.tsx 兜底；`safeParse` 能把「哪个字段错了」精确地送回界面。",
      explain: [
        "先定义状态的形状：`export type State = { errors?: { customerId?: string[]; amount?: string[]; status?: string[] }; message?: string | null; };`。",
        "然后把 `CreateInvoice.parse(...)` 换成 `const validatedFields = CreateInvoice.safeParse({...})`，判断 `if (!validatedFields.success) { return { errors: validatedFields.error.flatten().fieldErrors, message: 'Missing Fields. Failed to Create Invoice.' }; }`。",
        "`safeParse` 返回一个**结果对象**（成功或失败）而不是抛错，所以校验失败时函数直接 `return` 错误状态 —— 界面拿到 `state.errors`、`state.message` 就能分别显示。注意类型上要把 action 的入参和返回值都标注清楚，才能被 `useActionState` 正确推断。",
      ],
      code:
        "// app/lib/actions.ts\nexport type State = {\n  errors?: {\n    customerId?: string[];\n    amount?: string[];\n    status?: string[];\n  };\n  message?: string | null;\n};\n\nexport async function createInvoice(prevState: State, formData: FormData) {\n  const validatedFields = CreateInvoice.safeParse({\n    customerId: formData.get('customerId'),\n    amount: formData.get('amount'),\n    status: formData.get('status'),\n  });\n\n  if (!validatedFields.success) {\n    return {\n      errors: validatedFields.error.flatten().fieldErrors,\n      message: 'Missing Fields. Failed to Create Invoice.',\n    };\n  }\n\n  const { customerId, amount, status } = validatedFields.data;\n  // ……写库、revalidatePath、redirect\n}",
      check: "提交空表单后，服务端返回结构化错误（而不是抛异常），界面拿到 `state.errors`。",
    },
    {
      title: "把错误显示出来，并让它能被朗读（aria）",
      why: "视觉上变红只是「一半」的可访问性 —— 错误必须同时以文本与播报的形式存在。",
      explain: [
        "在表单里按字段渲染错误：`{state.errors?.customerId && <p className=\"mt-2 text-sm text-red-500\" id=\"customer-error\" aria-live=\"polite\">{state.errors.customerId}</p>}`。同时给对应的 `<select>` 加 `aria-describedby=\"customer-error\"`，把「这个元素」和「那条错误说明」关联起来。",
        "再给控件加 `aria-invalid={state.errors?.customerId ? 'true' : 'false'}`，让辅助技术知道当前值非法。",
        "`aria-live=\"polite\"` 的含义是「这块区域内容会变，变化时请朗读，但别打断用户当前正在读的内容」（对比 `assertive` 会立刻打断，适合紧急提示）。这几个属性组合起来，屏幕阅读器用户就能听到「Please select a customer」，而不仅是看到红字。",
      ],
      code:
        "<select\n  id=\"customer\"\n  name=\"customerId\"\n  defaultValue=\"\"\n  aria-describedby=\"customer-error\"\n  aria-invalid={state.errors?.customerId ? 'true' : 'false'}\n>\n  {/* options */}\n</select>\n\n<div id=\"customer-error\" aria-live=\"polite\">\n  {state.errors?.customerId &&\n    state.errors.customerId.map((error) => (\n      <p className=\"mt-2 text-sm text-red-500\" key={error}>\n        {error}\n      </p>\n    ))}\n</div>",
      check:
        "用 `Tab` 键走到下拉框时能听到/看到它被标记为无效；错误出现时 `aria-live` 区域会播报文字。",
      pitfalls: [
        "`aria-describedby` 的值是元素的 `id`（不是类名），写错就关联不上。",
        "只把边框变红、不给文字错误，屏幕阅读器用户什么都感知不到。",
      ],
    },
    {
      title: "练习：给其余字段补齐错误提示，并跑一次 lint",
      why: "把模式练熟，另外让工具帮你查出遗漏的无障碍问题。",
      explain: [
        "照着 `customerId` 的写法，给 `amount` 与 `status` 也加上错误显示与 `aria-describedby`（它们的错误 id 用 `amount-error`、`status-error`）。",
        "然后运行 `npm run lint`。Next.js 的 ESLint 配置包含 `eslint-plugin-jsx-a11y`，它会提示比如「图片缺 alt」「可点击元素不可聚焦」这类问题。**注意本项目尚未安装 ESLint 相关依赖**，如果报找不到 eslint，先在项目根 `npm install -D eslint eslint-config-next` 再跑。",
        "有精力的话，把同样的模式套到 `app/ui/invoices/edit-form.tsx`（编辑发票的表单）上 —— 这才是「学会」的标志：换个地方也能自己落地。",
      ],
      code: "npm install -D eslint eslint-config-next\nnpm run lint",
      check: "三个字段都能显示各自的错误；`npm run lint` 里没有与无障碍相关的报错。",
    },
  ],
  tips: [
    "本章的模式可以概括为：**服务端 zod `safeParse` 返回错误 → `useActionState` 接管状态 → 界面用 `aria-` 系列属性把错误讲清楚**。",
    "无障碍不是额外的负担：语义化的 HTML + 明确的反馈，既帮助了辅助技术用户，也让所有用户在出错时更清楚发生了什么。",
  ],
};
