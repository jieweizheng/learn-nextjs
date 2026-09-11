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

### 1. 打开字体文件（已就绪，读懂它）

`app/ui/fonts.ts` 已经准备好（`app/ui` 里有 7 个组件引用它，所以前置准备阶段就补上了）。
打开它，对照官方文档理解每一行：

```ts
import { Inter, Lusitana } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'] });

export const lusitana = Lusitana({
  subsets: ['latin'],
  weight: ['400', '700'],
});
```

### 2. 在根布局应用主字体

在 `app/layout.tsx` 引入 `inter`，把 `inter.className` 加到 `<body>` 的 `className` 上（本项目原有的 `antialiased` 等类保留），字体将全局生效：

```tsx
<body className={`${inter.className} antialiased ...原有类名...`}>{children}</body>
```

### 3. 练习：添加次字体

在 `fonts.ts` 再加一个 `Lusitana`（包含 `400`、`700` 字重），应用到 `app/playground/page.tsx` 的 `<p>` 上
（课程里这一步改的是 starter 的首页，本项目 `app/page.tsx` 是清单主页不能改；同理，课程里取消 `<AcmeLogo />` 注释，
你可以把 `AcmeLogo` 用到 `/playground` 页面上练手）。

### 4. 添加桌面端 hero 图

图片素材已经在 `public/` 里了（`hero-desktop.png`、`hero-mobile.png`）。从 `next/image` 引入 `Image`，在 `app/playground/page.tsx` 添加 `hero-desktop.png`：

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
- 本项目在 `app/layout.tsx` 里给 `<body>` 设了一套**系统字体栈**（`app/globals.css` 中），加上 `inter.className` 后会以 Inter 为准，这是正常的。
- 练习写在 `app/playground/`；`public/` 里已经有 `hero-desktop.png`、`hero-mobile.png`、`customers/*.png` 等素材，直接用。

## ✅ 完成标准

- [ ] 字体：全局用 Inter，`/playground` 的 `<p>` 用 Lusitana
- [ ] 桌面端与移动端分别显示各自的 hero 图
- [ ] 能用自己的话解释字体 / 图片优化带来的好处

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行命令。
- 两个「练习」尽量自己先做，实在不会再让 Agent 给思路（而非直接给答案）。
