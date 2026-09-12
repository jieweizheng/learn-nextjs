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
      why: "它决定页面在搜索结果的标题、在社交平台分享时的卡片 —— 直接影响点击率。",
      explain: [
        "**元数据**是写在 HTML `<head>` 里描述页面的信息：`<title>`（标签与搜索结果标题）、`<meta name='description'>`（摘要）、Open Graph / Twitter 卡片（分享时的标题、描述、缩略图）。用户不直接看到，但影响 SEO 与分享效果。",
        "Next.js 里两种写法：",
        "- **配置式**：在 `layout.tsx` / `page.tsx` 导出 `metadata` 对象或 `generateMetadata` 函数",
        "- **文件式**：把特定文件名放进 `app/` 目录（如 `favicon.ico`、`opengraph-image.png`）",
        "`metadataBase` 给相对路径的元数据提供基准 URL，让生成的图片/链接是绝对路径（分享平台抓取需要绝对地址）。",
      ],
      check: "能列出至少三种元数据，并说出「配置式」与「文件式」各自的场景。",
    },
    {
      title: "文件式元数据：favicon 与分享图",
      why: "最省事的「零配置」方式：文件放对位置，标签自动生成。",
      explain: [
        "把 `favicon.ico` 移到 `app/` 根目录，Next 自动注入 `<link rel='icon'>`；把 `opengraph-image.png`（或 `.jpg`）也放进去，自动生成 Open Graph 与 Twitter 图片标签。",
        "好处是**不用写任何代码**，且 Next 会做缓存破坏（文件名带哈希），用户不会看到旧图标。",
        "本项目 `public/` 里已有 `favicon.ico` 与 `opengraph-image.png`（第 1 章搬素材时复制的）。按课程把它们**移到 `app/` 根目录**；想省事也可以留在 `public/` 并在 `metadata` 里显式声明 `icons` / `openGraph.images`。",
      ],
      check: "查看页面源码能看到图标生效；用社交平台调试工具或 `next build` 输出确认分享图标签存在。",
      pitfalls: [
        "文件放错目录（如放进 `app/dashboard/`）作用范围就变了 —— 文件式元数据同样「就近生效」。",
      ],
    },
    {
      title: "静态 metadata 对象与 title.template",
      why: "`title.template` 让你只在子页面写「后半段」，标题格式全站统一。",
      explain: [
        "在 `app/layout.tsx` 导出 `export const metadata: Metadata = { ... }`：含 `metadataBase`（你的部署域名）、`title`、`description`、`openGraph`、`twitter` 等。",
        "`title` 写成对象：`{ template: '%s | 品牌名', default: '品牌名' }`。**子页面只给 `%s` 那部分**（如 `'Invoices'`），最终渲染成 `Invoices | 品牌名`；页面自己没标题时用 `default`。",
        "「模板 + 局部」避免了每个页面重复写品牌名，也避免改品牌名时漏改。",
      ],
      note: "本项目的 `app/layout.tsx` 已经有一个 `metadata` 导出（标题是「Next.js 学习之旅」）。所以这一步是**改造已有的那个对象**，而不是新建文件。课程里的 `Acme Dashboard` 换成你自己的品牌名即可 —— 下面示例用的是本项目实际写法。",
      code:
        "// app/layout.tsx —— 在文件顶部加 import，并把已有的 metadata 改造成这样\n// ⚠️ 文件其余部分都不动：import './globals.css'（第 2 章）、\n//    import { inter }（第 3 章）、<body className={...}>（第 3 章）都保留\nimport type { Metadata } from 'next';\n\nexport const metadata: Metadata = {\n  metadataBase: new URL('https://你的部署域名'),\n  title: {\n    template: '%s | Next.js 学习之旅',\n    default: 'Next.js 学习之旅',\n  },\n  description: 'Next.js 官方 Dashboard 课程 16 章学习工作台。',\n};",
      check: "浏览器标签标题变成你配置的 `default`；源码里能看到 `<title>` 与 description。",
    },
    {
      title: "页面级标题：就近覆盖",
      why: "每个页面都该有自己的标题。",
      explain: [
        "给页面导出 `metadata` 即可覆盖上级默认值：在 `app/dashboard/invoices/page.tsx` 里 `export const metadata: Metadata = { title: 'Invoices' };`，最终标题是 **`Invoices | 你的品牌名`**。",
        "**就近优先**：页面的 `metadata` 覆盖上层布局；最上层是根布局。所以「默认值放根布局、特例放页面」是正确分工。",
        "标题要按数据动态生成时（如发票详情页显示发票号），用 `generateMetadata` —— 一个 `async` 函数，可 `await` 数据后返回 `Metadata`，参数与页面相同（含 `params`）。",
      ],
      code:
        "// app/dashboard/invoices/page.tsx —— 在第 10 章那个页面顶部新增这个导出（其余不动）\nimport type { Metadata } from 'next';\n\nexport const metadata: Metadata = {\n  title: 'Invoices',\n};\n\n// 需要动态标题时（例如详情页）：\nexport async function generateMetadata(props: { params: Promise<{ id: string }> }) {\n  const params = await props.params;\n  return { title: `Invoice #${params.id}` };\n}",
      check: "切换到 Invoices 页，浏览器标签标题变成 `Invoices | 你的品牌名`（本项目是 `Invoices | Next.js 学习之旅`）。",
      pitfalls: [
        "`metadata` 只能在**服务端组件**导出：文件加了 `'use client'` 就不能再导出它。",
        "同一个文件里不要同时导出 `metadata` 和 `generateMetadata`，选一个。",
      ],
    },
    {
      title: "练习：给所有页面补上标题",
      why: "收尾工作最能检验你是否真的掌握了「就近覆盖」。",
      explain: [
        "给这些页面加标题：`/login`（Login）、`/dashboard`（Home 或 Dashboard）、`/dashboard/customers`（Customers）、`/dashboard/invoices/create`（Create Invoice）、`/dashboard/invoices/[id]/edit`（Edit Invoice）。",
        "做完后逐个点开验证：每个页面标题各不相同，且都带 `| 你的品牌名` 后缀（本项目是 `| Next.js 学习之旅`）。",
        "想更进一步，给 `/dashboard/invoices/[id]/edit` 用 `generateMetadata`，从数据库取发票信息拼标题 —— 同时练到动态元数据。",
      ],
      check: "五个页面的标题各不相同且格式统一；没有页面还停留在默认标题。",
    },
  ],
  tips: [
    "元数据优先级：**页面的 `metadata` 覆盖上层布局**；这一条决定了默认值该放哪。",
    "`metadataBase` 忘了配，Open Graph 图片可能是相对路径，部分分享平台抓不到。",
    "元数据是服务端能力：客户端组件里无法导出 `metadata`。",
  ],
};
