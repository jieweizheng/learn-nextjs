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
    "理解嵌套布局与「部分渲染」：导航时布局不会被重新渲染",
  ],
  points: [
    {
      title: "文件系统路由：文件夹就是 URL",
      why: "这是 App Router 最核心的约定，理解了它，你就能「看一眼目录就知道网站有哪些页面」。",
      explain: [
        "App Router 用**文件系统**描述路由：目录层级 = URL 层级。`app/dashboard/page.tsx` → `/dashboard`；`app/dashboard/customers/page.tsx` → `/dashboard/customers`。",
        "再次强调两条边界：**只有 `page.tsx` 才能让地址可访问**（光建文件夹访问不到），**`layout.tsx` 负责共享外壳而不是页面内容**。",
        "`app/` 里所有非路由文件（组件、工具函数、样式）都可以和路由文件放在一起，这是前面提过的 colocation。",
      ],
      check: "在纸上画出 `/dashboard/invoices` 对应的文件路径，以及它沿途会遇到哪些 `layout.tsx`。",
    },
    {
      title: "创建 dashboard 页面",
      why: "先做出一个最小可访问页面，后面每一步优化才有东西可改。",
      explain: [
        "新建 `app/dashboard/page.tsx`，导出一个默认函数组件，先返回一段最简单的文字：`<p>Dashboard Page</p>`。约定是**默认导出**，这是 Next.js 识别页面的方式。",
        "保存后访问 `/dashboard`，你会看到这段文字。因为开发服务器开着，Turbopack 会立刻编译新文件，不需要重启。",
        "⚠️ 本课程的实际路径就是 `app/dashboard/`，与本项目的练习区域约定一致：**第 4 章起，你的练习代码就写在 `app/dashboard/` 下**（第 2–3 章在 `app/playground/`）。",
      ],
      code:
        "// app/dashboard/page.tsx\nexport default function Page() {\n  return <p>Dashboard Page</p>;\n}",
      check: "访问 `http://localhost:3000/dashboard`（或 3001）能看到 `Dashboard Page`。",
    },
    {
      title: "练习：再创建 customers 与 invoices 两个页面",
      why: "路由是「练出来」的，多建两个页面，你对嵌套关系的直觉会立刻建立。",
      explain: [
        "照上面的写法再建两个：`app/dashboard/customers/page.tsx` 与 `app/dashboard/invoices/page.tsx`，各返回一段文字。",
        "访问 `/dashboard/customers` 和 `/dashboard/invoices` 验证。你会发现三个页面虽然各自独立，但**共享了 `/dashboard` 这一段** —— 这正是下一步要利用的结构。",
      ],
      code:
        "// app/dashboard/customers/page.tsx\nexport default function Page() {\n  return <p>Customers Page</p>;\n}\n\n// app/dashboard/invoices/page.tsx\nexport default function Page() {\n  return <p>Invoices Page</p>;\n}",
      check: "三个地址都能正常访问，且互不影响。",
    },
    {
      title: "用 layout.tsx 让多个页面共享 UI",
      why: "侧边栏、导航这类外壳在每个页面都一样，重复写既啰嗦又容易改漏 —— 布局就是为它准备的。",
      explain: [
        "`layout.tsx` 导出的组件会接收一个 `children` 属性（就是它包裹的那个页面），你把共享的外壳写在这里、把 `{children}` 放在内容位置即可。",
        "课程让你在 `app/dashboard/layout.tsx` 里引入课程已经写好的 `<SideNav />` 组件（在 `app/ui/dashboard/sidenav.tsx`），让 dashboard 下的页面都带上侧边栏。",
        "布局是**嵌套**的：`app/layout.tsx`（根布局）包住 `app/dashboard/layout.tsx`，后者再包住 `/dashboard/*` 的每个页面。所以根布局里的 `<html>`、`<body>` 只写一次，全站共用。",
      ],
      code:
        "// app/dashboard/layout.tsx\nimport SideNav from '@/app/ui/dashboard/sidenav';\n\nexport default function Layout({ children }: { children: React.ReactNode }) {\n  return (\n    <div className=\"flex h-screen flex-col md:flex-row md:overflow-hidden\">\n      <div className=\"w-full flex-none md:w-64\">\n        <SideNav />\n      </div>\n      <div className=\"flex-grow p-6 md:overflow-y-auto md:p-12\">{children}</div>\n    </div>\n  );\n}",
      check: "访问 `/dashboard`、`/dashboard/customers`、`/dashboard/invoices` 都能看到侧边栏，且页面内容出现在右侧区域。",
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
    "本章开始，练习代码写在 `app/dashboard/` 下 —— 与官方路径完全一致，后续章节可以直接对照文档。",
    "⛔ 不要动工作台本体：`app/page.tsx`、`app/chapters/[slug]/page.tsx`、`components/`、`lib/chapters/`。",
  ],
};
