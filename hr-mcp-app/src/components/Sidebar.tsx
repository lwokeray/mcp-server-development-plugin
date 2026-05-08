import React from "react";
import type { View } from "../types";

interface NavItem {
  id: View;
  label: string;
  icon: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",  label: "Dashboard",     icon: "📊" },
  { id: "employees",  label: "Employees",     icon: "👥" },
  { id: "leave",      label: "Leave",         icon: "📅", badge: 3 },
  { id: "orgchart",   label: "Org Chart",     icon: "🏢" },
  { id: "attendance", label: "Attendance",    icon: "⏱️" },
];

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏢</div>
          <span>HR Portal</span>
        </div>
        <div className="sidebar-sub">Microsoft 365</div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item${activeView === item.id ? " active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge != null && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </button>
        ))}

        <div className="nav-section-label" style={{ marginTop: 12 }}>System</div>
        {[
          { icon: "⚙️", label: "Settings" },
          { icon: "❓", label: "Help" },
        ].map((item) => (
          <button key={item.label} className="nav-item" onClick={() => {}}>
            <span className="nav-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        M365 HR · v1.0.0
      </div>
    </nav>
  );
}
