# Horizon Plugin SDK

Build and publish plugins for [Horizon Genesis](https://horizonaai.dev) — the
desktop AI agent.

```bash
npx @horizonai/plugin-cli init my-plugin
cd my-plugin
npm run build
npx @horizonai/plugin-cli publish
```

## Packages

| Name | Purpose |
|---|---|
| [`@horizonai/plugin-types`](./packages/types) | TypeScript types for the plugin manifest + tool API. |
| [`@horizonai/plugin-cli`](./packages/cli) | `hz-plugin` CLI: scaffold, build, publish. |

## Examples

- [`hello-world`](./examples/hello-world) — minimal plugin that registers a single tool.

## Docs

- [Getting started](./docs/getting-started.md)
- [Manifest reference](./docs/manifest.md)
- [Tool API](./docs/tools-api.md)
- [Publishing](./docs/publishing.md)

## Revenue share

Plugin authors keep **70%** of every sale. Horizon takes **30%**. Payouts are
weekly in USDT (TRC20 / BSC / TON / SOL), minimum $25. See
[publishing.md](./docs/publishing.md) for details.

## License

MIT — see [LICENSE](./LICENSE).
