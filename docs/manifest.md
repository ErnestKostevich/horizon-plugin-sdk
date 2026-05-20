# Manifest reference

Every plugin ships a `manifest.json` at its root. Field reference:

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
