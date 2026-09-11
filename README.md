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

1. **打开主页**，你会看到 16 个章节的清单和总进度条（章节进度 + 知识点进度）。
2. **点某章的「学习计划」**，进入详情页：有学习目标、知识点地图，以及带**具体讲解**的知识点清单
   （每项都能单独打勾，含示例代码、自检标准、常见坑），还能记笔记。
   示例代码块右上角有**「复制」按钮**，点一下即可复制整段代码（复制内容和屏幕上看到的一致）。
3. **对照官方文档动手**：让 AI 助手带你完成每一步。它只讲解与提示；**代码你自己写，命令你自己跑**。
4. **完成一章**回主页勾选，进度自动保存在浏览器本地。

## 文件跳转（点一下就能在编辑器里打开）

讲解里出现的文件路径都是**可点击的**，例如 `app/lib/definitions.ts`：

- **点路径本身** → 用你的编辑器打开该文件（打开的是本机 `D:\learn-nextjs` 里的真实文件）；
- **点后面的 ⧉** → 复制该文件的绝对路径。

**不需要任何配置**：用哪个编辑器、项目根目录在哪，都由本机自动识别 ——
dev server 就跑在你电脑上，它会依次看：启动它的终端（编辑器的内置终端会留下痕迹）、
**正在运行的编辑器进程**、系统里注册了哪些编辑器协议（Windows 注册表 / macOS 应用目录）、
以及 PATH 与常见安装目录。把鼠标停在文件路径上就能看到识别结果
（例如「在 Cursor 中打开：D:\learn-nextjs\app\lib\definitions.ts」）。

- 首次点击时浏览器会问「是否允许打开 Cursor / VS Code」，**允许一次**就好；
- 支持 Cursor、VS Code（含 Insiders）、Windsurf、Zed、JetBrains 全家桶、Sublime Text；
- **还没创建的文件会标成灰色的「待创建」**：课程里有些文件是你后面才要建的
  （`app/dashboard/page.tsx`、`.env` 等），这时点它 = 复制路径，不会让编辑器弹出「文件不存在」；
  等你把文件建好、刷新页面，它就自动变回可跳转的蓝色链接。
- 只在**本机 `npm run dev`** 时有效；部署到线上后浏览器碰不到你本机文件，这个功能自然失效 ——
  那时点击会退化成「复制路径」，不会报错。

想知道识别到了什么，可以直接访问 http://localhost:3000/api/editor
（返回编辑器、项目根目录，以及判断依据 `source` / `evidence`）。

万一自动识别不灵（编辑器没注册协议、或项目不在启动目录下），两个兜底办法：
在项目根的 `.env.local` 里写 `LEARN_NEXTJS_EDITOR=cursor`（指定编辑器）或
`NEXT_PUBLIC_PROJECT_ROOT=D:/learn-nextjs`（指定项目根目录）。
当然，**点 ⧉ 复制路径**这条路永远有效。

## 目录结构

```
.
├── app/
│   ├── page.tsx                 # 主页：16 章清单 + 打勾 + 进度条（⛔ 别改）
│   ├── chapters/[slug]/page.tsx # 章节详情页：目标 + 知识点清单/讲解 + 笔记（⛔ 别改）
│   ├── ui/                      # ⭐ 课程 UI 组件（卡片/表格/表单/侧边栏，已就位）
│   ├── lib/                     # ⭐ 课程数据与工具（definitions/utils/data/placeholder-data）
│   ├── seed/ query/             # ⭐ 课程的第 6 章播种与试查路由
│   ├── api/editor/route.ts      # ⭐ 工作台内部接口：自动识别本机编辑器与项目根目录
│   ├── api/paths/route.ts       # ⭐ 工作台内部接口：批量查询「这些文件创建了没」
│   ├── playground/              # ⭐ 第 2–3 章的练手页（你自己建）
│   ├── dashboard/               # ⭐ 第 4 章起按课程创建
│   ├── not-found.tsx
│   ├── layout.tsx
│   └── globals.css              # Tailwind v4 + 课程主题（@theme / shimmer）
├── public/                      # ⭐ 课程图片素材（hero、客户头像）+ favicon
├── components/                  # 工作台交互组件
│   ├── chapter-checklist.tsx    #   主页章节打勾
│   ├── chapter-steps.tsx        #   知识点清单 + 讲解渲染
│   ├── code-block.tsx           #   ⭐ 示例代码块（右上角「复制」按钮）
│   ├── inline-text.tsx          #   反引号 → 行内代码 / 可点文件路径
│   └── file-chip.tsx            #   ⭐ 可点击文件路径（在编辑器打开 / 复制）
├── lib/chapters/                # 16 章数据与知识点讲解（单一来源）
│   ├── types.ts                 #   Chapter / KnowledgePoint 类型
│   ├── 01-getting-started.ts    #   每章一个文件：知识点 + 讲解 + 代码 + 自检 + 常见坑
│   ├── ...
│   └── index.ts                 #   汇总导出 chapters 与若干工具函数
├── lib/editor-links.ts          # ⭐ 文件路径识别 + 各编辑器的协议 URL 构造
├── lib/detect-editor.ts         # ⭐ 自动识别本机编辑器（注册表/进程/PATH/终端环境变量）
├── lib/use-editor-env.ts        # ⭐ 客户端拉取识别结果，所有文件链接共用
├── lib/file-exists.ts           # ⭐ 客户端批量查「文件创建了没」（同页请求自动合并）
├── lib/project-root.ts          # ⭐ 服务端获取项目根目录（process.cwd()）
├── lib/storage-keys.ts          # ⭐ 所有 localStorage 键名（客户端组件只引它）
├── chapters/                    # ⭐ 每章的学习计划（引导大纲，与上面一一对应）
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
- **点了文件路径没反应**：① 浏览器第一次会弹权限框，需要允许；② 自动识别到的编辑器不是你实际在用的
  （访问 `/api/editor` 看识别结果，必要时在 `.env.local` 里写 `LEARN_NEXTJS_EDITOR=cursor` 之类）；
  ③ 编辑器没注册 URL 协议（VS Code / Cursor 里执行一次「安装 `code` 命令」）。
  实在不行用 ⧉ 复制路径，粘到编辑器里打开。
- **路径后面带灰色「待创建」**：该项目里确实还没有这个文件（课程后面才让你建），
  点击 = 复制路径，不会去唤起编辑器。建好文件后刷新页面即可恢复跳转。
- **讲解里的路径指向了不存在的文件（既不是「待创建」也不是蓝色链接）**：说明讲解内容写错了路径，
  属于工作台数据的 bug，可以提出来修正 —— 章节文案源在 `lib/chapters/`，
  改的时候要同步对应的 `chapters/**/PLAN.md`。

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
