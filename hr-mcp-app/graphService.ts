import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js";
import type { Employee, DashboardData } from "./src/types.js";
import {
  DEMO_EMPLOYEES, DEMO_DASHBOARD, DEMO_LEAVE_REQUESTS,
  DEMO_LEAVE_BALANCES, DEMO_ATTENDANCE, DEMO_ORG_CHART,
} from "./demoData.js";

function createClient(): Client | null {
  const { AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET } = process.env;
  if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET) return null;
  const credential = new ClientSecretCredential(AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET);
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ["https://graph.microsoft.com/.default"],
  });
  return Client.initWithMiddleware({ authProvider });
}

export async function getDashboardData(): Promise<DashboardData> {
  const client = createClient();
  if (!client) return DEMO_DASHBOARD;
  try {
    const users = await client
      .api("/users?$top=999&$select=id,displayName,department,jobTitle")
      .get();
    const employees: Employee[] = users.value ?? [];
    const deptMap = new Map<string, number>();
    for (const emp of employees) {
      if (emp.department) deptMap.set(emp.department, (deptMap.get(emp.department) ?? 0) + 1);
    }
    return {
      ...DEMO_DASHBOARD,
      totalEmployees: employees.length,
      departmentBreakdown: Array.from(deptMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
    };
  } catch {
    return DEMO_DASHBOARD;
  }
}

export async function getEmployees(search?: string, department?: string): Promise<Employee[]> {
  const client = createClient();
  if (!client) {
    let result = DEMO_EMPLOYEES;
    if (search) result = result.filter((e) => e.displayName.toLowerCase().includes(search.toLowerCase()) || e.mail?.toLowerCase().includes(search.toLowerCase()));
    if (department) result = result.filter((e) => e.department === department);
    return result;
  }
  try {
    let query = "/users?$top=999&$select=id,displayName,mail,jobTitle,department,officeLocation,mobilePhone,businessPhones";
    if (search) query += `&$search="displayName:${search}"`;
    if (department) query += `&$filter=department eq '${department}'`;
    const res = await client.api(query).get();
    return res.value ?? [];
  } catch {
    return DEMO_EMPLOYEES;
  }
}

export async function getLeaveData() {
  return { requests: DEMO_LEAVE_REQUESTS, balances: DEMO_LEAVE_BALANCES };
}

export async function getOrgChart() {
  return DEMO_ORG_CHART;
}

export async function getAttendance() {
  return { records: DEMO_ATTENDANCE };
}
