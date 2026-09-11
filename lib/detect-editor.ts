/**
 * 自动探测「用户正在用哪个编辑器」（**只在服务端跑**）。
 *
 * 思路：dev server 就跑在用户本机上，所以它有能力直接问系统 ——
 * 用户完全不需要做任何配置。
 *
 * 证据（按可信度排序）：
 *   1. `LEARN_NEXTJS_EDITOR` 环境变量（唯一的「手动」方式，可选，用于兜底）
 *   2. **启动 dev server 的终端**：如果是从编辑器的内置终端跑的 npm run dev，
 *      环境变量里会留下痕迹（Cursor → `CURSOR_TRACE_ID`，VS Code → `TERM_PROGRAM=vscode` 等）
 *   3. **正在运行的进程**：装了、又正好在跑的编辑器，几乎可以确定就是它
 *      （Windows 用 `tasklist`，macOS/Linux 用 `ps`）
 *   4. **协议是否注册**：Windows 查 `HKEY_CLASSES_ROOT\<scheme>`（只有注册了，
 *      `cursor://` 这类链接才能真正被浏览器唤起）
 *   5. 兜底：PATH 上能否找到编辑器命令行；Windows 再补一层常见安装目录
 *
 * 结果在进程内缓存 5 分钟（编辑器不会频繁换）。
 */

import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { editorLabel, isEditorId, type EditorId } from "@/lib/editor-links";
import { getProjectRoot } from "@/lib/project-root";

type EditorKey = Exclude<EditorId, "none">;

type Hint = {
  id: EditorKey;
  /** Windows 注册表里的 URL 协议键名，也是浏览器要唤起的 scheme */
  scheme: string;
  /** 进程名（小写比较）：正在运行的编辑器 */
  processes: string[];
  /** PATH 上的命令行程序名 */
  bins: string[];
  /** macOS 应用目录名 */
  macApps: string[];
  /** Linux .desktop 文件名（小写匹配） */
  linuxDesktop: string[];
  /** Windows 常见安装位置（相对各安装根目录；`*` 可匹配一层目录名） */
  winPaths: string[];
};

/** 顺序即「同样可用时的优先级」 */
const HINTS: Hint[] = [
  {
    id: "cursor",
    scheme: "cursor",
    processes: ["cursor.exe", "cursor"],
    bins: ["cursor"],
    macApps: ["Cursor.app"],
    linuxDesktop: ["cursor.desktop"],
    winPaths: ["Programs/cursor/Cursor.exe", "cursor/Cursor.exe"],
  },
  {
    id: "windsurf",
    scheme: "windsurf",
    processes: ["windsurf.exe", "windsurf"],
    bins: ["windsurf"],
    macApps: ["Windsurf.app"],
    linuxDesktop: ["windsurf.desktop"],
    winPaths: ["Programs/Windsurf/Windsurf.exe", "Windsurf/Windsurf.exe"],
  },
  {
    id: "vscode",
    scheme: "vscode",
    processes: ["code.exe", "code"],
    bins: ["code"],
    macApps: ["Visual Studio Code.app"],
    linuxDesktop: ["code.desktop"],
    winPaths: [
      "Programs/Microsoft VS Code/Code.exe",
      "Microsoft VS Code/Code.exe",
    ],
  },
  {
    id: "vscode-insiders",
    scheme: "vscode-insiders",
    processes: ["code - insiders.exe", "code-insiders"],
    bins: ["code-insiders"],
    macApps: ["Visual Studio Code - Insiders.app"],
    linuxDesktop: ["code-insiders.desktop"],
    winPaths: [
      "Programs/Microsoft VS Code Insiders/Code - Insiders.exe",
      "Microsoft VS Code Insiders/Code - Insiders.exe",
    ],
  },
  {
    id: "zed",
    scheme: "zed",
    processes: ["zed.exe", "zed"],
    bins: ["zed"],
    macApps: ["Zed.app"],
    linuxDesktop: ["zed.desktop"],
    winPaths: ["Programs/Zed/zed.exe", "Zed/zed.exe"],
  },
  {
    id: "webstorm",
    scheme: "webstorm",
    processes: ["webstorm64.exe", "webstorm.exe", "webstorm"],
    bins: ["webstorm"],
    macApps: ["WebStorm.app"],
    linuxDesktop: ["webstorm.desktop"],
    winPaths: ["JetBrains/*/bin/webstorm64.exe", "Programs/*/bin/webstorm64.exe"],
  },
  {
    id: "idea",
    scheme: "idea",
    processes: ["idea64.exe", "idea.exe", "idea"],
    bins: ["idea"],
    macApps: ["IntelliJ IDEA.app", "IntelliJ IDEA Ultimate.app"],
    linuxDesktop: [
      "intellij-idea-ultimate.desktop",
      "intellij-idea-community.desktop",
    ],
    winPaths: ["JetBrains/*/bin/idea64.exe", "Programs/*/bin/idea64.exe"],
  },
  {
    id: "pycharm",
    scheme: "pycharm",
    processes: ["pycharm64.exe", "pycharm.exe", "pycharm"],
    bins: ["pycharm"],
    macApps: ["PyCharm.app", "PyCharm CE.app"],
    linuxDesktop: ["pycharm-ultimate.desktop", "pycharm-community.desktop"],
    winPaths: ["JetBrains/*/bin/pycharm64.exe", "Programs/*/bin/pycharm64.exe"],
  },
  {
    id: "phpstorm",
    scheme: "phpstorm",
    processes: ["phpstorm64.exe", "phpstorm.exe", "phpstorm"],
    bins: ["phpstorm"],
    macApps: ["PhpStorm.app"],
    linuxDesktop: ["phpstorm.desktop"],
    winPaths: [
      "JetBrains/*/bin/phpstorm64.exe",
      "Programs/*/bin/phpstorm64.exe",
    ],
  },
  {
    id: "goland",
    scheme: "goland",
    processes: ["goland64.exe", "goland.exe", "goland"],
    bins: ["goland"],
    macApps: ["GoLand.app"],
    linuxDesktop: ["goland.desktop"],
    winPaths: ["JetBrains/*/bin/goland64.exe", "Programs/*/bin/goland64.exe"],
  },
  {
    id: "sublime",
    scheme: "subl",
    processes: ["sublime_text.exe", "sublime_text"],
    bins: ["subl"],
    macApps: ["Sublime Text.app"],
    linuxDesktop: ["sublime_text.desktop"],
    winPaths: [
      "Sublime Text/sublime_text.exe",
      "Programs/Sublime Text/sublime_text.exe",
    ],
  },
];

export type EditorEnv = {
  /** 探测到的编辑器；`none` = 没找到可唤起的编辑器（此时点击只复制路径） */
  editor: EditorId;
  label: string;
  /** 项目根目录的绝对路径（相对路径会拼到它下面） */
  root: string;
  /** 结论来自哪里，便于排查 */
  source: "env" | "terminal" | "running" | "installed" | "none";
  /** 本机检测到「可能可用」的编辑器（按优先级） */
  candidates: EditorId[];
  platform: string;
  /** 各条证据是否可用（排查用；客户端不关心） */
  evidence: {
    /** Windows 注册表里的 URL 协议查询结果 */
    registry: "ok" | "blocked" | "empty" | "skipped";
    /** PATH 上找到了命令行程序 */
    path: boolean;
    /** 读到了正在运行的进程列表 */
    running: boolean;
    /** 命中了常见安装目录 */
    installDir: boolean;
  };
  /** 系统层面的探测失败原因（可选） */
  warnings?: string[];
};

let cache: { at: number; data: EditorEnv } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function detectEditorEnv(): Promise<EditorEnv> {
  if (cache && Date.now() - cache.at < CACHE_TTL) return cache.data;

  let result: EditorEnv;
  try {
    result = await runDetection();
  } catch (error) {
    result = {
      editor: "none",
      label: editorLabel("none"),
      root: getProjectRoot(),
      source: "none",
      candidates: [],
      platform: process.platform,
      evidence: {
        registry: "skipped",
        path: false,
        running: false,
        installDir: false,
      },
      warnings: [error instanceof Error ? error.message : String(error)],
    };
  }

  cache = { at: Date.now(), data: result };
  return result;
}

async function runDetection(): Promise<EditorEnv> {
  const root = getProjectRoot();
  const warnings: string[] = [];

  // 1) 显式指定（不对外宣传，只在自动探测不灵时当作兜底）
  const override = (process.env.LEARN_NEXTJS_EDITOR ?? "").trim();
  if (override && isEditorId(override)) {
    return {
      editor: override,
      label: editorLabel(override),
      root,
      source: "env",
      candidates: [override],
      platform: process.platform,
      evidence: {
        registry: "skipped",
        path: false,
        running: false,
        installDir: false,
      },
    };
  }

  // 2~5) 并行探测
  const [installed, running] = await Promise.all([
    probeInstalled(warnings),
    probeRunning(warnings),
  ]);

  const candidates = HINTS.map((h) => h.id).filter((id) =>
    installed.found.has(id),
  );
  // 「装了、而且正在运行」——进程名要和候选编辑器对上（如 cursor.exe ↔ cursor）
  const runningInstalled = candidates.filter((id) => {
    const hint = HINTS.find((h) => h.id === id);
    return hint ? hint.processes.some((p) => running.names.has(p)) : false;
  });

  const base = {
    root,
    platform: process.platform,
    candidates,
    evidence: {
      registry: installed.registry,
      path: installed.viaPath.size > 0,
      running: running.ok,
      installDir: installed.viaInstallDir.size > 0,
    },
  };
  const withWarnings = warnings.length ? { warnings } : {};

  // 2) 启动 dev server 的终端（编辑器的内置终端）
  const hint = terminalHint(installed.found);
  if (hint) {
    return {
      ...base,
      ...withWarnings,
      editor: hint,
      label: editorLabel(hint),
      source: "terminal",
    };
  }

  // 3) 装了、而且正在运行
  if (runningInstalled.length > 0) {
    const id = runningInstalled[0];
    return {
      ...base,
      ...withWarnings,
      editor: id,
      label: editorLabel(id),
      source: "running",
    };
  }

  // 4) 装了（协议已注册 / 应用存在 / 安装目录命中 / PATH 上有）
  if (candidates.length > 0) {
    const id = candidates[0];
    return {
      ...base,
      ...withWarnings,
      editor: id,
      label: editorLabel(id),
      source: "installed",
    };
  }

  // 5) 什么都没找到 → 退化为「点击复制路径」
  return {
    ...base,
    ...withWarnings,
    editor: "none",
    label: editorLabel("none"),
    source: "none",
  };
}

/**
 * 从「启动 dev server 的终端」的环境变量推断编辑器。
 * 只有该编辑器确实可用（`installed`）时才采纳，避免误判。
 */
function terminalHint(installed: Set<EditorId>): EditorId | null {
  const env = process.env;
  const term = (env.TERM_PROGRAM ?? "").toLowerCase();
  const bundle = (env.__CFBundleIdentifier ?? "").toLowerCase();
  const ipc = (env.VSCODE_IPC_HOOK ?? "").toLowerCase();

  const guess = (id: EditorKey): EditorId | null =>
    installed.has(id) ? id : null;

  // 出于安全考虑，只做「有就采纳」的判断；没有就返回 null 交给后面的规则
  if (
    env.CURSOR_TRACE_ID ||
    term.includes("cursor") ||
    bundle.includes("cursor")
  ) {
    return guess("cursor") ?? guess("vscode");
  }
  if (term.includes("windsurf") || bundle.includes("windsurf")) {
    return guess("windsurf");
  }
  if (env.VSCODE_IPC_HOOK || term === "vscode" || bundle.includes("vscode")) {
    // VS Code Insiders 的 TERM_PROGRAM 同样是 vscode，靠 IPC 路径区分
    if (ipc.includes("insiders") || bundle.includes("insiders")) {
      return guess("vscode-insiders") ?? guess("vscode");
    }
    return guess("vscode") ?? guess("vscode-insiders");
  }
  if (term.includes("zed") || bundle === "dev.zed.zed") return guess("zed");
  // JetBrains 内置终端只给出 TERMINAL_EMULATOR，看不出具体产品，按优先级挑已装的
  if (
    env.TERMINAL_EMULATOR === "JetBrains-JediTerm" ||
    bundle.includes("jetbrains")
  ) {
    const order: EditorKey[] = ["webstorm", "idea", "pycharm", "phpstorm", "goland"];
    for (const id of order) {
      const hit = guess(id);
      if (hit) return hit;
    }
  }
  return null;
}

type InstalledProbe = {
  found: Set<EditorId>;
  registry: EditorEnv["evidence"]["registry"];
  viaPath: Set<EditorId>;
  viaInstallDir: Set<EditorId>;
};

/** 本机「可用」的编辑器：协议已注册 / 应用存在 / 安装目录命中 / PATH 上有命令行 */
async function probeInstalled(warnings: string[]): Promise<InstalledProbe> {
  const found = new Set<EditorId>();
  let registry: InstalledProbe["registry"] = "skipped";

  if (process.platform === "win32") {
    const results = await Promise.all(
      HINTS.map(
        async (h) => [h.id, await queryWindowsProtocol(h.scheme)] as const,
      ),
    );
    const yes = results.filter(([, r]) => r === "yes");
    const errored = results.filter(([, r]) => r === "error");
    for (const [id] of yes) found.add(id);
    if (yes.length > 0) {
      registry = "ok";
    } else if (errored.length > 0) {
      registry = "blocked";
      warnings.push(
        "查询注册表失败（reg.exe 不可用或被安全策略拦截），已改用 PATH / 安装目录 / 运行进程判断",
      );
    } else {
      registry = "empty";
    }
  } else if (process.platform === "darwin") {
    const dirs = ["/Applications", path.join(os.homedir(), "Applications")];
    for (const h of HINTS) {
      for (const dir of dirs) {
        if (h.macApps.some((app) => fs.existsSync(path.join(dir, app)))) {
          found.add(h.id);
          break;
        }
      }
    }
  } else {
    const dirs = [
      "/usr/share/applications",
      "/usr/local/share/applications",
      path.join(os.homedir(), ".local/share/applications"),
    ];
    for (const h of HINTS) {
      if (
        h.linuxDesktop.some((f) =>
          dirs.some((d) => fs.existsSync(path.join(d, f))),
        )
      ) {
        found.add(h.id);
      }
    }
  }

  // 补充证据：PATH 上的命令行程序
  const bins = probeBins();
  const viaPath = new Set<EditorId>();
  for (const h of HINTS) {
    if (h.bins.some((b) => bins.has(b))) {
      viaPath.add(h.id);
      found.add(h.id);
    }
  }

  // 补充证据：Windows 常见安装目录
  const viaInstallDir = probeWindowsInstallDirs();
  for (const id of viaInstallDir) found.add(id);

  if (found.size === 0) {
    warnings.push(
      process.platform === "win32"
        ? "本机没有找到任何已知编辑器（协议未注册、PATH 与常见安装目录里都没有）"
        : "本机没有找到任何已知编辑器",
    );
  }

  return { found, registry, viaPath, viaInstallDir };
}

type ProtocolQuery = "yes" | "no" | "error";

/** Windows：URL 协议是否注册（`reg query HKCR\<scheme>` 退出码 0 即存在、1 即不存在） */
function queryWindowsProtocol(scheme: string): Promise<ProtocolQuery> {
  return new Promise((resolve) => {
    execFile(
      "reg",
      ["query", `HKCR\\${scheme}`, "/ve"],
      { timeout: 4000, windowsHide: true },
      (error) => {
        if (!error) return resolve("yes");
        // 键不存在时 reg 返回退出码 1；其它情况（找不到/被拦截）算 error
        if ((error as NodeJS.ErrnoException & { code?: number }).code === 1) {
          return resolve("no");
        }
        resolve("error");
      },
    );
  });
}

/** PATH 上存在的命令行程序名（小写集合） */
function probeBins(): Set<string> {
  const result = new Set<string>();
  const exts = process.platform === "win32" ? [".exe", ".cmd", ".bat", ""] : [""];
  const dirs = (process.env.PATH ?? "").split(path.delimiter).filter(Boolean);

  for (const dir of dirs) {
    for (const h of HINTS) {
      for (const bin of h.bins) {
        for (const ext of exts) {
          try {
            if (fs.statSync(path.join(dir, bin + ext)).isFile()) {
              result.add(bin);
              break;
            }
          } catch {
            /* 不存在就跳过 */
          }
        }
      }
    }
  }
  return result;
}

/** Windows：常见安装目录（相对路径里的 `*` 表示任意一层目录名） */
function probeWindowsInstallDirs(): Set<EditorId> {
  const found = new Set<EditorId>();
  if (process.platform !== "win32") return found;

  const roots = [
    process.env.LOCALAPPDATA,
    process.env.ProgramFiles,
    process.env["ProgramFiles(x86)"],
  ].filter((v): v is string => Boolean(v));

  for (const h of HINTS) {
    outer: for (const rel of h.winPaths) {
      for (const root of roots) {
        if (resolvePattern(root, rel)) {
          found.add(h.id);
          break outer;
        }
      }
    }
  }
  return found;
}

/**
 * 从 `root` 开始按 `/` 逐段解析相对路径，其中含 `*` 的段会遍历目录展开
 * （例如 `JetBrains/<版本>/bin/pycharm64.exe`），全部段落都能落地才算命中。
 */
function resolvePattern(root: string, rel: string): boolean {
  let dirs = [root];

  for (const segment of rel.split("/")) {
    const next: string[] = [];
    for (const dir of dirs) {
      if (segment.includes("*")) {
        try {
          for (const entry of fs.readdirSync(dir)) {
            if (matchesGlob(entry, segment)) next.push(path.join(dir, entry));
          }
        } catch {
          /* 目录不存在就跳过 */
        }
      } else {
        next.push(path.join(dir, segment));
      }
    }
    dirs = next;
    if (dirs.length === 0) return false;
  }

  return dirs.some((p) => {
    try {
      return fs.existsSync(p);
    } catch {
      return false;
    }
  });
}

function matchesGlob(name: string, pattern: string): boolean {
  if (!pattern.includes("*")) return name === pattern;
  const regex = new RegExp(
    `^${pattern.split("*").map(escapeRegExp).join(".*")}$`,
    "i",
  );
  return regex.test(name);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type RunningProbe = { names: Set<string>; ok: boolean };

/** 正在运行的进程名（小写集合） */
async function probeRunning(warnings: string[]): Promise<RunningProbe> {
  const names = new Set<string>();

  if (process.platform === "win32") {
    const out = await exec("tasklist", ["/FO", "CSV", "/NH"], warnings);
    for (const line of out.split(/\r?\n/)) {
      const m = /^"([^"]+)"/.exec(line.trim());
      if (m) names.add(m[1].toLowerCase());
    }
  } else {
    const out = await exec("ps", ["-A", "-o", "comm="], warnings);
    for (const line of out.split("\n")) {
      const name = line.trim().split("/").pop();
      if (name) names.add(name.toLowerCase());
    }
  }

  return { names, ok: names.size > 0 };
}

function exec(
  file: string,
  args: string[],
  warnings: string[],
): Promise<string> {
  return new Promise((resolve) => {
    execFile(
      file,
      args,
      { timeout: 5000, windowsHide: true, maxBuffer: 4 * 1024 * 1024 },
      (error, stdout) => {
        if (error && !stdout) {
          warnings.push(`无法执行 ${file}：${error.message}`);
          resolve("");
          return;
        }
        resolve(stdout ?? "");
      },
    );
  });
}
