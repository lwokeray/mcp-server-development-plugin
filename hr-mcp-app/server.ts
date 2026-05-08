import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAppTool, registerAppResource, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  getDashboardData, getEmployees,
  getLeaveData, getOrgChart, getAttendance,
} from "./graphService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_PATH = path.join(__dirname, "dist", "mcp-app.html");

const CSP = {
  "connect-src": [
    "https://graph.microsoft.com",
    "https://login.microsoftonline.com",
  ],
};

function readHtml(): string {
  try {
    return fs.readFileSync(HTML_PATH, "utf-8");
  } catch {
    return `<!DOCTYPE html><html><body><p style="font-family:sans-serif;padding:24px">
      Run <code>npm run build</code> to compile the HR App UI.</p></body></html>`;
  }
}

export function createServer() {
  const server = new McpServer({ name: "hr-mcp-server", version: "1.0.0" });

  // ── Dashboard ─────────────────────────────────────────────────────────────
  registerAppTool(
    server,
    "hr_dashboard",
    {
      description: "Open the HR Dashboard with employee metrics, department breakdown, and recent activity",
      inputSchema: z.object({}),
      _meta: { ui: { resourceUri: "ui://hr-app" } },
    },
    async () => {
      const data = await getDashboardData();
      return {
        content: [{ type: "text", text: `HR Dashboard — ${data.totalEmployees} employees, ${data.pendingApprovals} pending approvals` }],
        _meta: { view: "dashboard", data },
      };
    }
  );

  // ── Employee Directory ────────────────────────────────────────────────────
  registerAppTool(
    server,
    "hr_employees",
    {
      description: "Browse the employee directory with search and department filters",
      inputSchema: z.object({
        search: z.string().optional().describe("Search by name or email"),
        department: z.string().optional().describe("Filter by department name"),
      }),
      _meta: { ui: { resourceUri: "ui://hr-app" } },
    },
    async ({ search, department }) => {
      const employees = await getEmployees(search, department);
      return {
        content: [{ type: "text", text: `Found ${employees.length} employee(s)${search ? ` matching "${search}"` : ""}` }],
        _meta: { view: "employees", data: { employees, search, department } },
      };
    }
  );

  // ── Leave Management ──────────────────────────────────────────────────────
  registerAppTool(
    server,
    "hr_leave",
    {
      description: "Manage leave requests — view balances, pending approvals, and leave history",
      inputSchema: z.object({
        employeeId: z.string().optional().describe("Filter leave records for a specific employee ID"),
      }),
      _meta: { ui: { resourceUri: "ui://hr-app" } },
    },
    async ({ employeeId }) => {
      const data = await getLeaveData();
      const requests = employeeId
        ? data.requests.filter((r) => r.employeeId === employeeId)
        : data.requests;
      const pending = requests.filter((r) => r.status === "pending").length;
      return {
        content: [{ type: "text", text: `Leave management — ${requests.length} requests, ${pending} pending` }],
        _meta: { view: "leave", data: { ...data, requests } },
      };
    }
  );

  // ── Org Chart ─────────────────────────────────────────────────────────────
  registerAppTool(
    server,
    "hr_orgchart",
    {
      description: "View the interactive organization chart and reporting structure",
      inputSchema: z.object({}),
      _meta: { ui: { resourceUri: "ui://hr-app" } },
    },
    async () => {
      const data = await getOrgChart();
      return {
        content: [{ type: "text", text: "Organization chart loaded" }],
        _meta: { view: "orgchart", data },
      };
    }
  );

  // ── Attendance ────────────────────────────────────────────────────────────
  registerAppTool(
    server,
    "hr_attendance",
    {
      description: "View attendance records, check-in/check-out times, and monthly summaries",
      inputSchema: z.object({
        employeeId: z.string().optional().describe("Employee ID to view attendance for"),
        month: z.string().optional().describe("Month in YYYY-MM format (defaults to current month)"),
      }),
      _meta: { ui: { resourceUri: "ui://hr-app" } },
    },
    async ({ month }) => {
      const data = await getAttendance();
      const targetMonth = month ?? new Date().toISOString().slice(0, 7);
      const records = data.records.filter((r) => r.date.startsWith(targetMonth));
      const present = records.filter((r) => r.status === "present" || r.status === "late").length;
      return {
        content: [{ type: "text", text: `Attendance for ${targetMonth} — ${present} present days` }],
        _meta: { view: "attendance", data: { records: data.records, month: targetMonth } },
      };
    }
  );

  // ── Resource (shared HTML shell) ──────────────────────────────────────────
  registerAppResource(server, "ui://hr-app", {
    name: "M365 HR App",
    read: () => [
      {
        uri: "ui://hr-app",
        mimeType: RESOURCE_MIME_TYPE,
        text: readHtml(),
        _meta: { ui: { csp: CSP } },
      },
    ],
  });

  return server;
}
