import type { Chapter } from "./types";

export const chapter04: Chapter = {
  num: 4,
  slug: "creating-layouts-and-pages",
  title: "Creating Layouts and Pages",
  titleZh: "创建布局与页面",
  officialUrl:
    "https://nextjs.org/learn/dashboard-app/creating-layouts-and-pages",
  summary:
    "用「文件夹即路由」创建 dashboard 的页面，再用嵌套布局让多个页面共享同一套 UI。",
  goals: [
    "理解文件系统路由：文件夹 = 路由段，`page.tsx` 才让地址可访问",
    "会创建页面并访问它",
    "会用 `layout.tsx` 在多个页面之间共享 UI",
    "分清「根布局」与「嵌套布局」：谁必需、作用范围有多大",
    "理解嵌套布局与「部分渲染」：导航时布局不会被重新渲染",
  ],
  points: [
    {
      title: "文件系统路由：文件夹就是 URL",
      why: "这条约定决定了「看一眼目录就知道有哪些页面」。",
      explain: [
        "目录层级 = URL 层级：",
        "- `app/page.tsx` → `/`（本项目的工作台清单主页）",
        "- `app/dashboard/page.tsx` → `/dashboard`",
        "- `app/dashboard/customers/page.tsx` → `/dashboard/customers`",
        "两条边界：**只有 `page.tsx` 才能让地址可访问**（光建文件夹没用）；**`layout.tsx` 是共享外壳，不是页面内容**。",
      ],
      check: "在纸上画出 `/dashboard/invoices` 对应的文件路径，以及它沿途会遇到哪些 `layout.tsx`。",
    },
    {
      title: "创建 dashboard 页面",
      why: "先有个最小可访问页面，后面才有东西可改。",
      explain: [
        "在 `app/` 下新建 `dashboard` 文件夹，再建 `page.tsx` —— **路径是 `app/dashboard/page.tsx`，中间没有 `ui` 那一层**。",
        "导出一个默认函数组件，先返回 `<p>Dashboard Page</p>`。默认导出是 Next.js 识别页面的方式。",
        "保存后访问 `/dashboard` 即可看到（dev server 开着会热更新，不用重启）。",
        "📌 第 4 章起，练习代码写在 `app/dashboard/` 下（第 2–3 章在 `app/playground/`）。",
      ],
      code:
        "// app/dashboard/page.tsx\nexport default function Page() {\n  return <p>Dashboard Page</p>;\n}",
      check:
        "访问 `http://localhost:3000/dashboard`（或 3001）能看到 `Dashboard Page`。若是 404，先确认文件是不是误建在 `app/ui/dashboard/` 下 —— 那样地址会变成 `/ui/dashboard`。",
      pitfalls: [
        "⛔ **别把页面建到 `app/ui/dashboard/` 里。** 那是组件目录（`app/ui/dashboard/sidenav.tsx`、`app/ui/dashboard/cards.tsx`、`app/ui/dashboard/nav-links.tsx`…）。虽然 `app/ui/` 本身不是路由，但**一旦往里塞 `page.tsx`，Next 照常把它变成真实路由** —— 你能访问 `/ui/dashboard`，而 `/dashboard` 依旧 404。",
        "页面必须**默认导出**组件。只贴一段裸 JSX 会报 `Property 'default' is missing`。",
      ],
    },
    {
      title: "练习：再创建 customers 与 invoices 两个页面",
      why: "多建两个，嵌套关系的直觉立刻建立。",
      explain: [
        "照上面的写法再建两个：`app/dashboard/customers/page.tsx` 与 `app/dashboard/invoices/page.tsx`，各返回一段文字。",
        "访问 `/dashboard/customers` 和 `/dashboard/invoices` 验证。三者互相独立，但**共享 `/dashboard` 这一段** —— 下一步就利用这个结构。",
      ],
      code:
        "// app/dashboard/customers/page.tsx\nexport default function Page() {\n  return <p>Customers Page</p>;\n}\n\n// app/dashboard/invoices/page.tsx\nexport default function Page() {\n  return <p>Invoices Page</p>;\n}\n\n/* 做完这两页之后，目录与路由的对应关系长这样：\n\napp/\n  dashboard/\n    customers/page.tsx  →  /dashboard/customers\n    invoices/page.tsx   →  /dashboard/invoices\n    page.tsx            →  /dashboard\n\n（此时还没有 layout.tsx —— 那是下一步。） */",
      check: "三个地址都能正常访问，且互不影响。",
    },
    {
      title: "用 layout.tsx 让多个页面共享 UI",
      why: "侧边栏、导航这类外壳每个页面都一样，重复写既啰嗦又容易改漏。",
      explain: [
        "`layout.tsx` 接收 `children` —— 它可能是**一个页面**，也可能是**更深一层的布局**。把共享外壳写在这里、`{children}` 放在内容位置。",
        "**布局里 import 的组件会成为布局的一部分**，对 `/dashboard/*` 下所有页面生效。",
        "动手：在 `app/dashboard/layout.tsx` 引入 `app/ui/dashboard/sidenav.tsx` 里的 `<SideNav />`。",
        "布局是**嵌套**的：`app/layout.tsx` 包住 `app/dashboard/layout.tsx`，后者再包住各页面。所以 `<html>`、`<body>` 只写一次。",
      ],
      code:
        "// app/dashboard/layout.tsx\nimport SideNav from '@/app/ui/dashboard/sidenav';\n\nexport default function Layout({ children }: { children: React.ReactNode }) {\n  return (\n    <div className=\"flex h-screen flex-col md:flex-row md:overflow-hidden\">\n      <div className=\"w-full flex-none md:w-64\">\n        <SideNav />\n      </div>\n      <div className=\"grow p-6 md:overflow-y-auto md:p-12\">{children}</div>\n    </div>\n  );\n}",
      check: "`/dashboard`、`/dashboard/customers`、`/dashboard/invoices` 都能看到侧边栏，页面内容在右侧区域。",
    },
    {
      title: "根布局：`app/layout.tsx` 是全站唯一、且必需的布局",
      why: "根布局是唯一能改 `<html>` / `<body>` 的地方，字体、全局样式、metadata 都挂它身上。",
      explain: [
        "根布局位置固定为 `app/layout.tsx`，**必需**，作用于所有页面：",
        "- 只有它能写 `<html>`、`<body>`",
        "- 字体（第 3 章）、全局样式（第 2 章）、metadata（第 15 章）都挂在这里",
        "它与 `app/dashboard/layout.tsx` 是**嵌套**关系：根布局 → dashboard 布局 → 页面。官方特别提醒：新布局只服务 dashboard，**根布局不需要为它加任何 UI**。",
        "本项目 `app/layout.tsx` 已写好（导入 `app/globals.css`、`inter` 字体、站点 metadata），**不用改**，理解「为什么这几件事都放这儿」即可。",
      ],
      note: "官方那一节示例导入的是 app/ui/ 下的 global.css，本项目对应物是 `app/globals.css`（第 2 章讲过这个差异）。",
      code:
        "// app/layout.tsx（本项目现状，节选）\nimport \"./globals.css\";\nimport { inter } from \"@/app/ui/fonts\";\nimport clsx from \"clsx\";\n\nexport const metadata = {\n  title: { template: \"%s | Next.js 学习之旅\", default: \"Next.js 学习之旅\" },\n};\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang=\"zh-CN\">\n      <body className={clsx(\"min-h-screen bg-slate-50 text-slate-900 antialiased\", inter.className)}>\n        {children}\n      </body>\n    </html>\n  );\n}",
      check: "能说出根布局与 dashboard 布局的三点区别（谁必需、作用范围、能否改 `<html>`/`<body>`），并指出本项目根布局挂了哪几件事。",
    },
    {
      title: "部分渲染：为什么导航时布局不重新渲染",
      why: "这解释了「为什么导航快、状态还能保住」，也是第 5 章 `<Link>` 的价值所在。",
      explain: [
        "导航到同一布局下的另一个页面时，**只有页面部分重新渲染，布局保持不动** —— 这叫 **partial rendering（部分渲染）**。",
        "布局是最上层共享的 UI，页面是**独有**的 UI。共享的不重复渲染：不重复请求、不重复刷新，滚动位置与组件状态也能保住。",
        "验证：在侧边栏做点交互（比如滚动），再点导航切换页面，布局部分不会「闪一下」。",
      ],
      check: "能从「共享 vs 独有」解释布局与页面的区别，并说出部分渲染的两个好处。",
      pitfalls: [
        "不要在布局里写「只有某个页面才需要」的逻辑（例如读取某页面的查询参数）—— 布局是共享的；这类逻辑放页面或组件里。",
      ],
    },
  ],
  tips: [
    "官方 starter 里 `app/ui/dashboard/` 下已备好侧边栏、导航、卡片等组件，直接 import 用即可，本章不需要自己写样式。",
    "⚠️ 正因为 `app/ui/dashboard/` **已经存在**（装着组件），很容易顺手把 `page.tsx` 建进去 —— 那就错了，路由会变成 `/ui/dashboard`。认准 `app/dashboard/`。",
    "本章开始，练习代码写在 `app/dashboard/` 下，与官方路径一致。",
    "📌 侧边栏顶部 Acme logo 指向 `/`。本项目 `/` 是**工作台清单主页**，点它回到章节清单是正常的、故意的。",
    "📌 `app/ui/dashboard/nav-links.tsx` 里三个链接正好对应本章三个路由。它们现在用的是原生 `<a>`，第 5 章换成 `<Link>`。",
    "⛔ 不要动工作台本体：`app/page.tsx`、`app/chapters/[slug]/page.tsx`、`components/`、`lib/chapters/`。",
  ],
};
