import type { Chapter } from "./types";

export const chapter02: Chapter = {
  num: 2,
  slug: "css-styling",
  title: "CSS Styling",
  titleZh: "CSS 样式",
  officialUrl: "https://nextjs.org/learn/dashboard-app/css-styling",
  summary:
    "用「全局样式 + Tailwind 工具类 + CSS Modules」三种方式给应用加样式，并学会用 clsx 做条件类名。",
  goals: [
    "看清全局 CSS 是怎么接到根布局上的（本项目已就绪）",
    "会用 Tailwind 工具类直接写样式",
    "会用 CSS Modules 写组件级作用域样式",
    "会用 `clsx` 根据状态切换类名",
  ],
  points: [
    {
      title: "全局样式挂在根布局上（本项目已就绪）",
      why: "样式为什么能全站生效？",
      explain: [
        "根布局作用于全站每个页面，所以全局 CSS 只要在 `app/layout.tsx` 导入一次，所有路由都会带上。",
        "本项目已就绪：`app/layout.tsx` 顶部导入了 `app/globals.css`（Tailwind v4 主题也写在这里）。",
        "要做「只影响某个组件」的样式，用下面的 CSS Modules。",
      ],
      note: "官方 starter 把全局样式放在 app/ui/ 下的 global.css，本项目没有这个文件 —— 看到官方文档提到它时，对应到 `app/globals.css` 即可。",
      code: "// app/layout.tsx（本项目现状，节选）\nimport \"./globals.css\";\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang=\"en\">\n      <body>{children}</body>\n    </html>\n  );\n}",
      check: "打开 `app/layout.tsx` 能找到导入全局样式的这一行，并说出「为什么放在这里」。",
    },
    {
      title: "用 Tailwind 工具类写样式",
      why: "课程后续几乎所有组件都用 Tailwind，不熟悉类名就读不动代码。",
      explain: [
        "Tailwind 是**工具类优先**的框架：一个类只干一件事，直接堆在元素上，不必为每个组件另写样式文件。",
        "常用四类：",
        "- 尺寸间距：`p-4`、`mt-2`、`w-full`",
        "- 颜色：`bg-sky-100`、`text-slate-600`",
        "- 布局：`flex`、`items-center`、`gap-3`、`grid`",
        "- 状态/响应式前缀：`hover:`、`md:`、`focus:`",
        "动手：在**练习页** `app/playground/page.tsx`（自己新建）用 `border-*` 类拼一个三角形 —— 三条边透明、一条边有色。",
      ],
      code:
        "// app/playground/page.tsx —— 写成一个完整的页面组件\n// （注意：整页必须是组件，不能只写一个裸的 <div />）\nexport default function Page() {\n  return (\n    <div className=\"relative h-0 w-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-black\" />\n  );\n}",
      check: "浏览器里能看到一个黑色三角形；把 `border-b-black` 改成 `border-b-sky-500`，颜色立刻变。",
      pitfalls: [
        "本项目是 Tailwind **v4**：`app/globals.css` 里是 `@import \"tailwindcss\";`。官方写的 v3 指令（`@tailwind base/components/utilities;`）**照抄不生效**。",
        "页面文件必须**默认导出**一个组件。只贴一段裸 JSX（单独一个 `<div />`）会报 `Property 'default' is missing` —— 示例片段要放进组件的 `return (...)` 里。",
        "工具类不生效时，先确认改的是本项目的代码（`npm run dev` 正在运行的那份）。",
      ],
    },
    {
      title: "用 CSS Modules 写作用域样式",
      why: "样式复杂、要复用时，独立 CSS 文件更好维护 —— 但要解决类名冲突。",
      explain: [
        "文件名以 **`.module.css` 结尾**即可。导入后拿到对象，键是你写的类名、值是被改写过的唯一类名（如 `_shape_1a2b3`），所以不同组件同名类不会互相覆盖。",
        "用法：`import styles from './pg.module.css'`，然后 `<div className={styles.shape}>`。",
        "动手：新建 `app/playground/pg.module.css`，把刚才那个三角形用 CSS 重新实现。Tailwind 与 CSS Modules 可以混用。",
      ],
      note: "官方 starter 自带一个现成的 CSS Modules 示例（首页那个样式模块），本项目没搬 —— 我们用不到，所以这条由你自己写一遍。",
      code:
        "/* 第 1 步 —— 新建 app/playground/pg.module.css，内容就是这些 */\n.shape {\n  height: 0;\n  width: 0;\n  border-bottom: 30px solid black;\n  border-left: 20px solid transparent;\n  border-right: 20px solid transparent;\n}\n\n/* 第 2 步 —— 把 app/playground/page.tsx 整个换成下面这个组件 */\nimport styles from './pg.module.css';\n\nexport default function Page() {\n  return <div className={styles.shape} />;\n}",
      check: "三角形效果与 Tailwind 版一致；开发者工具里能看到类名被加上了哈希后缀。",
    },
    {
      title: "用 clsx 按状态切换类名",
      why: "「根据条件拼类名」用字符串拼接会很难读。",
      explain: [
        "`clsx` 把「多个类名 + 条件对象」拼成干净的类名字符串，值为真才保留：`clsx('基础类', { '条件类': 条件 })`。",
        "课程例子是发票状态标签 `app/ui/invoices/status.tsx`：pending 灰底、paid 绿底。",
        "只想给一个类名加可选后缀时，写 `clsx('base', condition && 'extra')`。第 5 章高亮导航会再用到。",
      ],
      code:
        "// app/ui/invoices/status.tsx —— 节选：只看 return 里 clsx 那一段，文件本身不用改\nimport clsx from 'clsx';\n\n<span\n  className={clsx(\n    'inline-flex items-center rounded-full px-2 py-1 text-xs',\n    {\n      'bg-gray-100 text-gray-500': status === 'pending',\n      'bg-green-500 text-white': status === 'paid',\n    },\n  )}\n>",
      check: "能说出 `clsx(基础类, { 类名: 条件 })` 的效果，并解释 `app/ui/invoices/status.tsx` 里两个条件键分别何时生效。",
    },
  ],
  tips: [
    "📌 官方第一步「引入全局样式」在本项目**已完成**（`app/layout.tsx` 已导入 `app/globals.css`），看懂即可，不必动手。",
    "练习代码统一写在 `app/playground/`；**不要修改** `app/page.tsx`（清单主页）与 `app/chapters/[slug]/page.tsx`（章节页）。",
    "CSS Modules 文件名**必须**以 `.module.css` 结尾，否则只是普通全局 CSS，不会生成唯一类名。",
  ],
};
