/**
 * Public types for Horizon plugin authors.
 * Mirrors the contract enforced by `src/main/pluginManager.js` in
 * the Horizon Genesis desktop app.
 */

/** Plugin manifest — one per bundle, lives at manifest.json. */
export interface PluginManifest {
  /** Globally unique slug. Lowercase kebab-case. 3–48 chars. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** SemVer version. */
  version: string;
  /** One-sentence pitch. */
  description: string;
  /** Name or handle shown as author. */
  author: string;
  /** Optional contact URL or email. */
  homepage?: string;
  /** SPDX license identifier. MIT recommended for free plugins. */
  license?: string;
  /** Minimum Horizon Genesis version required. */
  minHorizonVersion?: string;
  /** Category shown in the marketplace grid. */
  category?: PluginCategory;
  /** Optional price in USD. Omit / 0 = free. $1 – $200. */
  priceUsd?: number;
  /** Tools this plugin registers. */
  tools: PluginToolSpec[];
  /** Permissions the plugin requires. User sees and grants these at install. */
  permissions: PluginPermission[];
}

export type PluginCategory =
  | 'automation'
  | 'productivity'
  | 'developer'
  | 'communication'
  | 'browser'
  | 'media'
  | 'ai'
  | 'other';

/** Fine-grained permission scopes — reviewed at install time. */
export type PluginPermission =
  | 'filesystem.read'
  | 'filesystem.write'
  | 'network.fetch'
  | 'shell.exec'
  | 'clipboard.read'
  | 'clipboard.write'
  | 'notifications'
  | 'screen.read'
  | 'mouse.control'
  | 'keyboard.control';

/** A single tool the plugin exposes to the agent. */
export interface PluginToolSpec {
  /** Tool name. Snake_case, matches the handler function name. */
  name: string;
  /** Short description. The agent reads this to decide when to call. */
  description: string;
  /** JSON Schema for inputs (subset: type, properties, required). */
  inputSchema: JsonSchema;
}

export interface JsonSchema {
  type: 'object' | 'string' | 'number' | 'boolean' | 'array';
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: string[];
  description?: string;
}

/**
 * Canonical tool handler signature. Every Horizon built-in plugin and
 * every plugin scaffolded by `hz-plugin init` exports this exact shape.
 *
 * @example
 *   module.exports = {
 *     async execute(tool, args, ctx) {
 *       if (tool === 'hello') return { ok: true, out: `Hello ${args.who}` };
 *       return { ok: false, error: 'unknown tool' };
 *     }
 *   };
 */
export type PluginExecuteFn = (
  tool: string,
  args: Record<string, unknown>,
  ctx: PluginContext,
) => Promise<unknown> | unknown;

/**
 * The module shape the host loader expects. The `execute()` dispatcher
 * is canonical; the indexed legacy form `{ [toolName]: fn }` is still
 * accepted by the host for backward compatibility but is not
 * recommended for new plugins.
 */
export interface PluginModule {
  execute: PluginExecuteFn;
}

/**
 * @deprecated Pre-Sprint-3 per-tool function shape. Kept for plugins
 * that still export `{ [toolName]: handler }`; new code should use
 * `PluginExecuteFn` / `PluginModule` instead.
 */
export type PluginToolHandler = (
  args: Record<string, unknown>,
  ctx: PluginContext,
) => Promise<unknown> | unknown;

/**
 * Runtime context passed into each handler.
 *
 * Sprint-3 — host (`src/main/pluginManager.js`) now provides the full
 * `{ settings, fetch, logger, storage }` shape. Plugins that previously
 * called `globalThis.fetch` / `console.log` continue to work; the
 * ctx-bound forms are recommended because they integrate with Horizon's
 * permission checks (fetch), per-plugin log files (logger), and
 * persistent storage (storage).
 */
export interface PluginContext {
  /** The user-settable config the plugin exposed at install (frozen — read only at runtime). */
  settings: Readonly<Record<string, unknown>>;

  /**
   * Permission-checked HTTP client. Throws a `PermissionError` if the
   * plugin's manifest doesn't list `network.fetch`. Same signature as
   * the global `fetch` (node-fetch under the hood).
   */
  fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

  /**
   * Per-plugin logger. Writes to `<userData>/plugin-logs/<plugin-id>.log`
   * (1 MiB rotation) and mirrors to the host console. Use this instead of
   * `console.*` so users can inspect plugin activity from the Plugin Hub.
   */
  logger: {
    info(message: string, ...rest: unknown[]): void;
    warn(message: string, ...rest: unknown[]): void;
    error(message: string, ...rest: unknown[]): void;
  };

  /**
   * Per-plugin key-value storage, backed by
   * `<userData>/plugin-storage/<plugin-id>.json`. Synchronous, safe for
   * small state (settings, tokens, caches). For large blobs use the
   * filesystem with `filesystem.write` permission.
   */
  storage: {
    get(key: string): unknown;
    set(key: string, value: unknown): boolean;
    delete(key: string): boolean;
    all(): Record<string, unknown>;
  };
}

/** Bundle layout inside a `.hzplugin` zip. */
export interface PluginBundleLayout {
  'manifest.json': PluginManifest;
  /** Canonical entry filename inside the zip (SDK ≥0.1.2). */
  'handler.js': string;
  /** Legacy entry filename — still accepted by the host loader. */
  'main.js'?: string;
  'icon.png'?: Uint8Array;
  'README.md'?: string;
}
