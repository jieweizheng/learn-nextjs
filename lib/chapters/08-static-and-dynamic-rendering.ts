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
      why: "理解了静态渲染，你才知道 Next.js 为什么能既「动态应用」又「极快响应」。",
      explain: [
        "**静态渲染**指页面在**构建时（build）**就渲染成 HTML，之后每次访问直接返回这份结果，不再重新执行数据查询与组件渲染。",
        "它适合「不随用户变化」的内容：营销页、博客文章、商品介绍页、文档站点。好处是响应极快（无需等数据）、可直接放 CDN、源站压力小。",
        "代价是数据会「陈旧」：构建之后源数据变了，页面不会自己更新，除非重新构建或使用按时间/按需的失效策略（这是 Next.js 缓存体系里的 ISR / revalidation 话题）。",
      ],
      check: "能举出两个适合静态渲染的页面类型，并说出它的一个缺点。",
    },
    {
      title: "动态渲染：每次请求都重新生成",
      why: "课程即将做的 dashboard 就是一个动态页面，你需要知道它在什么情况下会发生。",
      explain: [
        "**动态渲染**指页面在**每次请求到达时**才渲染：执行组件、查数据库、生成 HTML 再返回。",
        "它适合「跟用户或实时性相关」的内容：需要读取用户的 cookie / 会话、依赖搜索参数、展示实时统计数据（比如 dashboard 上的收入与发票）。",
        "触发方式有两种：一是代码里用了**动态 API**（如 `cookies()`、`headers()`、读 `searchParams`），Next.js 就知道这页不能在构建时定稿；二是数据请求本身被声明为不缓存。本课程的 `app/lib/data.ts` 用的是 `postgres.js` 直接查库（不是 `fetch`），Next.js 无法替它缓存，因此 `/dashboard` 天然是**动态**的 —— 每次访问都会重新查库。",
      ],
      check:
        "能回答：为什么 `/dashboard` 是动态渲染的？（提示：数据来自数据库直连，而不是构建时已知的静态内容。）",
    },
    {
      title: "动手模拟一个慢请求",
      why: "「页面只和最慢的请求一样快」这句话，只有亲眼看到才会真的记住。",
      explain: [
        "打开 `app/lib/data.ts`，在 `fetchRevenue()` 里有一段被注释掉的演示代码（大约在函数开头）：一行 `console.log('Fetching revenue data...')` + 一个 `await new Promise((resolve) => setTimeout(resolve, 3000))`，以及结尾的 `console.log('Data fetch completed after 3 seconds.')`。",
        "按文档把它们**取消注释**。这条 `setTimeout` 让这个取数函数**人为地慢 3 秒**，模拟「数据库很慢」的情况。",
        "这是**只用于教学的演示代码**，练习完成后要记得注释回去 —— 生产环境里没人会真的写 `setTimeout`。",
      ],
      code:
        "// app/lib/data.ts → fetchRevenue() 里的演示代码\nexport async function fetchRevenue() {\n  try {\n    console.log('Fetching revenue data...');\n    await new Promise((resolve) => setTimeout(resolve, 3000));\n\n    const data = await sql<Revenue>`SELECT * FROM revenue`;\n\n    console.log('Data fetch completed after 3 seconds.');\n    return data;\n  } catch (error) { /* ... */ }\n}",
      check: "代码已取消注释且保存，终端里没有报错。",
    },
    {
      title: "观察：整页被拖慢（以及为什么会这样）",
      why: "这是本章的高潮 —— 由「一个慢请求」推出「整页白屏」的因果关系。",
      explain: [
        "刷新 `/dashboard`：页面会**卡住约 3 秒**才显示任何内容，同时终端先打印 `Fetching revenue data...`、3 秒后打印 `Data fetch completed after 3 seconds.`。",
        "原因就是第 7 章讲的：页面里的 `await` 是串行的，而且 Next.js 要**等整页的数据都到齐**才把 HTML 发出去。所以一个 3 秒的请求，就能让**整页**延迟 3 秒 —— 收入图表慢，连不依赖它的卡片和发票列表也一起被拖住。",
        "这句话值得记住：**在动态渲染下，你的页面只和它最慢的那个数据请求一样快。** 解决方向不是「把请求写快一点」，而是「不要为了一个慢请求，让整页都等着」—— 也就是第 9 章的流式渲染。",
      ],
      check:
        "能重复描述现象并给出因果解释：慢请求 → 串行等待 → 整页 HTML 延迟输出 → 用户看到长时间白屏。",
      pitfalls: [
        "演示完记得把 `setTimeout` 与 `console.log` 注释回去，否则后面每一步都会慢 3 秒。",
        "如果刷新后看不出 3 秒延迟，多半是改错了文件或 dev server 没热更新 —— 保存文件后看终端有没有新的日志输出。",
      ],
    },
  ],
  tips: [
    "静态 / 动态不是「哪个更好」，而是「哪个更合适」：该静态的静态化（快、省钱），必须动态的就动态化（准、实时）。",
    "本课程后续不会手动指定渲染模式，而是让你理解「什么写法会导致动态渲染」，并学会用流式渲染把动态页面的体验做好。",
  ],
};
