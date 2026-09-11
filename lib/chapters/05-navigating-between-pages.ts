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
      why: "同样是一个链接，用错标签会让体验从「秒切」退回「整页重载」，原因值得搞清楚。",
      explain: [
        "原生 `<a href=\"/dashboard/invoices\">` 会触发**浏览器级别的页面跳转**：重新请求 HTML、重新下载并执行所有 JS、清空所有客户端状态（滚动位置、输入框、组件内部状态全丢），页面会明显地「闪一下」。",
        "Next.js 提供 `<Link>` 组件做**客户端导航**：它拦截点击，只请求目标页面的数据与组件代码，再用 React 更新界面，其余部分（布局、已加载的共享代码）保持不动。",
        "这就是第 4 章「部分渲染」在导航上的体现：布局不重渲染，切换页面时只有变化的部分更新。",
      ],
      check: "能说出用 `<a>` 时「重复做了哪三件不必要的事」（重新请求 HTML、重新执行 JS、丢失客户端状态）。",
    },
    {
      title: "把导航里的 <a> 换成 <Link>",
      why: "课程提供的侧边栏导航就是用 `<a>` 写的，这是最典型的改造对象。",
      explain: [
        "打开 `app/ui/dashboard/nav-links.tsx`。文件里有一个 `links` 数组（Home / Invoices / Customers，各自带 `href` 和图标），下面的 `map` 用 `<a>` 渲染它们。",
        "改造很简单：`import Link from 'next/link'`，把 `<a key={link.name} href={link.href}>` 换成 `<Link key={link.name} href={link.href}>`，闭合标签一起改。",
        "`<Link>` 的用法看起来和 `<a>` 几乎一样，这也是它容易上手的地方；区别在行为上：点击后页面**不会整页刷新**。",
      ],
      code:
        "// app/ui/dashboard/nav-links.tsx（改两处：import + 标签名）\nimport Link from 'next/link';\n\n<Link\n  key={link.name}\n  href={link.href}\n  className=\"flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3\"\n>\n  <link.icon className=\"w-6\" />\n  <p className=\"hidden md:block\">{link.name}</p>\n</Link>",
      check: "点击侧边栏切换页面时没有整页白闪；浏览器「返回」按钮依然正常工作。",
      pitfalls: [
        "只改了开标签没改闭标签，会报 JSX 标签不匹配。",
        "需要跳转到外部站点时仍应使用 `<a>`，`<Link>` 是给站内路由用的。",
      ],
    },
    {
      title: "代码分割与预取（为什么它这么快）",
      why: "知道背后的机制，你才能理解「为什么该用 Link 的地方一定要用」以及什么时候需要关心体积。",
      explain: [
        "Next.js 会**按路由自动做代码分割**：每个路由只加载自己需要的那部分代码，浏览器不会一次性下载整个应用的 JS。所以页面越复杂，切到它时要下载的代码才越多，而其他页面不受影响。",
        "更进一步，**在生产环境中**，当 `<Link>` 进入用户视口（viewport）时，Next.js 会在后台**预取（prefetch）**目标路由的代码与数据。等你真的点下去，要用的东西往往已经就位，所以感觉是「瞬间打开」。",
        "注意两点：开发环境通常不做预取（避免干扰调试，你可能会看到「首次点击稍慢」）；预取是「进入视口就做」，如果页面上有几十个链接，也会带来额外的后台请求。",
      ],
      check: "能解释「代码分割」与「预取」各自解决了什么问题，以及预取为什么在开发环境看不出来。",
    },
    {
      title: "用 usePathname 高亮当前页面",
      why: "导航能高亮「你在哪」，用户才不会迷路；这需要组件在客户端获取当前路径。",
      explain: [
        "要判断「哪个链接是当前页」，组件必须知道当前 URL。Next.js 提供了 `usePathname()` hook：调用它返回当前路径字符串（例如 `/dashboard/invoices`）。",
        "但 hook 只能用在**客户端组件**里，所以要在 `nav-links.tsx` **文件顶部**加上 `'use client'`。这一行告诉 Next.js：这个组件需要在浏览器里运行、可以带交互与状态。",
        "然后就可以用 `clsx` 拼类名：当前路径与 `link.href` 相等时加上高亮类（课程用的是 `bg-sky-100 text-blue-600`）。注意课程示例里还检查了 `link.href.startsWith(pathname)`，让子路由也能保持父级高亮。",
      ],
      code:
        "'use client';\n\nimport Link from 'next/link';\nimport { usePathname } from 'next/navigation';\nimport clsx from 'clsx';\n\nconst pathname = usePathname();\n\n<Link\n  key={link.name}\n  href={link.href}\n  className={clsx(\n    'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',\n    {\n      'bg-sky-100 text-blue-600': pathname === link.href,\n    },\n  )}\n>",
      check: "点进 Invoices 时该链接变成蓝色高亮，点回 Home 后高亮跟着移动。",
      pitfalls: [
        "忘记写 `'use client'` 会报错：hook 只能在客户端组件中使用。",
        "`usePathname` 返回的是路径不含查询串（`?query=...` 部分），第 10 章读搜索参数要用 `useSearchParams`。",
      ],
    },
  ],
  tips: [
    "生产环境下，`<Link>` 进入视口时会自动预取目标路由；开发环境往往看不到这个效果，不要因此以为哪里写错了。",
    "`'use client'` 是「从这个文件开始的整棵组件子树都在客户端」的标记，能用就不要滥用 —— 只给真正需要交互的组件加。",
  ],
};
