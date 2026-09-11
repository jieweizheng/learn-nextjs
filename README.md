# Next.js 学习之旅

一个基于 [Next.js 官方 Dashboard 课程](https://nextjs.org/learn) 整理的 **16 章学习工作台**。
适合已经了解 React、想系统学习 Next.js（App Router）的新手。

主页是一份**可打勾的章节清单**，每章在 `chapters/` 下都有独立目录与一份**学习计划（PLAN.md）**。
你跟着计划自己动手，AI 助手负责讲解、提醒和陪你排错。

> 本项目的核心约定：**Agent 只引导，不代劳** —— 它不会替你改代码，也不会替你运行命令。

## 快速开始

```bash
npm install
npm run dev
```

然后打开 http://localhost:3000 查看章节清单。

## 怎么用

1. **打开主页**，你会看到 16 个章节的清单和总进度条。
2. **点某章的「学习计划」**，进入详情页：有学习目标、逐步任务清单，可以逐条打勾并记笔记。
3. **对照官方文档动手**：让 AI 助手带你完成每一步。它只讲解与提示；**代码你自己写，命令你自己跑**。
4. **完成一章**回主页勾选，进度自动保存在浏览器本地。

## 目录结构

```
.
├── app/
│   ├── page.tsx                 # 主页：16 章清单 + 打勾 + 进度条（⛔ 别改）
│   ├── chapters/[slug]/page.tsx # 章节详情页：目标 + 步骤 + 笔记（⛔ 别改）
│   ├── ui/                      # ⭐ 课程 UI 组件（卡片/表格/表单/侧边栏，已就位）
│   ├── lib/                     # ⭐ 课程数据与工具（definitions/utils/data/placeholder-data）
│   ├── seed/ query/             # ⭐ 课程的第 6 章播种与试查路由
│   ├── playground/              # ⭐ 第 2–3 章的练手页（你自己建）
│   ├── dashboard/               # ⭐ 第 4 章起按课程创建
│   ├── not-found.tsx
│   ├── layout.tsx
│   └── globals.css              # Tailwind v4 + 课程主题（@theme / shimmer）
├── public/                      # ⭐ 课程图片素材（hero、客户头像）+ favicon
├── components/                  # 工作台交互组件（打勾、笔记）
├── lib/chapters.ts              # 16 章数据（标题/链接/目标/步骤）
├── chapters/                    # ⭐ 每章的学习计划
│   ├── 01-getting-started/PLAN.md
│   ├── 02-css-styling/PLAN.md
│   ├── ...
│   └── 16-next-steps/PLAN.md
├── .env.example                 # ⭐ 第 6 章连数据库时复制成 .env
├── AGENTS.md                    # ⭐ Agent 行为准则（只引导，不代劳）
└── CLAUDE.md                    # 指向 AGENTS.md
```

## 16 章一览

| # | 章节 | 中文 |
| --- | --- | --- |
| 1 | Getting Started | 快速上手 |
| 2 | CSS Styling | CSS 样式 |
| 3 | Optimizing Fonts and Images | 优化字体与图片 |
| 4 | Creating Layouts and Pages | 创建布局与页面 |
| 5 | Navigating Between Pages | 页面间导航 |
| 6 | Setting Up Your Database | 搭建数据库 |
| 7 | Fetching Data | 获取数据 |
| 8 | Static and Dynamic Rendering | 静态与动态渲染 |
| 9 | Streaming | 流式渲染 |
| 10 | Adding Search and Pagination | 搜索与分页 |
| 11 | Mutating Data | 修改数据（Server Actions） |
| 12 | Handling Errors | 错误处理 |
| 13 | Improving Accessibility | 提升可访问性 |
| 14 | Adding Authentication | 添加身份认证 |
| 15 | Adding Metadata | 添加元数据 |
| 16 | Next Steps | 下一步 |

## 常见问题

- **`npm run dev` 报 `Can't resolve '@tailwindcss/forms'`，或「刚装的包找不到」**：
  dev server 是在安装依赖**之前**启动的，模块缓存过期了。`Ctrl+C` 停掉再重新 `npm run dev` 即可；
  若仍报错，删掉 `.next` 目录后再启动（这是 Turbopack 的缓存，删了会自动重建）。
- **端口被占用**：终端会打印回退后的地址（3001、3002…），以它为准。
- **访问 `/seed` 报数据库连接错误**：正常现象 —— 第 6 章配好 Postgres 之后它才能用。
- **文档里改 `tailwind.config.ts` 的步骤在本项目不生效**：本项目是 Tailwind v4，主题写在 `app/globals.css` 的 `@theme` 里。

## 说明

- 本仓库**既是学习工作台，也是课程练习场**：不用另建 `nextjs-dashboard`，直接在这里动手。
  课程 starter 的素材与依赖**已经全部准备好**，第 1 章的「✅ 前置准备」只做状态说明，不需要你操作。
- 练习请写在 `app/playground/`（第 2–3 章）与 `app/dashboard/`（第 4 章起）。
- 练习时**不要改动工作台本体**：`app/page.tsx`（清单主页）、`app/chapters/[slug]/page.tsx`（章节详情页）。
- 本项目用 Tailwind **v4**；官方课程文档是 v3。课程 starter 的自定义配色与骨架屏动画已用 `@theme` / `@keyframes`
  等价写进 `app/globals.css`，文档里「改 `tailwind.config.ts`」的步骤在本项目请改 `app/globals.css`。
- `app/lib/data.ts`（依赖 `postgres`）与 `app/seed/route.ts`（依赖 `bcrypt`）已在位且依赖已装，
  但**第 6 章配好数据库之前不要访问 `/seed`**。
- 课程内容版权归 [Next.js 官方文档](https://nextjs.org/learn) 所有。
