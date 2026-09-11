import type { Chapter } from "./types";
import { chapter01 } from "./01-getting-started";
import { chapter02 } from "./02-css-styling";
import { chapter03 } from "./03-optimizing-fonts-images";
import { chapter04 } from "./04-creating-layouts-and-pages";
import { chapter05 } from "./05-navigating-between-pages";
import { chapter06 } from "./06-setting-up-your-database";
import { chapter07 } from "./07-fetching-data";
import { chapter08 } from "./08-static-and-dynamic-rendering";
import { chapter09 } from "./09-streaming";
import { chapter10 } from "./10-adding-search-and-pagination";
import { chapter11 } from "./11-mutating-data";
import { chapter12 } from "./12-error-handling";
import { chapter13 } from "./13-improving-accessibility";
import { chapter14 } from "./14-adding-authentication";
import { chapter15 } from "./15-adding-metadata";
import { chapter16 } from "./16-next-steps";

export type { Chapter, KnowledgePoint } from "./types";

/**
 * 16 章数据（单一来源）。
 *
 * 每一章一个文件，便于维护；新增 / 修改章节内容时：
 *   1. 改对应的 lib/chapters/NN-<slug>.ts
 *   2. 确认与 chapters/NN-<slug>/PLAN.md 描述一致
 */
export const chapters: Chapter[] = [
  chapter01,
  chapter02,
  chapter03,
  chapter04,
  chapter05,
  chapter06,
  chapter07,
  chapter08,
  chapter09,
  chapter10,
  chapter11,
  chapter12,
  chapter13,
  chapter14,
  chapter15,
  chapter16,
];

/** 根据 slug 查找章节 */
export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}

/** 章节目录名，例如 01-getting-started */
export function chapterDirName(chapter: Chapter): string {
  return `${String(chapter.num).padStart(2, "0")}-${chapter.slug}`;
}

/** 章节学习计划文件的相对路径，例如 chapters/01-getting-started/PLAN.md */
export function chapterPlanPath(chapter: Chapter): string {
  return `chapters/${chapterDirName(chapter)}/PLAN.md`;
}

/** 章节知识点数据文件（讲解正文所在处），例如 lib/chapters/01-getting-started.ts */
export function chapterDataPath(chapter: Chapter): string {
  return `lib/chapters/${chapterDirName(chapter)}.ts`;
}

/** 全部章节的知识点总数 */
export function totalKnowledgePoints(): number {
  return chapters.reduce((sum, c) => sum + c.points.length, 0);
}
