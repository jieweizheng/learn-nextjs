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

给输入加 `required`，体验浏览器原生校验。⚠️ **体验完务必移除** —— 留着它会拦住浏览器提交，服务端 action 根本不会被调用，后面「服务端返回错误 → 界面显示错误」就永远看不到。

### 2. 引入 useActionState

把 `app/ui/invoices/create-form.tsx` 改为 `'use client'`，使用：

```tsx
import { useActionState } from 'react';
import { createInvoice, State } from '@/app/lib/actions';

const initialState: State = { message: null, errors: {} };
const [state, formAction, isPending] = useActionState(createInvoice, initialState);

return <form action={formAction}>/* ... */</form>;
```

`initialState` 的 **`: State` 类型标注不能省** —— 它决定 `state.errors` 的类型；不标注会被推断成 `{}`，后面写 `state.errors.customerId` 会报「属性不存在」。（`State` 要到下一步骤才定义，所以这里 import 会先报红，属预期内。）

⚠️ 这一步做完 `createInvoice` 仍是旧签名 `(formData: FormData)`，而 `useActionState` 按 `(prevState, formData)` 调用它 —— 会出两个**预期内**的报错：`ts(2769)` 类型错 + 提交时 `formData.get is not a function`。**下一步骤**改成 `(prevState: State, formData: FormData)` 后消失，建议连着下一步骤一起做。

### 3. 服务端校验（两处必改：签名 + safeParse）

在 `app/lib/actions.ts`：

**① 先改函数签名** —— `createInvoice` 从 `(formData: FormData)` 改成 `(prevState: State, formData: FormData)`。顺序不能反、也不能少（`useActionState` 先传 state、再传表单数据）；漏了它提交时会抛 `formData.get is not a function`。

**② 定义 `State` 类型 + 把 `parse` 换成 `safeParse`**，校验失败时提前返回：

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

**③ 写库的 `catch` 从 `throw` 改成 `return`** —— 现在错误能显示回表单，数据库出错就不该整页崩到 `error.tsx`：

```ts
} catch (error) {
  return { message: 'Database Error: Failed to Create Invoice.' };
}
```

（`revalidatePath` 与 `redirect` 仍留在 `try/catch` 之外。）

### 4. 显示错误 + aria

⚠️ 前提：步骤 2 的 `import { createInvoice, State }` 与 `const initialState: State = {...}` 必须已做 —— 否则写 `state.errors.customerId` 会报 `Property 'customerId' does not exist on type '{}'`。

在表单里根据 `state.errors` 渲染每个字段的错误（**不渲染就等于没效果** —— 服务端返回的错误会被丢掉），并加上无障碍属性：

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

给其余字段补齐错误显示；有精力再给 `app/ui/invoices/edit-form.tsx` 也加上。

然后跑 lint 检查 aria 用法。⚠️ **Next 16 已移除 `next lint`**（课程里那句是旧版写法），本项目也还没配 lint，需先建好三步：
- `npm install -D eslint eslint-config-next`
- 新建 `eslint.config.mjs`：`eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`（flat config，详见 `lib/chapters/13-improving-accessibility.ts`）
- `package.json` 的 `scripts` 加 `"lint": "eslint"`
- 之后 `npm run lint`。⚠️ **别期待它报一堆 a11y 问题**：Next 默认只开 **6 条** `jsx-a11y` 规则 —— `alt-text`（图片缺 `alt`）+ `aria-props` / `aria-proptypes` / `aria-unsupported-elements` / `role-has-required-aria-props` / `role-supports-aria-props`。「可点击元素不可聚焦」「控件缺 label」这类**没开**。项目里所有 `<Image>` 都带 `alt`，所以 a11y 一条都不报 = 没违规，不是没生效（想确认可临时删一个 `alt` 试）。
- 输出里还会有一堆**与无障碍无关**的提示（未使用变量、`react/display-name`、`react-hooks/set-state-in-effect`），只看以 `jsx-a11y/` 开头的行即可。
- 想要完整规则集：`npm install -D eslint-plugin-jsx-a11y`，在 `eslint.config.mjs` 里加 `jsxA11y.flatConfigs.recommended`。
- ⚠️ 若项目 TypeScript 是 **7.0**，`eslint` 会报 `typescript-eslint does not support TS 7.0`（只支持到 TS 6）→ 先 `npm install -D typescript@6` 再跑

### 6. 亲手听一遍（验证，最容易被跳过但最关键）

分三层验证，成本从零到最接近真实用户：

1. **键盘走查**（零安装）：只用 `Tab` / `Shift + Tab`，看焦点顺序与聚焦可见性 —— 查不出「念出来的内容」。
2. **DevTools 无障碍面板**（零安装）：Elements → 「无障碍 / Accessibility」→「计算后的属性」里的 **Name / Role / Description**（`aria-describedby` 的内容就在 Description 里）。它是静态快照，**看不到 `aria-live` 的播报**。

   ⚠️ 若「计算后的属性」一片空白：① 必须选中 `<select>` **本体**（选到 `<label>` / 外层 `<div>` / 图标会是 generic、ignored）；② 两个分组是折叠的，页签常藏在 Styles 右边的 `»` 里；③ **页面当前无错误 → 错误容器为空 → Description 本来就是空的**，要提交一次空表单再回来看（最容易误判）。选不中元素时改用 Elements 右上角的 `Switch to Accessibility Tree view`。
3. **真实屏幕阅读器**：Windows 自带讲述人（`Win + Ctrl + Enter`）；推荐免费 **NVDA**（`nvaccess.org`）。用 **工具 → 语音查看器（Speech Viewer）** 把朗读内容以文字显示出来。

NVDA 关键操作：`Ctrl + Alt + N` 启动；`NVDA + Q` 退出；`Ctrl` 停止朗读；`Tab` 移动焦点；`NVDA + 空格` 切换浏览 / 焦点模式；`NVDA + 下箭头` 连续朗读；`NVDA + F7` 元素列表；`H` / `F` / `B` / `K` / `R` 单键跳转（仅浏览模式）。

预期听到：**①** 聚焦下拉框 → 「Choose customer, 组合框, Please select a customer, 无效输入」；**②** 提交后焦点不动 → `aria-live` 自动播报错误。

⚠️ 安装时勾选「用 CapsLock 作为 NVDA 键」；速度先调到 30–40%。测试时**别用鼠标**。

详见 `lib/chapters/13-improving-accessibility.ts` 第 7 个知识点。

### 7. （可选）提交失败后保留用户已填内容

React 19 在 action **正常返回**后（返回校验错误也算正常返回）会**重置所有非受控控件** → 校验失败时表单被清空。这是行为、不是 bug；`useActionState` 的 `state` 不会被重置，所以会出现「错误提示还在、输入没了」。

分辨方法：看 Console —— 被清空 / 地址栏有加载进度 = 真的整页刷新；Console 还在、只是输入框空了 = 就是这个重置。

修法：action 失败分支把原始输入一并 `return`（`State` 加 `fields`），控件用 `defaultValue` / `defaultChecked` 回填；⚠️ `<select>` 可能仍不回填，把它**单独做成受控**（受控控件不受重置影响）。

详见 `lib/chapters/13-improving-accessibility.ts` 第 8 个知识点。

## 💡 提示 / 易错点

- 服务端校验是「唯一真相来源」，能防止恶意用户绕过客户端校验。
- 表单变成客户端组件后，可以用 `console.log(state)` 在浏览器控制台调试。
- 自动扫描工具通常只能查出约三成无障碍问题，剩下七成要靠真屏幕阅读器手动听。

## ✅ 完成标准

- [ ] 提交空表单会显示逐字段的友好错误
- [ ] 错误区域带有合适的 aria 属性
- [ ] `npm run lint` 通过
- [ ] 用真屏幕阅读器（NVDA / 讲述人）听到错误被正确朗读与播报
- [ ] （可选）校验失败后，已填的其它字段仍保留原值

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 可以让 Agent 讲清「controlled vs uncontrolled」以及校验放在服务端的理由。
