# Manifest reference

Every plugin ships a `manifest.json` at its root, alongside a single
JavaScript handler. The canonical bundle layout inside a `.hzplugin` zip:

```
manifest.json    ← required, see fields below
handler.js       ← required, exports { execute(tool, args, ctx) }
icon.png         ← optional, 256×256 recommended
README.md        ← optional, rendered on the marketplace listing
```

During development the handler lives at `main.js`; `hz-plugin build`
renames it to `handler.js` inside the zip. The host loader prefers
`handler.js` and falls back to `main.js` for legacy bundles.

## Field reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | 3–48 lowercase kebab-case. Globally unique. |
| `name` | string | yes | Display name. |
| `version` | string | yes | SemVer. |
| `description` | string | yes | One-line pitch. |
| `author` | string | yes | Name or handle. |
| `license` | string | no | SPDX identifier. |
| `homepage` | string | no | URL or email. |
| `category` | enum | no | See the types package for allowed values. |
| `priceUsd` | number | no | 0 = free. 1–200 USD. |
| `permissions` | enum[] | yes | Minimal scopes — dotted form, see below. |
| `tools` | object[] | yes | See below. |
| `minHorizonVersion` | string | no | SemVer lower bound. |

## Tool entries

Each item of `tools[]`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | snake_case — must match a tool the handler dispatches. |
| `description` | string | yes | The agent reads this to decide when to call. Write it for an LLM. |
| `inputSchema` | JSON Schema subset | yes | `type: 'object'`, `properties`, `required`. |

## Permission strings

Sprint-3 canonical form is **dotted**, lowercase, `<scope>.<action>`:

| String | Meaning |
|---|---|
| `filesystem.read` | Read user files via the host bridge. |
| `filesystem.write` | Write under the user's workspace. |
| `network.fetch` | Outbound HTTP(S) via Node `fetch`. |
| `shell.exec` | Spawn shell commands (use sparingly). |
| `clipboard.read` | Read system clipboard. |
| `clipboard.write` | Write system clipboard. |
| `notifications` | Show desktop toast notifications. |
| `screen.read` | Capture the screen (screenshot / vision). |
| `mouse.control` | Move / click pointer (automation). |
| `keyboard.control` | Synthesise keystrokes (automation). |

### Legacy `colon:form` (deprecated)

Older built-in plugins ship `clipboard:read`, `network:*`, `shell:exec`,
`fs:write:userdata`, etc. The host still accepts these strings for
backward compatibility — it emits a one-time deprecation warning in the
main-process log on load. New plugins must use the dotted form.

## Complete example

```json
{
  "id": "currency-converter",
  "name": "Currency Converter",
  "version": "0.1.0",
  "description": "ISO currency conversion via frankfurter.app.",
  "author": "Your Name",
  "license": "MIT",
  "homepage": "https://example.com",
  "category": "productivity",
  "priceUsd": 0,
  "minHorizonVersion": "0.6.0",
  "permissions": ["network.fetch"],
  "tools": [
    {
      "name": "currency_convert",
      "description": "Convert an amount between two ISO currency codes.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "amount": { "type": "number", "description": "Amount in the source currency." },
          "from":   { "type": "string", "description": "ISO source code, e.g. USD." },
          "to":     { "type": "string", "description": "ISO target code, e.g. EUR." }
        },
        "required": ["amount", "from", "to"]
      }
    }
  ]
}
```

The matching `handler.js` lives in [`tools-api.md`](./tools-api.md).
