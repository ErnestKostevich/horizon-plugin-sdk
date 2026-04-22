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

Each key on the `module.exports` object in `main.js` becomes a tool the
agent can call, as long as it's also declared under `tools[]` in
`manifest.json`.

```js
module.exports = {
  async get_weather({ city }, ctx) {
    const res = await ctx.fetch(`https://wttr.in/${city}?format=j1`);
    const data = await res.json();
    return { tempC: data.current_condition[0].temp_C };
  }
};
```

`ctx` gives you a permission-gated `fetch`, a `logger`, and a
per-plugin `storage` keyed by your plugin id.

## 3. Declare permissions

List the scopes you need in `manifest.json` under `permissions`. The
user sees and grants these once at install:

- `network.fetch` — HTTP requests
- `filesystem.read` / `filesystem.write`
- `shell.exec`
- `clipboard.read` / `clipboard.write`
- `notifications`
- `screen.read`, `mouse.control`, `keyboard.control`

Minimize what you ask for. Users reject plugins with over-broad asks.

## 4. Build

```bash
npx @horizonai/plugin-cli build
```

Produces `dist/<id>-<version>.hzplugin` — a zip with manifest, code,
and optional icon/README.

## 5. Publish

See [publishing.md](./publishing.md).
