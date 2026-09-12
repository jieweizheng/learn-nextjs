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
      why: "这是第 8 章「整页等待」的正解。",
      explain: [
        "传统做法是「全部渲染完，一次性发 HTML」。**流式渲染**把页面拆成块，**算好一块就先发一块**，浏览器收到立刻渲染。",
        "于是慢的部分不再是拦路虎：外壳、导航、快的组件先显示，慢的稍后替换进来，中间用 **fallback** 占位。",
        "用法不需要特殊配置：**用 `<Suspense>` 包住慢的部分**，Next 就会把边界之外的内容先发出去。",
      ],
      check: "能用「先看到壳、慢的部分后到、中间有个占位」描述流式渲染，并说出它依赖 `<Suspense>` 边界。",
    },
    {
      title: "用 loading.tsx 做整页加载态",
      why: "最省事的流式入口：一个文件就给整个路由段加加载态。",
      explain: [
        "在路由段目录放 `loading.tsx` 并默认导出组件，Next 自动用它包成 `<Suspense>` 边界：**这段内容没就绪时先显示它**。",
        "动手：在 `app/dashboard/loading.tsx` 里先返回 `<div>Loading...</div>`，观察效果 —— **侧边栏立即出现**（布局在更外层，早就渲染好了），只有右侧内容区先显示 Loading。",
        "数据到齐后，`loading.tsx` 的内容会被真实页面**替换**掉，不是叠加。",
      ],
      code:
        "// app/dashboard/loading.tsx\nexport default function Loading() {\n  return <div>Loading...</div>;\n}",
      check: "刷新 `/dashboard` 时侧边栏立刻出现，右侧先短暂显示 Loading，然后被真实内容替换。",
    },
    {
      title: "把 Loading 换成骨架屏",
      why: "「Loading...」只说明在等，骨架屏还告诉你「等的是什么形状」。",
      explain: [
        "**骨架屏**用灰色占位块模拟最终布局，用户能预判内容位置与数量，切换时不「跳一下」—— 这是**感知性能**优化。",
        "`app/ui/skeletons.tsx` 已备好整套：`CardSkeleton`、`CardsSkeleton`、`RevenueChartSkeleton`、`LatestInvoicesSkeleton`、`InvoicesTableSkeleton`，以及整页用的 **`DashboardSkeleton`**（默认导出）。",
        "把 `loading.tsx` 换成 `<DashboardSkeleton />` 即可。本项目还在 `app/globals.css` 里配了 shimmer 动画，占位块会有流动光效。",
      ],
      code:
        "// app/dashboard/loading.tsx\nimport DashboardSkeleton from '@/app/ui/skeletons';\n\nexport default function Loading() {\n  return <DashboardSkeleton />;\n}",
      check: "加载时占位块与最终页面布局基本一一对应（卡片位置、图表位置都对得上）。",
    },
    {
      title: "用路由组 (overview) 限定加载态的范围",
      why: "`loading.tsx` 作用于「整个路由段」，但 dashboard 还有子页面，范围要收窄。",
      explain: [
        "`loading.tsx` 放在 `app/dashboard/` 下会影响 `/dashboard` **及其所有子路由**（如 `/dashboard/invoices`），但 invoices 将来要有自己的加载态。",
        "解法是**路由组**：新建 `app/dashboard/(overview)/`（**加圆括号**），把 `page.tsx` 与 `loading.tsx` 一起**移进去**。",
        "圆括号表示**文件夹名不进入 URL**，只是打包分组。所以 `/dashboard` 地址不变，但这个 loading 只作用于概览页。",
      ],
      code:
        "app/dashboard/\n├── (overview)/\n│   ├── page.tsx          ← 概览页，访问 /dashboard\n│   └── loading.tsx       ← 只作用于概览页\n├── customers/page.tsx\n├── invoices/page.tsx\n└── layout.tsx",
      check: "访问 `/dashboard` 会看到骨架屏；`/dashboard/invoices` 不再被它影响。",
      pitfalls: [
        "写成 `(overview)` 用小括号，写成 `[overview]` 会变成动态路由，地址都会变。",
        "移动后要确认 `/dashboard` 还能打开 —— 打不开多半是 `loading.tsx` 没一起移动。",
      ],
    },
    {
      title: "组件级流式：把取数下推到组件里 + Suspense",
      why: "整页 loading 是粗粒度方案，真正好用的是让各部分各自就绪。",
      explain: [
        "思路：",
        "- **把取数从页面下移到真正需要它的组件**，让组件自己 `await`",
        "- **用 `<Suspense>` 包住该组件**并给 `fallback`",
        "具体到课程：删掉 `(overview)/page.tsx` 里的 `await fetchRevenue()`，改成在 `RevenueChart` 内部取数（组件变 `async`）；页面里用 `<Suspense fallback={<RevenueChartSkeleton />}><RevenueChart /></Suspense>` 包裹。",
        "效果：外壳与卡片**立刻**出现，只有图表先显示骨架屏，3 秒后补上 —— 收入查询再慢也不拖累整页。",
      ],
      note: "上一步已把 `page.tsx` 移到 `(overview)/` 下，下面改的就是移动后的文件；内容承接第 7 章末尾那个完整页面，这一步只改与 RevenueChart 有关的三处。",
      code:
        "// ① app/dashboard/(overview)/page.tsx —— 这一步改完后的完整页面\nimport { Suspense } from 'react';\nimport { fetchLatestInvoices, fetchCardData } from '@/app/lib/data';\nimport { RevenueChartSkeleton } from '@/app/ui/skeletons';\nimport RevenueChart from '@/app/ui/dashboard/revenue-chart';\nimport LatestInvoices from '@/app/ui/dashboard/latest-invoices';\nimport { Card } from '@/app/ui/dashboard/cards';\n\nexport default async function Page() {\n  // 改动 1：删掉 const revenue = await fetchRevenue();（取数下移到组件里了）\n  const latestInvoices = await fetchLatestInvoices();\n  const {\n    numberOfInvoices,\n    numberOfCustomers,\n    totalPaidInvoices,\n    totalPendingInvoices,\n  } = await fetchCardData();\n\n  return (\n    <main>\n      <h1 className=\"mb-4 text-xl md:text-2xl\">Dashboard</h1>\n      <div className=\"grid gap-6 sm:grid-cols-2 lg:grid-cols-4\">\n        <Card title=\"Collected\" value={totalPaidInvoices} type=\"collected\" />\n        <Card title=\"Pending\" value={totalPendingInvoices} type=\"pending\" />\n        <Card title=\"Total Invoices\" value={numberOfInvoices} type=\"invoices\" />\n        <Card title=\"Total Customers\" value={numberOfCustomers} type=\"customers\" />\n      </div>\n      <div className=\"mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8\">\n        {/* 改动 2：不再传 revenue，改成 Suspense 包裹 */}\n        <Suspense fallback={<RevenueChartSkeleton />}>\n          <RevenueChart />\n        </Suspense>\n        <LatestInvoices latestInvoices={latestInvoices} />\n      </div>\n    </main>\n  );\n}\n\n// ② app/ui/dashboard/revenue-chart.tsx —— 改动 3：组件自己取数、不再收 revenue 属性\nimport { fetchRevenue } from '@/app/lib/data';\n\nexport default async function RevenueChart() {\n  const revenue = await fetchRevenue();\n  return (/* ...用 revenue 渲染图表，这部分你第 7 章已经打开了... */);\n}",
      check: "刷新页面：卡片与外壳立即出现，只有图表位置先显示骨架屏，随后图表补上。",
    },
    {
      title: "练习：用 Suspense 流式渲染 LatestInvoices",
      why: "同一个套路再走一遍，直到变成本能。",
      explain: [
        "把 `fetchLatestInvoices()` 从页面**下移**到 `app/ui/dashboard/latest-invoices.tsx` 内部，删掉它的入参。",
        "页面里用 `<Suspense fallback={<LatestInvoicesSkeleton />}><LatestInvoices /></Suspense>` 包裹。",
        "现在有两个独立的 Suspense 边界：谁先就绪谁先出现，互不等待。",
      ],
      code:
        "// ① app/ui/dashboard/latest-invoices.tsx —— 组件改成这样（自己取数、不再收 props）\nimport { fetchLatestInvoices } from '@/app/lib/data';\n\nexport default async function LatestInvoices() {\n  const latestInvoices = await fetchLatestInvoices();\n  return (/* ...用 latestInvoices 渲染列表... */);\n}\n\n// ② app/dashboard/(overview)/page.tsx —— 页面里删掉 fetchLatestInvoices，改成 Suspense 包裹\n//（import 需要：import { Suspense } from 'react';\n//             import { LatestInvoicesSkeleton } from '@/app/ui/skeletons';）\n<Suspense fallback={<LatestInvoicesSkeleton />}>\n  <LatestInvoices />\n</Suspense>",
      check: "两个区块各自独立地「先骨架、后内容」，其中一个慢不会拖住另一个。",
    },
    {
      title: "分组卡片：收口成一个 Suspense（页面顶层不再 await）",
      why: "页面顶层 await 会拖住整页，连已包好的图表/发票流式也发不出去。",
      explain: [
        "到目前为止 `(overview)/page.tsx` 顶部还在 `await fetchCardData()`。App Router 里**页面组件的顶层 await 会阻塞整个组件的输出**——哪怕里面已经包了 `<Suspense>`，也得等顶层 await 结束后才往外发。所以这步之前，整页其实一直被 `fetchCardData()` 拖着。",
        "这一步把 `fetchCardData()` **移进** `CardWrapper`（组件自己取数），页面顶层**彻底没有 await** 了。于是外壳、图表、发票的 Suspense 立刻发出，只有卡片这一组先显示 `CardsSkeleton`，等数据回来再补上。",
        "⚠️ 关于 `Promise.all`：`fetchCardData` 内部用 `Promise.all` 把 4 个查询**并行一次发出、一起返回**，所以**四张卡片的数据注定同步到达**——它们不可能「逐张闪现」。这反而证明「一个 Suspense 包四张卡」是对的：它们本就是一组。",
        "要**亲眼看到**这一步的效果：给 `fetchCardData` 临时加个人工延迟（和 `fetchRevenue` 的 3 秒一个套路，见下面代码第三段），否则它太快、看不出区别。**加之前**：整页被 `fetchCardData` 拖住，连图表/发票都要等它；**加之后**：卡片有独立骨架，图表/发票照常流式。章节末尾记得和另外两个延迟一起删掉。",
        "⚠️ 关键坑：`app/ui/dashboard/cards.tsx` 的 `CardWrapper` 要先启用——顶部有 `import { fetchCardData }`、函数里有 `await fetchCardData()`、4 张 `<Card>` 已取消注释。若这个文件还没启用，先按第一段代码打开它，否则卡片区域会是空白。",
        "判断原则：**边界粒度要与用户的认知单位对齐**——整块一起变化就用一个边界，确实独立、快慢差别大的才拆开。",
      ],
      code:
        "// app/ui/dashboard/cards.tsx —— 第一段：先启用 CardWrapper（顶部加 import，函数里补取数 + 取消注释 4 张卡片）\nimport { fetchCardData } from '@/app/lib/data';\n\nexport default async function CardWrapper() {\n  const {\n    numberOfInvoices,\n    numberOfCustomers,\n    totalPaidInvoices,\n    totalPendingInvoices,\n  } = await fetchCardData();\n\n  return (\n    <>\n      <Card title='Collected' value={totalPaidInvoices} type='collected' />\n      <Card title='Pending' value={totalPendingInvoices} type='pending' />\n      <Card title='Total Invoices' value={numberOfInvoices} type='invoices' />\n      <Card title='Total Customers' value={numberOfCustomers} type='customers' />\n    </>\n  );\n}\n\n// app/dashboard/(overview)/page.tsx —— 第二段：把原来的 fetchCardData()+4 张 Card 换成 <CardWrapper />（其余不变）\nimport { Suspense } from 'react';\nimport { CardsSkeleton, RevenueChartSkeleton, LatestInvoicesSkeleton } from '@/app/ui/skeletons';\nimport CardWrapper from '@/app/ui/dashboard/cards';\nimport RevenueChart from '@/app/ui/dashboard/revenue-chart';\nimport LatestInvoices from '@/app/ui/dashboard/latest-invoices';\n\nexport default function Page() {\n  return (\n    <main>\n      <h1 className='mb-4 text-xl md:text-2xl'>Dashboard</h1>\n      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>\n        <Suspense fallback={<CardsSkeleton />}>\n          <CardWrapper />\n        </Suspense>\n      </div>\n      <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8'>\n        <Suspense fallback={<RevenueChartSkeleton />}>\n          <RevenueChart />\n        </Suspense>\n        <Suspense fallback={<LatestInvoicesSkeleton />}>\n          <LatestInvoices />\n        </Suspense>\n      </div>\n    </main>\n  );\n}\n\n// app/lib/data.ts —— 第三段（仅观察用，章节末尾删）：给 fetchCardData 加人工延迟\n// 在 fetchCardData 的 try 里、Promise.all 之前加这一行：\nawait new Promise((resolve) => setTimeout(resolve, 1500));",
      check: "四张卡片一组从骨架变成内容；`cards.tsx` 的 `CardWrapper` 已启用；页面顶层已无任何 `await` 取数；加了延迟后能肉眼看到「卡片组独立于图表/发票流式」。",
      pitfalls: [
        "别直接把 `<CardWrapper />` 塞进页面就完事——先确认 `cards.tsx` 的 `CardWrapper` 真的取数且 4 张卡片已启用，否则卡片区域空白。",
        "因为 `fetchCardData` 用 `Promise.all`，四张卡数据必定一起到；即便你给每张卡各包一个 Suspense，它们也还是会一起出现。所以别折腾成 4 个边界，一个就够。",
        "观察用的延迟只是临时手段，章节末尾要把 `fetchCardData` 这行 `setTimeout` 一并注释掉，否则页面永远慢 1.5 秒。",
      ],
      note: "背景：官方课程里 `cards.tsx` 的 `CardWrapper` 默认就带 `fetchCardData` 取数、只把 JSX 注释掉。另外，`fetchCardData` 内部用 `Promise.all` 一次返回全部数据，所以四张卡片始终同步出现、不会逐张闪现——这正是「用一个 Suspense 包住整组」的理由。",
    },
    {
      title: "为什么 npm run start 看不到流式（静态预渲染）",
      why: "dev 能看到骨架，start 却秒出 —— 这不是你代码错。",
      explain: [
        "你可能会遇到：`npm run dev` 刷新能看到骨架屏流式，但 `npm run start`（生产构建）下所有卡片秒出、毫无 loading。",
        "原因：Next 默认会**静态预渲染**能静态化的页面，判定标准是「是否用到动态 API」—— 用了 `cookies()`/`headers()` 才自动判定为动态；而你这里用的是 `postgres` 的 `sql` **裸查询**，框架**不知道你连了数据库**，页面又没碰任何动态 API，于是 `next build` 时把整页渲染一次、连同 `<Suspense>` 解析完的数据一起烤成静态 HTML。",
        "后果：`start` 直接发这份静态文件 → 内容早就在了，自然没有骨架、没有流式。dev 每次请求都现渲染，所以才看得到。",
        "怎么确认：看 `.next/prerender-manifest.json` 里 `/dashboard` 是不是 `compute: static`，以及 `.next/server/app/dashboard.html` 是否存在 —— 有就说明被静态化了。",
        "真实项目怎么办（核心是一句话：**主动声明数据是动态的**）：",
        "- **用鉴权**：页面里用到 `cookies()`，整页自动变动态（本课程第 15 章加登录后即如此）",
        "- **强制动态**：在页面文件顶部加 `export const dynamic = 'force-dynamic';`",
        "- **ISR 折中**：`export const revalidate = 60;` —— 缓存 60 秒后自动重生，又快又不至于太旧",
        "- **fetch 取数时**：`fetch(url, { cache: 'no-store' })` 或 `noStore()`",
      ],
      code:
        "// app/dashboard/(overview)/page.tsx —— 在 import 之后、export default 之前加一行\nexport const dynamic = 'force-dynamic';",
      check: "知道「裸数据库查询不会自动变动态」这一陷阱；能说出至少两种让生产环境也实时取数的办法（如 force-dynamic / 鉴权 / revalidate）。",
      pitfalls: [
        "别以为流式「没生效」就是代码写错 —— 先确认是不是被静态预渲染了（看 prerender-manifest 与 dashboard.html）。",
        "把页面强制动态后，每次请求都打数据库；高并发真实项目记得加缓存或 ISR，别无脑 force-dynamic。",
      ],
      note: "这其实是 Next.js 的**性能特性**而非缺陷：能静态化的就提前渲染好，最快。代价是「需要新鲜数据」得你主动说出来。dev 永远现渲染，所以开发期不会被误导；出问题的只可能是用 `start` 跑生产构建却忘了声明动态。",
    },
  ],
  tips: [
    "流式的两条经验：**取数下推到真正用它的组件**、**用 Suspense 给出合适的边界粒度**。",
    "做完本章，别忘了把 `fetchRevenue()`（3 秒）、`fetchLatestInvoices()`（1.5 秒）、`fetchCardData()`（1.5 秒，仅观察用）三处演示用的 `setTimeout` 都注释掉，否则页面永远慢。",
    "骨架屏不是万能的：切换太快时反而会「闪一下」，所以边界别切得太碎。",
    "为什么 `npm run start` 看不到流式？多半是页面被**静态预渲染**了（裸数据库查询不会被框架识别成动态数据）；真实项目用 `cookies()`/鉴权 或 `dynamic='force-dynamic'`/`revalidate` 主动声明动态即可。",
  ],
};
