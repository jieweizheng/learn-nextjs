import type { Chapter } from "./types";

export const chapter05: Chapter = {
  num: 5,
  slug: "navigating-between-pages",
  title: "Navigating Between Pages",
  titleZh: "页面间导航",
  officialUrl:
    "https://nextjs.org/learn/dashboard-app/navigating-between-pages",
  summary:
    "用 `next/link` 做客户端导航（不做整页刷新），并用 `usePathname` 高亮当前页面。",
  goals: [
    "理解为什么用 `<Link>` 而不是 `<a>`",
    "会用 `<Link>` 改写导航组件",
    "理解代码分割与预取（prefetching）",
    "会用 `usePathname` + `clsx` 高亮当前链接",
  ],
  points: [
    {
      title: "为什么 <a> 不行：整页刷新 vs 客户端导航",
      why: "用错标签，体验会从「秒切」退回「整页重载」。",
      explain: [
        "原生 `<a>` 触发浏览器级跳转，多做了三件不必要的事：",
        "- 重新请求 HTML",
        "- 重新下载并执行所有 JS",
        "- 清空客户端状态（滚动位置、输入内容、组件状态全丢）",
        "`<Link>` 做**客户端导航**：拦截点击，只请求目标页面的数据与组件代码，其余部分保持不动。",
      ],
      check: "能说出用 `<a>` 时「重复做了哪三件不必要的事」。",
    },
    {
      title: "把导航里的 <a> 换成 <Link>",
      why: "课程侧边栏就是 `<a>` 写的，最典型的改造对象。",
      explain: [
        "打开 `app/ui/dashboard/nav-links.tsx`：里面有个 `links` 数组（Home / Invoices / Customers），下面的 `map` 用 `<a>` 渲染。",
        "改两处即可：`import Link from 'next/link'`；把 `<a ...>...</a>` 的标签名（含闭合标签）换成 `Link`。",
        "用法与 `<a>` 几乎一样，区别在行为：点击后**不整页刷新**。",
      ],
      code:
        "// app/ui/dashboard/nav-links.tsx —— 改两处：\n// ① 文件顶部加 import；② 把 map 里 <a ...>...</a> 的标签名（含闭合标签）换成 Link\nimport Link from 'next/link';\n\n<Link\n  key={link.name}\n  href={link.href}\n  className=\"flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3\"\n>\n  <link.icon className=\"w-6\" />\n  <p className=\"hidden md:block\">{link.name}</p>\n</Link>",
      check: "点击侧边栏切换页面时没有整页白闪；浏览器「返回」按钮依然正常。",
      pitfalls: [
        "只改开标签没改闭合标签，会报 JSX 标签不匹配。",
        "跳外部站点仍用 `<a>`，`<Link>` 只用于站内路由。",
      ],
    },
    {
      title: "代码分割与预取（为什么它这么快）",
      why: "知道机制，才知道「该用 Link 的地方为什么一定要用」。",
      explain: [
        "**代码分割**：Next 按路由自动分割，每个路由只加载自己需要的代码，不会一次下载整个应用的 JS。",
        "**预取**：生产环境下 `<Link>` 进入视口时，后台预先拉取目标路由的代码与数据，点下去时往往已就位。",
        "- 开发环境通常不预取（避免干扰调试），所以首次点击可能稍慢，不是写错了",
        "- 预取是「进入视口就做」，页面上有几十个链接会带来额外后台请求",
      ],
      check: "能解释「代码分割」与「预取」各自解决什么问题，以及预取为什么在开发环境看不出来。",
    },
    {
      title: "用 usePathname 高亮当前页面",
      why: "导航要能告诉你「你在哪」。",
      explain: [
        "`usePathname()` 返回当前路径字符串（如 `/dashboard/invoices`）。",
        "hook 只能用在**客户端组件**，所以 `app/ui/dashboard/nav-links.tsx` 文件顶部要加 `'use client'`。",
        "再用 `clsx` 拼类名：`pathname === link.href` 时加高亮类 `bg-sky-100 text-blue-600`。课程还检查 `link.href.startsWith(pathname)`，让子路由也能保持父级高亮。",
      ],
      code:
        "// app/ui/dashboard/nav-links.tsx —— ① 文件最顶部加 'use client' 与 usePathname 的 import\n'use client';\n\nimport Link from 'next/link';\nimport { usePathname } from 'next/navigation';\nimport clsx from 'clsx';\n\n// ② 下面这行放在组件函数体内部；再把 <Link> 的 className 换成 clsx(...) 的写法\nconst pathname = usePathname();\n\n<Link\n  key={link.name}\n  href={link.href}\n  className={clsx(\n    'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',\n    {\n      'bg-sky-100 text-blue-600': pathname === link.href,\n    },\n  )}\n>",
      check: "点进 Invoices 时该链接变蓝高亮，点回 Home 后高亮跟着移动。",
      pitfalls: [
        "忘记写 `'use client'` 会报错：hook 只能在客户端组件中使用。",
        "`usePathname` 返回的路径不含查询串（`?query=...`），第 10 章读搜索参数要用 `useSearchParams`。",
      ],
    },
  ],
  tips: [
    "生产环境下 `<Link>` 进入视口会自动预取；开发环境看不到这个效果，不要以为写错了。",
    "`'use client'` 是「从该文件开始的整棵组件子树都在客户端」的标记，只给真正需要交互的组件加。",
  ],
};
