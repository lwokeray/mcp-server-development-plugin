You are working in an **MCP (Model Context Protocol) Server** project built with TypeScript.

## Project Stack
- **Runtime:** Node.js v22 / TypeScript ES2022 (module: Node16)
- **Core SDK:** `@modelcontextprotocol/sdk` — `McpServer`, `StreamableHTTPServerTransport`, `StdioServerTransport`
- **UI Extension:** `@modelcontextprotocol/ext-apps` — `registerAppTool`, `registerAppResource`, `RESOURCE_MIME_TYPE`
- **HTTP:** Express 5, transport at `POST /mcp`
- **Auth:** `@azure/identity` + `@microsoft/microsoft-graph-client`
- **Validation:** Zod 3

## Key Conventions
- `registerAppTool(server, name, config, cb)` — always 4 arguments; `config` requires `_meta: { ui: { resourceUri: "ui://..." } }`
- Use `tsx src/server.ts` for development, `npm run build` to compile
- Extension IDs follow reverse-domain notation: `io.modelcontextprotocol/{extension-name}`
- Extensions are negotiated in the `initialize` capability handshake; always optional

## Available Prompt Files
Run these with `/` in Copilot Chat or reference them by name:
- `/mcp-extensions-overview` — How MCP extension negotiation works
- `/create-mcp-app` — Build an interactive UI tool with ext-apps
- `/add-app-to-server` — Add UI to an existing tool
- `/migrate-oai-app` — Migrate from OpenAI Apps SDK
- `/convert-web-app` — Turn a web app into a hybrid MCP App
- `/implement-client-credentials` — OAuth 2.1 M2M auth (no user login)
- `/implement-enterprise-auth` — Enterprise SSO via Identity Assertion / ID-JAG
- `/use-mcp-reference-servers` — Configure official MCP reference servers
