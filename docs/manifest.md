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
| `permissions` | enum[] | yes | Minimal scopes. |
| `tools` | object[] | yes | See below. |
| `minHorizonVersion` | string | no | SemVer lower bound. |

## Tool entries

Each item of `tools[]`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | snake_case — must match an export in `main.js`. |
| `description` | string | yes | The agent reads this to decide when to call. Write it for an LLM. |
| `inputSchema` | JSON Schema subset | yes | `type: 'object'`, `properties`, `required`. |
