/**
 * 取项目根目录的绝对路径（**只在服务端调用**）。
 *
 * 本地跑 `npm run dev` / `npm run build` 时，`process.cwd()` 就是项目根目录
 * （例如 `/path/to/learn-nextjs`），用来把讲解里的 `app/lib/definitions.ts`
 * 拼成 `/path/to/learn-nextjs/app/lib/definitions.ts`，交给编辑器的自定义协议打开。
 *
 * 用户无需关心这个值；只有在「项目不在启动目录下」这类特殊部署里，
 * 才需要在 `.env.local` 里显式覆盖：
 *   NEXT_PUBLIC_PROJECT_ROOT=/path/to/learn-nextjs
 */
export function getProjectRoot(): string {
  return process.env.NEXT_PUBLIC_PROJECT_ROOT || process.cwd();
}
