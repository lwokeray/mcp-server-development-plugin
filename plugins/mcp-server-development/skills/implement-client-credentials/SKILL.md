---
name: implement-client-credentials
description: This skill should be used when the user asks to "add OAuth client credentials to MCP server", "implement machine-to-machine auth for MCP", "secure MCP server without user login", "add client credentials flow", "implement JWT client authentication for MCP", "add OAuth 2.0 M2M auth", or needs to add the OAuth Client Credentials extension (io.modelcontextprotocol/oauth-client-credentials) to an MCP server. Provides step-by-step guidance for implementing machine-to-machine authentication without user interaction.
---

# Implement OAuth Client Credentials on MCP Server

Add the **OAuth Client Credentials** extension (`io.modelcontextprotocol/oauth-client-credentials`) to your MCP server to enable machine-to-machine (M2M) authentication — no user interaction required.

**Extension identifier:** `io.modelcontextprotocol/oauth-client-credentials`
**Status:** Draft
**Spec:** https://github.com/modelcontextprotocol/ext-auth/blob/main/specification/draft/oauth-client-credentials.mdx

## When to Use This Extension

Use client credentials when:
- Your MCP server is called by **automated systems** (CI/CD, batch jobs, backend services)
- There is **no end user** who would authenticate interactively
- You need **service accounts** to access MCP resources
- You are building **server-to-server** integrations

If end users need to delegate access, use the standard MCP authorization flow instead.

## Standards This Extension Builds On

- **OAuth 2.1** (draft-ietf-oauth-v2-1-13)
- **OAuth 2.0 Authorization Server Metadata** (RFC 8414)
- **OAuth 2.0 Protected Resource Metadata** (RFC 9728)
- **JWT Profile for OAuth 2.0 Client Authentication and Authorization Grants** (RFC 7523)

This extension requires **HTTP-based transports** (not stdio).

## How the Flow Works

```
Client ──► MCP Server: Request without token
MCP Server ──► Client: 401 Unauthorized + WWW-Authenticate (resource_metadata URL)
Client ──► MCP Server: GET /.well-known/oauth-protected-resource
MCP Server ──► Client: Protected Resource Metadata (includes authorization_servers)
Client ──► Auth Server: GET /.well-known/oauth-authorization-server (or /openid-configuration)
Auth Server ──► Client: Authorization Server Metadata
Client ──► Auth Server: POST /token (with JWT assertion or client secret)
Auth Server ──► Client: Access token
Client ──► MCP Server: Request with Bearer token
MCP Server ──► Client: MCP response
```

## Step 1: Set Up an Authorization Server

Choose an OAuth authorization server that supports client credentials:

| Option | Notes |
|--------|-------|
| **Microsoft Entra ID** | Enterprise-grade, Azure AD app registrations |
| **Auth0** | Cloud-hosted, easy setup |
| **Keycloak** | Self-hosted, open source |
| **Okta** | Enterprise identity platform |

Register your MCP server as a **Resource** (audience) and register each client application with `client_credentials` grant type enabled.

## Step 2: Implement Protected Resource Metadata

Your MCP server **MUST** expose the protected resource metadata endpoint (RFC 9728):

```typescript
import express from "express";

const app = express();

// RFC 9728: OAuth 2.0 Protected Resource Metadata
app.get("/.well-known/oauth-protected-resource", (req, res) => {
  res.json({
    resource: process.env.MCP_RESOURCE_URI,           // e.g., "https://mcp.example.com"
    authorization_servers: [
      process.env.AUTHORIZATION_SERVER_ISSUER,        // e.g., "https://auth.example.com"
    ],
    bearer_methods_supported: ["header"],
    scopes_supported: ["mcp:read", "mcp:write"],      // your scopes
  });
});
```

## Step 3: Advertise Extension Support

In your MCP server initialization response, advertise the extension:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
  name: "my-mcp-server",
  version: "1.0.0",
  // Advertise extension support (if SDK supports it)
  // Extensions are advertised in the initialize response capabilities
});
```

The extension is negotiated via the `extensions` capability field in the `initialize` response:

```json
{
  "capabilities": {
    "extensions": {
      "io.modelcontextprotocol/oauth-client-credentials": {}
    }
  }
}
```

## Step 4: Validate Bearer Tokens on Every Request

Validate JWT Bearer tokens from incoming requests. The token is passed in the `Authorization: Bearer <token>` header.

```typescript
import { createRemoteJWKSet, jwtVerify } from "jose";

const jwks = createRemoteJWKSet(new URL(`${process.env.AUTHORIZATION_SERVER_ISSUER}/.well-known/jwks.json`));

async function validateToken(req: express.Request): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing Bearer token");
  }

  const token = authHeader.slice(7);
  const { payload } = await jwtVerify(token, jwks, {
    issuer: process.env.AUTHORIZATION_SERVER_ISSUER,
    audience: process.env.MCP_RESOURCE_URI,
  });

  // Validate required scopes
  const tokenScopes = (payload.scope as string ?? "").split(" ");
  if (!tokenScopes.includes("mcp:read")) {
    throw new Error("Insufficient scopes");
  }
}
```

Return `401 Unauthorized` with a `WWW-Authenticate` header on authentication failure:

```typescript
app.use("/mcp", async (req, res, next) => {
  try {
    await validateToken(req);
    next();
  } catch (err) {
    res.setHeader(
      "WWW-Authenticate",
      `Bearer realm="mcp", resource_metadata="${process.env.MCP_BASE_URL}/.well-known/oauth-protected-resource"`,
    );
    res.status(401).json({ error: "unauthorized" });
  }
});
```

## Step 5: Client Authentication

Clients use one of two methods to authenticate:

### JWT Authentication (RECOMMENDED)

The client generates a signed JWT and sends it as a `client_assertion`:

```typescript
// Client side (example)
import { SignJWT, importPKCS8 } from "jose";

const privateKey = await importPKCS8(process.env.CLIENT_PRIVATE_KEY!, "RS256");

const clientAssertion = await new SignJWT({})
  .setProtectedHeader({ alg: "RS256", kid: process.env.CLIENT_KEY_ID })
  .setIssuedAt()
  .setIssuer(process.env.CLIENT_ID!)                  // sub identifies the client
  .setSubject(process.env.CLIENT_ID!)
  .setAudience(process.env.AUTHORIZATION_SERVER_ISSUER!)
  .setExpirationTime("5m")
  .sign(privateKey);

const tokenResponse = await fetch(`${process.env.AUTHORIZATION_SERVER_ISSUER}/token`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "client_credentials",
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: clientAssertion,
    resource: process.env.MCP_RESOURCE_URI!,
    scope: "mcp:read",
  }),
});
```

Note: `client_id` is omitted from the body — it is conveyed through the `sub` claim in the JWT assertion (RFC 7523 Section 3).

### Client Secret Authentication

```typescript
// Client side (simpler but less secure)
const tokenResponse = await fetch(`${process.env.AUTHORIZATION_SERVER_ISSUER}/token`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    resource: process.env.MCP_RESOURCE_URI!,
    scope: "mcp:read",
  }),
});
```

## Step 6: Authorization Server Metadata Requirements

When using your own Authorization Server, ensure its metadata (at `/.well-known/oauth-authorization-server`) includes:

```json
{
  "issuer": "https://auth.example.com",
  "token_endpoint": "https://auth.example.com/token",
  "token_endpoint_auth_methods_supported": ["private_key_jwt", "client_secret_basic"],
  "token_endpoint_auth_signing_alg_values_supported": ["RS256", "ES256"],
  "grant_types_supported": ["client_credentials"],
  "jwks_uri": "https://auth.example.com/.well-known/jwks.json"
}
```

`token_endpoint_auth_methods_supported` **MUST** include at least one of `"private_key_jwt"` or `"client_secret_basic"`.

## CORS Configuration

HTTP-based MCP servers handling cross-origin requests must configure CORS:

```typescript
import cors from "cors";

app.use(cors({
  origin: "*",                    // restrict to known clients in production
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "mcp-session-id",
    "mcp-protocol-version",
    "last-event-id",
  ],
  exposedHeaders: ["mcp-session-id"],
}));
```

## Dependencies

```bash
npm install jose                  # JWT validation
npm install cors                  # CORS middleware
```

Use `npm install` — never specify version numbers from memory.

## Environment Variables

```env
MCP_RESOURCE_URI=https://mcp.example.com
MCP_BASE_URL=https://mcp.example.com
AUTHORIZATION_SERVER_ISSUER=https://auth.example.com

# For client-side (if testing):
CLIENT_ID=your-client-id
CLIENT_SECRET=your-client-secret
CLIENT_PRIVATE_KEY=<PEM-encoded private key>
CLIENT_KEY_ID=your-key-id
```

## Security Considerations

Follow OAuth 2.1 security best practices (Section 7):

- **Client authentication security** — Prefer JWT (`private_key_jwt`) over client secrets; rotate keys regularly
- **Token storage** — Store tokens securely; never log access tokens
- **Communication security** — Use HTTPS for all endpoints; validate TLS certificates
- **Credential protection** — Never embed client secrets in client-side code; use environment variables or secret managers
- **Scope minimization** — Request only the scopes needed for each operation
- **Token expiry** — Set short expiry times; implement token refresh logic

See also: [RFC 7523 Section 5 - Security Considerations](https://datatracker.ietf.org/doc/html/rfc7523#section-5)

## Testing

1. Start the MCP server
2. Make an unauthenticated request — verify `401` with `WWW-Authenticate` header
3. Request `/.well-known/oauth-protected-resource` — verify correct JSON response
4. Obtain a token from the Authorization Server using client credentials
5. Make an authenticated request with `Authorization: Bearer <token>` — verify success
6. Test with an expired or invalid token — verify `401`
7. Test with insufficient scopes — verify `401` or `403`
