import type { Chapter } from "./types";

export const chapter03: Chapter = {
  num: 3,
  slug: "optimizing-fonts-images",
  title: "Optimizing Fonts and Images",
  titleZh: "优化字体与图片",
  officialUrl: "https://nextjs.org/learn/dashboard-app/optimizing-fonts-images",
  summary:
    "用 `next/font` 添加自定义字体、用 `next/image` 添加响应式图片，理解 Next.js 为什么要替你接管这两件事。",
  goals: [
    "会用 `next/font/google` 引入主字体与次字体",
    "会把字体应用到根布局，让它全局生效",
    "会用 `next/image` 的 `<Image>` 添加响应式图片",
    "能解释字体 / 图片优化如何避免布局偏移（CLS）",
  ],
  points: [
    {
      title: "为什么用 next/font（而不是 CSS @import 字体）",
      why: "字体处理不好会文字闪烁、布局跳动。",
      explain: [
        "传统做法在 CSS 里 `@import` 或写 `<link>`：浏览器要先请求 CSS 再请求字体，期间要么用备用字体顶替（FOUT），要么不显示文字（FOIT）。",
        "`next/font` 在**构建时把字体文件下载下来、与自己的静态资源一起托管**，于是请求同源且已预加载，没有第三方请求，也不会闪烁。",
        "- `size-adjust` 等字体度量自动计算 → 备用字体与目标字体占位一致 → **避免布局偏移（CLS）**",
        "- `subsets: ['latin']` 只下载需要的字符子集 → 体积更小",
      ],
      check: "能说出：为什么 `next/font` 能减少「字体加载导致的闪烁与跳动」。",
    },
    {
      title: "认识 app/ui/fonts.ts",
      why: "全项目字体的出口，避免处处重复配置。",
      explain: [
        "字体集中在 `app/ui/fonts.ts`：从 `next/font/google` 引入 `Inter`，调用后导出成 `inter`。**本项目已备好**，打开读它即可。",
        "`Inter({ subsets: ['latin'] })` 返回的 `inter` 上有 `className`、`style` 等属性，供 JSX 使用。",
        "单独一个文件的好处：换字体或加字重只改这一处。",
      ],
      code:
        "// app/ui/fonts.ts（本项目已有，读它即可）\nimport { Inter } from 'next/font/google';\n\nexport const inter = Inter({ subsets: ['latin'] });",
      check: "打开文件，能说出 `inter` 来自哪个包、`subsets` 的含义。",
    },
    {
      title: "把主字体应用到根布局",
      why: "字体要全站生效，挂在哪最省事？",
      explain: [
        "在 `app/layout.tsx` 里 `import { inter } from '@/app/ui/fonts'`，把 `inter.className` 加到 `<body>` 的 `className` 上，全站生效。",
        "官方还加了 `antialiased`（抗锯齿）：`className={`${inter.className} antialiased`}`。",
        "⚠️ 本项目 `<body>` 上已有别的类名，要**拼进去**，不要覆盖。",
      ],
      code:
        "// app/layout.tsx —— 改这一处：给 <body> 加上 className（import 那行也要补在最上面）\nimport { inter } from '@/app/ui/fonts';\n\n<body className={`${inter.className} antialiased`}>{children}</body>",
      check: "保存后浏览器里字形明显变化（Inter 更紧凑），且原有配色没被破坏。",
      pitfalls: [
        "`className={inter.className}` 会把原有类名冲掉，背景色、文字色都会变 —— 用模板字符串拼接。",
      ],
    },
    {
      title: "练习：添加次字体 Lusitana",
      why: "真实项目常是一个字体做正文、另一个做标题。",
      explain: [
        "在 `app/ui/fonts.ts` 追加 `Lusitana`（衬线体）。它不是可变字体，必须显式写 `weight: ['400', '700']`；同样加 `subsets: ['latin']`。",
        "用到**练习页** `app/playground/page.tsx` 的 `<p>` 上（官方改的是 starter 首页，本项目 `app/page.tsx` 是清单主页，不能改）。",
      ],
      code:
        "// ① app/ui/fonts.ts —— 文件里追加 lusitana 这一个导出（import 那行也要加上 Lusitana）\nimport { Inter, Lusitana } from 'next/font/google';\n\nexport const lusitana = Lusitana({ weight: ['400', '700'], subsets: ['latin'] });\n\n// ② app/playground/page.tsx —— 整个文件换成下面这个组件\nimport { lusitana } from '@/app/ui/fonts';\n\nexport default function Page() {\n  return <p className={lusitana.className}>用 Lusitana 渲染的一段文字</p>;\n}",
      check: "练习页上出现衬线字体效果，与页面其他文字明显不同。",
      pitfalls: [
        "忘记写 `weight` 会报类型错误 —— 非可变字体必须指定字重。",
      ],
    },
    {
      title: "用 <Image> 添加桌面端 hero 图",
      why: "图片是体积大头、也最容易造成布局抖动。",
      explain: [
        "`<Image>` 相比原生 `<img>` 自动做四件事：",
        "- 按设备尺寸返回合适的图（不给手机发 2000px 大图）",
        "- 优先用 WebP / AVIF 等现代格式",
        "- 进入视口才加载（懒加载）",
        "- 由 `width` / `height` 预留空间，防止布局偏移",
        "`width` / `height` 写**源图真实像素尺寸**（用来算比例），不决定最终显示大小 —— 显示大小交给 CSS 类名。",
        "动手：在 `app/playground/page.tsx` 加一张 hero 图，用 `hidden md:block` 让它只在桌面端（≥768px）显示。`src` 写 `/hero-desktop.png`（开头的 `/` 是网站根，指向 `public/`）。",
      ],
      code:
        "// app/playground/page.tsx —— 完整页面组件（整个文件换成这些）\nimport Image from 'next/image';\n\nexport default function Page() {\n  return (\n    <Image\n      src=\"/hero-desktop.png\"\n      width={1000}\n      height={760}\n      className=\"hidden md:block\"\n      alt=\"Acme dashboard 预览图\"\n    />\n  );\n}",
      check: "桌面宽度下图片显示、缩到手机宽度后消失；Network 面板里是 WebP/AVIF 之类优化格式。",
      pitfalls: [
        "`width` / `height` 必须与**源图比例**一致，否则图片被拉伸变形。",
        "装饰性图片用 `alt=\"\"`，有含义的图要写清描述（第 13 章无障碍会用到）。",
      ],
    },
    {
      title: "练习：添加移动端 hero 图",
      why: "手机与桌面需要不同裁切的图，这是最常见的响应式需求。",
      explain: [
        "再加 `public/hero-mobile.png`，`width={560}`、`height={620}`，类名 `block md:hidden` —— 与上一张互斥。",
        "这不是「把一张大图缩放」，而是让浏览器**只下载当前设备真正需要的那张**。",
      ],
      code: "// 在 app/playground/page.tsx 里，紧挨着上一张 <Image> 的下面再加一个：\n<Image\n  src=\"/hero-mobile.png\"\n  width={560}\n  height={620}\n  className=\"block md:hidden\"\n  alt=\"Acme dashboard 移动端预览\"\n/>\n\n// 两张图要放在一个父元素里，组件整体长这样：\nexport default function Page() {\n  return (\n    <div>\n      {/* 上一张：hidden md:block */}\n      {/* 这一张：block md:hidden */}\n    </div>\n  );\n}",
      check: "拖动窗口宽度跨越 768px，两张图此消彼长，不会同时出现。",
    },
  ],
  tips: [
    "练习写在 `app/playground/`；字体用 `app/ui/fonts.ts`，图片用 `public/` 里已有的素材。",
    "`<Image>` 的 `width` / `height` 决定的是**宽高比**（防布局偏移），不是最终显示尺寸；显示尺寸用 CSS / Tailwind 控制。",
    "本项目是 Tailwind v4，响应式前缀（`md:`）用法与 v3 一致。",
  ],
};
