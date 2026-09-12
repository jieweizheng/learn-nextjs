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
      why: "没有本地服务，后面每一步都验证不了。",
      explain: [
        "在项目根目录跑 `npm run dev`。官方教程用 `pnpm dev`，本项目统一用 npm，效果相同。",
        "终端会打印一行 `Local:` 地址，默认 `http://localhost:3000`，浏览器打开它。",
        "- 保存文件后页面自动热更新，通常不用手动刷新",
        "- `/` 在本项目是**章节清单主页**，不是官方那个无样式首页",
      ],
      code: "cd <项目目录>\nnpm run dev",
      check:
        "终端打印出 Local 地址，浏览器能打开页面；改动页面上的一个字并保存，页面自动更新。",
      pitfalls: [
        "3000 端口被占用时 Next 会顺延到 **3001**（甚至 3002），以终端**实际打印**的地址为准。",
        "报 `EADDRINUSE`：说明已有一个 dev server 在跑，先关掉旧的，不要同时开两个。",
      ],
    },
    {
      title: "app/ 目录：文件夹即路由",
      why: "看不懂目录，就不知道页面是从哪来的。",
      explain: [
        "`app/` 下每个文件夹是 URL 里的一段：`app/dashboard/page.tsx` → `/dashboard`。",
        "**只有放了 `page.tsx` 的文件夹才会产生可访问的地址** —— 所以 `app/ui/`、`app/lib/` 不会变成 `/ui`、`/lib`。",
        "约定文件名（名字即含义）：",
        "- `layout.tsx` 共享布局",
        "- `loading.tsx` 加载态",
        "- `error.tsx` 错误兜底",
        "- `not-found.tsx` 404 页面",
        "- `route.ts` HTTP 接口",
        "方括号是动态段：`app/chapters/[slug]/page.tsx` 匹配 `/chapters/任意一段` —— 你现在看的这页就是它。",
      ],
      check:
        "打开 `app/` 逛一圈，能说出 `/`、`/chapters/streaming`、`/query` 分别由哪个文件生成。",
    },
    {
      title: "app/ui/ 与 app/lib/ 的分工（colocation）",
      why: "知道去哪找东西、新建的文件放哪。",
      explain: [
        "- `app/ui/` 放界面组件：卡片、表格、侧边栏、骨架屏……",
        "- `app/lib/` 放数据与逻辑：数据库查询、类型定义、工具函数",
        "这叫 **colocation（就近放置）**：除 `page.tsx` 等特殊文件名外，其他文件都不会变成路由，所以 `app/ui/` 下二十多个组件不会产生一堆网址。",
      ],
      check:
        "能立刻回答：侧边栏组件、数据库类型定义、金额格式化函数分别在哪个目录里。",
    },
    {
      title: "public/ 与静态资源",
      why: "图片、图标这类不参与编译的文件需要固定位置，才能用稳定地址访问。",
      explain: [
        "`public/` 里的文件原样托管在网站根路径下：`public/hero-desktop.png` → `/hero-desktop.png`。",
        "适合放不会变的资源：图片、`favicon.ico`、robots.txt。它们不被构建改写，文件名要自己保证可读。",
        "课程素材已就位：`public/hero-desktop.png`、`public/hero-mobile.png`、`public/customers/*.png`，第 3 章用 `next/image` 引用。",
      ],
      check: "浏览器访问 `http://localhost:3000/hero-desktop.png` 能直接看到图片。",
    },
    {
      title: "TypeScript 与两个关键文件",
      why: "先知道「类型从哪来、假数据长什么样」，第 6、7 章才不会迷路。",
      explain: [
        "`app/lib/definitions.ts` 是**类型清单**：描述数据库查出来的一行数据长什么样（`User`、`Customer`、`Invoice`、`Revenue` 等）。字段名敲错、类型对不上时编辑器立刻报红。",
        "`app/lib/placeholder-data.ts` 是**手写假数据**。第 6 章用 `app/seed/route.ts` 把它写进 Postgres —— 在那之前项目里没有数据库。",
        "`app/lib/data.ts` 是**执行 SQL 的地方**（第 7 章才用）。现在只需看清 `sql` 变量怎么来的，不必读懂每条查询。",
      ],
      code:
        "// app/lib/definitions.ts（节选，你项目里就是这个）\nexport type Invoice = {\n  id: string;\n  customer_id: string;\n  amount: number;\n  date: string;\n  // 字符串联合类型：status 只能是 'pending' 或 'paid' 之一\n  status: 'pending' | 'paid';\n};",
      check:
        "能说出 `Invoice` 有哪些字段，以及 `app/lib/placeholder-data.ts` 将来会被谁使用。",
    },
  ],
  tips: [
    "✅ 一次性准备已全部做好（素材已搬入、依赖已装），只要在项目根跑 `npm install && npm run dev` 就能开工。",
    "3000 端口被占用时会自动回退到 3001，以终端打印的地址为准。",
    "本项目是 Tailwind **v4**，官方是 v3。文档里「改 `tailwind.config.ts`」的步骤在本项目请改 `app/globals.css`。",
    "`app/lib/data.ts` 依赖 postgres、`app/seed/route.ts` 依赖 bcrypt，都已安装；但第 6 章配好数据库之前不要访问 `/seed`，会报连接错误。",
  ],
};
