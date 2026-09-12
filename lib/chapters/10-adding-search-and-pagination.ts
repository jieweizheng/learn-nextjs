import type { Chapter } from "./types";

export const chapter10: Chapter = {
  num: 10,
  slug: "adding-search-and-pagination",
  title: "Adding Search and Pagination",
  titleZh: "搜索与分页",
  officialUrl:
    "https://nextjs.org/learn/dashboard-app/adding-search-and-pagination",
  summary:
    "把搜索与分页状态放进 URL，用 `useSearchParams` / `useRouter` 在客户端读写，服务端按条件查库并流式返回。",
  goals: [
    "理解为什么把搜索状态放在 URL 而不是 `useState`",
    "会用 `useSearchParams` + `useRouter` 读写查询参数",
    "会让服务端页面根据 `searchParams` 查数据",
    "会实现分页并保留搜索条件",
  ],
  points: [
    {
      title: "为什么把搜索状态放在 URL 里",
      why: "这是本章的架构决策，选错了后面每个功能都别扭。",
      explain: [
        "用 `useState` 存搜索词：**刷新就丢、无法分享、后退按钮失效、服务端读不到**。",
        "放进 URL 查询参数（`?query=lee&page=2`）一次解决全部问题：",
        "- 地址可复制分享、刷新与书签都保留",
        "- 浏览器前进后退自然工作",
        "- **服务端**能从 `searchParams` 读到条件，在数据库层面过滤与分页",
        "两类读取方式：**客户端组件**用 `useSearchParams()` 读、`useRouter().replace()` 写；**服务端页面**通过 `searchParams` 属性（Promise）读。",
      ],
      check: "能说出至少两条「URL 存状态」相对 `useState` 的优势，并解释为什么服务端能读到很重要。",
    },
    {
      title: "准备发票页面与三个组件",
      why: "先把文件骨架摆好，再按顺序填能力。",
      explain: [
        "`app/dashboard/invoices/page.tsx` 在第 4 章已建过（当时只有 `<p>Invoices Page</p>`），这一步**把整个文件换成**下面的起始骨架：`async` 服务端页面，接收 `searchParams`（**Next.js 16 里是 Promise，必须 `await`**）。",
        "页面用到三个现成组件：`<Search />`（`app/ui/search.tsx`）、`<Pagination />`（`app/ui/invoices/pagination.tsx`）、`<Table />`（`app/ui/invoices/table.tsx`）。本章就是让它们串起来。",
        "另外给这个路由段加 `loading.tsx`（用 `InvoicesTableSkeleton`）。",
      ],
      code:
        "// app/dashboard/invoices/page.tsx（起始骨架）\nimport Pagination from '@/app/ui/invoices/pagination';\nimport Search from '@/app/ui/search';\nimport Table from '@/app/ui/invoices/table';\nimport { InvoicesTableSkeleton } from '@/app/ui/skeletons';\n\nexport default async function Page(props: {\n  searchParams?: Promise<{ query?: string; page?: string }>;\n}) {\n  const searchParams = await props.searchParams;\n  const query = searchParams?.query || '';\n  const currentPage = Number(searchParams?.page) || 1;\n\n  return (\n    <div className=\"w-full\">\n      <div className=\"flex w-full items-center justify-between\">\n        <h1 className=\"text-2xl\">Invoices</h1>\n      </div>\n      <div className=\"mt-4 flex items-center justify-between gap-2 md:mt-8\">\n        <Search placeholder=\"Search invoices...\" />\n      </div>\n      <Table query={query} currentPage={currentPage} />\n      <div className=\"mt-5 flex w-full justify-center\">\n        <Pagination totalPages={1} />\n      </div>\n    </div>\n  );\n}",
      check: "`/dashboard/invoices` 能打开，看到标题、搜索框和一个空表格。",
      pitfalls: [
        "忘记 `await props.searchParams` 会拿到 Promise，读 `query` 永远是 undefined。",
      ],
    },
    {
      title: "捕获用户输入（先用 console.log 验证）",
      why: "先验证「输入能拿到值」再去做 URL 同步，排错成本最低。",
      explain: [
        "打开 `app/ui/search.tsx`（客户端组件）。写 `handleSearch(term: string)` 先只打印，再给 `<input>` 加 `onChange={(e) => handleSearch(e.target.value)}`。",
        "在浏览器输入几个字符，确认 Console 每次按键都有输出 —— 这一步确认数据从输入框流到了函数里。",
      ],
      code:
        "'use client';\n\nimport { MagnifyingGlassIcon } from '@heroicons/react/24/outline';\n\nexport default function Search({ placeholder }: { placeholder: string }) {\n  function handleSearch(term: string) {\n    console.log(term);\n  }\n\n  return (\n    <div className=\"relative flex flex-1 flex-shrink-0\">\n      <label htmlFor=\"search\" className=\"sr-only\">Search</label>\n      <input\n        id=\"search\"\n        className=\"peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500\"\n        placeholder={placeholder}\n        onChange={(e) => handleSearch(e.target.value)}\n      />\n      <MagnifyingGlassIcon className=\"absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900\" />\n    </div>\n  );\n}",
      check: "控制台里能看到每次按键的输入内容。",
      pitfalls: [
        "`<input>` 必须带 `id`，外层 `<label htmlFor=\"search\">` 才能关联上（第 13 章无障碍会考）。",
      ],
    },
    {
      title: "把输入写进 URL（useSearchParams + useRouter）",
      why: "「客户端改地址栏」的标准写法，也是分页、筛选的基础模式。",
      explain: [
        "在 `app/ui/search.tsx` 导入 `useSearchParams`、`usePathname`、`useRouter` 三个 hook。",
        "`handleSearch` 里：`const params = new URLSearchParams(searchParams)` 拿到**可变副本**（hook 返回的是只读的），然后：`params.set('query', term)` / `params.delete('query')`。",
        "最后 `router.replace(`${pathname}?${params.toString()}`)`。用 **`replace`** 而非 `push`，是为了**不往历史里堆每一帧输入**。",
        "这一步做完，每次输入都会反映到地址栏；地址变了 → **服务端页面重新执行** → 带新 `query` 查数据。",
      ],
      code:
        "'use client';\n\nimport { usePathname, useSearchParams, useRouter } from 'next/navigation';\n\nexport default function Search({ placeholder }: { placeholder: string }) {\n  const searchParams = useSearchParams();\n  const pathname = usePathname();\n  const { replace } = useRouter();\n\n  function handleSearch(term: string) {\n    const params = new URLSearchParams(searchParams);\n    if (term) {\n      params.set('query', term);\n    } else {\n      params.delete('query');\n    }\n    replace(`${pathname}?${params.toString()}`);\n  }\n\n  return (/* 这里的 input 加 id=\"search\" 与 onChange */);\n}",
      check: "搜索框输入内容，地址栏出现 `?query=xxx`；清空后该参数消失。",
      pitfalls: [
        "直接对 `useSearchParams()` 的返回值 `set` 会报错（只读），必须先 `new URLSearchParams(...)` 复制。",
      ],
    },
    {
      title: "让输入框与 URL 同步（defaultValue）",
      why: "刷新或分享链接后，输入框应显示 URL 里的搜索词。",
      explain: [
        "给 `<input>` 加 `defaultValue={searchParams.get('query')?.toString()}`。用 **`defaultValue`（非受控）**而非 `value`：显示交给浏览器，只在初始渲染时把 URL 的值塞进去。",
        "改用 `value` 就必须同时接管 `onChange` 与状态，更啰嗦还容易输入卡顿。",
      ],
      note: "用 `useSearchParams()` 的组件在构建时会触发客户端渲染（它依赖运行时地址），所以官方建议把它放进 `<Suspense>` —— 本项目第 10 章的页面就按文档加了 Suspense 边界。",
      code: "// 在 app/ui/search.tsx 里，把原来那个 <input> 整体换成这几行：\n<input\n  className=\"peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500\"\n  placeholder=\"搜索发票\"\n  defaultValue={searchParams.get('query')?.toString()}\n  onChange={(e) => handleSearch(e.target.value)}\n/>",
      check: "搜索 `lee` 后刷新页面，输入框里仍是 `lee`；把链接复制到新标签页打开，搜索词也在。",
    },
    {
      title: "服务端读取参数，让表格随查询更新",
      why: "搜索条件最终要变成「数据库层面的过滤」，这才叫真搜索。",
      explain: [
        "前面几步已经把搜索词写进了 URL，但表格还没「跟着变」。这一步让服务端页面按 URL 里的 `query` 与 `page` 去查库。",
        "起始骨架（第 2 步）里的 `app/dashboard/invoices/page.tsx` **已经**读到了 `query` 与 `currentPage` 并传给了 `<Table />`，所以这一步**不用再加这两行**——真正要改的只有一件：给 `<Table>` 包一层带 `key` 的 `<Suspense>`。",
        "关键细节：`<Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>`。`query` 或页码变化 → `key` 变化 → React 认为是**新边界** → 重新显示骨架屏。没有这个 `key`，切换搜索/翻页时不会回到 loading，用户以为「点了没反应」。",
        "整条链路：**输入 → 改 URL → 服务端重新执行 → 查库 → 流式返回**。",
      ],
      code:
        "// app/dashboard/invoices/page.tsx —— 这一步做完后的完整文件（与第 2 步骨架相比，只多了 import Suspense 和给 <Table> 加的 <Suspense key> 包裹）\nimport Pagination from '@/app/ui/invoices/pagination';\nimport Search from '@/app/ui/search';\nimport Table from '@/app/ui/invoices/table';\nimport { InvoicesTableSkeleton } from '@/app/ui/skeletons';\nimport { Suspense } from 'react';\n\nexport default async function Page(props: {\n  searchParams?: Promise<{ query?: string; page?: string }>;\n}) {\n  const searchParams = await props.searchParams;\n  const query = searchParams?.query || '';\n  const currentPage = Number(searchParams?.page) || 1;\n\n  return (\n    <div className=\"w-full\">\n      <div className=\"flex w-full items-center justify-between\">\n        <h1 className=\"text-2xl\">Invoices</h1>\n      </div>\n      <div className=\"mt-4 flex items-center justify-between gap-2 md:mt-8\">\n        <Search placeholder=\"Search invoices...\" />\n      </div>\n      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>\n        <Table query={query} currentPage={currentPage} />\n      </Suspense>\n      <div className=\"mt-5 flex w-full justify-center\">\n        <Pagination totalPages={1} />\n      </div>\n    </div>\n  );\n}",
      check: "搜索框里搜一个客户名，表格只显示匹配的行；清空后恢复全部。",
      pitfalls: [
        "页面骨架里已经有 `query` / `currentPage` 两行并传给 `<Table>` 了，不用重复添加；这一步真正要做的是给 `<Table>` 加 `<Suspense>` 包裹 + `key`，让切换查询/翻页时能重新显示骨架屏。",
      ],
    },
    {
      title: "加上分页",
      why: "数据一多就不能一次全查出来。",
      explain: [
        "分页改两个文件：**页面**负责算总页数，**Pagination 组件**负责画页码、生成链接。",
        "① `app/dashboard/invoices/page.tsx`：加 `import { fetchInvoicesPages } from '@/app/lib/data';`，组件体里加 `const totalPages = await fetchInvoicesPages(query);`，把骨架里的 `<Pagination totalPages={1} />` 改成 `<Pagination totalPages={totalPages} />`。",
        "② `app/ui/invoices/pagination.tsx`：starter 把主组件那段 JSX **注释掉了**，而注释里用到的 `currentPage`、`createPageURL`、`allPages` **还没定义**，直接取消注释会全是 `undefined`。需要按顺序补齐：",
        "- 顶部导入 `usePathname, useSearchParams`（来自 `next/navigation`）",
        "- 主组件开头：`const pathname = usePathname(); const searchParams = useSearchParams(); const currentPage = Number(searchParams.get('page')) || 1;` —— **`currentPage` 是从 URL 读出来的，不是 props**（所以页面**不用**给它传 currentPage）",
        "- 定义 `createPageURL(pageNumber)`：复制现有查询参数、只把 `page` 改掉",
        "- 取消注释 `const allPages = generatePagination(currentPage, totalPages);`",
        "- 取消注释那一整段 `<div className='inline-flex'>…</div>` JSX",
        "文件下方已有的 `PaginationNumber`、`PaginationArrow` 两个子组件**不用改**；配套的 `generatePagination` 也已备在 `app/lib/utils.ts`。",
      ],
      code:
        "// ① app/dashboard/invoices/page.tsx —— 加一行 import 与一行 totalPages，并把骨架里的 <Pagination totalPages={1} /> 改成 <Pagination totalPages={totalPages} />\nimport { fetchInvoicesPages } from '@/app/lib/data';\n\nconst totalPages = await fetchInvoicesPages(query);   // 放在组件体内（query 第 5 步已有）\n\n// return 里替换那一行：\n// <Pagination totalPages={totalPages} />\n\n// ② app/ui/invoices/pagination.tsx —— 头部 + 主组件的最终形态（文件下方已有的 PaginationNumber / PaginationArrow 两个函数不用改）\n'use client';\n\nimport { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';\nimport clsx from 'clsx';\nimport Link from 'next/link';\nimport { generatePagination } from '@/app/lib/utils';\nimport { usePathname, useSearchParams } from 'next/navigation';\n\nexport default function Pagination({ totalPages }: { totalPages: number }) {\n  // 新增：从 URL 里读当前页（不是 props！）\n  const pathname = usePathname();\n  const searchParams = useSearchParams();\n  const currentPage = Number(searchParams.get('page')) || 1;\n\n  // 新增：生成「保留现有查询、只改 page」的链接\n  const createPageURL = (pageNumber: number | string) => {\n    const params = new URLSearchParams(searchParams);\n    params.set('page', pageNumber.toString());\n    return `${pathname}?${params.toString()}`;\n  };\n\n  // 取消注释：原来被注掉的这一行\n  const allPages = generatePagination(currentPage, totalPages);\n\n  return (\n    <>\n      {/* 取消注释：下面这一整段原本是注释掉的 */}\n      <div className='inline-flex'>\n        <PaginationArrow\n          direction='left'\n          href={createPageURL(currentPage - 1)}\n          isDisabled={currentPage <= 1}\n        />\n        <div className='flex -space-x-px'>\n          {allPages.map((page, index) => {\n            let position: 'first' | 'last' | 'single' | 'middle' | undefined;\n            if (index === 0) position = 'first';\n            if (index === allPages.length - 1) position = 'last';\n            if (allPages.length === 1) position = 'single';\n            if (page === '...') position = 'middle';\n            return (\n              <PaginationNumber\n                key={`${page}-${index}`}\n                href={createPageURL(page)}\n                page={page}\n                position={position}\n                isActive={currentPage === page}\n              />\n            );\n          })}\n        </div>\n        <PaginationArrow\n          direction='right'\n          href={createPageURL(currentPage + 1)}\n          isDisabled={currentPage >= totalPages}\n        />\n      </div>\n    </>\n  );\n}",
      check: "点第 2 页，地址变成 `?query=...&page=2`，表格换了一批；当前页码按钮高亮。",
      pitfalls: [
        "`currentPage` 不在 props 里：`Pagination` 自己从 `useSearchParams().get('page')` 读，所以页面只需传 `totalPages`，不用传 `currentPage`。",
        "注释里用到的 `allPages`、`createPageURL` 必须先定义（取消注释 `allPages` 那行 + 写 `createPageURL` 函数），否则 `allPages.map` 会读一个 `undefined`。",
        "别漏了顶部 `import { usePathname, useSearchParams } from 'next/navigation';`，否则会报 `useSearchParams is not defined`。",
      ],
      note: "背景：starter 故意把这段 JSX 注释掉，让你亲手补出 `currentPage` / `createPageURL` / `allPages`；工具函数 `generatePagination` 与子组件 `PaginationNumber` / `PaginationArrow` 都已写好，你只需补主组件的上半段并取消注释。",
    },
    {
      title: "加防抖（use-debounce）",
      why: "不防抖的话，每敲一个字母都会改 URL → 重新渲染 → 查一次库。",
      explain: [
        "**防抖**：一段安静时间（课程用 300ms）内不再有新输入才真正执行一次。「快速输入 5 个字母」只触发 1 次查询。",
        "课程用 `useDebouncedCallback`：`const handleSearch = useDebouncedCallback((term: string) => { /* 原逻辑 */ }, 300);`，其余代码不用改。",
        "本项目**尚未安装** `use-debounce`，练到这步需要你自己 `npm install use-debounce`。",
        "防抖优化的是「请求频率」，它不改变「每次请求都重新渲染页面」这个事实 —— 那是服务端渲染的固有成本。",
      ],
      code: "npm install use-debounce\n\n// app/ui/search.tsx —— 组件里把 handleSearch 的定义整体换成这段\nimport { useDebouncedCallback } from 'use-debounce';\n\nconst handleSearch = useDebouncedCallback((term: string) => {\n  const params = new URLSearchParams(searchParams);\n  if (term) params.set('query', term);\n  else params.delete('query');\n  replace(`${pathname}?${params.toString()}`);\n}, 300);",
      check: "快速连续输入时，Network 面板里只出现一次导航请求。",
      pitfalls: [
        "没装 `use-debounce` 会报模块找不到 —— 记得自己装。",
        "等待时间调得过长（如 1000ms）会让输入感觉迟钝，300ms 是常见折中。",
      ],
    },
  ],
  tips: [
    "`useSearchParams` / `usePathname` / `useRouter` 只能用在客户端组件；服务端页面读参数走 `searchParams` 属性（Next.js 16 里是 Promise）。",
    "搜索与分页的完整链路：**输入 → 改 URL → 服务端重新执行 → 查库 → 流式返回**。",
  ],
};
