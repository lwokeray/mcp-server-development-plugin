import React, { useState, useMemo } from "react";
import type { Employee } from "../types";
import { DEMO_EMPLOYEES } from "../../demoData";

// ── Colour palette cycling for avatars ────────────────────────────────────────
const AVATAR_COLORS = [
  "#0078d4","#107c10","#c19c00","#8764b8","#038387",
  "#d13438","#ca5010","#00b7c3","#4a154b","#2e7d32",
];
function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name: string): string {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

// ── Employee detail panel ─────────────────────────────────────────────────────
function EmployeeDetail({ emp, onClose }: { emp: Employee; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <span className="modal-title">Employee Profile</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ alignItems: "center", textAlign: "center" }}>
          <div
            className="avatar avatar-xl"
            style={{ background: avatarColor(emp.displayName), fontSize: 24 }}
          >
            {initials(emp.displayName)}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--fg)" }}>{emp.displayName}</div>
            <div style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 2 }}>{emp.jobTitle}</div>
            {emp.department && (
              <span className="badge badge-blue" style={{ marginTop: 6 }}>{emp.department}</span>
            )}
          </div>
        </div>
        <div className="divider" />
        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { icon: "📧", label: "Email",       value: emp.mail },
            { icon: "📱", label: "Mobile",      value: emp.mobilePhone },
            { icon: "📍", label: "Office",      value: emp.officeLocation },
            { icon: "👤", label: "Reports To",  value: emp.manager?.displayName },
          ].filter((r) => r.value).map((row) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{row.icon}</span>
              <span style={{ color: "var(--fg-2)", width: 70, flexShrink: 0 }}>{row.label}</span>
              <span style={{ color: "var(--fg)", fontWeight: 500, wordBreak: "break-all" }}>{row.value}</span>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm">📅 Request 1:1</button>
          <button className="btn btn-primary btn-sm">✉️ Send Email</button>
        </div>
      </div>
    </div>
  );
}

// ── EmployeeDirectory ─────────────────────────────────────────────────────────
interface EmployeeDirectoryProps {
  data: { employees: Employee[]; search?: string; department?: string } | null;
}

export function EmployeeDirectory({ data }: EmployeeDirectoryProps) {
  const allEmployees = data?.employees ?? DEMO_EMPLOYEES;
  const [search, setSearch] = useState(data?.search ?? "");
  const [dept, setDept] = useState(data?.department ?? "");
  const [selected, setSelected] = useState<Employee | null>(null);

  const departments = useMemo(
    () => ["", ...Array.from(new Set(allEmployees.map((e) => e.department ?? ""))).filter(Boolean).sort()],
    [allEmployees]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allEmployees.filter((e) => {
      const matchSearch = !q || e.displayName.toLowerCase().includes(q) || (e.mail ?? "").toLowerCase().includes(q) || (e.jobTitle ?? "").toLowerCase().includes(q);
      const matchDept = !dept || e.department === dept;
      return matchSearch && matchDept;
    });
  }, [allEmployees, search, dept]);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Employee Directory</div>
          <div className="page-subtitle">{filtered.length} employee{filtered.length !== 1 ? "s" : ""} found</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm">📥 Export</button>
          <button className="btn btn-primary btn-sm">+ Add Employee</button>
        </div>
      </div>

      <div className="content-area">
        {/* Filters */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="input-wrap" style={{ flex: 1, minWidth: 200 }}>
            <span className="input-icon">🔍</span>
            <input
              placeholder="Search by name, email, title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-3)", fontSize: 14 }}
                onClick={() => setSearch("")}>✕</button>
            )}
          </div>
          <div className="input-wrap" style={{ minWidth: 160 }}>
            <span className="input-icon">🏷️</span>
            <select value={dept} onChange={(e) => setDept(e.target.value)}>
              <option value="">All Departments</option>
              {departments.filter(Boolean).map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Department chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {departments.map((d) => (
            <button key={d} className={`chip${dept === d ? " active" : ""}`} onClick={() => setDept(d)}>
              {d || "All"}
              {d && (
                <span style={{ marginLeft: 4, color: "var(--fg-3)" }}>
                  {allEmployees.filter((e) => e.department === d).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Employee grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-text">No employees match your search</div>
          </div>
        ) : (
          <div className="grid cols-4" style={{ gap: 12 }}>
            {filtered.map((emp) => (
              <div key={emp.id} className="emp-card" onClick={() => setSelected(emp)}>
                <div
                  className="avatar avatar-lg"
                  style={{ background: avatarColor(emp.displayName) }}
                >
                  {initials(emp.displayName)}
                </div>
                <div className="emp-card-name">{emp.displayName}</div>
                {emp.jobTitle && <div className="emp-card-title">{emp.jobTitle}</div>}
                {emp.department && <div className="emp-card-dept">{emp.department}</div>}
                {emp.officeLocation && (
                  <div className="emp-card-contact">📍 {emp.officeLocation}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <EmployeeDetail emp={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
