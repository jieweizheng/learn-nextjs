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
      why: "字体是「先下载后显示」的资源，处理不好会出现文字闪烁和布局跳动；Next.js 把这件事接管了。",
      explain: [
        "传统做法是在 CSS 里 `@import` 一个 Google Fonts 链接，或写 `<link>`。代价是：浏览器要先请求 CSS、再请求字体文件，这期间页面要么用备用字体顶替（文字突然换样式，叫 FOUT），要么干脆不显示文字（FOIT）—— 两种都影响体验。",
        "`next/font` 的做法是：**在构建时把字体文件下载下来、与你自己的静态资源一起托管**。所以用户访问时对字体的请求是「同源、已预加载」的，没有额外的第三方请求，也不会因为网络抖动而闪烁。",
        "它还顺带解决了一个隐形问题：字体的 `size-adjust` 等度量会被自动计算，让备用字体与目标字体占位一致，从而**避免布局偏移（CLS）**。课程用 `subsets: ['latin']` 只下载需要的字符子集，减小体积。",
      ],
      check: "能用自己的话说出：为什么 `next/font` 能减少「字体加载导致的闪烁与跳动」。",
    },
    {
      title: "认识 app/ui/fonts.ts",
      why: "这是全项目字体的「出口」，根布局和页面都从这里取字体，避免处处重复配置。",
      explain: [
        "课程把字体集中放在 `app/ui/fonts.ts`：从 `next/font/google` 引入 `Inter`，调用它并导出成 `inter` 常量。这个文件**本项目已经准备好了**（第 1 章搬素材时补齐的），直接打开读它。",
        "`Inter({ subsets: ['latin'] })` 里的 `subsets` 表示只下载拉丁字符集，这是官方推荐的省流量做法。返回的 `inter` 对象上有 `className` 和 `style` 等属性，供你在 JSX 里使用。",
        "为什么要单独一个文件？因为字体配置需要保持一致 —— 想换字体或加字重时，只改这一处。",
      ],
      code:
        "// app/ui/fonts.ts（本项目已有，读它即可）\nimport { Inter } from 'next/font/google';\n\nexport const inter = Inter({ subsets: ['latin'] });",
      check: "打开文件，能说出 `inter` 是从哪个包来的、`subsets` 的含义。",
    },
    {
      title: "把主字体应用到根布局",
      why: "字体要在全站生效，就得挂在根布局的 `<body>` 上，这是「一次配置、全站受益」的典型位置。",
      explain: [
        "在 `app/layout.tsx` 里 `import { inter } from '@/app/ui/fonts'`，然后把 `inter.className` 加到 `<body>` 的 `className` 上，字体就对所有页面生效了。",
        "官方还加了 `antialiased`（抗锯齿）工具类，让字体渲染更顺滑。写法是把两个类名拼起来：`className={`${inter.className} antialiased`}`。",
        "⚠️ 注意：**本项目的 `app/layout.tsx` 是工作台自己的根布局**，`<body>` 上已经有别的类名了。你要做的是把 `inter.className` **拼进去**，而不是覆盖掉原有的类名 —— 覆盖了页面样式会变。",
      ],
      code:
        "// app/layout.tsx（示意：把新字体拼进原有类名）\nimport { inter } from '@/app/ui/fonts';\n\n<body className={`${inter.className} ${原有的类名}`}>{children}</body>",
      check: "改完保存后，浏览器里中文/英文的数字与字母字形明显变化（Inter 更紧凑）；原有配色没被破坏。",
      pitfalls: [
        "`className` 写成 `className={inter.className}` 会把 `<body>` 上原有类名冲掉，页面背景色、文字色都会变 —— 记得用模板字符串拼接。",
      ],
    },
    {
      title: "练习：添加次字体 Lusitana",
      why: "课程故意让你「再来一遍」，因为真实项目里常常一个字体做正文、另一个做标题。",
      explain: [
        "在 `app/ui/fonts.ts` 里再加一个 `Lusitana`（衬线体），它的配置稍有不同：需要 `weight: ['400', '700']`，因为 Lusitana 不是可变字体，必须显式声明字重；同样加 `subsets: ['latin']`。",
        "然后把它应用到**练习页** `app/playground/page.tsx` 的 `<p>` 上（课程原本改的是 starter 首页，但本项目的 `app/page.tsx` 是清单主页，不能改）。",
        "顺便练一下：`app/ui/acme-logo.tsx` 里有个 `AcmeLogo` 组件，你可以把它用到练习页上，看看 logo 用不同字体时的效果。",
      ],
      code:
        "// app/ui/fonts.ts（追加）\nimport { Inter, Lusitana } from 'next/font/google';\n\nexport const lusitana = Lusitana({ weight: ['400', '700'], subsets: ['latin'] });\n\n// app/playground/page.tsx\nimport { lusitana } from '@/app/ui/fonts';\n\n<p className={lusitana.className}>用 Lusitana 渲染的一段文字</p>",
      check: "练习页上出现了衬线字体效果，且与页面其他文字明显不同。",
      pitfalls: [
        "忘记写 `weight` 会报类型错误 —— 非可变字体必须指定字重。不确定有哪些字重时，看编辑器的类型提示。",
      ],
    },
    {
      title: "用 <Image> 添加桌面端 hero 图",
      why: "图片是页面体积的大头，也是最容易造成布局抖动的元素；`next/image` 把「体积、格式、尺寸、懒加载」一起处理了。",
      explain: [
        "`next/image` 的 `<Image>` 相比原生 `<img>` 会自动做这些事：**按设备尺寸生成并返回合适的图片**（避免给手机发 2000px 大图）、**优先用 WebP/AVIF 等现代格式**、**进入视口才加载（懒加载）**、**必须给出宽高比，从而预留空间、防止布局偏移**。",
        "用法：`import Image from 'next/image'`，然后 `<Image src=\"/hero-desktop.png\" width={1000} height={760} className=\"hidden md:block\" alt=\"\" />`。`width` / `height` 写**源图的真实像素尺寸**（用来算比例），并不决定最终显示大小 —— 显示大小交给 CSS 类名。",
        "先在 `app/playground/page.tsx` 里练：加 `hero-desktop.png`，用 `hidden md:block` 让它只在桌面端（≥768px）显示。图片已在 `public/` 里，直接引用 `/hero-desktop.png` 即可。",
      ],
      code:
        "import Image from 'next/image';\n\n<Image\n  src=\"/hero-desktop.png\"\n  width={1000}\n  height={760}\n  className=\"hidden md:block\"\n  alt=\"Acme dashboard 预览图\"\n/>",
      check: "桌面宽度下图片显示、缩小到手机宽度后消失；Network 面板里图片是 WebP/AVIF 之类的优化格式。",
      pitfalls: [
        "`width` / `height` 必须与**源图比例**一致，否则图片会被拉伸变形。",
        "`alt` 别留空描述性缺失：装饰性图片可用 `alt=\"\"`，有含义的图要写清描述（第 13 章无障碍会用到）。",
      ],
    },
    {
      title: "练习：添加移动端 hero 图",
      why: "同一个位置在手机和桌面需要不同裁切的图，这是真实项目最常见的响应式需求。",
      explain: [
        "再加一张 `hero-mobile.png`，`width={560}`、`height={620}`，类名用 `block md:hidden` —— 与上一张恰好相反，于是两张图互斥显示：**桌面看桌面图，手机看手机图**。",
        "这就是「响应式图片」的朴素做法：不是把一张大图缩放，而是让浏览器**只下载当前设备真正需要的那张**。",
      ],
      code: "<Image\n  src=\"/hero-mobile.png\"\n  width={560}\n  height={620}\n  className=\"block md:hidden\"\n  alt=\"Acme dashboard 移动端预览\"\n/>",
      check: "拖动浏览器窗口宽度跨越 768px，两张图刚好此消彼长，不会同时出现。",
    },
  ],
  tips: [
    "练习写在 `app/playground/`；字体文件直接用 `app/ui/fonts.ts`，图片直接用 `public/` 里已有的素材。",
    "`<Image>` 的 `width` / `height` 决定的是**宽高比**（防布局偏移），不是最终显示尺寸；显示尺寸请用 CSS / Tailwind 类名控制。",
    "本项目是 Tailwind v4，响应式前缀（`md:`）用法与 v3 一致，可以放心写。",
  ],
};
