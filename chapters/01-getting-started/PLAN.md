# 第 1 章 · 快速上手

> 英文标题：Getting Started
> 官方文档：https://nextjs.org/learn/dashboard-app/getting-started
> 本章目录：`chapters/01-getting-started/`
> 📚 **知识点与详细讲解**：`lib/chapters/01-getting-started.ts`（章节页 `/chapters/getting-started` 渲染的就是它，每项都可勾选）。
> 引导用户时请按该文件里的知识点**逐条展开讲解**（含示例代码、自检标准、常见坑），**不要只说「去看官方文档」** —— 见 `AGENTS.md` 规则 3、4。

认识项目目录结构、把开发服务器跑起来，并了解课程使用的 TypeScript 与「占位数据」。

> ✅ **本项目的一次性准备已经全部做完了**（素材搬运 + 依赖安装），你直接看下面的步骤清单即可。

## 🎯 学习目标

- 认识 `app/`、`app/ui/`、`app/lib/`、`public/` 各自负责什么
- 会启动开发服务器并访问（本机 3000 常被占用，会回退到 3001）
- 了解课程使用 TypeScript，以及什么是「占位数据」

## ✅ 前置准备（已由 Agent 完成，你无需操作）

「拿本项目当练习场」需要的一次性准备，已经全部就绪。你只需要两条命令：

```bash
npm install
npm run dev
```

| 项目 | 状态 |
| --- | --- |
| 项目骨架：Next 16 + App Router + TypeScript + Tailwind v4 + npm | ✅ 已就绪 |
| 课程 starter 素材：`app/ui/**`、`app/lib/**`、`public/**`、`.env.example` | ✅ 已搬入 |
| 依赖：`clsx`、`@heroicons/react`、`postgres`、`bcrypt`、`@tailwindcss/forms` | ✅ 已安装 |
| `app/ui/fonts.ts`（`app/ui` 里有 7 个组件引用它，官方第 3 章才创建） | ✅ 已补上 |
| Tailwind 主题：官方 v3 `tailwind.config.ts` 里的自定义蓝色与 `shimmer` 关键帧 | ✅ 已用 v4 的 `@theme` 写进 `app/globals.css` |

> 想额外完整练一遍「创建项目」这个动作，见文末「🔁 可选」。

## 📋 步骤清单

> 下面才是官方章节的内容。命令请你自己在终端运行，代码请你自己写，Agent 只做讲解与提醒。

### 1. 启动开发服务器

在项目根运行：

```bash
npm run dev
```

访问终端打印出来的地址（默认 http://localhost:3000 ；被占用会自动回退到 **3001**）。
官方文档里那个「故意没有样式」的首页，在本项目里换成了**章节清单主页**。

### 2. 探索目录结构

打开编辑器，依次认识：

| 路径 | 作用 |
| --- | --- |
| `app/` | 所有路由与页面（工作台 + 你的练习） |
| `app/ui/` | ⭐ 课程 UI 组件（卡片、表格、表单、侧边栏） |
| `app/lib/` | ⭐ 课程的数据与工具函数（占位数据、类型定义、取数函数） |
| `public/` | 静态资源（hero 图、头像等） |
| `components/` | 工作台自己的交互组件（打勾、笔记） |
| `lib/chapters/` | 本工作台的 16 章数据与知识点讲解（`types.ts` + 每章一个 `NN-<slug>.ts` + `index.ts`） |
| `chapters/**/PLAN.md` | 每章的学习计划（就是你在读的这种文件） |
| `next.config.ts` | 配置文件（本课程基本不用改） |

**练习区域约定：**

- 第 2–3 章的小实验放在 `app/playground/`（自己新建，随便折腾）
- 第 4 章起，按官方路径创建 `app/dashboard/`
- ⛔ 别去改 `/`（`app/page.tsx` 清单主页）和 `/chapters/[slug]`（章节详情页）

### 3. 读两个关键文件

- `app/lib/placeholder-data.ts`：占位数据，第 6 章会用它「播种」数据库
- `app/lib/definitions.ts`：数据库返回值的 TypeScript 类型定义（例如 `Invoice`）

## 💡 提示 / 易错点

- 不用纠结看不懂的代码：课程大部分代码是现成的，重点是理解 Next.js 的特性。
- 全程使用同一种包管理器（本项目统一用 **npm**），避免出现多个 lockfile。
- **Tailwind 版本差异**：本项目是 Tailwind **v4**（`app/globals.css` 里 `@import "tailwindcss";`），
  课程文档是 **v3**。绝大多数工具类通用；课程 starter 的自定义蓝色（`blue-400/500/600`）与骨架屏
  `shimmer` 动画，已经用 v4 的 `@theme` / `@keyframes` 等价写在 `app/globals.css` 里了。
  文档里提到「改 `tailwind.config.ts`」的步骤，在本项目请改 `app/globals.css` 的 `@theme` 块。
- 3000 端口被占用时不用慌，用终端打印的 3001 就行。
- `app/lib/data.ts` 依赖 `postgres`、`app/seed/route.ts` 依赖 `bcrypt`，两者都已安装好；
  但在第 6 章配好数据库之前，**不要去访问 `/seed` 或调用这些取数函数**，会报连接错误。

## ✅ 完成标准

- [ ] `npm run dev` 正常启动，浏览器能看到清单主页
- [ ] 能说清 `app/`、`app/ui/`、`app/lib/`、`public/` 各自的作用
- [ ] 打开并读懂了 `app/lib/placeholder-data.ts` 与 `app/lib/definitions.ts`

## 🤖 交给 Agent 的引导规则

- Agent 只做讲解与提示，**不得**替你修改代码，**不得**替你运行任何命令。
- 让 Agent 逐条带你完成上面的步骤；卡住时把终端报错原文贴给它。
- 每完成一步自己打勾；整章完成后回主页勾选「第 1 章」。

## 🔁 可选：想从零创建一个自己的项目

如果你就是想完整练一遍「创建项目」这个动作，可以在别的目录建一个独立项目：

```bash
cd D:\
npx create-next-app@latest nextjs-dashboard --example "https://github.com/vercel/next-learn/tree/main/dashboard/starter-example" --use-npm
```

- 放在 `D:\learn-nextjs` **外面**（同级目录），别放进 `app/` 里。
- 官方文档默认用 `pnpm`；这里统一用 `npm`，一种包管理器就够了。
- 但**本课程的主线仍在本项目里进行**，这个只是可选的额外练习。
