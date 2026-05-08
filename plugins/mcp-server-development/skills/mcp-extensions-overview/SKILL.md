---
name: mcp-extensions-overview
description: This skill should be used when the user asks "how do MCP extensions work", "what are MCP protocol extensions", "how to advertise an extension on my MCP server", "how does extension negotiation work in MCP", "what official MCP extensions exist", "how to implement extension capability handshake", "what is io.modelcontextprotocol namespace", or needs to understand the MCP extension system before implementing a specific extension. Provides a comprehensive guide to the MCP extension mechanism, extension identifiers, capability negotiation, and the complete list of official extensions.
---

# MCP Extensions — Overview and Capability Negotiation

The MCP **Extension System** allows the protocol to grow beyond its core capabilities through optional, versioned modules. Both clients and servers must opt in; neither party is required to support any extension.

**Official extension overview:** https://modelcontextprotocol.io/extensions/overview
**Extension registrations:** https://github.com/modelcontextprotocol/ext-auth, https://github.com/modelcontextprotocol/ext-apps

## Extension Identifier Format

Every extension is identified by a unique string using a **reverse-domain notation**:

```
{vendor-prefix}/{extension-name}
```

Examples:
- `io.modelcontextprotocol/oauth-client-credentials`
- `io.modelcontextprotocol/enterprise-managed-authorization`
- `io.modelcontextprotocol/apps`

The `io.modelcontextprotocol` prefix is reserved for official extensions maintained by the MCP steering group. Third-party extensions MUST use a different prefix (e.g., `com.example/my-extension`).

## Extension Negotiation — Initialize Handshake

Extensions are negotiated during the `initialize` request/response cycle.

### Client declares supported extensions

The MCP client lists extensions it supports in the `initialize` request:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-03-26",
    "capabilities": {
      "extensions": {
        "io.modelcontextprotocol/oauth-client-credentials": {},
        "io.modelcontextprotocol/apps": {}
      }
    },
    "clientInfo": { "name": "my-client", "version": "1.0.0" }
  }
}
```

### Server responds with activated extensions

The server's `initialize` response includes only the extensions it has activated (intersection of both parties' support):

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-03-26",
    "capabilities": {
      "extensions": {
        "io.modelcontextprotocol/apps": {}
      }
    },
    "serverInfo": { "name": "my-server", "version": "1.0.0" }
  }
}
```

Only `io.modelcontextprotocol/apps` is activated — the server did not include `oauth-client-credentials` (perhaps because no auth is needed on this transport, or it was not yet implemented).

### Key Rules

- Extensions in the server's `initialize` response are **active** for this session
- Extensions not present in the response are **inactive** — client must not assume support
- Extension capabilities can be extended with **extension-specific configuration** in the value object (currently `{}` for official extensions)
- Extensions are **always optional** — implementations that don't recognize an extension simply ignore it

## Official MCP Extensions

### MCP Authorization Extensions (ext-auth)

Maintained at: https://github.com/modelcontextprotocol/ext-auth

These extensions add OAuth 2.1 authentication frameworks to MCP servers.

#### `io.modelcontextprotocol/oauth-client-credentials`

**Purpose:** Machine-to-machine (M2M) authentication without user interaction

**Based on:**
- OAuth 2.1 client credentials grant
- RFC 9728 (OAuth 2.0 Protected Resource Metadata)
- RFC 8414 (Authorization Server Metadata)
- RFC 7523 (JWT Client Authentication)

**Requires:** HTTP transport (not stdio)

**Use when:**
- Automated systems (CI/CD, batch jobs) call your MCP server
- No end user login is needed
- Service accounts access MCP resources

**Discovery flow:** Client hits `401` → reads `/.well-known/oauth-protected-resource` → contacts authorization server → gets access token → retries with `Authorization: Bearer`

---

#### `io.modelcontextprotocol/enterprise-managed-authorization`

**Purpose:** Enterprise SSO-based authorization using existing corporate identity infrastructure

**Based on:**
- Identity Assertion Authorization Grant (ID-JAG) — draft-ietf-oauth-identity-assertion-authz-grant
- RFC 8693 (Token Exchange)
- RFC 7523 (JWT Bearer Grant)

**Requires:** HTTP transport (not stdio), enterprise IdP (Azure AD, Okta, etc.)

**Use when:**
- Employees are already signed into MCP client via corporate SSO
- No separate MCP login prompt should appear
- Enterprise admins need centralized policy control

**Flow:** SSO login → ID Token → Token Exchange with IdP → ID-JAG → JWT Grant to MAS → MCP access token

---

### MCP Apps Extension (ext-apps)

Maintained at: https://github.com/modelcontextprotocol/ext-apps

#### `io.modelcontextprotocol/apps`

**Purpose:** Rich interactive UIs embedded within MCP tool responses

**Provides:**
- `registerAppTool` — registers a tool that also returns a renderable UI
- `registerAppResource` — registers a resource serving HTML/JS content
- Sandboxed iframe rendering in supporting clients
- CSP-compliant HTML delivery

**Use when:**
- Your MCP tool benefits from charts, forms, dashboards, or other visual output
- You want to provide interactive data exploration beyond text
- You need to port an existing web app to run inside an MCP client

---

## Implementing Extension Support in Your Server

### TypeScript / Node.js — Using MCP SDK

If you are using `@modelcontextprotocol/sdk`, extension capability advertising is handled per-extension via the SDK's extension helper packages.

For `ext-apps`:
```typescript
import { registerAppTool } from "@modelcontextprotocol/ext-apps";
// registerAppTool automatically handles the apps extension negotiation
```

For auth extensions, the extension negotiation happens at the HTTP transport level (unauthorized requests return `401` with a `WWW-Authenticate` header pointing to `/.well-known/oauth-protected-resource`). There is no separate `initialize` field to set manually in the current SDK — the discovery and negotiation is driven by the authorization challenge response.

### Manual Extension Capability Negotiation

If building a server from scratch (without SDK extension helpers), modify the `initialize` response handler:

```typescript
// In your MCP initialize response builder:
function buildInitializeResponse(clientExtensions: Record<string, unknown>) {
  const serverSupportedExtensions = {
    "io.modelcontextprotocol/apps": {},
    // Add more as implemented
  };

  // Intersect: only activate what both sides support
  const activatedExtensions: Record<string, unknown> = {};
  for (const [id, config] of Object.entries(serverSupportedExtensions)) {
    if (id in clientExtensions) {
      activatedExtensions[id] = config;
    }
  }

  return {
    protocolVersion: "2025-03-26",
    capabilities: {
      tools: {},
      resources: {},
      extensions: activatedExtensions,
    },
    serverInfo: { name: "my-server", version: "1.0.0" },
  };
}
```

## Extension vs. Core Protocol

| Feature | Core MCP | Extension |
|---------|----------|-----------|
| Versioning | `protocolVersion` | Extension-specific versioning in value object |
| Required | Yes (both parties must implement) | No (optional opt-in) |
| Negotiation | Always active | Only if both parties declare support |
| Modification | MCP spec PR | Extension repo PR |

## Quick Reference — All Official Extensions

| Extension ID | Package | When to use |
|-------------|---------|------------|
| `io.modelcontextprotocol/oauth-client-credentials` | `ext-auth` | M2M auth, no user login |
| `io.modelcontextprotocol/enterprise-managed-authorization` | `ext-auth` | Corporate SSO, enterprise users |
| `io.modelcontextprotocol/apps` | `@modelcontextprotocol/ext-apps` | Interactive UI in tool responses |

## Related Skills

- **`implement-client-credentials`** — Detailed guide to implementing the OAuth Client Credentials extension
- **`implement-enterprise-auth`** — Detailed guide to implementing the Enterprise-Managed Authorization extension
- **`create-mcp-app`** — Detailed guide to building MCP Apps (the ext-apps extension)
- **`add-app-to-server`** — Adding interactive UI to an existing MCP server
- **`use-mcp-reference-servers`** — Using official MCP reference servers in your project
