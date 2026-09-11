# 第 2 章 · CSS 样式

> 英文标题：CSS Styling
> 官方文档：https://nextjs.org/learn/dashboard-app/css-styling
> 本章目录：`chapters/02-css-styling/`
> 📚 **知识点与详细讲解**：`lib/chapters/02-css-styling.ts`（章节页 `/chapters/css-styling` 渲染的就是它，每项都可勾选）。
> 引导用户时请按该文件里的知识点**逐条展开讲解**（含示例代码、自检标准、常见坑），**不要只说「去看官方文档」** —— 见 `AGENTS.md` 规则 3、4。

用全局样式 + Tailwind + CSS Modules 给应用加样式，并用 `clsx` 做条件类名。

> 📌 本项目已经是有样式的项目了：官方文档的「引入全局样式」在本项目**只需看懂，不必动手**（见下方说明）。
> 动手练习都写在 `app/playground/` 里（别动 `app/page.tsx`，那是工作台的清单主页）。

## 🎯 学习目标

- 看清全局 CSS 是怎么接到根布局上的（本项目已就绪）
- 用 Tailwind 工具类写样式
- 用 CSS Modules 做组件级作用域样式
- 用 `clsx` 按状态切换类名

## 🔗 关于「引入全局样式」（不属于步骤清单）

本项目在 `app/layout.tsx` 顶部**已经**导入了 `app/globals.css`，样式本来就生效：

```tsx
import "./globals.css";
```

打开 `app/globals.css`，第一行 `@import "tailwindcss";` 就是 Tailwind。
官方文档用的是 Tailwind v3 的 `@tailwind base; @tailwind components; @tailwind utilities;`，
本项目是 v4，一行 `@import` 代替，作用相同 —— 所以这一步你**不用动任何代码**。

> ⚠️ 官方 starter 把全局样式表放在 app/ui/global.css。**本项目没有这个文件**，
> 对应物是 `app/globals.css`（Tailwind v4 主题也写在这里）。文档里出现 app/ui/global.css 时，
> 在本项目一律按 `app/globals.css` 理解，别去项目里找那个不存在的路径。
> 同样，官方 starter 的 app/ui/home.module.css（现成的 CSS Modules 示例）本项目也没搬过来，
> 第 2 步的样式模块由**你自己写**。
>
> （注：app/ui/global.css 这类路径这里**故意不加反引号** —— 加了会被工作台渲染成可点击的文件链接，
> 而这个文件并不存在。只有项目里真实存在的路径才用反引号。）

## 📋 步骤清单

### 1. 认识 Tailwind（动手）

给元素加类名即可写样式，例如 `<h1 className="text-blue-500">`。

先建一个自己的练习页 `app/playground/page.tsx`（**不要**改 `app/page.tsx`）：

```tsx
export default function Page() {
  return <h1 className="text-blue-500">Playground</h1>;
}
```

访问 http://localhost:3000/playground ，再用 `border-*` 类拼出一个三角形（把组件 `return` 的内容换成这个 `div`）：

```tsx
export default function Page() {
  return (
    <div className="relative h-0 w-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-black" />
  );
}
```

### 2. 改用 CSS Modules

在练习目录里**自己**新建 `app/playground/pg.module.css`：

```css
.shape {
  height: 0;
  width: 0;
  border-bottom: 30px solid black;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
}
```

然后在 `app/playground/page.tsx` 里导入这个样式模块（同目录写成 `import styles from "./pg.module.css"`），
用 `styles.shape` 替换 Tailwind 类名，效果一致。

### 3. 用 clsx 切换类名

打开 `app/ui/invoices/status.tsx`，看它如何用 `clsx` 根据 `status`（`pending` / `paid`）条件应用不同类名。
（`clsx` 已经装好了，直接读代码。）

## 💡 提示 / 易错点

- Tailwind 与 CSS Modules 可以并存，按个人偏好选择即可。
- **页面文件必须默认导出组件**（`export default function Page()`）：只贴一段裸 JSX 会报
  `Property 'default' is missing`；示例里的片段要放进组件的 `return (...)` 里面。
- CSS Modules 会自动生成唯一类名，避免样式冲突；文件名**必须**写成 `*.module.css`。
- 本项目是 Tailwind v4，官方文档是 v3。照文档写 v3 的 `@tailwind ...` 指令在本项目不生效 —— 以 `app/globals.css` 为准。
- 练习写进 `app/playground/`，不要动工作台的 `/`（清单主页）。

## ✅ 完成标准

- [ ] 能说明本项目的样式是从哪来的（`app/layout.tsx` → `app/globals.css`）
- [ ] `/playground` 页能用 Tailwind 画出三角形
- [ ] 用 CSS Modules 复现出同样的形状
- [ ] 看懂 `app/ui/invoices/status.tsx` 里 `clsx` 的用法

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 建议先让 Agent 解释 Tailwind 与 CSS Modules 的区别，再自己动手改。
