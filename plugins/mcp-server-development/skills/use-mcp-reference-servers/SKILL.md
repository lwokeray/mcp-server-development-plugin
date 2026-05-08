---
name: use-mcp-reference-servers
description: This skill should be used when the user asks to "add official MCP servers to my project", "use Fetch MCP server", "use Filesystem MCP server", "integrate Memory server", "add Git MCP server", "use Sequential Thinking server", "use Time MCP server", "configure official MCP servers in Claude Desktop or VS Code", "use @modelcontextprotocol/server-*", "set up reference MCP servers", or needs to integrate the official Model Context Protocol reference servers into an MCP client, project, or Claude Desktop / VS Code configuration.
---

# Use Official MCP Reference Servers

Integrate the official MCP reference servers — maintained by the MCP steering group — into your project, Claude Desktop, VS Code, or MCP client configuration.

**Repository:** https://github.com/modelcontextprotocol/servers
**Registry:** https://registry.modelcontextprotocol.io/

> **Note:** These reference servers are **educational examples** demonstrating MCP features and SDK usage. Evaluate your own security requirements before using in production.

## Available Reference Servers

| Server | Package | Language | Description |
|--------|---------|----------|-------------|
| **Everything** | `@modelcontextprotocol/server-everything` | TypeScript | Reference/test server with prompts, resources, and tools — use to verify your MCP client works |
| **Fetch** | `@modelcontextprotocol/server-fetch` | TypeScript | Web content fetching and conversion for efficient LLM usage |
| **Filesystem** | `@modelcontextprotocol/server-filesystem` | TypeScript | Secure file operations with configurable access controls |
| **Git** | `mcp-server-git` (pip) | Python | Tools to read, search, and manipulate Git repositories |
| **Memory** | `@modelcontextprotocol/server-memory` | TypeScript | Knowledge graph-based persistent memory system |
| **Sequential Thinking** | `@modelcontextprotocol/server-sequentialthinking` | TypeScript | Dynamic and reflective problem-solving through thought sequences |
| **Time** | (Python) | Python | Time and timezone conversion capabilities |

## Quick Start — Run Without Installation

TypeScript servers can be run with `npx`:

```bash
npx -y @modelcontextprotocol/server-memory
npx -y @modelcontextprotocol/server-fetch
npx -y @modelcontextprotocol/server-filesystem /path/to/allowed/files
npx -y @modelcontextprotocol/server-everything
npx -y @modelcontextprotocol/server-sequentialthinking
```

Python servers use `uvx` (recommended) or `pip`:

```bash
# Install uv: https://docs.astral.sh/uv/getting-started/installation/
uvx mcp-server-git

# Or with pip:
pip install mcp-server-git
python -m mcp_server_git
```

## Claude Desktop Configuration

Add reference servers to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS, `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/yourname/Documents"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    },
    "git": {
      "command": "uvx",
      "args": ["mcp-server-git", "--repository", "/path/to/your/repo"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequentialthinking"]
    }
  }
}
```

**On Windows**, wrap `npx`-based servers with `cmd /c`:

```json
{
  "mcpServers": {
    "memory": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-memory"]
    },
    "filesystem": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-filesystem", "C:\\Users\\yourname\\Documents"]
    }
  }
}
```

Leave `uvx` entries unchanged on Windows.

## VS Code Configuration

Add to `.vscode/mcp.json` (workspace) or User settings under `mcp.servers`:

```json
{
  "servers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "type": "stdio"
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "${workspaceFolder}"],
      "type": "stdio"
    }
  }
}
```

## Server Details

### Everything — Reference Test Server

Tests all MCP features: tools, resources, prompts, sampling, roots.

```bash
npx -y @modelcontextprotocol/server-everything
```

Use this to verify your MCP client implementation handles all protocol features correctly.

---

### Fetch — Web Content Retrieval

Fetches URLs and converts web content to Markdown for efficient LLM consumption.

```bash
npx -y @modelcontextprotocol/server-fetch
```

Tools:
- `fetch` — Fetches a URL and returns the page content as Markdown (or raw HTML)

---

### Filesystem — Secure File Operations

Provides file system access limited to explicitly allowed directories.

```bash
npx -y @modelcontextprotocol/server-filesystem /allowed/path1 /allowed/path2
```

Tools: `read_file`, `read_multiple_files`, `write_file`, `edit_file`, `create_directory`, `list_directory`, `directory_tree`, `move_file`, `search_files`, `get_file_info`

Resources: Direct file access via `file://` URIs

**Security:** Only paths passed as arguments are accessible. Never pass `/` or sensitive system directories.

---

### Git — Repository Operations

Read, search, and manipulate Git repositories.

```bash
uvx mcp-server-git --repository /path/to/repo
# or
pip install mcp-server-git && python -m mcp_server_git --repository /path/to/repo
```

Tools: `git_status`, `git_diff_unstaged`, `git_diff_staged`, `git_diff`, `git_commit`, `git_add`, `git_reset`, `git_log`, `git_create_branch`, `git_checkout`, `git_show`, `git_init`, `git_clone`, `git_search_code`

---

### Memory — Knowledge Graph Persistence

A persistent memory system using a local knowledge graph (stored in a JSON file).

```bash
npx -y @modelcontextprotocol/server-memory
```

Tools: `create_entities`, `create_relations`, `add_observations`, `delete_entities`, `delete_observations`, `delete_relations`, `read_graph`, `search_nodes`, `open_nodes`

Use this to give your MCP client persistent memory across conversations.

Environment variable:
```bash
MEMORY_FILE_PATH=/path/to/memory.json   # default: ~/.mcp-memory.json
```

---

### Sequential Thinking — Reflective Problem-Solving

Enables dynamic multi-step problem solving with the ability to revise thoughts.

```bash
npx -y @modelcontextprotocol/server-sequentialthinking
```

Tools: `sequentialthinking` — The model calls this with thoughts, can branch and revise, useful for complex reasoning chains.

---

### Time — Time and Timezone Utilities

```bash
# Python only - see repo for installation details
```

Tools: `get_current_time`, `convert_time`

## Integrating as Examples in Your Own Server

Clone the reference server repository to study patterns:

```bash
git clone https://github.com/modelcontextprotocol/servers.git /tmp/mcp-servers
```

Key source directories:
- `/tmp/mcp-servers/src/fetch/` — HTTP fetch + Markdown conversion pattern
- `/tmp/mcp-servers/src/filesystem/` — Allowlist-based path security pattern
- `/tmp/mcp-servers/src/memory/` — JSON file persistence + graph pattern
- `/tmp/mcp-servers/src/sequentialthinking/` — Stateful multi-step tool pattern
- `/tmp/mcp-servers/src/everything/` — All-features reference (prompts, resources, tools, sampling)

## Testing with the Everything Server

The `everything` server is the best way to verify your MCP client handles all protocol features:

```bash
# Start the server
npx -y @modelcontextprotocol/server-everything

# Or run locally from clone
cd /tmp/mcp-servers/src/everything
npm install && npm run build && node dist/index.js
```

Configure your client to connect and exercise:
- Tool calls (various input types)
- Resource reads (`resource://` URIs)
- Prompt requests
- Progress notifications
- Logging

## Common Patterns

### Running Multiple Servers Simultaneously

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

### Pinning a Specific Version

```bash
npx -y @modelcontextprotocol/server-memory@latest
# or pin to a specific version:
npx -y @modelcontextprotocol/server-memory@2026.1.26
```

### Local Development / Testing a Modified Server

```json
{
  "mcpServers": {
    "memory-local": {
      "command": "bash",
      "args": [
        "-c",
        "cd /tmp/mcp-servers/src/memory && npm run build >&2 && node dist/index.js"
      ]
    }
  }
}
```
