/**
 * 章节数据模型。
 *
 * 设计目标：把「课程知识点」本身做成可勾选的 checklist 项，
 * 并且每一项都带上**具体讲解**（转述官方文档内容），
 * 而不是只写一句「去看文档」。
 */

/** 一个知识点 = 学习清单里的一项，也是讲解的最小单位 */
export type KnowledgePoint = {
  /** 知识点标题（清单里显示的一行） */
  title: string;
  /** 一句话点明它解决什么问题、为什么值得学 */
  why?: string;
  /** 详细讲解：会按段落渲染；文中可以用 `反引号` 标出行内代码 */
  explain: string[];
  /** 示例命令 / 代码（供你自己敲，Agent 不会替你运行） */
  code?: string;
  /** 自检标准：做到什么算这一项过关 */
  check?: string;
  /** 常见坑 / 易错点 */
  pitfalls?: string[];
};

export type Chapter = {
  /** 章节序号 1-16 */
  num: number;
  /** 路由 / 目录标识，对应 chapters/<slug>/ */
  slug: string;
  /** 官方英文标题 */
  title: string;
  /** 中文标题 */
  titleZh: string;
  /** 官方文档地址 */
  officialUrl: string;
  /** 一句话说明本章要做什么 */
  summary: string;
  /** 学习目标 */
  goals: string[];
  /** 知识点清单（每项都可勾选，并带详解） */
  points: KnowledgePoint[];
  /** 本章整体提示 / 易错点 */
  tips?: string[];
};
