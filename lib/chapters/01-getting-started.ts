import type { Chapter } from "./types";

export const chapter01: Chapter = {
  num: 1,
  slug: "getting-started",
  title: "Getting Started",
  titleZh: "快速上手",
  officialUrl: "https://nextjs.org/learn/dashboard-app/getting-started",
  summary:
    "把开发服务器跑起来，认识 App Router 的目录分工，并了解课程使用的 TypeScript 与占位数据。",
  goals: [
    "会启动开发服务器并访问页面（3000 被占用时会回退到 3001）",
    "能说出 `app/`、`app/ui/`、`app/lib/`、`public/` 各自负责什么",
    "理解「文件夹即路由」以及 `page.tsx`、`layout.tsx` 这类特殊文件的作用",
    "知道 `app/lib/placeholder-data.ts` 与 `app/lib/definitions.ts` 在第 6、7 章会被用来做什么",
  ],
  points: [
    {
      title: "启动开发服务器（npm run dev）",
      why: "先把「改代码 → 立刻看到效果」这个反馈环建立起来，后面每个知识点都要靠它验证。",
      explain: [
        "在项目根目录运行 `npm run dev`，它会启动 Next.js 的**开发服务器**（本项目底层用 Turbopack 编译）。第一次启动要编译一会儿，稍等几秒。",
        "启动成功后终端会打印一行以 `Local:` 开头的地址，默认是 `http://localhost:3000`，在浏览器打开它。之后你每保存一次文件，页面都会自动热更新（HMR），通常不用手动刷新。",
        "官方文档全程用 `pnpm dev`，本项目统一用 npm，因此把命令换成 `npm run dev` 即可，两者效果一样。",
        "官方文档里那个「故意没有任何样式」的首页，在本项目里换成了你现在看到的**章节清单主页** —— 这是同一个位置（`/`），只是内容不同。",
      ],
      code: "cd D:\\learn-nextjs\nnpm run dev",
      check:
        "终端打印出 Local 地址，浏览器能打开页面；随便改动页面上的一个字并保存，页面自动更新。",
      pitfalls: [
        "本机 3000 端口常被别的进程占用，Next 会自动顺延到 **3001**（甚至 3002）。以终端**实际打印**的地址为准，不要死认 3000。",
        "报 `EADDRINUSE` 或提示端口被占用：说明已经有一个 dev server 在跑。先关掉旧的，不要同时开两个。",
      ],
    },
    {
      title: "app/ 目录：文件夹即路由",
      why: "App Router 的路由规则是后面 16 章的地基 —— 看不懂目录，就看不懂页面是从哪来的。",
      explain: [
        "在 App Router 里，`app/` 下的**每一个文件夹代表 URL 中的一个路由段**。例如 `app/dashboard/page.tsx` 对应 `/dashboard`，`app/dashboard/invoices/page.tsx` 对应 `/dashboard/invoices`，嵌套关系直接映射成 URL 的层级。",
        "但文件夹本身**不产生路由**：只有当文件夹里放了 `page.tsx`，这个地址才可访问。所以 `app/ui/`、`app/lib/` 里没有 `page.tsx`，它们不会变成 `/ui`、`/lib` 这样的网址，只用于组织代码。",
        "还有一组「约定文件名」，名字本身就是含义：`layout.tsx`（共享布局）、`loading.tsx`（加载态）、`error.tsx`（错误兜底）、`not-found.tsx`（404 页面）、`route.ts`（HTTP 接口）。第 4、9、12 章会陆续用到它们。",
        "方括号表示**动态路由段**：`app/chapters/[slug]/page.tsx` 会匹配 `/chapters/任意一段`。你现在看的这一页就是它渲染的。",
      ],
      check:
        "打开 `app/` 逛一圈，能说出 `/`、`/chapters/streaming`、`/query` 分别由哪个文件生成。",
    },
    {
      title: "app/ui/ 与 app/lib/ 的分工（colocation）",
      why: "课程里大量代码已经按这套约定放好了，先认识它，你才知道后面该去哪个文件里找东西、新建的文件该放哪。",
      explain: [
        "课程遵循一个简单分工：`app/ui/` 放**界面组件**（卡片、表格、侧边栏、骨架屏……），`app/lib/` 放**数据与逻辑**（数据库查询、类型定义、工具函数）。",
        "这背后是 App Router 的 **colocation（就近放置）** 思想：你可以把组件、样式、测试文件与路由文件放在同一个文件夹里，只有 `page.tsx` 这类特殊文件名才会变成路由，所以 `app/ui/` 下那二十多个组件并不会产生一堆网址。",
        "另外，同一个文件既可以在服务端运行、也可以被 `'use client'` 标记为客户端组件 —— 第 5 章会正式遇到这个区别，现在先知道「组件放在哪」就够了。",
      ],
      check:
        "能立刻回答：侧边栏组件、数据库类型定义、金额格式化函数分别在哪个目录里。",
    },
    {
      title: "public/ 与静态资源",
      why: "图片、图标这类不参与编译的文件需要一个约定位置，才能用固定地址稳定访问。",
      explain: [
        "`public/` 里的文件会**原样托管在网站根路径下**：`public/hero-desktop.png` 对应的网址就是 `/hero-desktop.png`，你可以直接在浏览器地址栏访问来验证。",
        "它适合放不会变化的资源：图片、`favicon.ico`、robots.txt 等。这些文件不会被构建工具改写，所以文件名要自己保证可读、可推断。",
        "课程需要的素材已经放进来了：hero 图（`hero-desktop.png`、`hero-mobile.png`）、客户头像（`public/customers/*.png`）。第 3 章你会用 `next/image` 引用它们。",
      ],
      check: "浏览器访问 `http://localhost:3000/hero-desktop.png` 能直接看到图片。",
    },
    {
      title: "TypeScript 与两个关键文件",
      why: "先知道「类型从哪来、假数据长什么样」，第 6 章播种数据库、第 7 章取数时才不会迷路。",
      explain: [
        "课程用 **TypeScript** 写。类型的作用很实际：字段名敲错、类型对不上时编辑器立刻报红，而不是等到运行时才炸。`app/lib/definitions.ts` 就是这个项目的类型清单，定义了 `User`、`Customer`、`Invoice`、`Revenue`、`InvoicesTable` 等类型，描述「数据库查出来的一行数据长什么样」。",
        "`app/lib/placeholder-data.ts` 是**手写的假数据**：发票、客户、收入、用户。第 6 章会用 `app/seed/route.ts` 把它写进真正的 Postgres 数据库 —— 在那之前，你的项目里没有任何数据库。",
        "`app/lib/data.ts` 是**真正执行 SQL 的地方**（第 7 章才开始用）。现在打开它，只需要看清它长什么样、那个 `sql` 变量是怎么来的，不必读懂每条查询。",
      ],
      code:
        "// app/lib/definitions.ts（节选，你项目里就是这个）\nexport type Invoice = {\n  id: string;\n  customer_id: string;\n  amount: number;\n  date: string;\n  // 字符串联合类型：status 只能是 'pending' 或 'paid' 之一\n  status: 'pending' | 'paid';\n};",
      check:
        "能说出 `Invoice` 有哪些字段，以及 `app/lib/placeholder-data.ts` 将来会被谁使用。",
    },
  ],
  tips: [
    "✅ 本项目的一次性准备已经全部做好了（课程素材已搬入、`clsx` / `@heroicons/react` / `postgres` / `bcrypt` / `@tailwindcss/forms` 已装好），只要在项目根跑 `npm install && npm run dev` 就能开工。",
    "3000 端口常被别的进程占用，`npm run dev` 会自动回退到 3001，以终端打印的地址为准。",
    "本项目是 Tailwind **v4**，官方文档是 v3。课程 starter 自定义的 Vercel 蓝与骨架屏 shimmer 动画，已用 v4 的 `@theme` / `@keyframes` 等价写进 `app/globals.css`；文档里「改 `tailwind.config.ts`」的步骤在本项目请改 `app/globals.css`。",
    "`app/lib/data.ts` 依赖 postgres、`app/seed/route.ts` 依赖 bcrypt，都已安装；但第 6 章配好数据库之前不要访问 `/seed`，会报连接错误。",
  ],
};
