# 第 2 章 · CSS 样式

> 英文标题：CSS Styling
> 官方文档：https://nextjs.org/learn/dashboard-app/css-styling
> 本章目录：`chapters/02-css-styling/`

用全局样式 + Tailwind + CSS Modules 给应用加样式，并用 `clsx` 做条件类名。

## 🎯 学习目标

- 在根布局引入全局 CSS
- 用 Tailwind 工具类写样式
- 用 CSS Modules 做组件级作用域样式
- 用 `clsx` 按状态切换类名

## 📋 步骤清单

### 1. 引入全局样式

打开 `app/layout.tsx`，在顶部导入全局样式文件：

```tsx
import '@/app/ui/global.css';
```

保存后首页就有样式了——样式来自 `global.css` 里的 Tailwind 指令。

### 2. 认识 Tailwind

`global.css` 中的 `@tailwind base/components/utilities` 就是 Tailwind。
给元素加类名即可写样式，例如 `<h1 className="text-blue-500">`。
试着在 `app/page.tsx` 里用 `border-*` 类拼出一个三角形：

```tsx
<div className="relative h-0 w-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-black" />
```

### 3. 改用 CSS Modules

在 `app/ui` 新建 `home.module.css`：

```css
.shape {
  height: 0;
  width: 0;
  border-bottom: 30px solid black;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
}
```

然后在 `app/page.tsx` 里 `import styles from '@/app/ui/home.module.css'`，用 `styles.shape` 替换 Tailwind 类名，效果一致。

### 4. 用 clsx 切换类名

打开 `app/ui/invoices/status.tsx`，看它如何用 `clsx` 根据 `status`（`pending` / `paid`）条件应用不同类名。

## 💡 提示 / 易错点

- Tailwind 与 CSS Modules 可以并存，按个人偏好选择即可。
- CSS Modules 会自动生成唯一类名，避免样式冲突。

## ✅ 完成标准

- [ ] 首页已有样式，能说明样式来自哪里
- [ ] 成功用 Tailwind 画出三角形
- [ ] 成功用 CSS Modules 复现同样的形状
- [ ] 看懂 `status.tsx` 里 `clsx` 的用法

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 建议先让 Agent 解释 Tailwind 与 CSS Modules 的区别，再自己动手改。
