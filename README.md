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
├── app/                         # 学习工作台（清单主页 + 章节详情页）
│   ├── page.tsx                 # 主页：16 章清单 + 打勾 + 进度条
│   ├── chapters/[slug]/page.tsx # 章节详情页：目标 + 步骤 + 笔记
│   ├── not-found.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/                  # 交互组件（打勾、笔记）
├── lib/chapters.ts              # 16 章数据（标题/链接/目标/步骤）
├── chapters/                    # ⭐ 每章的学习计划
│   ├── 01-getting-started/PLAN.md
│   ├── 02-css-styling/PLAN.md
│   ├── ...
│   └── 16-next-steps/PLAN.md
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

## 说明

- 本工作台是**学习辅助工具**，不包含课程要构建的 Dashboard 应用本体。
  那个应用请按课程指引自行用 `create-next-app` 创建。
- 课程内容版权归 [Next.js 官方文档](https://nextjs.org/learn) 所有。
