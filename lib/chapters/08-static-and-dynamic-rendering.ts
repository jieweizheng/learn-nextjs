import type { Chapter } from "./types";

export const chapter08: Chapter = {
  num: 8,
  slug: "static-and-dynamic-rendering",
  title: "Static and Dynamic Rendering",
  titleZh: "静态与动态渲染",
  officialUrl:
    "https://nextjs.org/learn/dashboard-app/static-and-dynamic-rendering",
  summary:
    "分清「构建时就渲染好」与「每次请求都重新渲染」两种模式，并亲手制造一次慢请求，看它如何拖慢整页。",
  goals: [
    "能区分静态渲染与动态渲染",
    "知道各自的适用场景",
    "能模拟慢数据请求，并解释它为什么拖慢整页",
  ],
  points: [
    {
      title: "静态渲染：构建时生成，之后直接复用",
      why: "理解了它，才知道 Next.js 为什么能既「动态」又「极快」。",
      explain: [
        "**静态渲染**：页面在**构建时（build）**就渲染成 HTML，之后每次访问直接返回，不再重新查数与渲染。",
        "适合不随用户变化的内容：营销页、博客、商品介绍、文档站。",
        "- 好处：响应极快、可放 CDN、源站压力小",
        "- 代价：数据会「陈旧」，源数据变了页面不会自己更新（除非重新构建或做 revalidation）",
      ],
      check: "能举出两个适合静态渲染的页面类型，并说出它的一个缺点。",
    },
    {
      title: "动态渲染：每次请求都重新生成",
      why: "课程要做的 dashboard 就是动态页面。",
      explain: [
        "**动态渲染**：每次请求到达时才渲染 —— 执行组件、查库、生成 HTML 再返回。",
        "适合与用户或实时性相关的内容：读 cookie / 会话、依赖搜索参数、实时统计（如收入与发票）。",
        "触发方式两种：",
        "- 用了**动态 API**（`cookies()`、`headers()`、读 `searchParams`）",
        "- 数据请求本身不缓存",
        "本课程的 `app/lib/data.ts` 用 `postgres.js` 直连查库（不是 `fetch`），Next 无法替它缓存，所以 `/dashboard` 天然是**动态**的。",
      ],
      check: "能回答：为什么 `/dashboard` 是动态渲染的？",
    },
    {
      title: "动手模拟一个慢请求",
      why: "「页面只和最慢的请求一样快」这句话，亲眼看到才记得住。",
      explain: [
        "打开 `app/lib/data.ts`，`fetchRevenue()` 开头有一段被注释的演示代码：`console.log('Fetching revenue data...')` + `await new Promise((resolve) => setTimeout(resolve, 3000))`。",
        "按文档**取消注释**，让这个函数人为地慢 3 秒，模拟「数据库很慢」。",
        "这是**只用于教学的演示代码**，练完要注释回去。",
      ],
      code:
        "// app/lib/data.ts → fetchRevenue() 里的演示代码\nexport async function fetchRevenue() {\n  try {\n    console.log('Fetching revenue data...');\n    await new Promise((resolve) => setTimeout(resolve, 3000));\n\n    const data = await sql<Revenue>`SELECT * FROM revenue`;\n\n    console.log('Data fetch completed after 3 seconds.');\n    return data;\n  } catch (error) {\n    console.error('Database Error:', error);\n    throw new Error('Failed to fetch revenue data.');\n  }\n}",
      check: "代码已取消注释且保存，终端里没有报错。",
    },
    {
      title: "观察：整页被拖慢（以及为什么会这样）",
      why: "由「一个慢请求」推出「整页白屏」的因果关系。",
      explain: [
        "刷新 `/dashboard`：页面**卡住约 3 秒**才显示，终端先打印 `Fetching revenue data...`，3 秒后打印完成日志。",
        "原因（第 7 章讲过）：`await` 是串行的，且 Next 要**等整页数据到齐**才发 HTML。所以一个 3 秒请求能让**整页**延迟 3 秒 —— 连不依赖它的卡片和发票列表也一起被拖住。",
        "记住这句话：**动态渲染下，页面只和它最慢的那个数据请求一样快。** 解法不是「把请求写快」，而是「别让整页为一个慢请求等着」—— 即第 9 章的流式渲染。",
      ],
      check: "能重复描述现象并给出因果解释：慢请求 → 串行等待 → 整页 HTML 延迟输出 → 用户看到长时间白屏。",
      pitfalls: [
        "演示完记得把 `setTimeout` 与 `console.log` 注释回去，否则后面每步都慢 3 秒。",
        "看不出 3 秒延迟：多半改错了文件或 dev server 没热更新 —— 保存后看终端有没有新日志。",
      ],
    },
  ],
  tips: [
    "静态 / 动态不是「哪个更好」，而是「哪个更合适」：该静态的静态化（快、省），必须动态的就动态化（准、实时）。",
    "本课程不会手动指定渲染模式，而是让你理解「什么写法会导致动态渲染」，再用流式渲染把体验做好。",
  ],
};
