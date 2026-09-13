// proxy.ts（项目根目录，Next.js 16 的写法）
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|chapters|.*\\.png$).*)'],
  };