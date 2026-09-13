// proxy.ts（项目根目录，Next.js 16 的写法）
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // 白名单：只拦截受保护区。
  // - `/dashboard/:path*`：dashboard 本身（`/(overview)`）及其所有子页（customers / invoices / create / [id]/edit）
  // - `/login`：用于「已登录访问登录页 → 送回 dashboard」
  // 其余路径（`/`、`/chapters/*`、`/playground`、`/api/*`、`/seed`、`/favicon.ico` 等）
  // 根本不进 proxy，因此不受登录逻辑影响。
  matcher: ['/dashboard/:path*', '/login'],
};