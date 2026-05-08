import React, { useState } from "react";
import type { AttendanceRecord } from "../types";
import { DEMO_ATTENDANCE } from "../../demoData";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DayClassInfo {
  cls: string;
  label: string;
  emoji: string;
}

function dayInfo(rec?: AttendanceRecord): DayClassInfo {
  if (!rec) return { cls: "att-empty",   label: "",         emoji: "" };
  switch (rec.status) {
    case "present":  return { cls: "att-present",  label: `${rec.hours ?? ""}h`, emoji: "✓" };
    case "late":     return { cls: "att-late",     label: `${rec.hours ?? ""}h`, emoji: "⚡" };
    case "absent":   return { cls: "att-absent",   label: "Absent",  emoji: "✗" };
    case "halfDay":  return { cls: "att-halfday",  label: "Half",    emoji: "½" };
    case "leave":    return { cls: "att-leave",    label: "Leave",   emoji: "🏖" };
    case "weekend":  return { cls: "att-weekend",  label: "",        emoji: "" };
    default:         return { cls: "att-empty",    label: "",        emoji: "" };
  }
}

// ── Monthly calendar ──────────────────────────────────────────────────────────
function AttCalendar({ records, month }: { records: AttendanceRecord[]; month: string }) {
  const [year, mon] = month.split("-").map(Number);
  const firstDay = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();

  const byDate: Record<string, AttendanceRecord> = {};
  for (const r of records) if (r.date.startsWith(month)) byDate[r.date] = r;

  const cells: (AttendanceRecord | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = `${month}-${String(i + 1).padStart(2, "0")}`;
      return byDate[d] ?? { date: d, status: (new Date(year, mon - 1, i + 1).getDay() % 6 === 0 ? "weekend" : "absent") as AttendanceRecord["status"] };
    }),
  ];

  return (
    <div>
      <div className="att-calendar" style={{ marginBottom: 8 }}>
        {DAY_HEADERS.map((h) => (
          <div key={h} className="att-day-header">{h}</div>
        ))}
      </div>
      <div className="att-calendar">
        {cells.map((rec, i) => {
          if (i < firstDay) return <div key={`e${i}`} className="att-day att-empty" />;
          const day = i - firstDay + 1;
          const { cls, label, emoji } = dayInfo(rec ?? undefined);
          const isToday = rec?.date === new Date().toISOString().split("T")[0];
          return (
            <div
              key={day}
              className={`att-day ${cls}`}
              style={isToday ? { outline: "2px solid var(--brand)", outlineOffset: 1 } : {}}
              title={rec ? `${rec.date}${rec.checkIn ? ` · ${rec.checkIn}–${rec.checkOut}` : ""}` : ""}
            >
              <div className="att-day-num">{day}</div>
              {label && <div className="att-day-hrs">{label || emoji}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Summary stats ─────────────────────────────────────────────────────────────
function SummaryStats({ records, month }: { records: AttendanceRecord[]; month: string }) {
  const monthly = records.filter((r) => r.date.startsWith(month));
  const present   = monthly.filter((r) => r.status === "present").length;
  const late      = monthly.filter((r) => r.status === "late").length;
  const absent    = monthly.filter((r) => r.status === "absent").length;
  const leave     = monthly.filter((r) => r.status === "leave").length;
  const totalHrs  = monthly.reduce((s, r) => s + (r.hours ?? 0), 0);
  const avgHrs    = present + late > 0 ? totalHrs / (present + late) : 0;

  const stats = [
    { icon: "✅", label: "Present",      val: present,                bg: "var(--green-bg)", iconBg: "var(--green)" },
    { icon: "⚡", label: "Late",         val: late,                   bg: "var(--amber-bg)", iconBg: "var(--amber)" },
    { icon: "❌", label: "Absent",       val: absent,                 bg: "var(--red-bg)",   iconBg: "var(--red)"   },
    { icon: "🏖",  label: "On Leave",    val: leave,                  bg: "var(--brand-bg)", iconBg: "var(--brand)" },
    { icon: "⏱",  label: "Total Hours", val: `${totalHrs.toFixed(1)}h`, bg: "var(--purple-bg)", iconBg: "var(--purple)" },
    { icon: "📊",  label: "Avg / Day",   val: `${avgHrs.toFixed(1)}h`,  bg: "var(--bg-3)",     iconBg: "var(--fg-3)" },
  ];

  return (
    <div className="grid cols-3" style={{ gap: 10 }}>
      {stats.map((s) => (
        <div key={s.label} className="att-stat-card">
          <div className="att-stat-icon" style={{ background: s.bg, color: s.iconBg }}>
            {s.icon}
          </div>
          <div>
            <div className="att-stat-val">{s.val}</div>
            <div className="att-stat-lbl">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Recent records table ──────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, { label: string; badge: string }> = {
  present:  { label: "Present",  badge: "badge-green"   },
  late:     { label: "Late",     badge: "badge-amber"   },
  absent:   { label: "Absent",   badge: "badge-red"     },
  halfDay:  { label: "Half Day", badge: "badge-purple"  },
  leave:    { label: "On Leave", badge: "badge-blue"    },
  weekend:  { label: "Weekend",  badge: "badge-neutral" },
};

// ── Attendance ────────────────────────────────────────────────────────────────
interface AttendanceProps { data: { records: AttendanceRecord[]; month: string } | null }

export function Attendance({ data }: AttendanceProps) {
  const records = data?.records ?? DEMO_ATTENDANCE;
  const today = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(data?.month ?? today);

  const workdays = records.filter(
    (r) => r.date.startsWith(month) && r.status !== "weekend"
  );
  const todayRec = records.find((r) => r.date === new Date().toISOString().split("T")[0]);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Attendance</div>
          <div className="page-subtitle">
            {todayRec?.checkIn
              ? `Today: checked in at ${todayRec.checkIn}${todayRec.checkOut ? ` · out at ${todayRec.checkOut}` : " · still in"}`
              : "Today: not checked in yet"}
          </div>
        </div>
        <div className="page-actions">
          <div className="input-wrap">
            <span className="input-icon">📅</span>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-sm">⏱ Check In / Out</button>
        </div>
      </div>

      <div className="content-area">
        {/* Summary stats */}
        <SummaryStats records={records} month={month} />

        <div className="grid cols-2" style={{ alignItems: "start" }}>
          {/* Calendar */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                {new Date(month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <div style={{ display: "flex", gap: 6, fontSize: 11 }}>
                {[
                  { cls: "att-present",  label: "Present" },
                  { cls: "att-late",     label: "Late" },
                  { cls: "att-absent",   label: "Absent" },
                  { cls: "att-leave",    label: "Leave" },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2 }} className={item.cls} />
                    <span style={{ color: "var(--fg-2)" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-body">
              <AttCalendar records={records} month={month} />
            </div>
          </div>

          {/* Recent records */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Records</span>
            </div>
            <div className="card-body-flush">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workdays.slice(-10).reverse().map((rec) => {
                    const s = STATUS_LABEL[rec.status] ?? { label: rec.status, badge: "badge-neutral" };
                    return (
                      <tr key={rec.date}>
                        <td style={{ fontWeight: 500 }}>
                          {new Date(rec.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td style={{ color: rec.status === "absent" ? "var(--fg-3)" : "var(--fg)" }}>
                          {rec.checkIn ?? "—"}
                        </td>
                        <td style={{ color: rec.status === "absent" ? "var(--fg-3)" : "var(--fg)" }}>
                          {rec.checkOut ?? "—"}
                        </td>
                        <td>
                          {rec.hours != null ? (
                            <span style={{ fontWeight: 600 }}>{rec.hours}h</span>
                          ) : "—"}
                        </td>
                        <td><span className={`badge ${s.badge}`}>{s.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
