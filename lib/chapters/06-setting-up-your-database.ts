import type { Chapter } from "./types";

export const chapter06: Chapter = {
  num: 6,
  slug: "setting-up-your-database",
  title: "Setting Up Your Database",
  titleZh: "搭建数据库",
  officialUrl:
    "https://nextjs.org/learn/dashboard-app/setting-up-your-database",
  summary:
    "把代码推到 GitHub、在 Vercel 上部署并创建 Postgres 数据库，把连接信息写进本地 `.env`，最后用 `/seed` 播种数据、用 `/query` 验证取数。",
  goals: [
    "会把项目推到 GitHub",
    "会用 Vercel 导入仓库并完成一次部署",
    "会创建 Postgres 数据库并把连接串写进本地环境变量",
    "会运行 `/seed` 播种数据，并用 `/query` 验证能查到数据",
  ],
  points: [
    {
      title: "把代码推到 GitHub",
      why: "Vercel 从 Git 仓库拉代码部署，所以先把代码托管起来，后面才有「推送即部署」的自动化。",
      explain: [
        "在 GitHub 上新建一个空仓库（不要勾选初始化 README），然后把本地仓库关联并推送：`git remote add origin <你的仓库地址>`，接着 `git add . && git commit -m \"init\" && git push -u origin main`。",
        "推送前请确认 `.gitignore` 已经忽略了 `node_modules`、`.next`，以及**最重要的 `.env`** —— 数据库连接串里带密码，绝不能进仓库。",
        "⚠️ 本项目的实际情况：你推的是**整个学习工作台仓库**（包含清单主页与章节页的代码）。这完全没问题，工作台会一起部署到 Vercel；`.env` 已被忽略，密钥不会泄露。",
      ],
      code:
        "git init\ngit add .\ngit commit -m \"Next.js learn dashboard\"\ngit branch -M main\ngit remote add origin https://github.com/<你的账号>/<仓库名>.git\ngit push -u origin main",
      check: "刷新 GitHub 仓库页面能看到代码；仓库里**搜不到** `.env` 文件。",
      pitfalls: [
        "如果已经不小心提交过 `.env`，请删除该文件、重新提交，并到数据库后台**轮换密码**。",
      ],
    },
    {
      title: "在 Vercel 上导入并部署",
      why: "Vercel 是 Next.js 背后的公司，两者集成最顺，还能免费拿到数据库与部署环境。",
      explain: [
        "用 GitHub 账号登录 `vercel.com`，选择 Hobby（免费）计划。进入后点 **Add New → Project**，导入刚才那个仓库。",
        "Vercel 会自动识别这是 Next.js 项目，构建命令、输出目录都不用改，直接点 **Deploy**。几十秒后会给你一个 `xxx.vercel.app` 的域名。",
        "这次部署还有一个附带好处：**之后你每次 push 到 main 分支，Vercel 都会自动重新构建部署**（这就是 CI/CD）。",
      ],
      check: "能打开 `xxx.vercel.app` 看到你的应用；Vercel 项目页显示最近一次部署成功。",
    },
    {
      title: "创建 Postgres 数据库并连接",
      why: "课程需要一个真实数据库来练习查询与写入；Vercel 把它做成了「点几下就有」的服务。",
      explain: [
        "在 Vercel 项目页进入 **Storage** 标签，点 **Create Database**，选择 Postgres（提供方可能是 Neon、Supabase 等，课程用哪个都可以）。",
        "创建完成后，按提示把它 **Connect** 到你的项目 —— 这一步会自动向项目注入一组环境变量（`POSTGRES_URL`、`POSTGRES_PRISMA_URL`、`POSTGRES_URL_NON_POOLING` 等）。",
        "回到项目的 **.env.local** 标签页，点 **Show secret** 就能看到这些变量的值；把它们复制下来，下一步要写到本地的 `.env` 里。",
        "`POSTGRES_URL` 是**连接池**地址（服务器/Dashboard 里的普通查询用它）；`POSTGRES_URL_NON_POOLING` 是不走池的直连（迁移、播种等一次性操作用它更稳）。",
      ],
      check: "在 Storage 里能看到刚创建的数据库，且项目的环境变量里出现了 `POSTGRES_URL`。",
    },
    {
      title: "把连接信息写进本地 .env",
      why: "本地开发也要能连数据库，而环境变量不会被提交到仓库，所以必须手动写一份本地副本。",
      explain: [
        "把项目根目录下的 `.env.example` 重命名为 `.env`（官方就是让你改这个文件），把刚才从 Vercel 复制的内容粘贴进去。",
        "确认变量名与代码里用的一致：`app/lib/data.ts` 里读的是 `process.env.POSTGRES_URL`。如果 Vercel 的标签页里出现了 `DATABASE_URL` 这样的别名，不影响你使用 `POSTGRES_URL`，但如果缺少 `POSTGRES_URL`，就要自己补齐。",
        "最后做两件容易忘的事：**确认 `.env` 在 `.gitignore` 里**，以及**重启开发服务器** —— 环境变量只在进程启动时读取，不重启不会生效。",
      ],
      code:
        "# .env（示例，值来自 Vercel 的 .env.local 标签）\nPOSTGRES_URL=\"postgres://default:xxxx@xxxx.postgres.vercel-storage.com:5432/verceldb?sslmode=require\"\nPOSTGRES_PRISMA_URL=\"...\"\nPOSTGRES_URL_NON_POOLING=\"...\"",
      check: "`git status` 里看不到 `.env`；重启 dev server 后访问页面不再报缺少环境变量。",
      pitfalls: [
        "忘记重启 dev server：改了 `.env` 但 `process.env.POSTGRES_URL` 仍是 undefined。",
        "把 `.env` 提交到 Git：数据库密码泄露，需要立刻轮换。",
      ],
    },
    {
      title: "运行 /seed 播种数据",
      why: "数据库是空的，页面只能显示空表；先灌入课程准备好的假数据，后面才能真正练习查询。",
      explain: [
        "`app/seed/route.ts` 是一个 **Route Handler**：它导出一个 `GET` 函数，访问 `/seed` 就会执行。里面做的事情依次是：创建 `uuid-ossp` 扩展、建 `users` / `customers` / `invoices` / `revenue` 四张表，然后把 `app/lib/placeholder-data.ts` 里的数据插进去（用户密码用 `bcrypt` 哈希后存储）。",
        "保持 `npm run dev` 运行，浏览器访问 `http://localhost:3000/seed`（或是你实际的端口），看到 **`Database seeded successfully`** 就成功了。",
        "它是「一次性脚本」：官方说成功后可以删掉这个文件。**重复访问可能会重复插入数据**，所以别反复跑；如果想重来，先清空表再跑。",
      ],
      code: "// 保持开发服务器运行，然后在浏览器访问：\n// http://localhost:3000/seed\n//\n// 预期看到：Database seeded successfully",
      check: "页面显示 `Database seeded successfully`；到数据库的 Data 标签里能看到 4 张表都有数据。",
      pitfalls: [
        "访问 `/seed` 报连接错误：检查 `.env` 是否正确、是否重启过 dev server。",
        "重复执行导致数据重复：需要先 TRUNCATE 清表再播种。",
      ],
    },
    {
      title: "用 /query 验证取数",
      why: "播种成功只说明「写」通了，还要验证「读」得出来 —— 这是第 7 章的基础。",
      explain: [
        "打开 `app/query/route.ts`，里面有一段被注释掉的代码：用 `postgres` 建连接、写一个 `listInvoices()` 查询（联表查出金额为 666 的发票对应的客户名）。",
        "按文档把注释解开（同时删掉那句「Uncomment this file...」的占位返回），保存后访问 `/query`，你应该得到一条 JSON 数据 —— 金额 666 的那张发票。",
        "注意 `sql` 的用法：`await sql` + 模板字符串。这个模板字符串**只能在服务端执行**（它读环境变量、开 TCP 连接），所以这类文件都是服务端代码，不能被 `'use client'` 组件引用。",
        "做完本章后这个文件也可以删掉 —— 它的使命只是验证连通性。",
      ],
      code:
        "// app/query/route.ts（解开注释后的样子）\nimport postgres from 'postgres';\n\nconst sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });\n\nasync function listInvoices() {\n  const data = await sql`\n    SELECT invoices.amount, customers.name\n    FROM invoices\n    JOIN customers ON invoices.customer_id = customers.id\n    WHERE invoices.amount = 666;\n  `;\n  return data;\n}\n\nexport async function GET() {\n  try {\n    return Response.json(await listInvoices());\n  } catch (error) {\n    return Response.json({ error }, { status: 500 });\n  }\n}",
      check: "访问 `/query` 返回一条包含金额与客户名的 JSON；终端没有报错。",
    },
  ],
  tips: [
    "如果你已经有自己的 Postgres（本地或其他云厂商），可以跳过 Vercel 部署，直接把连接串写进 `.env`，但要保证 `app/lib/data.ts` 里的查询语句与你的表结构一致。",
    "仓库根目录的 `.env.example` 是模板（可以提交），`.env` 是你的真实密钥（必须忽略）。",
    "本章的 `/seed`、`/query` 都是「一次性工具」，用完可以删；但**表和数据要留着**，第 7 章起全靠它们。",
  ],
};
