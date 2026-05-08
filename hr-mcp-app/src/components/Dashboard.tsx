import React from "react";
import type { DashboardData } from "../types";
import { DEMO_DASHBOARD } from "../../demoData";

// ── Donut chart ───────────────────────────────────────────────────────────────
const DEPT_COLORS = ["#0078d4","#107c10","#c19c00","#8764b8","#038387","#d13438","#ca5010","#00b7c3"];

function DonutChart({ data }: { data: { name: string; count: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const R = 54, CX = 64, CY = 64;
  const circ = 2 * Math.PI * R;
  let cumulative = 0;

  const segments = data.map((d, i) => {
    const pct = d.count / total;
    const dash = pct * circ;
    const gap  = circ - dash;
    const rotate = (cumulative / total) * 360 - 90;
    cumulative += d.count;
    return { ...d, dash, gap, rotate, color: DEPT_COLORS[i % DEPT_COLORS.length] };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={128} height={128} viewBox="0 0 128 128">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--bg-3)" strokeWidth={18} />
        {segments.map((s, i) => (
          <circle
            key={i} cx={CX} cy={CY} r={R}
            fill="none" stroke={s.color} strokeWidth={18}
            strokeDasharray={`${s.dash} ${s.gap}`}
            transform={`rotate(${s.rotate} ${CX} ${CY})`}
          />
        ))}
        <text x={CX} y={CY - 6} textAnchor="middle" fill="var(--fg)" fontSize={18} fontWeight={700}>{total}</text>
        <text x={CX} y={CY + 12} textAnchor="middle" fill="var(--fg-2)" fontSize={10}>employees</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
        {segments.slice(0, 6).map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ flex: 1, color: "var(--fg)" }}>{s.name}</span>
            <span style={{ color: "var(--fg-2)", fontWeight: 600 }}>{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Headcount trend sparkline ─────────────────────────────────────────────────
function TrendLine({ trend }: { trend: { month: string; count: number }[] }) {
  if (trend.length < 2) return null;
  const W = 280, H = 80, PAD = 8;
  const min = Math.min(...trend.map((t) => t.count)) - 5;
  const max = Math.max(...trend.map((t) => t.count)) + 5;
  const x = (i: number) => PAD + (i / (trend.length - 1)) * (W - PAD * 2);
  const y = (v: number) => PAD + ((max - v) / (max - min)) * (H - PAD * 2);
  const pts = trend.map((t, i) => `${x(i)},${y(t.count)}`).join(" ");
  const area = `M${x(0)},${y(trend[0].count)} ` + trend.slice(1).map((t, i) => `L${x(i + 1)},${y(t.count)}`).join(" ")
    + ` L${x(trend.length - 1)},${H - PAD} L${x(0)},${H - PAD} Z`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity=".4" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaGrad)" />
      <polyline points={pts} className="chart-line" />
      {trend.map((t, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(t.count)} r={3} className="chart-dot" />
          <text x={x(i)} y={H - 1} textAnchor="middle" fontSize={9} className="chart-label">{t.month}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Activity feed ────────────────────────────────────────────────────────────
const ACTIVITY_CFG: Record<string, { icon: string; bg: string }> = {
  hire:     { icon: "👤", bg: "var(--green-bg)" },
  leave:    { icon: "📅", bg: "var(--brand-bg)" },
  review:   { icon: "⭐", bg: "var(--amber-bg)" },
  training: { icon: "📚", bg: "var(--purple-bg)" },
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
interface DashboardProps { data: DashboardData | null }

export function Dashboard({ data }: DashboardProps) {
  const d = data ?? DEMO_DASHBOARD;

  const kpis = [
    { label: "Total Employees",   value: d.totalEmployees,    change: "+3 this month", dir: "up",   accent: "#0078d4" },
    { label: "On Leave Today",    value: d.onLeaveToday,      change: `${((d.onLeaveToday / d.totalEmployees) * 100).toFixed(1)}% of workforce`, dir: null, accent: "#ca5010" },
    { label: "New Hires (Month)", value: d.newHiresThisMonth, change: "+2 vs last month", dir: "up",  accent: "#107c10" },
    { label: "Pending Approvals", value: d.pendingApprovals,  change: "Requires action",  dir: null, accent: "#c19c00" },
  ] as const;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Workforce overview · {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm">📥 Export</button>
          <button className="btn btn-primary btn-sm">+ Quick Action</button>
        </div>
      </div>

      <div className="content-area">
        {/* KPIs */}
        <div className="grid cols-4">
          {kpis.map((k, i) => (
            <div key={i} className="kpi-card" style={{ "--kpi-accent": k.accent } as React.CSSProperties}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              <div className={`kpi-trend${k.dir === "up" ? " up" : k.dir === "down" ? " down" : ""}`}>
                {k.dir === "up" ? "↑" : k.dir === "down" ? "↓" : "•"} {k.change}
              </div>
            </div>
          ))}
        </div>

        {/* Second row */}
        <div className="grid cols-2">
          {/* Department donut */}
          <div className="card">
            <div className="card-header"><span className="card-title">Department Breakdown</span></div>
            <div className="card-body"><DonutChart data={d.departmentBreakdown} /></div>
          </div>

          {/* Headcount trend */}
          <div className="card">
            <div className="card-header"><span className="card-title">Headcount Trend (6 months)</span></div>
            <div className="card-body">
              <TrendLine trend={d.headcountTrend} />
              <div style={{ marginTop: 12, fontSize: 12, color: "var(--fg-2)" }}>
                Net growth: <strong style={{ color: "var(--green)" }}>
                  +{d.headcountTrend.at(-1)!.count - d.headcountTrend[0].count}
                </strong> in 6 months
              </div>
            </div>
          </div>
        </div>

        {/* Third row */}
        <div className="grid cols-2">
          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Activity</span>
              <button className="btn btn-ghost btn-sm">View All</button>
            </div>
            <div className="card-body-flush">
              {d.recentActivities.map((act) => {
                const cfg = ACTIVITY_CFG[act.type] ?? { icon: "📌", bg: "var(--bg-3)" };
                return (
                  <div key={act.id} className="activity-item">
                    <div className="activity-icon" style={{ background: cfg.bg }}>{cfg.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div className="activity-text">{act.text}</div>
                      <div className="activity-time">{act.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header"><span className="card-title">Quick Actions</span></div>
            <div className="card-body">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { icon: "📅", label: "Request Leave" },
                  { icon: "💰", label: "View Payslip" },
                  { icon: "👤", label: "Update Profile" },
                  { icon: "🧾", label: "Submit Expense" },
                  { icon: "📚", label: "Training Portal" },
                  { icon: "⭐", label: "Performance Review" },
                  { icon: "📋", label: "HR Policies" },
                  { icon: "🏖️", label: "Holiday Calendar" },
                ].map((a) => (
                  <button key={a.label} className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
