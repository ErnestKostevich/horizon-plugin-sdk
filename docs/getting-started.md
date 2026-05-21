# Getting started

Build your first Horizon plugin in ~3 minutes.

## 1. Scaffold

```bash
npx @horizonai/plugin-cli init my-plugin
cd my-plugin
```

The CLI asks for a name, description, author, and price (0 = free). It
writes `manifest.json`, `main.js`, `README.md`, and a `.gitignore`.

## 2. Implement a tool

Every plugin exports a single `execute(tool, args, ctx)` dispatcher.
Match on the tool name, return a JSON-serialisable value.

```js
'use strict';

module.exports = {
  async execute(tool, args, ctx) {
    if (tool === 'get_weather') {
      const res  = await ctx.fetch(`https://wttr.in/${args.city}?format=j1`);
      const data = await res.json();
      return { ok: true, out: `${data.current_condition[0].temp_C}°C` };
    }
    return { ok: false, error: `Unknown tool: ${tool}` };
  },
};
```

`ctx` gives you four host-provided helpers:

- `ctx.settings` — frozen snapshot of the user's plugin settings
- `ctx.fetch(url, opts?)` — permission-gated HTTPS client
- `ctx.logger.{info,warn,error}` — per-plugin log file (1 MiB rotation)
- `ctx.storage.{get,set,delete,all}` — JSON-backed key-value store

See [`tools-api.md`](./tools-api.md) for the full contract.

## 3. Declare permissions

List the scopes you need in `manifest.json` under `permissions`. The
user sees and grants these once at install. All permission strings use
the dotted form:

- `network.fetch` — HTTP requests via `ctx.fetch`
- `filesystem.read` / `filesystem.write`
- `shell.exec`
- `clipboard.read` / `clipboard.write`
- `notifications`
- `screen.read`, `mouse.control`, `keyboard.control`

Minimise what you ask for. Users reject plugins with over-broad asks.

## 4. Build

```bash
npx @horizonai/plugin-cli build
```

Produces `dist/<id>-<version>.hzplugin` — a zip with `manifest.json`,
`handler.js` (renamed from your `main.js`), and an optional
`icon.png` / `README.md`.

## 5. Publish

See [publishing.md](./publishing.md).
