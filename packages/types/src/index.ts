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
 * The shape of a tool handler. `main.js` in the bundle exports an object
 * keyed by tool name mapping to async handlers.
 *
 * @example
 *   module.exports = {
 *     async get_weather({ city }, ctx) {
 *       const res = await ctx.fetch(`https://api.example.com/weather?city=${city}`);
 *       return res.json();
 *     }
 *   };
 */
export type PluginToolHandler<TInput = Record<string, unknown>, TOutput = unknown> = (
  input: TInput,
  ctx: PluginContext,
) => Promise<TOutput> | TOutput;

/** Runtime context passed into each handler. */
export interface PluginContext {
  /** Horizon desktop version running the plugin. */
  horizonVersion: string;
  /** Permission-gated network fetch (CORS-free, no cookies leaked). */
  fetch: typeof fetch;
  /** Structured logger — surfaces in the Horizon logs UI. */
  logger: PluginLogger;
  /** Per-plugin key-value storage (isolated from other plugins). */
  storage: PluginStorage;
  /** The user-settable config the plugin exposed at install. */
  config: Readonly<Record<string, unknown>>;
}

export interface PluginLogger {
  debug(msg: string, data?: unknown): void;
  info(msg: string, data?: unknown): void;
  warn(msg: string, data?: unknown): void;
  error(msg: string, data?: unknown): void;
}

export interface PluginStorage {
  get<T = unknown>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  keys(): Promise<string[]>;
}

/** Bundle layout expected on disk before zipping into a `.hzplugin`. */
export interface PluginBundleLayout {
  'manifest.json': PluginManifest;
  'main.js': string;
  'icon.png'?: Uint8Array;
  'README.md'?: string;
}
