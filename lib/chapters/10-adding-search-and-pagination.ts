import type { Chapter } from "./types";

export const chapter10: Chapter = {
  num: 10,
  slug: "adding-search-and-pagination",
  title: "Adding Search and Pagination",
  titleZh: "搜索与分页",
  officialUrl:
    "https://nextjs.org/learn/dashboard-app/adding-search-and-pagination",
  summary:
    "用 URL 查询参数管理搜索与分页：客户端用 `useSearchParams` 写参数，服务端用 `searchParams` 读参数，并加上防抖。",
  goals: [
    "理解为什么用 URL 参数而不是组件状态来存搜索条件",
    "会在客户端组件里用 `useSearchParams` / `usePathname` / `useRouter` 改写 URL",
    "会在页面里读取 `searchParams` 并把结果传给表格",
    "会用 `use-debounce` 给输入加防抖",
  ],
  points: [
    {
      title: "为什么把搜索状态放在 URL 里",
      why: "这是本章的架构决策，选错了后面每个功能都会别扭。",
      explain: [
        "如果用 `useState` 存搜索词：**刷新就丢、无法分享、后退按钮失效、服务端读不到**（页面无法在服务端按条件查数据）。",
        "把状态放进 URL 查询参数（`?query=lee&page=2`）一次解决上面全部问题：地址可复制分享、刷新和书签都保留、浏览器前进后退自然工作，而**服务端**可以直接从 `searchParams` 读到条件、在数据库层面做过滤与分页。",
        "所以本章出现两类读取方式：**客户端组件**用 `useSearchParams()` hook 读、用 `useRouter().replace()` 写；**服务端页面**通过组件的 `searchParams` 属性（Promise）读。",
      ],
      check: "能说出至少两条「URL 存状态」相对 `useState` 的优势，并解释为什么服务端能读到很重要。",
    },
    {
      title: "准备发票页面与三个组件",
      why: "先把文件骨架摆好，再按顺序填充能力。",
      explain: [
        "按文档把起始代码写进 `app/dashboard/invoices/page.tsx`：它是一个 `async` 服务端页面，接收 `searchParams`（**在 Next.js 16 里它是 Promise，必须 `await`**）。",
        "页面里会用到课程准备好的三个组件：`<Search />`（搜索框，`app/ui/search.tsx`）、`<Pagination />`（分页，`app/ui/invoices/pagination.tsx`）、`<Table />`（表格，`app/ui/invoices/table.tsx`）。这一章要做的就是让它们**串起来**。",
        "另外别忘了给这个路由段加 `loading.tsx`（用 `InvoicesTableSkeleton`）—— 第 9 章学的骨架屏，在真正的列表页上正好用得上。",
      ],
      code:
        "// app/dashboard/invoices/page.tsx（起始骨架）\nimport Pagination from '@/app/ui/invoices/pagination';\nimport Search from '@/app/ui/search';\nimport Table from '@/app/ui/invoices/table';\nimport { InvoicesTableSkeleton } from '@/app/ui/skeletons';\n\nexport default async function Page(props: {\n  searchParams?: Promise<{ query?: string; page?: string }>;\n}) {\n  const searchParams = await props.searchParams;\n  const query = searchParams?.query || '';\n  const currentPage = Number(searchParams?.page) || 1;\n\n  return (\n    <div className=\"w-full\">\n      <div className=\"flex w-full items-center justify-between\">\n        <h1 className=\"text-2xl\">Invoices</h1>\n      </div>\n      <div className=\"mt-4 flex items-center justify-between gap-2 md:mt-8\">\n        <Search placeholder=\"Search invoices...\" />\n      </div>\n      <Table query={query} currentPage={currentPage} />\n      <div className=\"mt-5 flex w-full justify-center\">\n        <Pagination totalPages={1} />\n      </div>\n    </div>\n  );\n}",
      check: "`/dashboard/invoices` 能打开，看到标题、搜索框和一个空表格。",
      pitfalls: [
        "忘记 `await props.searchParams` 会拿到一个 Promise 对象，读 `query` 永远是 undefined。",
      ],
    },
    {
      title: "捕获用户输入（先用 console.log 验证）",
      why: "先把「输入事件能拿到值」验证掉，再去做 URL 同步，排错成本最低。",
      explain: [
        "打开 `app/ui/search.tsx`，它是客户端组件（顶部 `'use client'`）。在里面写一个 `handleSearch(term: string)`，先只在控制台打印；再给 `<input>` 加上 `onChange={(e) => handleSearch(e.target.value)}`。",
        "在浏览器里输入几个字符，打开开发者工具 Console，确认每次按键都有输出 —— 这一步确认了数据从输入框流到了你的函数里。",
        "这种「先验证数据流、再实现逻辑」的习惯很值得保留：出问题时你能立刻判断是哪一段坏了。",
      ],
      code:
        "'use client';\n\nimport { MagnifyingGlassIcon } from '@heroicons/react/24/outline';\n\nexport default function Search({ placeholder }: { placeholder: string }) {\n  function handleSearch(term: string) {\n    console.log(term);\n  }\n\n  return (\n    <div className=\"relative flex flex-1 flex-shrink-0\">\n      <label htmlFor=\"search\" className=\"sr-only\">Search</label>\n      <input\n        id=\"search\"\n        className=\"peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500\"\n        placeholder={placeholder}\n        onChange={(e) => handleSearch(e.target.value)}\n      />\n      <MagnifyingGlassIcon className=\"absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900\" />\n    </div>\n  );\n}",
      check: "控制台里能看到每次按键的输入内容。",
      pitfalls: [
        "`<input>` 必须带 `id`，外层 `<label htmlFor=\"search\">` 才能关联上（第 13 章无障碍会考这点）。",
      ],
    },
    {
      title: "把输入写进 URL（useSearchParams + useRouter）",
      why: "这是「客户端改地址栏」的标准写法，也是后面分页、筛选的基础模式。",
      explain: [
        "在 `app/ui/search.tsx` 顶部导入 `useSearchParams`、`usePathname`、`useRouter` 三个 hook，然后在组件里取到它们的实例。",
        "`handleSearch` 里：`const params = new URLSearchParams(searchParams);` 得到当前参数的**可变副本**（hook 返回的是只读的），然后按条件增删：有搜索词就 `params.set('query', term)`，清空时 `params.delete('query')`。",
        "最后更新地址栏：`router.replace(`${pathname}?${params.toString()}`)`。用 **`replace`** 而不是 `push`，是为了**不往历史记录里堆每一帧输入** —— 否则用户要疯狂点很多次「返回」才能离开这个页面。",
        "这一步做完，输入框的每一次变化都会反映在地址栏上；因为地址变了，**服务端页面会重新执行**，带着新的 `query` 去查数据（下一步接上）。",
      ],
      code:
        "'use client';\n\nimport { usePathname, useSearchParams, useRouter } from 'next/navigation';\n\nexport default function Search({ placeholder }: { placeholder: string }) {\n  const searchParams = useSearchParams();\n  const pathname = usePathname();\n  const { replace } = useRouter();\n\n  function handleSearch(term: string) {\n    const params = new URLSearchParams(searchParams);\n    if (term) {\n      params.set('query', term);\n    } else {\n      params.delete('query');\n    }\n    replace(`${pathname}?${params.toString()}`);\n  }\n\n  return (/* 这里的 input 加 id=\"search\" 与 onChange */);\n}",
      check: "在搜索框输入内容，地址栏出现 `?query=xxx`；清空输入框后该参数消失。",
      pitfalls: [
        "直接用 `useSearchParams()` 的返回值去 `set` 会报错（它是只读的），必须先 `new URLSearchParams(...)` 复制一份。",
      ],
    },
    {
      title: "让输入框与 URL 同步（defaultValue）",
      why: "刷新或分享链接后，输入框应该显示 URL 里的搜索词 —— 否则界面与状态不一致，用户会困惑。",
      explain: [
        "给 `<input>` 加 `defaultValue={searchParams.get('query')?.toString()}`。这里用 **`defaultValue`（非受控）**而不是 `value`：输入框的显示交给浏览器自己管，我们只在初始渲染时把 URL 里的值塞进去。",
        "如果改用 `value`，就必须同时接管 `onChange` 与状态，反而更啰嗦，还容易出现「输入卡顿」。",
        "⚠️ 用 `useSearchParams()` 的组件在**构建时会触发客户端渲染**（因为它依赖运行时的地址）。这也是为什么官方建议把它放在 `<Suspense>` 里 —— 本项目第 10 章的页面就按文档加了 Suspense 边界。",
      ],
      code: "<input\n  id=\"search\"\n  defaultValue={searchParams.get('query')?.toString()}\n  onChange={(e) => handleSearch(e.target.value)}\n/>",
      check: "搜索 `lee` 后刷新页面，输入框里仍然是 `lee`；把地址栏链接复制到新标签页打开，搜索词也在。",
    },
    {
      title: "服务端读取参数，让表格随查询更新",
      why: "搜索条件最终要变成「数据库层面的过滤」，这才叫真的搜索（而不是前端筛已加载的那几条）。",
      explain: [
        "页面里已经 `await` 到 `searchParams`，取出 `query` 与 `page`，把它们作为 props 传给 `<Table />`。`Table` 内部会用 `fetchFilteredInvoices(query, currentPage)` 去数据库按条件分页查询。",
        "关键细节是给 `<Suspense>` 加 **`key`**：`<Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>`。当 `query` 或页码变化时，`key` 变化 → React 认为这是**新的**边界 → 重新显示 fallback（骨架屏）→ 再渲染新结果。没有这个 `key`，切换时不会回到 loading 状态，用户会以为「点了没反应」。",
        "这也顺带展示了 Server Component 的请求流程：输入变化 → URL 变化 → 服务端页面重新执行 → 拿到新数据 → 流式发回新表格。",
      ],
      code:
        "const query = searchParams?.query || '';\nconst currentPage = Number(searchParams?.page) || 1;\n\n<Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>\n  <Table query={query} currentPage={currentPage} />\n</Suspense>",
      check: "输入框里搜一个客户名，表格只显示匹配的行；清空后恢复全部。",
    },
    {
      title: "加上分页",
      why: "数据一多就不能一次全查出来，分页是列表页的标配。",
      explain: [
        "用 `fetchInvoicesPages(query)` 拿到**总页数**（实现是 `Math.ceil(总数 / ITEMS_PER_PAGE)`），再把它传给 `<Pagination totalPages={totalPages} />`。",
        "分页组件里的页码链接要**保留当前的搜索条件**：它用 `usePathname()` 和 `useSearchParams()` 生成 `createPageURL(pageNumber)`，通常是复制现有参数、只改 `page`，最后用 `<Link href={...}>` 渲染。这样翻页时搜索词不会丢。",
        "注意分页组件也是客户端组件（用到了 hook），并且当 `totalPages <= 1` 时应当直接不渲染按钮。",
      ],
      code:
        "// app/dashboard/invoices/page.tsx\nimport { fetchInvoicesPages } from '@/app/lib/data';\n\nconst totalPages = await fetchInvoicesPages(query);\n\n<div className=\"mt-5 flex w-full justify-center\">\n  <Pagination totalPages={totalPages} />\n</div>\n\n// app/ui/invoices/pagination.tsx（客户端组件里生成链接）\nconst createPageURL = (pageNumber: number | string) => {\n  const params = new URLSearchParams(searchParams);\n  params.set('page', pageNumber.toString());\n  return `${pathname}?${params.toString()}`;\n};",
      check: "数据量够多时能看到页码；点第 2 页地址变成 `?query=...&page=2`，表格内容确实换了一批。",
    },
    {
      title: "加防抖（use-debounce）",
      why: "不加防抖，用户每敲一个字母都会改 URL → 重新渲染 → 查一次数据库，白白浪费。",
      explain: [
        "**防抖（debounce）** 指：在一段安静时间（课程用约 300ms）内不再有新输入，才真正执行一次。于是「快速输入 5 个字母」只会触发 1 次查询，而不是 5 次。",
        "课程用 `use-debounce` 的 `useDebouncedCallback`：`const handleSearch = useDebouncedCallback((term: string) => { /* 原来的逻辑 */ }, 300);`，其余代码不用改。",
        "注意本项目**尚未安装** `use-debounce`，练到这一步需要你自己在项目根跑一次 `npm install use-debounce`（这是课程正常的依赖安装，属于你要做的动作）。",
        "再往深一层想：防抖优化的是「请求频率」，它不改变「每次请求都重新渲染页面」这个事实 —— 那是服务端渲染的固有成本，正是前面缓存与流式那些机制在应对的问题。",
      ],
      code: "npm install use-debounce\n\n// app/ui/search.tsx\nimport { useDebouncedCallback } from 'use-debounce';\n\nconst handleSearch = useDebouncedCallback((term: string) => {\n  const params = new URLSearchParams(searchParams);\n  if (term) params.set('query', term);\n  else params.delete('query');\n  replace(`${pathname}?${params.toString()}`);\n}, 300);",
      check: "快速连续输入时，Network 面板里只出现一次导航请求；停顿后再输入才会再发一次。",
      pitfalls: [
        "没装 `use-debounce` 会报模块找不到 —— 记得自己 `npm install use-debounce`。",
        "把等待时间调得过长（比如 1000ms）会让输入感觉「迟钝」，300ms 左右是常见折中。",
      ],
    },
  ],
  tips: [
    "`useSearchParams` / `usePathname` / `useRouter` 都只能用在客户端组件里；服务端页面读参数走 `searchParams` 属性（Next.js 16 里是 Promise）。",
    "搜索与分页的完整链路是：**输入 → 改 URL → 服务端重新执行 → 查库 → 流式返回**。理解这条链，你就掌握了 App Router 处理列表页的标准范式。",
  ],
};
