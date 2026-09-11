# 第 1 章 · 快速上手

> 英文标题：Getting Started
> 官方文档：https://nextjs.org/learn/dashboard-app/getting-started
> 本章目录：`chapters/01-getting-started/`

用官方提供的 starter 模板创建 `nextjs-dashboard` 项目，认识目录结构，并把它跑起来。

## 🎯 学习目标

- 使用 `create-next-app` 创建课程项目
- 认识 `/app`、`/app/lib`、`/app/ui`、`/public` 的职责
- 会启动开发服务器并访问 `http://localhost:3000`
- 了解课程使用 TypeScript，以及什么是「占位数据」

## 📋 步骤清单

> 命令请你自己在终端运行，代码请你自己写。Agent 只做讲解与提醒。

### 1. 创建项目

在你想放项目的目录下，用课程 starter 模板创建 `nextjs-dashboard`。
官方文档默认用 `pnpm`；本项目统一用 `npm`，保持一种包管理器即可。

```bash
npx create-next-app@latest nextjs-dashboard --example "https://github.com/vercel/next-learn/tree/main/dashboard/starter-example" --use-npm
```

### 2. 进入目录并安装依赖

```bash
cd nextjs-dashboard
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

然后访问 http://localhost:3000 ，你会看到一个**故意没有样式**的首页（第 2 章才加样式）。

### 4. 探索目录结构

打开编辑器，依次认识：

- `/app`：所有路由、组件与逻辑，你主要在这里工作
- `/app/lib`：可复用的工具函数与数据获取函数
- `/app/ui`：预置好的 UI 组件（卡片、表格、表单等）
- `/public`：静态资源（图片等）
- 根目录配置文件：`next.config.ts` 等（本课程基本不需要改）

### 5. 读两个关键文件

- `app/lib/placeholder-data.ts`：占位数据，第 6 章会用来「播种」数据库
- `app/lib/definitions.ts`：数据库返回值的 TypeScript 类型定义（例如 `Invoice`）

## 💡 提示 / 易错点

- 不用纠结看不懂的代码：课程大部分代码已经写好，重点是理解 Next.js 的特性。
- 全程使用同一种包管理器，避免出现多个 lockfile。
- `create-next-app` 会拉取远端模板，需要网络；慢的话耐心等一下。

## ✅ 完成标准

- [ ] `npm run dev` 能正常启动，浏览器能看到首页
- [ ] 能说清 `/app`、`/app/lib`、`/app/ui`、`/public` 各自的作用
- [ ] 在编辑器里打开了 `placeholder-data.ts` 与 `definitions.ts`

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行任何命令。
- 让 Agent 逐条带你完成上面的步骤；卡住时把终端报错原文贴给它。
- 每完成一步自己打勾；整章完成后回主页勾选「第 1 章」。
