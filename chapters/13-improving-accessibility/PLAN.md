# 第 13 章 · 提升可访问性

> 英文标题：Improving Accessibility
> 官方文档：https://nextjs.org/learn/dashboard-app/improving-accessibility
> 本章目录：`chapters/13-improving-accessibility/`
> 📚 **知识点与详细讲解**：`lib/chapters/13-improving-accessibility.ts`（章节页 `/chapters/improving-accessibility` 渲染的就是它，每项都可勾选）。
> 引导用户时请按该文件里的知识点**逐条展开讲解**（含示例代码、自检标准、常见坑），**不要只说「去看官方文档」** —— 见 `AGENTS.md` 规则 3、4。

做客户端与服务端表单校验，用 `useActionState` 显示错误，并加上无障碍的 aria 属性。

## 🎯 学习目标

- 理解客户端校验与服务端校验的区别
- 用 `useActionState` 管理表单状态
- 用 zod `safeParse` 返回字段级错误
- 给表单添加 `aria-describedby` / `aria-live`

## 📋 步骤清单

### 1. 了解客户端校验

给输入加 `required`，体验浏览器原生校验（了解即可，随后可以移除）。

### 2. 引入 useActionState

把 `app/ui/invoices/create-form.tsx` 改为 `'use client'`，使用：

```tsx
import { useActionState } from 'react';

const initialState: State = { message: null, errors: {} };
const [state, formAction] = useActionState(createInvoice, initialState);

return <form action={formAction}>/* ... */</form>;
```

### 3. 服务端校验

在 `app/lib/actions.ts` 定义 `State` 类型，把 `parse` 换成 `safeParse`，校验失败时提前返回：

```ts
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  // ...
}
```

同时更新 zod schema，为字段加友好错误信息（如「Please enter an amount greater than $0.」）。

### 4. 显示错误 + aria

在表单里根据 `state.errors` 渲染每个字段的错误，并加上无障碍属性：

```tsx
<div id="customer-error" aria-live="polite" aria-atomic="true">
  {state.errors?.customerId &&
    state.errors.customerId.map((error: string) => (
      <p className="mt-2 text-sm text-red-500" key={error}>
        {error}
      </p>
    ))}
</div>
```

### 5. 练习

给其余字段补齐错误显示，并运行 `npm run lint` 检查 aria 用法；有精力再给 `app/ui/invoices/edit-form.tsx` 也加上。

## 💡 提示 / 易错点

- 服务端校验是「唯一真相来源」，能防止恶意用户绕过客户端校验。
- 表单变成客户端组件后，可以用 `console.log(state)` 在浏览器控制台调试。

## ✅ 完成标准

- [ ] 提交空表单会显示逐字段的友好错误
- [ ] 错误区域带有合适的 aria 属性
- [ ] `npm run lint` 通过

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 可以让 Agent 讲清「controlled vs uncontrolled」以及校验放在服务端的理由。
