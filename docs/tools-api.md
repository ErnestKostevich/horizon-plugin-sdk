# Tool API

Horizon's plugin host (`src/main/pluginManager.js`) loads your plugin's
entry file and dispatches every tool call through a single
`execute(tool, args, ctx)` function. This is the canonical form used by
every built-in Horizon plugin and the form `hz-plugin init` scaffolds.

## Handler shape

```js
'use strict';

module.exports = {
  async execute(tool, args, ctx) {
    if (tool === 'greet') {
      const who = (args && args.who) || 'world';
      ctx.logger.info('greet called', { who });
      return { ok: true, out: `Hello, ${who}!` };
    }

    if (tool === 'remember') {
      ctx.storage.set('lastSeen', new Date().toISOString());
      return { ok: true };
    }

    return { ok: false, error: `Unknown tool: ${tool}` };
  },
};
```

The first argument is the tool name (matching `tools[].name` in
`manifest.json`). The second is the raw arg object the agent built from
your `inputSchema`. The third is the runtime context (see below).

Return any JSON-serialisable value. The host normalises common shapes:

- `{ ok: true, out: '...' }` is preferred — the agent prints `out`.
- `{ ok: false, error: '...' }` surfaces as a tool error to the agent.
- A bare value is also accepted and will be JSON-stringified.

Throw a plain `Error` with a short message if you want the agent to
retry / surface it. Don't leak secrets or PII in errors.

### Legacy per-tool exports

The host still accepts the older `{ [toolName]: async (args, ctx) => … }`
shape for backwards compatibility, but it is no longer documented or
scaffolded. New plugins should use the `execute()` dispatcher exclusively.

## Context

```ts
interface PluginContext {
  settings: Readonly<Record<string, unknown>>;
  fetch:    (input: string | URL, init?: Record<string, unknown>) => Promise<Response>;
  logger:   { info(msg, ...rest): void; warn(msg, ...rest): void; error(msg, ...rest): void };
  storage:  { get(key): unknown; set(key, value): boolean; delete(key): boolean; all(): Record<string, unknown> };
}
```

### `ctx.settings`

Frozen snapshot of the user's settings for your plugin, populated from
the `settings[]` spec in `manifest.json`. Read-only at runtime — changes
the user makes in the Plugin Hub trigger a reload, not in-place mutation.

```js
const apiKey  = ctx.settings.apiKey;            // typed as unknown — cast as needed
const timeout = Number(ctx.settings.timeoutMs) || 5000;
```

### `ctx.fetch(url, opts?)`

Permission-checked HTTPS client. Same call signature as the global
`fetch` (node-fetch under the hood). The host gates every call against
your manifest's `permissions` array:

```js
// manifest.json: "permissions": ["network.fetch"]
const r = await ctx.fetch('https://api.example.com/things', {
  method:  'POST',
  headers: { 'content-type': 'application/json' },
  body:    JSON.stringify({ foo: 'bar' }),
});
if (!r.ok) return { ok: false, error: `HTTP ${r.status}` };
const data = await r.json();
```

Calling `ctx.fetch` without declaring `network.fetch` throws a
`PermissionError` that surfaces to the agent as a tool failure.

### `ctx.logger`

Per-plugin logger. Writes JSON lines to
`<userData>/plugin-logs/<plugin-id>.log` and mirrors to the host console
so users can inspect activity from the Plugin Hub.

```js
ctx.logger.info('processed batch', { count: items.length });
ctx.logger.warn('retrying', { attempt: 3 });
ctx.logger.error('upstream failed', { status: r.status, body: text });
```

Log files rotate at **1 MiB**: when a write would push the file over the
limit, the host keeps the latest half and discards the older half. There
is no separate rotated archive — design your log volume accordingly.

Always prefer `ctx.logger` over `console.*`. `console.log` still works
but isn't captured in the per-plugin log file the user can review.

### `ctx.storage`

Per-plugin key-value store, backed by
`<userData>/plugin-storage/<plugin-id>.json`. Synchronous, in-process
cache with mtime-based invalidation, safe for small state like cached
tokens, last-run timestamps, or feature flags.

```js
const last = ctx.storage.get('lastRunAt');                // unknown | undefined
ctx.storage.set('lastRunAt', Date.now());                 // boolean
ctx.storage.delete('staleKey');                           // boolean
const everything = ctx.storage.all();                     // Record<string, unknown>
```

Values must be JSON-serialisable. For binary data or large blobs use the
filesystem directly under the user-data dir with `filesystem.write`
permission — the storage file is loaded into memory on every read.

## Inputs and validation

`args` is whatever the agent built from the `inputSchema` you declared
in `manifest.json`. The host does **basic type validation only** — it
will not coerce types or fill defaults. Validate anything you care about
in your handler:

```js
if (typeof args.amount !== 'number' || !isFinite(args.amount)) {
  return { ok: false, error: 'amount must be a finite number' };
}
```
