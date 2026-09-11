# 第 3 章 · 优化字体与图片

> 英文标题：Optimizing Fonts and Images
> 官方文档：https://nextjs.org/learn/dashboard-app/optimizing-fonts-images
> 本章目录：`chapters/03-optimizing-fonts-images/`

用 `next/font` 添加自定义字体、用 `next/image` 添加响应式图片，理解 Next.js 的优化机制。

## 🎯 学习目标

- 用 `next/font/google` 添加主字体与次字体
- 用 `next/image` 的 `<Image>` 添加响应式图片
- 理解字体 / 图片优化如何减少「布局偏移（layout shift）」

## 📋 步骤清单

### 1. 创建字体文件

在 `app/ui` 新建 `fonts.ts`：

```ts
import { Inter } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'] });
```

### 2. 在根布局应用主字体

在 `app/layout.tsx` 引入 `inter`，把 `inter.className` 和 `antialiased` 加到 `<body>` 上，字体将全局生效：

```tsx
<body className={`${inter.className} antialiased`}>{children}</body>
```

### 3. 练习：添加次字体

在 `fonts.ts` 再加一个 `Lusitana`（包含 `400`、`700` 字重），应用到 `app/page.tsx` 的 `<p>` 上；并把被注释的 `<AcmeLogo />` 取消注释。

### 4. 添加桌面端 hero 图

从 `next/image` 引入 `Image`，在 `app/page.tsx` 添加 `hero-desktop.png`：

```tsx
<Image
  src="/hero-desktop.png"
  width={1000}
  height={760}
  className="hidden md:block"
  alt="Screenshots of the dashboard project showing desktop version"
/>
```

### 5. 练习：添加移动端 hero 图

再加 `hero-mobile.png`，`width={560}`、`height={620}`，让它仅在移动端显示（与桌面图各显示其一）。

## 💡 提示 / 易错点

- `<Image>` 的 `width` / `height` 要与**源图比例一致**，它用于避免布局偏移，而不是最终显示尺寸。
- `next/font` 会在构建时下载字体并与静态资源一起托管，因此用户访问时**没有额外的字体网络请求**。
- 不确定字体的可选字重？看编辑器的类型提示，或去 Google Fonts 查。

## ✅ 完成标准

- [ ] 首页使用 Inter 字体，`<p>` 使用 Lusitana
- [ ] 桌面端与移动端分别显示各自的 hero 图
- [ ] 能用自己的话解释字体 / 图片优化带来的好处

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 两个「练习」尽量自己先做，实在不会再让 Agent 给思路（而非直接给答案）。
