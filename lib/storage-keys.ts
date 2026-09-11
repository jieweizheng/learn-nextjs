/**
 * 进度 / 笔记的 localStorage 键名。
 *
 * 单独一个小文件：这样**客户端组件**可以只引入键名，
 * 而不会因为 import `@/lib/chapters` 而把 16 章的全部讲解文本打进浏览器包。
 */
export const CHAPTERS_STORAGE_KEY = "nextjs-learn:chapters";

/** 某章「知识点」勾选进度 */
export function pointsStorageKey(slug: string): string {
  return `nextjs-learn:steps:${slug}`;
}

/** 某章的笔记 */
export function notesStorageKey(slug: string): string {
  return `nextjs-learn:notes:${slug}`;
}
