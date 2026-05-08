export interface Employee {
  id: string;
  displayName: string;
  mail?: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  mobilePhone?: string;
  businessPhones?: string[];
  manager?: { id: string; displayName: string };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "annual" | "sick" | "personal" | "compensatory" | "maternity" | "other";
  startDate: string;
  endDate: string;
  days: number;
  status: "pending" | "approved" | "rejected";
  reason?: string;
}

export interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
  label: string;
}

export interface AttendanceRecord {
  date: string;
  checkIn?: string;
  checkOut?: string;
  hours?: number;
  status: "present" | "absent" | "late" | "halfDay" | "leave" | "weekend";
  leaveType?: string;
}

export interface OrgNode {
  id: string;
  name: string;
  title: string;
  department?: string;
  children?: OrgNode[];
}

export interface DashboardData {
  totalEmployees: number;
  onLeaveToday: number;
  newHiresThisMonth: number;
  pendingApprovals: number;
  headcountTrend: { month: string; count: number }[];
  departmentBreakdown: { name: string; count: number }[];
  recentActivities: {
    id: string;
    text: string;
    time: string;
    type: "hire" | "leave" | "review" | "training";
  }[];
}

export type View = "dashboard" | "employees" | "leave" | "orgchart" | "attendance";

export interface ToolPayload {
  view: View;
  data: DashboardData | { employees: Employee[]; search?: string; department?: string }
    | { requests: LeaveRequest[]; balances: LeaveBalance[] }
    | OrgNode
    | { records: AttendanceRecord[]; month: string }
    | null;
}
