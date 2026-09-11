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
      why: "样式能有全局效果，靠的是「根布局导入全局 CSS」这条链路；看懂它，后面才知道主题变量该写在哪。",
      explain: [
        "官方课程的第一步是引入全局样式：在 `app/ui/global.css` 里写 Tailwind 指令，再在 `app/layout.tsx` 顶部 `import '@/app/ui/global.css'`。之所以放在**根布局**，是因为根布局作用于全站的每个页面，导入一次，所有路由都会带上这些样式。",
        "**本项目的这一步已经做好了**：样式文件是 `app/globals.css`，`app/layout.tsx` 里已经 `import \"./globals.css\"`。你不需要动手，只要看懂这条链路。",
        "把样式放在根布局还有一个副作用：**全局 CSS 的作用域是全站**，所以像 Tailwind 这种天然带前缀/工具类的框架很适合放这里；要做「只影响某个组件」的样式，就用下面的 CSS Modules。",
      ],
      code: "// app/layout.tsx（本项目现状，节选）\nimport \"./globals.css\";\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang=\"en\">\n      <body>{children}</body>\n    </html>\n  );\n}",
      check: "打开 `app/layout.tsx` 能找到导入全局样式的这一行，并能说出「为什么放在这里」。",
    },
    {
      title: "用 Tailwind 工具类写样式",
      why: "课程后续几乎所有组件都用 Tailwind 写样式，不熟悉工具类，读课程代码会很吃力。",
      explain: [
        "Tailwind 是**工具类优先**的 CSS 框架：它提供了大量「一个类只干一件事」的类名（`text-blue-500`、`p-4`、`rounded-xl`、`flex`、`grid`……），你直接在元素上堆类名，不需要为每个组件另写样式文件。",
        "常见写法有几类：**尺寸间距**（`p-4`、`mt-2`、`w-full`）、**颜色**（`bg-sky-100`、`text-slate-600`）、**布局**（`flex`、`items-center`、`gap-3`、`grid`）、**状态/响应式前缀**（`hover:`、`md:`、`focus:`）。",
        "官方课程用它画了一个三角形来演示「类名也是样式」：利用 `border` 系列类把上下左右边框设成不同宽度、其中三条透明，就得到一个三角形。请你在**练习页** `app/playground/page.tsx` 里动手试（这个文件需要你自己新建；不要改 `app/page.tsx`，那是本工作台的清单主页）。",
      ],
      code:
        "// app/playground/page.tsx（你自己建，练手用）\n<div className=\"relative h-0 w-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-black\" />",
      check: "浏览器里能看到一个黑色三角形；再把 `border-b-black` 改成 `border-b-sky-500`，颜色会立刻变化。",
      pitfalls: [
        "本项目是 Tailwind **v4**：`app/globals.css` 里是 `@import \"tailwindcss\";`。官方文档写的是 v3 的 `@tailwind base/components/utilities;`，**照抄 v3 指令在本项目不生效**。",
        "工具类不生效时，先确认改动的是本项目（`npm run dev` 正在运行的那份代码），而不是别的项目目录。",
      ],
    },
    {
      title: "用 CSS Modules 写作用域样式",
      why: "Tailwind 适合快速拼样式，但当一段样式复杂、要复用时，独立的 CSS 文件更好维护 —— CSS Modules 解决「类名可能冲突」的问题。",
      explain: [
        "CSS Modules 就是一个普通的 CSS 文件，但文件名必须以 **`.module.css` 结尾**。导入它时拿到的是一个对象，里面的键是你写的类名、值是被改写过的唯一类名（类似 `_shape_1a2b3`），因此**不同组件里同名类不会互相覆盖**。",
        "用法：`import styles from './pg.module.css'`，然后 `<div className={styles.shape}>`。你写类名时不用关心会不会撞名，构建工具替你保证唯一。",
        "课程里 starter 已经带了 `app/ui/home.module.css`，你可以打开它看看写法；然后**自己在练习页旁边**新建 `app/playground/pg.module.css`，把刚才那个三角形用 CSS 重新实现一遍 —— 你会发现 Tailwind 和 CSS Modules 可以混用，没有谁替代谁。",
      ],
      code:
        "/* app/playground/pg.module.css —— 自己写 */\n.shape {\n  height: 0;\n  width: 0;\n  border-bottom: 30px solid black;\n  border-left: 20px solid transparent;\n  border-right: 20px solid transparent;\n}\n\n// app/playground/page.tsx\nimport styles from './pg.module.css';\n\n<div className={styles.shape} />",
      check: "三角形效果与用 Tailwind 写出来的一致；在浏览器开发者工具里能看到这个类名被加上了哈希后缀。",
    },
    {
      title: "用 clsx 按状态切换类名",
      why: "类名是字符串，一旦要「根据条件拼不同类名」，字符串拼接会立刻变得难读 —— `clsx` 用一个函数解决它。",
      explain: [
        "`clsx` 把「多个类名 + 条件对象」拼成一个干净的类名字符串：真值才保留。基本用法是 `clsx('基础类', { '条件类': 条件 })`，条件为 `true` 时加上、为 `false` 时忽略。",
        "课程里的例子是发票状态标签 `app/ui/invoices/status.tsx`：待付款时灰色底，已付款时绿色底。它用 `clsx('inline-flex items-center rounded-full px-2 py-1 text-xs', { 'bg-gray-100 text-gray-500': status === 'pending', 'bg-green-500 text-white': status === 'paid' })`。",
        "如果你只想给一个类名加个可选后缀，也可以写成 `clsx('base', condition && 'extra')`。多读几遍 `status.tsx` 的写法，第 5 章高亮导航链接时会立刻再用到它。",
      ],
      code:
        "// app/ui/invoices/status.tsx（课程已有，读它即可）\nimport clsx from 'clsx';\n\n<span\n  className={clsx(\n    'inline-flex items-center rounded-full px-2 py-1 text-xs',\n    {\n      'bg-gray-100 text-gray-500': status === 'pending',\n      'bg-green-500 text-white': status === 'paid',\n    },\n  )}\n>",
      check: "能不看代码说出 `clsx(基础类, { 类名: 条件 })` 的效果，并解释 `status.tsx` 里两个条件键分别什么时候生效。",
    },
  ],
  tips: [
    "📌 官方文档第一步「引入全局样式」在本项目**已经完成**（`app/layout.tsx` 已导入 `app/globals.css`），你只需看懂，不必动手。",
    "练习代码统一写在 `app/playground/`；**不要修改** `app/page.tsx`（清单主页）与 `app/chapters/[slug]/page.tsx`（章节页，也就是你现在看的页面）。",
    "CSS Modules 文件名**必须**以 `.module.css` 结尾，否则它只是一个普通的全局 CSS 文件，不会生成唯一类名。",
  ],
};
