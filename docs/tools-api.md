# Tool API

Each tool is an async function. Horizon loads `main.js` and looks for
`module.exports[<tool name>]`.

## Signature

```ts
(input: Record<string, unknown>, ctx: PluginContext) => Promise<unknown>;
```

Inputs are validated against `inputSchema` before the call — your
function never sees malformed shapes.

## Context

```ts
interface PluginContext {
  horizonVersion: string;
  fetch: typeof fetch;       // permission-gated HTTP
  logger: PluginLogger;      // debug/info/warn/error, surfaces in Logs tab
  storage: PluginStorage;    // get/set/delete/keys, isolated per plugin
  config: Record<string, unknown>; // user-settable config from Settings
}
```

## Errors

Throw a plain `Error` with a short message. The agent sees it and can
retry or surface it to the user. Do not leak secrets or PII.

## Logging

`ctx.logger.info('msg', { extra })` — visible in Settings → Logs. Use
`debug` for developer output; users can toggle verbose mode.
