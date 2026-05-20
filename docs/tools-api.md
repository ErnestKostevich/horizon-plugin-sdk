# Tool API

Horizon loads your plugin's entry file (`handler.js` in v0.1.2+ bundles,
`main.js` accepted as a fallback for older zips) and dispatches tool
calls to it. Two equivalent shapes are supported.

## Shape A — single `execute()` dispatcher (recommended)

This is what every Horizon built-in plugin uses and what `hz-plugin init`
scaffolds.

```js
module.exports = {
  async execute(tool, args, ctx) {
    if (tool === 'hello') return { ok: true, out: `Hello ${args.who}` };
    return { ok: false, error: 'unknown tool' };
  }
};
```

## Shape B — one function per tool

```js
module.exports = {
  async hello(args, ctx) {
    return { ok: true, out: `Hello ${args.who}` };
  }
};
```

Inputs match the `inputSchema` you declared in `manifest.json`. The
agent layer maps `plugin_<id>_<tool>` calls to the tool name and passes
the raw arg object straight through — basic type validation only.

## Context

```ts
interface PluginContext {
  settings: Readonly<Record<string, unknown>>;
}
```

`ctx.settings` is whatever the user set under your plugin's settings UI
(matches the `settings[]` spec in `manifest.json` + the `config` map the
host persists on toggle).

**That is the only field the host currently provides.** Earlier SDK
drafts advertised `ctx.fetch`, `ctx.logger`, `ctx.storage`,
`ctx.horizonVersion`, `ctx.config` — none of those were ever wired up,
so they would throw at runtime. They have been removed from the types.
Use Node globals instead:

- HTTP — Node's global `fetch`.
- Logging — `console.log` / `console.error`. Output lands in the
  Horizon main-process log.
- Per-plugin storage — none yet. Write to `path.join(os.homedir(),
  '.horizon-<your-id>')` and respect the user's home directory until
  the host ships isolated key-value storage.

## Return shape

Return any JSON-serialisable value. The host normalises common shapes:

- `{ ok: true, out: '...' }` is preferred — the agent prints `out`.
- `{ ok: false, error: '...' }` surfaces as a tool error to the agent.
- A bare value is also accepted and will be JSON-stringified.

Throw a plain `Error` with a short message if you want the agent to
retry / surface it. Don't leak secrets or PII.
