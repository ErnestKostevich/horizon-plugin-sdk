<p align="center">
  <img src="https://raw.githubusercontent.com/ErnestKostevich/horizon-genesis/main/assets/icon.png" width="120" alt="Horizon logo" />
</p>

<h1 align="center">Horizon Plugin SDK</h1>

<p align="center">
  <strong>Build, ship, and sell plugins for <a href="https://horizonaai.dev">Horizon AI</a>.</strong><br/>
  <sub>TypeScript types · CLI scaffolder · 70% revenue share · crypto payouts</sub>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@horizonai/plugin-cli"><img src="https://img.shields.io/npm/v/@horizonai/plugin-cli?style=flat-square&label=plugin-cli&color=8b5cf6" alt="plugin-cli npm"/></a>
  <a href="https://www.npmjs.com/package/@horizonai/plugin-types"><img src="https://img.shields.io/npm/v/@horizonai/plugin-types?style=flat-square&label=plugin-types&color=06b6d4" alt="plugin-types npm"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"/></a>
  <a href="https://horizonaai.dev/browse"><img src="https://img.shields.io/badge/marketplace-horizonaai.dev-ec4899?style=flat-square" alt="Marketplace"/></a>
</p>

<p align="center">
  <a href="#60-second-quick-start">Quick start</a> ·
  <a href="#what-you-can-build">What you can build</a> ·
  <a href="#revenue-share">Revenue</a> ·
  <a href="./docs/getting-started.md">SDK Docs</a> ·
  <a href="https://github.com/ErnestKostevich/Horizon-Agent-Docs">User Docs</a> ·
  <a href="./examples">Examples</a>
</p>

---

A Horizon plugin is a small bundle that registers **tools** and/or
**connectors** the agent can call. Personality, computer use, and memory
stay in Horizon core; your plugin adds the verbs.

```
my-plugin/
  manifest.json       ← name, version, permissions, tool list
  package.json
  src/index.ts        ← export default { tools: [...] }
  README.md
```

## 60-second quick start

```bash
# 1. Scaffold a new plugin (TypeScript, ready to build)
npx @horizonai/plugin-cli init my-plugin
cd my-plugin

# 2. Edit src/index.ts → add a tool
#    Type-safe via @horizonai/plugin-types

# 3. Build + dev
npm run build              # tsc → dist/
npm run dev                # watch mode

# 4. Sideload into Horizon for testing
npx @horizonai/plugin-cli pack         # → my-plugin-0.1.0.zip
# Then: Horizon GUI → Plugins → Install from file

# 5. Publish to the public marketplace
npx @horizonai/plugin-cli publish      # asks for credentials once
# → appears on horizonaai.dev/browse, installable via `horizon://` deep links
```

## What you can build

| Category | Examples already shipping |
|---|---|
| **Service connectors** | Slack, Notion, Linear, Telegram, Discord (built-in); Trello, ClickUp, Airtable, Zendesk (community) |
| **Domain tools** | clipboard utilities, system-monitor, web-fetch, screenshot, crypto-pulse, currency-converter |
| **API wrappers** | Spotify, Google Maps, OpenWeather, IMDB, Wikipedia |
| **Workflow blocks** | scheduled jobs, conditional branches, custom triggers |
| **Provider adapters** | new LLM backends not in the bundled 14 |

Anything you can do in a Node.js function — file ops, HTTP requests, child
processes, native bindings — is fair game inside a plugin, as long as your
`manifest.json` declares the matching permissions.

## Packages

| Package | Purpose | Version |
|---|---|---|
| [`@horizonai/plugin-types`](./packages/types) | TypeScript types for manifest + tool API | ![types](https://img.shields.io/npm/v/@horizonai/plugin-types?label=&color=06b6d4) |
| [`@horizonai/plugin-cli`](./packages/cli) | `hz-plugin` CLI — scaffold, build, pack, publish | ![cli](https://img.shields.io/npm/v/@horizonai/plugin-cli?label=&color=8b5cf6) |

## A complete plugin in 30 lines

```javascript
// main.js — built into handler.js inside the .hzplugin zip
'use strict';

module.exports = {
  async execute(tool, args, ctx) {
    if (tool === 'currency_convert') {
      const { amount, from, to } = args;
      const r = await ctx.fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
      if (!r.ok) return { ok: false, error: `HTTP ${r.status}` };
      const j = await r.json();
      return { ok: true, out: `${amount} ${from} = ${j.rates[to]} ${to}` };
    }
    return { ok: false, error: `Unknown tool: ${tool}` };
  },
};
```

`manifest.json` declares permissions:

```json
{
  "id": "currency-converter",
  "name": "Currency Converter",
  "version": "0.1.0",
  "description": "ISO currency conversion via frankfurter.app (free, no API key).",
  "author": "you",
  "permissions": ["network.fetch"],
  "tools": [
    {
      "name": "currency_convert",
      "description": "Convert an amount between two currency codes (e.g. USD→EUR).",
      "inputSchema": {
        "type": "object",
        "properties": {
          "amount": { "type": "number", "description": "Amount in the source currency" },
          "from":   { "type": "string", "description": "ISO source code, e.g. USD" },
          "to":     { "type": "string", "description": "ISO target code, e.g. EUR" }
        },
        "required": ["amount", "from", "to"]
      }
    }
  ]
}
```

Done. The agent picks it up automatically once installed. Users see a
permission prompt the first time the network gets hit.

## Examples

- [`hello-world`](./examples/hello-world) — minimal plugin with one tool

The [main Horizon repo](https://github.com/ErnestKostevich/horizon-genesis/tree/main/builtin-plugins)
ships 6 reference plugins (`web-fetch`, `system-monitor`, `clipboard`,
`screenshot`, `crypto-pulse`, `spotify-control`) — clone any of them as
a starting point.

## Docs

| | |
|---|---|
| [Getting started](./docs/getting-started.md) | First plugin from scratch |
| [Manifest reference](./docs/manifest.md) | Every `manifest.json` field |
| [Tool API](./docs/tools-api.md) | Handler signature, context, error shapes |
| [Publishing](./docs/publishing.md) | Marketplace credentials, pricing, payout setup |

## Revenue share

Plugin authors keep **70%** of every sale. Horizon takes **30%** to cover
marketplace hosting, payment processing, and infrastructure.

| | |
|---|---|
| **Author share** | 70% |
| **Platform share** | 30% |
| **Payout currency** | USDT (TRC20 / BSC / TON / SOL) |
| **Frequency** | Weekly, every Monday |
| **Minimum payout** | $30 (NOWPayments threshold) |
| **Free plugins** | Allowed — earn reputation, upsell paid versions later |

Pricing model is your call: one-time purchase, monthly subscription, or
freemium with paid premium features. The marketplace handles billing,
you just write the code.

See [`docs/publishing.md`](./docs/publishing.md) for the full payout flow.

## Permission model

Every plugin ships with a `permissions` array in its manifest. Users see
this list at install time and approve (or refuse) before the plugin can
do anything.

| Permission | Grants |
|---|---|
| `network.fetch` | Outbound HTTPS via `ctx.fetch` (throws `PermissionError` if missing) |
| `filesystem.read` | Read files under the user-data dir |
| `filesystem.write` | Write files under the user-data dir |
| `shell.exec` | Execute shell commands (always gates per-call too) |
| `clipboard.read` / `clipboard.write` | Read or write the OS clipboard |
| `notifications` | Show desktop notifications |
| `screen.read` | Capture the screen or specific windows |
| `mouse.control` / `keyboard.control` | Synthesize mouse / keyboard events |

Legacy `colon:form` strings (`network:*`, `fs:write:userdata`, etc.) are
still accepted on install — the host coerces them to the dotted form and
logs a one-time deprecation warning per plugin.

A plugin without permissions can do nothing destructive — it's a no-op
until the user explicitly grants what it asks for.

## Best practices

- **One thing well.** A tool that does one job teaches the agent better
  than a kitchen-sink "do-everything" function.
- **Verb-first names.** `convert_currency`, `send_telegram_message`,
  `analyze_image` — not `currency_helper` or `telegram_handler`.
- **Idempotency where possible.** If the agent re-runs your tool with
  the same args, it should yield the same result without side effects.
- **Errors as data, not exceptions.** Return `{ ok: false, err: '...' }`
  instead of throwing. The agent reads the error message and adapts.
- **Permission minimalism.** Ask only for what you need. Users approve
  faster when the list is short.

## Roadmap

- [x] TypeScript types
- [x] `hz-plugin init` scaffolder
- [x] `hz-plugin pack` / `publish` flow
- [x] Marketplace with crypto payouts
- [ ] Rust plugin runtime (compile to wasm)
- [ ] Python plugin runtime (via embedded interpreter)
- [ ] Signed releases (Sigstore)
- [ ] Plugin telemetry opt-in dashboard

## Community

File an issue here or on
[horizon-genesis/issues](https://github.com/ErnestKostevich/horizon-genesis/issues).

## License

MIT — see [LICENSE](./LICENSE). Open by design so you can build commercial
plugins on top with zero legal friction.
