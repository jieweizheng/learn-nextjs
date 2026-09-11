import type { Chapter } from "./types";

export const chapter09: Chapter = {
  num: 9,
  slug: "streaming",
  title: "Streaming",
  titleZh: "流式渲染",
  officialUrl: "https://nextjs.org/learn/dashboard-app/streaming",
  summary:
    "用 `loading.tsx` 与 `<Suspense>` 把页面拆成小块流式发送，配合骨架屏，让用户先看到能看的部分。",
  goals: [
    "理解流式渲染解决了什么问题",
    "会用 `loading.tsx` 做整页级加载态",
    "会用 `<Suspense>` 做组件级流式",
    "会用路由组 `(overview)` 限定加载态的作用范围",
    "认识课程提供的骨架屏组件",
  ],
  points: [
    {
      title: "流式渲染：把页面「边算边发」",
      why: "这是对第 8 章那个「整页等待」问题的正解，也是 App Router 体验上最大的优势之一。",
      explain: [
        "传统做法是「全部渲染完，一次性发出 HTML」。**流式渲染（Streaming）**则把页面拆成若干块，**算好一块就先发一块**，浏览器收到就立刻渲染。",
        "于是慢的部分不再是「拦路虎」：页面外壳、导航、快的组件先显示，慢的组件稍后替换进来，中间用**占位内容**（fallback）顶着。用户感知到的等待时间大幅缩短，而且能看到进度在推进，而不是一片空白。",
        "在 App Router 里这不需要什么特殊配置：**用一个 `<Suspense>` 边界包住慢的部分**，Next.js 就会把边界之外的内容先流式发出。边界内还没好的部分，先渲染 `fallback`。",
      ],
      check: "能用「先看到壳、慢的部分后到、中间有个占位」描述流式渲染，并说出它依赖 `<Suspense>` 边界。",
    },
    {
      title: "用 loading.tsx 做整页加载态",
      why: "这是最省事的流式入口：一个文件就能给整个路由段加上加载态。",
      explain: [
        "在路由段目录里放一个 `loading.tsx`，导出一个默认组件。Next.js 会自动用它包成一个 `<Suspense>` 边界：**当这一段的内容还没就绪时，先显示它**。",
        "课程让你在 `app/dashboard/loading.tsx` 里先返回一句简单的 `<div>Loading...</div>`。注意观察效果：**侧边栏会立即出现**，只有右侧内容区先显示 Loading —— 因为布局不属于这个 loading 边界（布局在更外层，早就渲染好了）。",
        "一旦页面数据到齐，`loading.tsx` 的内容会被真实页面**替换**掉（不是叠加）。",
      ],
      code:
        "// app/dashboard/loading.tsx\nexport default function Loading() {\n  return <div>Loading...</div>;\n}",
      check: "刷新 `/dashboard` 时侧边栏立刻出现，右侧先短暂显示 Loading，然后被真实内容替换。",
    },
    {
      title: "把 Loading 换成骨架屏",
      why: "「Loading...」只告诉用户在等，骨架屏能顺便告诉他「等的是什么形状」，主观感受差别很大。",
      explain: [
        "**骨架屏（skeleton）**是用灰色占位块模拟页面最终布局的加载态。用户在等待时就能预判内容的位置与数量，切换时不会「跳一下」，这叫**感知性能**的优化。",
        "课程已经在 `app/ui/skeletons.tsx` 里准备好了整套骨架屏：`CardSkeleton`、`CardsSkeleton`、`RevenueChartSkeleton`、`LatestInvoicesSkeleton`、`InvoicesTableSkeleton`，以及整页用的 **`DashboardSkeleton`**（默认导出）。",
        "把 `loading.tsx` 的内容换成 `<DashboardSkeleton />` 即可。本项目还额外配置了骨架屏的 **shimmer 动画**（在 `app/globals.css` 里，用 Tailwind v4 的 `@keyframes` 写的），所以占位块会有一点流动的光效。",
      ],
      code:
        "// app/dashboard/loading.tsx\nimport DashboardSkeleton from '@/app/ui/skeletons';\n\nexport default function Loading() {\n  return <DashboardSkeleton />;\n}",
      check: "加载时看到的占位块与最终页面布局基本一一对应（卡片位置、图表位置都对得上）。",
    },
    {
      title: "用路由组 (overview) 限定加载态的范围",
      why: "`loading.tsx` 的作用范围是「它所在的整个路由段」，而 dashboard 下还有 invoices 等子页面 —— 需要把范围收窄。",
      explain: [
        "`loading.tsx` 放在 `app/dashboard/` 下，会影响 `/dashboard` **以及它所有子路由**（比如 `/dashboard/invoices`）。但 invoices 页面将来会有自己的加载态，共享一个 dashboard 骨架屏显然不对。",
        "解决办法是**路由组**：新建文件夹 `app/dashboard/(overview)/`（**加圆括号**），把 `page.tsx` 与 `loading.tsx` 一起移进去。",
        "圆括号是路由组的标记：**文件夹名不进入 URL**，只是「打包分组」。所以 `/dashboard` 的地址不变，但这个 loading 现在只作用于概览页。你可以类比：`(overview)` 是一个不产生路径的「容器」，用来给一组路由共享某些约定文件。",
      ],
      code:
        "app/dashboard/\n├── (overview)/\n│   ├── page.tsx          ← 概览页，访问 /dashboard\n│   └── loading.tsx       ← 只作用于概览页\n├── customers/page.tsx\n├── invoices/page.tsx\n└── layout.tsx",
      check: "访问 `/dashboard` 会看到骨架屏；而 `/dashboard/invoices`（目前还是你第 4 章建的简单页面）不再被这个骨架屏影响。",
      pitfalls: [
        "写成 `(overview)` 时用小括号，写错成 `[overview]` 会变成动态路由，地址都会变。",
        "移动 `page.tsx` 后要确认 `/dashboard` 还能打开 —— 如果打不开，多半是文件没跟着 `loading.tsx` 一起移动。",
      ],
    },
    {
      title: "组件级流式：把取数下推到组件里 + Suspense",
      why: "整页 loading 仍是「全都有才出现」的粗粒度方案；真正好用的是让页面各部分各自就绪。",
      explain: [
        "思路分两步：**把取数从页面下移到真正需要它的组件**，让组件自己 `await`；**再用 `<Suspense>` 把该组件包起来**，并给一个 `fallback`。这样页面其余部分不必等它。",
        "具体到课程：把 `app/dashboard/(overview)/page.tsx` 里的 `await fetchRevenue()` 删掉，改成在 `RevenueChart` 组件内部取数（组件变成 `async`）；页面里用 `<Suspense fallback={<RevenueChartSkeleton />}><RevenueChart /></Suspense>` 包裹它。",
        "效果：页面外壳与卡片**立刻**出现，只有图表位置先显示骨架屏，3 秒后再变成图表 —— 即使收入查询很慢，也不再拖累整页。",
        "这就是官方反复强调的通用建议：**把数据获取下移到真正需要它的组件，然后用 Suspense 包住那个组件。** 记住这条，你就掌握了流式渲染的用法。",
      ],
      code:
        "// app/dashboard/(overview)/page.tsx\nimport { Suspense } from 'react';\nimport { RevenueChartSkeleton } from '@/app/ui/skeletons';\n\n<Suspense fallback={<RevenueChartSkeleton />}>\n  <RevenueChart />\n</Suspense>\n\n// app/ui/dashboard/revenue-chart.tsx\nimport { fetchRevenue } from '@/app/lib/data';\n\nexport default async function RevenueChart() {\n  const revenue = await fetchRevenue();\n  return (/* ...用 revenue 渲染图表... */);\n}",
      check: "刷新页面：卡片与外壳立即出现，只有图表位置先显示骨架屏，随后图表补上。",
    },
    {
      title: "练习：用 Suspense 流式渲染 LatestInvoices",
      why: "同一个套路再走一遍，直到它变成本能。",
      explain: [
        "把 `fetchLatestInvoices()` 从页面下移到 `app/ui/dashboard/latest-invoices.tsx` 组件内部，删掉它接收入参的部分。",
        "在页面里用 `<Suspense fallback={<LatestInvoicesSkeleton />}><LatestInvoices /></Suspense>` 包裹它，`LatestInvoicesSkeleton` 同样来自 `app/ui/skeletons.tsx`。",
        "现在页面上有两个独立的 Suspense 边界：谁先就绪谁先出现，互不等待。",
      ],
      check: "两个区块各自独立地「先骨架、后内容」，其中一个慢不会拖住另一个。",
    },
    {
      title: "分组卡片：避免四张卡片逐张闪现",
      why: "Suspense 用多了会「碎」：每个边界独立就绪，反而让界面不停跳动；有时应把多个慢组件当一个整体。",
      explain: [
        "如果给四张卡片各包一个 `<Suspense>`，它们会随各自数据到达时间**逐张闪现**。视觉上很碎，用户还会来回扫视。",
        "课程的做法是用 **`<CardWrapper />`** 把四张卡片包成一组，然后只在外面包**一个** `<Suspense fallback={<CardsSkeleton />}>`。这样它们要么一起是骨架，要么一起出现，节奏干净。",
        "这是 Suspense 使用上的一个重要判断：**边界粒度要与用户的认知单位对齐**。整块一起变化就用一个边界；确实独立、快慢差别大的部分才拆开。",
      ],
      code:
        "// app/dashboard/(overview)/page.tsx\n<Suspense fallback={<CardsSkeleton />}>\n  <CardWrapper />\n</Suspense>",
      check: "四张卡片同时从骨架变成内容，没有逐张弹出的现象。",
    },
  ],
  tips: [
    "流式的两条经验：**取数下推到真正用它的组件**、**用 Suspense 给出合适的边界粒度**。",
    "做完本章，别忘了回到 `fetchRevenue()` 把演示用的 `setTimeout` 注释掉，否则页面永远慢 3 秒。",
    "骨架屏不是万能的：切换太快时反而会「闪一下」，所以边界别切得太碎。",
  ],
};
