/**
 * 「点击文件路径 → 在编辑器里打开」所需的纯逻辑（无 React、无 Node 依赖，客户端可用）。
 *
 * 原理：主流编辑器都注册了**自定义 URL 协议**，浏览器把链接交给操作系统，
 * 系统再唤起对应编辑器并定位到该文件：
 *   - Cursor           → `cursor://file/<绝对路径>`
 *   - VS Code          → `vscode://file/<绝对路径>`（Insiders 用 `vscode-insiders://`）
 *   - Windsurf         → `windsurf://file/<绝对路径>`
 *   - Zed              → `zed://file/<绝对路径>`
 *   - JetBrains 系列   → `webstorm://open?file=<绝对路径>` 等
 *   - Sublime Text     → `subl://open?url=file:///<绝对路径>`
 *
 * 用哪个编辑器由服务端自动探测（见 `lib/detect-editor.ts`），用户无需选择。
 *
 * ⚠️ 前提：页面与项目在同一台机器上（本地 `npm run dev` 时成立），
 *    部署到线上后浏览器无法访问你本机文件，这个功能自然失效。
 */

export type EditorId =
  | "cursor"
  | "windsurf"
  | "vscode"
  | "vscode-insiders"
  | "zed"
  | "webstorm"
  | "idea"
  | "pycharm"
  | "phpstorm"
  | "goland"
  | "sublime"
  | "none";

/** 编辑器 id → 显示名（也用于链接的 title 提示） */
export const EDITOR_LABELS: Record<EditorId, string> = {
  cursor: "Cursor",
  windsurf: "Windsurf",
  vscode: "VS Code",
  "vscode-insiders": "VS Code Insiders",
  zed: "Zed",
  webstorm: "WebStorm",
  idea: "IntelliJ IDEA",
  pycharm: "PyCharm",
  phpstorm: "PhpStorm",
  goland: "GoLand",
  sublime: "Sublime Text",
  none: "（未识别到编辑器）",
};

export function editorLabel(id: EditorId): string {
  return EDITOR_LABELS[id] ?? id;
}

export function isEditorId(value: string): value is EditorId {
  return Object.prototype.hasOwnProperty.call(EDITOR_LABELS, value);
}

/** 各编辑器的 URL 构造方式（JetBrains 系列用 `?file=` 查询参数） */
const URL_BUILDERS: Record<
  Exclude<EditorId, "none">,
  (forwardSlashPath: string) => string
> = {
  cursor: (p) => `cursor://file/${p}`,
  windsurf: (p) => `windsurf://file/${p}`,
  vscode: (p) => `vscode://file/${p}`,
  "vscode-insiders": (p) => `vscode-insiders://file/${p}`,
  zed: (p) => `zed://file/${p}`,
  webstorm: (p) => `webstorm://open?file=${encodeURIComponent(p)}`,
  idea: (p) => `idea://open?file=${encodeURIComponent(p)}`,
  pycharm: (p) => `pycharm://open?file=${encodeURIComponent(p)}`,
  phpstorm: (p) => `phpstorm://open?file=${encodeURIComponent(p)}`,
  goland: (p) => `goland://open?file=${encodeURIComponent(p)}`,
  sublime: (p) => `subl://open?url=file:///${p}`,
};

/** 项目根目录下的零散文件（没有 `/`，但确实值得做成可点击） */
const ROOT_FILE_WHITELIST = new Set([
  ".env.example",
  ".env.local",
  ".env",
  ".gitignore",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "next.config.ts",
  "next.config.mjs",
  "postcss.config.mjs",
  "next-env.d.ts",
  "middleware.ts",
  "proxy.ts",
  "auth.ts",
  "auth.config.ts",
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
]);

/**
 * 判断一段行内代码（`反引号` 里的内容）是不是「项目内的文件路径」。
 *
 * 判定刻意保守：宁可少链接，也不要把 `page.tsx`、`next/image` 这类
 * 只是「文件名 / 模块名」的东西误当成路径（那样会跳到不存在的文件）。
 */
export function looksLikeFilePath(text: string): boolean {
  const t = text.trim();
  if (!t || t.length > 120) return false;
  // 外链、协议链接不算
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(t)) return false;
  // 尖括号包起来的目录名（如 <slug>）不算
  if (/[<>*?]/.test(t)) return false;
  // 根目录零散文件白名单
  if (ROOT_FILE_WHITELIST.has(t)) return true;
  // 其余必须是「带目录 + 带扩展名」的样子
  // 注意：目录段必须非空，否则 `/hero-desktop.png` 这类**网站根路径**会被误判
  if (!t.includes("/")) return false;
  return /^[\w.@~()\-\[\]]+(?:\/[\w.@~()\-\[\]]+)*\/[\w.@()\-\[\]]+\.[a-z0-9]{1,6}(?::\d+(?::\d+)?)?$/i.test(
    t,
  );
}

/** 把 `path/to/file.ts:12` 拆成路径 + 行号 */
export function splitLineSuffix(path: string): {
  file: string;
  line?: string;
} {
  const m = /^(.*):(\d+)(?::(\d+))?$/.exec(path.trim());
  // 单字母 + 冒号是 Windows 盘符（D:），不是行号
  if (m && !(m[1].length === 1 && /^[a-zA-Z]$/.test(m[1]))) {
    return { file: m[1], line: m[3] ? `${m[2]}:${m[3]}` : m[2] };
  }
  return { file: path.trim() };
}

function isAbsolute(p: string): boolean {
  return /^[a-zA-Z]:[\\/]/.test(p) || p.startsWith("\\\\") || p.startsWith("/");
}

/**
 * 相对路径 → 绝对路径。`root` 由服务端自动探测得到（用户无需关心）。
 * 已经是绝对路径的原样返回；root 为空时也原样返回（调用方会退化为「只复制路径」）。
 */
export function toAbsolutePath(root: string, relative: string): string {
  const { file, line } = splitLineSuffix(relative);
  let abs = file;

  if (!isAbsolute(file) && root) {
    const base = root.replace(/[\\/]+$/, "");
    const sep = base.includes("\\") ? "\\" : "/";
    // 允许写成 `/app/x.ts` 或 `./app/x.ts`，都当作「项目根目录下」
    abs = `${base}${sep}${file.replace(/^\.?\//, "")}`;
  }

  return line ? `${abs}:${line}` : abs;
}

/**
 * 生成唤起编辑器的 URL。
 * 绝对路径在 URL 里统一用正斜杠（Windows 上也如此，VS Code 官方即此写法）。
 * 返回 null 表示「没有可唤起的编辑器」，此时调用方应退化为复制路径。
 */
export function buildEditorUrl(
  editor: EditorId,
  absolutePath: string,
): string | null {
  if (editor === "none") return null;
  const builder = URL_BUILDERS[editor];
  if (!builder) return null;
  return builder(absolutePath.replace(/\\/g, "/"));
}
