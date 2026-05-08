import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import cors from "cors";
import { createServer } from "./server.js";

const PORT = parseInt(process.env.PORT ?? "3001", 10);
const USE_STDIO = process.env.MCP_TRANSPORT === "stdio";

async function main() {
  const server = createServer();

  if (USE_STDIO) {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } else {
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.post("/mcp", async (req, res) => {
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on("close", () => transport.close());
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    });

    app.get("/health", (_req, res) => res.json({ status: "ok", service: "hr-mcp-server" }));

    app.listen(PORT, () => {
      console.log(`HR MCP Server running on http://localhost:${PORT}/mcp`);
      console.log(`Set AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET for M365 integration`);
    });
  }
}

main().catch(console.error);
