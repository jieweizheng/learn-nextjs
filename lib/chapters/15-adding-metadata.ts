import type { Chapter } from "./types";

export const chapter15: Chapter = {
  num: 15,
  slug: "adding-metadata",
  title: "Adding Metadata",
  titleZh: "添加元数据",
  officialUrl: "https://nextjs.org/learn/dashboard-app/adding-metadata",
  summary:
    "用 Metadata API 配置标题、描述、favicon 与社交分享图，让页面在搜索结果和分享卡片里都体面。",
  goals: [
    "了解常见的元数据类型及其作用",
    "会用 `metadata` 对象与 `title.template` 配置标题",
    "会用文件约定（`favicon.ico`、`opengraph-image`）自动生成标签",
    "会给各页面设置各自的标题",
  ],
  points: [
    {
      title: "元数据是什么、为什么值得认真做",
      why: "它决定你的页面在搜索结果的标题、在社交平台分享时的卡片 —— 直接影响点击率。",
      explain: [
        "**元数据（Metadata）** 是写在 HTML `<head>` 里、描述页面的信息：`<title>`（浏览器标签与搜索结果标题）、`<meta name=\"description\">`（摘要）、Open Graph / Twitter 卡片（分享时的标题、描述、缩略图）等。用户不直接看到它们，但它们影响 SEO 与分享效果。",
        "在 Next.js 里有两种写法：**配置式**（在 `layout.tsx` / `page.tsx` 里导出 `metadata` 对象或 `generateMetadata` 函数）和**文件式**（把特定文件名放进 `app/` 目录，例如 `favicon.ico`、`opengraph-image.png`）。",
        "还需要知道 `metadataBase`：它给相对路径的元数据提供基准 URL，这样生成的图片/链接是绝对值（分享平台抓取时需要绝对地址）。",
      ],
      check: "能列出至少三种元数据，并说出「配置式」与「文件式」两种写法各自的场景。",
    },
    {
      title: "文件式元数据：favicon 与分享图",
      why: "这是最省事的一种「零配置」方式：文件放对位置，标签就自动生成。",
      explain: [
        "把 `favicon.ico` 移到 `app/` 根目录，Next.js 会自动为你注入对应的 `<link rel=\"icon\">`；把 `opengraph-image.png`（或 `.jpg`）也放到 `app/` 根目录，会自动生成 Open Graph 与 Twitter 的图片标签。",
        "好处是**不用手写任何代码**，而且 Next.js 会做缓存破坏（文件名带哈希），用户不会看到旧图标。",
        "⚠️ 本项目的情况：`public/` 里已经有 `favicon.ico` 与 `opengraph-image.png`（第 1 章搬素材时复制进来的）。按课程把它们**移到 `app/` 根目录**；如果想省事，也可以继续留在 `public/` 并在 `metadata` 里显式声明 `icons` / `openGraph.images` —— 两种做法都有效，但推荐跟课程走，体会文件约定的便利。",
      ],
      check: "查看页面源码（或浏览器标签页）能看到图标生效；用社交平台调试工具或 `next build` 输出确认分享图标签存在。",
      pitfalls: [
        "文件放错目录（比如放进 `app/dashboard/`）作用范围就变了 —— 文件式元数据同样是「就近生效」的。",
      ],
    },
    {
      title: "静态 metadata 对象与 title.template",
      why: "`title.template` 让你只在子页面写「后半段」，标题格式全站统一，改一次全站生效。",
      explain: [
        "在 `app/layout.tsx` 里导出 `export const metadata: Metadata = { ... }`：包含 `metadataBase`（用你的部署域名，如 `new URL('https://next-learn-dashboard.vercel.sh')`）、`title`、`description`、`openGraph`、`twitter` 等。",
        "`title` 写成对象：`{ template: '%s | Acme Dashboard', default: 'Acme Dashboard' }`。含义是：**子页面只需要给出 `%s` 那部分**（例如 `'Invoices'`），最终会渲染成 `Invoices | Acme Dashboard`；而如果页面自己没有标题，就用 `default`。",
        "这种「模板 + 局部」的组合是为了避免每个页面都重复写品牌名，也避免改品牌名时漏改。",
      ],
      code:
        "// app/layout.tsx\nimport type { Metadata } from 'next';\n\nexport const metadata: Metadata = {\n  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),\n  title: {\n    template: '%s | Acme Dashboard',\n    default: 'Acme Dashboard',\n  },\n  description: 'The official Next.js Learn Dashboard built with App Router.',\n  openGraph: {\n    title: 'Acme Dashboard',\n    description: 'The official Next.js Dashboard built with App Router.',\n    url: 'https://next-learn-dashboard.vercel.sh',\n    siteName: 'Acme Dashboard',\n  },\n};",
      check: "页面标题从默认的样式变成了 `Acme Dashboard`；查看源码能看到 `<title>` 与 description。",
    },
    {
      title: "页面级标题：就近覆盖",
      why: "每个页面都应该有自己的标题，这是 SEO 与用户体验的基本要求。",
      explain: [
        "给具体页面导出 `metadata` 即可覆盖上级的默认值：例如在 `app/dashboard/invoices/page.tsx` 里 `export const metadata: Metadata = { title: 'Invoices' };`，最终标题就是 **`Invoices | Acme Dashboard`**。",
        "**就近优先**：同一层级里页面（`page.tsx`）的 `metadata` 覆盖它上层布局的配置；最上层是根布局。理解这一点后，你就知道「默认值放根布局、特例放页面」是正确分工。",
        "如果标题需要根据数据动态生成（比如发票详情页要显示发票号），就用 `generateMetadata` —— 它是一个 `async` 函数，可以 `await` 数据后返回 `Metadata`，参数与页面相同（含 `params`）。",
      ],
      code:
        "// app/dashboard/invoices/page.tsx\nexport const metadata: Metadata = {\n  title: 'Invoices',\n};\n\n// 需要动态标题时（例如详情页）：\nexport async function generateMetadata(props: { params: Promise<{ id: string }> }) {\n  const params = await props.params;\n  return { title: `Invoice #${params.id}` };\n}",
      check: "切换到 Invoices 页，浏览器标签标题变成 `Invoices | Acme Dashboard`。",
      pitfalls: [
        "`metadata` 只能在**服务端组件**里导出：给文件加了 `'use client'` 就不能再导出它。",
        "同一个文件里不要同时导出 `metadata` 和 `generateMetadata`，选一个。",
      ],
    },
    {
      title: "练习：给所有页面补上标题",
      why: "收尾工作最能检验你是否真的掌握了「就近覆盖」的规则。",
      explain: [
        "按文档给这些页面加上标题：`/login`（Login）、`/dashboard`（Home 或 Dashboard）、`/dashboard/customers`（Customers）、`/dashboard/invoices/create`（Create Invoice）、`/dashboard/invoices/[id]/edit`（Edit Invoice）。",
        "做完后逐个点开验证：每个页面的标签标题应当各不相同，且都带 `| Acme Dashboard` 后缀。",
        "想更进一步，可以给 `/dashboard/invoices/[id]/edit` 用 `generateMetadata`，从数据库取发票信息拼出标题 —— 这样就同时练到了动态元数据。",
      ],
      check: "五个页面的标题各不相同且格式统一；没有任何页面还停留在默认标题。",
    },
  ],
  tips: [
    "元数据优先级：**页面的 `metadata` 覆盖上层布局**；这一条决定了你该把默认值放在哪里。",
    "`metadataBase` 忘了配的话，Open Graph 图片可能是相对路径，部分分享平台会抓不到。",
    "元数据是「服务端的能力」：客户端组件里无法导出 `metadata`。",
  ],
};
