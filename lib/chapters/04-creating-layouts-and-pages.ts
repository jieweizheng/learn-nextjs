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
      why: "这是 App Router 最核心的约定，理解了它，你就能「看一眼目录就知道网站有哪些页面」。",
      explain: [
        "App Router 用**文件系统**描述路由：目录层级 = URL 层级。`app/dashboard/page.tsx` → `/dashboard`；`app/dashboard/customers/page.tsx` → `/dashboard/customers`。本项目里已经有一个现成的例子：`app/page.tsx` 对应根路径 `/`（就是你现在看的工作台清单主页）。",
        "再次强调两条边界：**只有 `page.tsx` 才能让地址可访问**（光建文件夹访问不到），**`layout.tsx` 负责共享外壳而不是页面内容**。",
        "`app/` 里所有非路由文件（组件、工具函数、样式）都可以和路由文件放在一起，这是前面提过的 colocation。",
      ],
      check: "在纸上画出 `/dashboard/invoices` 对应的文件路径，以及它沿途会遇到哪些 `layout.tsx`。",
    },
    {
      title: "创建 dashboard 页面",
      why: "先做出一个最小可访问页面，后面每一步优化才有东西可改。",
      explain: [
        "在 `app/` 下新建 `dashboard` 文件夹，再在里面新建 `page.tsx`。**要建的路径是 `app/dashboard/page.tsx` —— 中间没有 `ui` 那一层。**",
        "文件里导出一个默认函数组件，先返回一段最简单的文字：`<p>Dashboard Page</p>`。约定是**默认导出**，这是 Next.js 识别页面的方式。",
        "保存后访问 `/dashboard`，你会看到这段文字。因为开发服务器开着，Turbopack 会立刻编译新文件，不需要重启。",
        "⚠️ 本课程的实际路径就是 `app/dashboard/`，与本项目的练习区域约定一致：**第 4 章起，你的练习代码就写在 `app/dashboard/` 下**（第 2–3 章在 `app/playground/`）。",
      ],
      code:
        "// app/dashboard/page.tsx\nexport default function Page() {\n  return <p>Dashboard Page</p>;\n}",
      check:
        "访问 `http://localhost:3000/dashboard`（或 3001）能看到 `Dashboard Page`。若这里返回 404，先回头确认文件是不是误建在了 `app/ui/dashboard/` 下 —— 那样地址会变成 `/ui/dashboard`。",
      pitfalls: [
        "⛔ **别把页面建到 `app/ui/dashboard/` 里。** 那是**组件**目录（`app/ui/dashboard/sidenav.tsx`、`app/ui/dashboard/cards.tsx`、`app/ui/dashboard/nav-links.tsx`…）。`app/ui/` 只是和路由同置的普通文件夹，但**一旦你真的往里塞一个 `page.tsx`，Next.js 会照常把它变成真实路由** —— 你能访问 `/ui/dashboard`，而要的 `/dashboard` 依旧是 404。页面必须在 `app/dashboard/` 下。",
        "页面文件必须**默认导出**一个组件（`export default function Page()`）。只贴一段裸 JSX（比如那行 `<div className=\"...\" />`）会报 `Property 'default' is missing` —— 示例里的片段要放进组件的 `return (...)` 里。",
      ],
    },
    {
      title: "练习：再创建 customers 与 invoices 两个页面",
      why: "路由是「练出来」的，多建两个页面，你对嵌套关系的直觉会立刻建立。",
      explain: [
        "照上面的写法再建两个：`app/dashboard/customers/page.tsx` 与 `app/dashboard/invoices/page.tsx`，各返回一段文字。",
        "访问 `/dashboard/customers` 和 `/dashboard/invoices` 验证。你会发现三个页面虽然各自独立，但**共享了 `/dashboard` 这一段** —— 这正是下一步要利用的结构。",
      ],
      code:
        "// app/dashboard/customers/page.tsx\nexport default function Page() {\n  return <p>Customers Page</p>;\n}\n\n// app/dashboard/invoices/page.tsx\nexport default function Page() {\n  return <p>Invoices Page</p>;\n}\n\n/* 做完这两页之后，目录与路由的对应关系长这样：\n\napp/\n  dashboard/\n    customers/page.tsx  →  /dashboard/customers\n    invoices/page.tsx   →  /dashboard/invoices\n    page.tsx            →  /dashboard\n\n（此时还没有 layout.tsx —— 那是下一步。） */",
      check: "三个地址都能正常访问，且互不影响。",
    },
    {
      title: "用 layout.tsx 让多个页面共享 UI",
      why: "侧边栏、导航这类外壳在每个页面都一样，重复写既啰嗦又容易改漏 —— 布局就是为它准备的。",
      explain: [
        "`layout.tsx` 导出的组件会接收一个 `children` 属性 —— 它可能是**一个页面**，也可能是**更深一层的布局**。你把共享的外壳写在这里、把 `{children}` 放在内容位置即可。",
        "注意：**凡是你在布局里 import 的组件，都会成为这个布局的一部分**（对 `/dashboard/*` 下所有页面生效）。所以 `<SideNav />` 被引进来之后，它就成了 dashboard 的公共导航。",
        "课程让你在 `app/dashboard/layout.tsx` 里引入课程已经写好的 `<SideNav />` 组件（在 `app/ui/dashboard/sidenav.tsx`），让 dashboard 下的页面都带上侧边栏。",
        "布局是**嵌套**的：`app/layout.tsx`（根布局）包住 `app/dashboard/layout.tsx`，后者再包住 `/dashboard/*` 的每个页面。所以根布局里的 `<html>`、`<body>` 只写一次，全站共用。",
      ],
      code:
        "// app/dashboard/layout.tsx\nimport SideNav from '@/app/ui/dashboard/sidenav';\n\nexport default function Layout({ children }: { children: React.ReactNode }) {\n  return (\n    <div className=\"flex h-screen flex-col md:flex-row md:overflow-hidden\">\n      <div className=\"w-full flex-none md:w-64\">\n        <SideNav />\n      </div>\n      <div className=\"grow p-6 md:overflow-y-auto md:p-12\">{children}</div>\n    </div>\n  );\n}",
      check: "访问 `/dashboard`、`/dashboard/customers`、`/dashboard/invoices` 都能看到侧边栏，且页面内容出现在右侧区域。",
    },
    {
      title: "根布局：`app/layout.tsx` 是全站唯一、且必需的布局",
      why: "根布局是唯一能改 `<html>` / `<body>` 的地方，字体、全局样式、metadata 都挂在它身上；分不清「根布局」和「嵌套布局」，后面做主题和 SEO 会乱。",
      explain: [
        "**根布局**（root layout）是应用最外层、且**必需**的布局，位置固定为 `app/layout.tsx`。它作用于**所有**页面：在这里加的 UI 全站可见，`<html>`、`<body>` 标签也只能在这里改，字体、全局样式、metadata 都挂在它身上（第 3 章、第 15 章分别对应后两者）。",
        "它和本步创建的 `app/dashboard/layout.tsx` 是**嵌套**关系：根布局在最外层 → dashboard 布局在它里面 → 再往里才是 `/dashboard/*` 的页面。官方文档特别提醒：新布局只服务于 dashboard，**根布局不需要为它加任何 UI**（也别把侧边栏挪上去）。",
        "本项目里 `app/layout.tsx` 已经写好了：导入 `app/globals.css`、把 `inter` 字体和 `antialiased` 加到 `<body>` 上、并设置了站点 metadata（标题模板是「%s | Next.js 学习之旅」）。你**不用改**它，只要理解「这几件事为什么都放在这里」。",
        "⚠️ 官方文档那一节的示例里导入的是 app/ui/global.css，本项目没有这个文件，对应物是 `app/globals.css`（第 2 章讲过这个差异）。",
      ],
      code:
        "// app/layout.tsx（本项目现状，节选）\nimport \"./globals.css\";\nimport { inter } from \"@/app/ui/fonts\";\nimport clsx from \"clsx\";\n\nexport const metadata = {\n  title: { template: \"%s | Next.js 学习之旅\", default: \"Next.js 学习之旅\" },\n};\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang=\"zh-CN\">\n      <body className={clsx(\"min-h-screen bg-slate-50 text-slate-900 antialiased\", inter.className)}>\n        {children}\n      </body>\n    </html>\n  );\n}",
      check: "能说出根布局与 dashboard 布局的三点区别（谁必需、作用范围、能不能改 `<html>`/`<body>`），并指出本项目根布局里挂了哪几件事。",
    },
    {
      title: "部分渲染：为什么导航时布局不重新渲染",
      why: "这是理解「为什么 Next.js 应用导航快、还能保住状态」的关键，也解释了第 5 章 `<Link>` 的价值。",
      explain: [
        "在 Next.js 里，导航到同一布局下的另一个页面时，**只有页面部分会重新渲染，布局保持不动**。这个特性叫 **partial rendering（部分渲染）**。",
        "官方把这件事和「布局 vs 页面」的关系说得很直白：布局是最上层共享的 UI，页面是**独有的** UI。共享的东西不重复渲染，也就不会重复请求、重复刷新，滚动位置与组件状态也能保住。",
        "可以这样验证：在侧边栏区域随便做点交互（比如滚动），再点击导航切换页面，你会发现布局部分没有任何「闪一下」的重新渲染。",
      ],
      check: "能从「共享 vs 独有」的角度解释布局与页面的区别，并说出部分渲染带来的两个好处。",
      pitfalls: [
        "不要在布局里写「只有某个页面才需要」的逻辑（例如读取某个页面的查询参数）—— 布局是共享的，可能导致意外行为；这类逻辑应放在页面或组件里。",
      ],
    },
  ],
  tips: [
    "官方 starter 里 `app/ui/dashboard/` 下已经备好了侧边栏、导航、卡片等组件，直接 import 用即可，本章不需要自己写样式。",
    "⚠️ 正因为 `app/ui/dashboard/` 这个目录**已经存在**（装着组件），很容易顺手把 `page.tsx` 建到它里面去 —— 那就错了，路由会变成 `/ui/dashboard`。新建页面时认准 `app/dashboard/`。",
    "本章开始，练习代码写在 `app/dashboard/` 下 —— 与官方路径完全一致，后续章节可以直接对照文档。",
    "📌 侧边栏顶部那个 Acme logo 链接指向 `/`。官方课程里 `/` 是 starter 的落地页，本项目里 `/` 是**工作台清单主页**，所以点它会回到章节清单，这是正常的、也是故意的。",
    "📌 侧边栏里的三个链接（`app/ui/dashboard/nav-links.tsx`）正好对应本章创建的三个路由：`/dashboard`、`/dashboard/invoices`、`/dashboard/customers`。它们现在用的是原生 `<a>` 标签，第 5 章会换成 `<Link>`。",
    "⛔ 不要动工作台本体：`app/page.tsx`、`app/chapters/[slug]/page.tsx`、`components/`、`lib/chapters/`。",
  ],
};
