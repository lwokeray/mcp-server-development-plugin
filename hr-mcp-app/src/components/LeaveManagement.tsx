import React, { useState } from "react";
import type { LeaveRequest, LeaveBalance } from "../types";
import { DEMO_LEAVE_REQUESTS, DEMO_LEAVE_BALANCES } from "../../demoData";

const LEAVE_TYPE_LABELS: Record<string, string> = {
  annual: "Annual Leave", sick: "Sick Leave", personal: "Personal Leave",
  compensatory: "Compensatory", maternity: "Maternity", other: "Other",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "badge-amber", approved: "badge-green", rejected: "badge-red",
};

const LEAVE_COLORS: Record<string, string> = {
  annual: "var(--brand)", sick: "var(--red)", personal: "var(--purple)",
  compensatory: "var(--green)", maternity: "var(--teal)", other: "var(--fg-3)",
};

// ── Leave Balance Card ────────────────────────────────────────────────────────
function BalanceCard({ balance }: { balance: LeaveBalance }) {
  const pct = Math.round((balance.used / balance.total) * 100);
  const color = LEAVE_COLORS[balance.type] ?? "var(--brand)";
  return (
    <div className="leave-balance-card">
      <div className="leave-balance-label">{balance.label}</div>
      <div className="leave-balance-numbers">
        <span className="leave-balance-remain">{balance.remaining}</span>
        <span className="leave-balance-total">/ {balance.total} days</span>
      </div>
      <div style={{ fontSize: 11, color: "var(--fg-3)" }}>{balance.used} used</div>
      <div className="leave-balance-bar-wrap">
        <div className="progress">
          <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

// ── Request Leave Modal ───────────────────────────────────────────────────────
function RequestLeaveModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ type: "annual", startDate: "", endDate: "", reason: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">📅 Request Leave</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <div className="input-wrap">
              <select value={form.type} onChange={set("type")}>
                {Object.entries(LEAVE_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid cols-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <div className="input-wrap"><input type="date" value={form.startDate} onChange={set("startDate")} /></div>
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <div className="input-wrap"><input type="date" value={form.endDate} onChange={set("endDate")} /></div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reason (optional)</label>
            <div className="input-wrap" style={{ alignItems: "flex-start", paddingTop: 6, paddingBottom: 6 }}>
              <textarea
                rows={3}
                style={{ border: "none", outline: "none", background: "transparent", fontFamily: "var(--font)", fontSize: 13, color: "var(--fg)", resize: "vertical", flex: 1 }}
                placeholder="Brief description of your leave reason…"
                value={form.reason}
                onChange={set("reason")}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={onClose}>Submit Request</button>
        </div>
      </div>
    </div>
  );
}

// ── LeaveManagement ───────────────────────────────────────────────────────────
interface LeaveManagementProps {
  data: { requests: LeaveRequest[]; balances: LeaveBalance[] } | null;
}

export function LeaveManagement({ data }: LeaveManagementProps) {
  const requests = data?.requests ?? DEMO_LEAVE_REQUESTS;
  const balances = data?.balances ?? DEMO_LEAVE_BALANCES;
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [showModal, setShowModal] = useState(false);

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const pending = requests.filter((r) => r.status === "pending").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Leave Management</div>
          <div className="page-subtitle">{pending} pending approval{pending !== 1 ? "s" : ""}</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Request Leave</button>
        </div>
      </div>

      <div className="content-area">
        {/* Balances */}
        <div className="grid cols-4">
          {balances.map((b) => <BalanceCard key={b.type} balance={b} />)}
        </div>

        {/* Requests table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Leave Requests</span>
            <div style={{ display: "flex", gap: 6 }}>
              {(["all", "pending", "approved", "rejected"] as const).map((s) => (
                <button key={s} className={`chip${filter === s ? " active" : ""}`} onClick={() => setFilter(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  {s === "pending" && pending > 0 && (
                    <span style={{ marginLeft: 4, background: "var(--red)", color: "#fff", borderRadius: 8, padding: "0 5px", fontSize: 10 }}>{pending}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body-flush">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">No {filter !== "all" ? filter : ""} leave requests</div>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Period</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{req.employeeName}</div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: LEAVE_COLORS[req.type] ?? "var(--fg-3)", flexShrink: 0 }} />
                          {LEAVE_TYPE_LABELS[req.type] ?? req.type}
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--fg-2)" }}>
                        {req.startDate} → {req.endDate}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{req.days}</span>
                        <span style={{ color: "var(--fg-3)", marginLeft: 2, fontSize: 11 }}>day{req.days !== 1 ? "s" : ""}</span>
                      </td>
                      <td style={{ color: "var(--fg-2)", fontSize: 12, maxWidth: 160 }}>
                        {req.reason ?? "—"}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[req.status] ?? "badge-neutral"}`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {req.status === "pending" && (
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="btn btn-sm" style={{ background: "var(--green-bg)", color: "var(--green)", border: "none" }}>✓</button>
                            <button className="btn btn-danger btn-sm">✕</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && <RequestLeaveModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
