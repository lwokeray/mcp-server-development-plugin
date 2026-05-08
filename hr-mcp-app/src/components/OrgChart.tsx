import React, { useState } from "react";
import type { OrgNode } from "../types";
import { DEMO_ORG_CHART } from "../../demoData";

const DEPT_COLORS: Record<string, string> = {
  Executive:       "#0078d4", Engineering: "#107c10", Technology: "#038387",
  "Human Resources": "#8764b8", Product: "#ca5010", Design: "#c19c00",
  Finance: "#605e5c", Marketing: "#d13438", Sales: "#00b7c3", Support: "#4a154b",
};

function deptColor(dept?: string): string {
  return DEPT_COLORS[dept ?? ""] ?? "#a19f9d";
}

// ── Recursive OrgNode tree ────────────────────────────────────────────────────
function NodeTree({
  node, isRoot = false, depth = 0,
}: { node: OrgNode; isRoot?: boolean; depth?: number }) {
  const [collapsed, setCollapsed] = useState(depth >= 2);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const color = deptColor(node.department);

  return (
    <div className="org-node-wrap">
      {/* Node box */}
      <div
        className={`org-node${isRoot ? " root" : ""}`}
        style={{ borderColor: isRoot ? color : undefined }}
        onClick={() => hasChildren && setCollapsed((c) => !c)}
        title={hasChildren ? (collapsed ? "Click to expand" : "Click to collapse") : undefined}
      >
        <div
          style={{
            width: 28, height: 28, borderRadius: "50%",
            background: color, display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}
        >
          {node.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
        </div>
        <div className="org-node-name">{node.name}</div>
        <div className="org-node-title">{node.title}</div>
        {node.department && (
          <div style={{ fontSize: 9, color: color, fontWeight: 600 }}>{node.department}</div>
        )}
        {hasChildren && (
          <div style={{ fontSize: 10, color: "var(--fg-3)" }}>
            {collapsed ? `▸ ${node.children!.length}` : "▾"}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <>
          <div className="org-connector-v" />
          <div style={{ position: "relative" }}>
            {/* Horizontal connector line */}
            {node.children!.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "calc(50% / " + node.children!.length + ")",
                  right: "calc(50% / " + node.children!.length + ")",
                  height: 1.5,
                  background: "var(--border)",
                }}
              />
            )}
            <div className="org-children-row">
              {node.children!.map((child) => (
                <NodeTree key={child.id} node={child} depth={depth + 1} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {Object.entries(DEPT_COLORS).map(([dept, color]) => (
        <div key={dept} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
          <span style={{ color: "var(--fg-2)" }}>{dept}</span>
        </div>
      ))}
    </div>
  );
}

// ── Search highlight ──────────────────────────────────────────────────────────
function findNodes(node: OrgNode, q: string): string[] {
  const ids: string[] = [];
  if (q && (node.name.toLowerCase().includes(q) || node.title.toLowerCase().includes(q))) {
    ids.push(node.id);
  }
  for (const child of node.children ?? []) ids.push(...findNodes(child, q));
  return ids;
}

// ── OrgChart ──────────────────────────────────────────────────────────────────
interface OrgChartProps { data: OrgNode | null }

export function OrgChart({ data }: OrgChartProps) {
  const root = data ?? DEMO_ORG_CHART;
  const [search, setSearch] = useState("");

  const matchIds = search.length > 1 ? findNodes(root, search.toLowerCase()) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="page-header">
        <div>
          <div className="page-title">Organization Chart</div>
          <div className="page-subtitle">Reporting structure · click nodes to expand/collapse</div>
        </div>
        <div className="page-actions">
          <div className="input-wrap" style={{ minWidth: 200 }}>
            <span className="input-icon">🔍</span>
            <input
              placeholder="Find person…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Search results banner */}
      {matchIds.length > 0 && (
        <div style={{
          background: "var(--brand-bg)", borderBottom: "1px solid var(--brand-light)",
          padding: "8px 24px", fontSize: 12, color: "var(--brand)", fontWeight: 500,
        }}>
          Found {matchIds.length} match{matchIds.length !== 1 ? "es" : ""} for "{search}"
        </div>
      )}
      {search.length > 1 && matchIds.length === 0 && (
        <div style={{
          background: "var(--red-bg)", borderBottom: "1px solid var(--red)",
          padding: "8px 24px", fontSize: 12, color: "var(--red)",
        }}>
          No results for "{search}"
        </div>
      )}

      {/* Legend */}
      <div style={{ padding: "12px 24px 0", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
        <Legend />
      </div>

      {/* Tree */}
      <div style={{ flex: 1, overflow: "auto", padding: "32px 24px" }}>
        <div style={{ display: "inline-block", minWidth: "100%" }}>
          <NodeTree node={root} isRoot depth={0} />
        </div>
      </div>
    </div>
  );
}
