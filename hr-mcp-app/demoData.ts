import type {
  Employee, LeaveRequest, AttendanceRecord,
  OrgNode, DashboardData, LeaveBalance,
} from "./src/types.js";

export const DEMO_EMPLOYEES: Employee[] = [
  { id: "e1", displayName: "Alice Chen", mail: "alice.chen@contoso.com", jobTitle: "VP of Engineering", department: "Engineering", officeLocation: "Taipei HQ", mobilePhone: "+886-912-345-001" },
  { id: "e2", displayName: "Bob Smith", mail: "bob.smith@contoso.com", jobTitle: "Engineering Manager", department: "Engineering", officeLocation: "Taipei HQ", mobilePhone: "+886-912-345-002", manager: { id: "e1", displayName: "Alice Chen" } },
  { id: "e3", displayName: "Carol White", mail: "carol.white@contoso.com", jobTitle: "HR Director", department: "Human Resources", officeLocation: "Taipei HQ", mobilePhone: "+886-912-345-003" },
  { id: "e4", displayName: "David Lee", mail: "david.lee@contoso.com", jobTitle: "Product Manager", department: "Product", officeLocation: "Taipei HQ", mobilePhone: "+886-912-345-004" },
  { id: "e5", displayName: "Emma Wilson", mail: "emma.wilson@contoso.com", jobTitle: "Senior UX Designer", department: "Design", officeLocation: "Taipei HQ", mobilePhone: "+886-912-345-005" },
  { id: "e6", displayName: "Frank Zhang", mail: "frank.zhang@contoso.com", jobTitle: "Data Analyst", department: "Analytics", officeLocation: "Taipei HQ", mobilePhone: "+886-912-345-006" },
  { id: "e7", displayName: "Grace Kim", mail: "grace.kim@contoso.com", jobTitle: "DevOps Engineer", department: "Engineering", officeLocation: "Remote", mobilePhone: "+886-912-345-007", manager: { id: "e2", displayName: "Bob Smith" } },
  { id: "e8", displayName: "Henry Brown", mail: "henry.brown@contoso.com", jobTitle: "Marketing Manager", department: "Marketing", officeLocation: "Taipei HQ", mobilePhone: "+886-912-345-008" },
  { id: "e9", displayName: "Iris Liu", mail: "iris.liu@contoso.com", jobTitle: "Sales Representative", department: "Sales", officeLocation: "Taichung Office", mobilePhone: "+886-912-345-009" },
  { id: "e10", displayName: "Jack Taylor", mail: "jack.taylor@contoso.com", jobTitle: "Finance Manager", department: "Finance", officeLocation: "Taipei HQ", mobilePhone: "+886-912-345-010" },
  { id: "e11", displayName: "Karen Davis", mail: "karen.davis@contoso.com", jobTitle: "Senior Recruiter", department: "Human Resources", officeLocation: "Taipei HQ", mobilePhone: "+886-912-345-011", manager: { id: "e3", displayName: "Carol White" } },
  { id: "e12", displayName: "Liam Garcia", mail: "liam.garcia@contoso.com", jobTitle: "Backend Developer", department: "Engineering", officeLocation: "Remote", mobilePhone: "+886-912-345-012", manager: { id: "e2", displayName: "Bob Smith" } },
  { id: "e13", displayName: "Mary Johnson", mail: "mary.johnson@contoso.com", jobTitle: "UX Researcher", department: "Design", officeLocation: "Taipei HQ", mobilePhone: "+886-912-345-013" },
  { id: "e14", displayName: "Nathan Moore", mail: "nathan.moore@contoso.com", jobTitle: "Business Analyst", department: "Finance", officeLocation: "Taipei HQ", mobilePhone: "+886-912-345-014" },
  { id: "e15", displayName: "Olivia Anderson", mail: "olivia.anderson@contoso.com", jobTitle: "Customer Support Lead", department: "Support", officeLocation: "Kaohsiung Office", mobilePhone: "+886-912-345-015" },
  { id: "e16", displayName: "Peter Chen", mail: "peter.chen@contoso.com", jobTitle: "Frontend Developer", department: "Engineering", officeLocation: "Taipei HQ", mobilePhone: "+886-912-345-016", manager: { id: "e2", displayName: "Bob Smith" } },
  { id: "e17", displayName: "Quinn Zhang", mail: "quinn.zhang@contoso.com", jobTitle: "Content Strategist", department: "Marketing", officeLocation: "Taipei HQ", mobilePhone: "+886-912-345-017" },
  { id: "e18", displayName: "Rachel Liu", mail: "rachel.liu@contoso.com", jobTitle: "Sales Manager", department: "Sales", officeLocation: "Taipei HQ", mobilePhone: "+886-912-345-018" },
];

export const DEMO_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: "l1", employeeId: "e7", employeeName: "Grace Kim", type: "annual", startDate: "2026-05-15", endDate: "2026-05-19", days: 5, status: "pending", reason: "Family vacation" },
  { id: "l2", employeeId: "e6", employeeName: "Frank Zhang", type: "sick", startDate: "2026-05-08", endDate: "2026-05-09", days: 2, status: "approved", reason: "Medical appointment" },
  { id: "l3", employeeId: "e12", employeeName: "Liam Garcia", type: "personal", startDate: "2026-05-20", endDate: "2026-05-20", days: 1, status: "pending", reason: "Personal errands" },
  { id: "l4", employeeId: "e9", employeeName: "Iris Liu", type: "annual", startDate: "2026-05-25", endDate: "2026-05-29", days: 5, status: "approved", reason: "Summer holiday" },
  { id: "l5", employeeId: "e16", employeeName: "Peter Chen", type: "sick", startDate: "2026-05-07", endDate: "2026-05-07", days: 1, status: "approved", reason: "Fever" },
  { id: "l6", employeeId: "e13", employeeName: "Mary Johnson", type: "annual", startDate: "2026-06-02", endDate: "2026-06-06", days: 5, status: "pending", reason: "Wedding attendance" },
  { id: "l7", employeeId: "e17", employeeName: "Quinn Zhang", type: "personal", startDate: "2026-05-12", endDate: "2026-05-12", days: 1, status: "rejected", reason: "House moving" },
  { id: "l8", employeeId: "e5", employeeName: "Emma Wilson", type: "annual", startDate: "2026-05-28", endDate: "2026-05-29", days: 2, status: "pending", reason: "Short break" },
];

export const DEMO_LEAVE_BALANCES: LeaveBalance[] = [
  { type: "annual", total: 20, used: 7, remaining: 13, label: "Annual Leave" },
  { type: "sick", total: 10, used: 3, remaining: 7, label: "Sick Leave" },
  { type: "personal", total: 3, used: 1, remaining: 2, label: "Personal Leave" },
  { type: "compensatory", total: 5, used: 0, remaining: 5, label: "Compensatory" },
];

export const DEMO_ATTENDANCE: AttendanceRecord[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 3, i + 9); // April 9 – May 8
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { date: date.toISOString().split("T")[0], status: "weekend" as const };
  }
  const roll = Math.random();
  if (i === 1 || i === 14) return { date: date.toISOString().split("T")[0], status: "leave", leaveType: "annual" };
  if (roll < 0.05) return { date: date.toISOString().split("T")[0], status: "absent" };
  if (roll < 0.12) {
    return { date: date.toISOString().split("T")[0], checkIn: "09:22", checkOut: "18:30", hours: 9.1, status: "late" };
  }
  if (roll < 0.18) {
    return { date: date.toISOString().split("T")[0], checkIn: "09:02", checkOut: "13:00", hours: 4, status: "halfDay" };
  }
  const checkInMin = 848 + Math.floor(Math.random() * 15);
  const checkOutMin = 1070 + Math.floor(Math.random() * 60);
  const toTime = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
  return {
    date: date.toISOString().split("T")[0],
    checkIn: toTime(checkInMin),
    checkOut: toTime(checkOutMin),
    hours: Math.round(((checkOutMin - checkInMin) / 60) * 10) / 10,
    status: "present",
  };
});

export const DEMO_ORG_CHART: OrgNode = {
  id: "ceo", name: "Sarah Mitchell", title: "Chief Executive Officer", department: "Executive",
  children: [
    {
      id: "e1", name: "Alice Chen", title: "VP of Engineering", department: "Engineering",
      children: [
        {
          id: "e2", name: "Bob Smith", title: "Engineering Manager", department: "Engineering",
          children: [
            { id: "e7", name: "Grace Kim", title: "DevOps Engineer", department: "Engineering" },
            { id: "e12", name: "Liam Garcia", title: "Backend Developer", department: "Engineering" },
            { id: "e16", name: "Peter Chen", title: "Frontend Developer", department: "Engineering" },
          ],
        },
      ],
    },
    {
      id: "cto", name: "James Park", title: "Chief Technology Officer", department: "Technology",
      children: [
        { id: "e6", name: "Frank Zhang", title: "Data Analyst", department: "Analytics" },
      ],
    },
    {
      id: "e3", name: "Carol White", title: "HR Director", department: "Human Resources",
      children: [
        { id: "e11", name: "Karen Davis", title: "Senior Recruiter", department: "Human Resources" },
      ],
    },
    {
      id: "e4", name: "David Lee", title: "Product Manager", department: "Product",
      children: [
        { id: "e5", name: "Emma Wilson", title: "Senior UX Designer", department: "Design" },
        { id: "e13", name: "Mary Johnson", title: "UX Researcher", department: "Design" },
      ],
    },
    {
      id: "e10", name: "Jack Taylor", title: "Finance Manager", department: "Finance",
      children: [
        { id: "e14", name: "Nathan Moore", title: "Business Analyst", department: "Finance" },
      ],
    },
    {
      id: "e8", name: "Henry Brown", title: "Marketing Manager", department: "Marketing",
      children: [
        { id: "e17", name: "Quinn Zhang", title: "Content Strategist", department: "Marketing" },
      ],
    },
    {
      id: "e18", name: "Rachel Liu", title: "Sales Manager", department: "Sales",
      children: [
        { id: "e9", name: "Iris Liu", title: "Sales Representative", department: "Sales" },
      ],
    },
    { id: "e15", name: "Olivia Anderson", title: "Customer Support Lead", department: "Support" },
  ],
};

export const DEMO_DASHBOARD: DashboardData = {
  totalEmployees: 247,
  onLeaveToday: 12,
  newHiresThisMonth: 8,
  pendingApprovals: 5,
  headcountTrend: [
    { month: "Nov", count: 228 }, { month: "Dec", count: 231 }, { month: "Jan", count: 235 },
    { month: "Feb", count: 238 }, { month: "Mar", count: 242 }, { month: "Apr", count: 247 },
  ],
  departmentBreakdown: [
    { name: "Engineering", count: 89 },
    { name: "Marketing", count: 41 },
    { name: "Product", count: 32 },
    { name: "Design", count: 28 },
    { name: "Finance", count: 22 },
    { name: "Sales", count: 20 },
    { name: "HR", count: 15 },
  ],
  recentActivities: [
    { id: "a1", text: "Alice Chen approved leave request from Bob Smith", time: "10 min ago", type: "leave" },
    { id: "a2", text: "New hire Emma Wilson joined the Design team", time: "2 hours ago", type: "hire" },
    { id: "a3", text: "Performance review cycle started for Q2 2026", time: "Yesterday", type: "review" },
    { id: "a4", text: "Leadership training completed by 15 employees", time: "2 days ago", type: "training" },
    { id: "a5", text: "Frank Zhang's leave request pending approval", time: "2 days ago", type: "leave" },
  ],
};
