import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { EmployeeDirectory } from "./components/EmployeeDirectory";
import { LeaveManagement } from "./components/LeaveManagement";
import { OrgChart } from "./components/OrgChart";
import { Attendance } from "./components/Attendance";
import type { View, ToolPayload } from "./types";

// ── MCP App lifecycle bridge ──────────────────────────────────────────────────
// We instantiate the App class from ext-apps and bridge its callbacks into
// React state. All handlers must be registered BEFORE app.connect() is called.

function useHrAppBridge() {
  const [payload, setPayload] = useState<ToolPayload | null>(null);
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");
  const connected = useRef(false);

  useEffect(() => {
    if (connected.current) return;
    connected.current = true;

    // Dynamic import keeps ext-apps out of the SSR/test bundle if needed.
    import("@modelcontextprotocol/ext-apps").then(({ App }) => {
      const app = new App({ name: "HR MCP App", version: "1.0.0" });

      // Register all handlers BEFORE connect()
      app.ontoolinput = () => {};

      app.ontoolresult = (result: Record<string, unknown>) => {
        const meta = result._meta as ToolPayload | undefined;
        if (meta?.view) setPayload(meta);
      };

      app.onhostcontextchanged = (ctx: Record<string, unknown>) => {
        const scheme = ctx?.colorScheme as string | undefined;
        if (scheme === "dark" || scheme === "light") setColorScheme(scheme);
      };

      app.onteardown = async () => ({});

      app.connect();
    }).catch(() => {
      // Running outside an MCP host (dev mode) — demo data shown by components.
    });
  }, []);

  return { payload, colorScheme };
}

// ── Root component ────────────────────────────────────────────────────────────
function HrApp() {
  const { payload, colorScheme } = useHrAppBridge();
  const [activeView, setActiveView] = useState<View>("dashboard");

  // When the MCP host triggers a tool, switch to the view it specifies.
  useEffect(() => {
    if (payload?.view) setActiveView(payload.view);
  }, [payload]);

  const data = (payload?.view === activeView ? payload.data : null) ?? null;

  return (
    <div className="app-root" data-color-scheme={colorScheme}>
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="main-content">
        {activeView === "dashboard"  && <Dashboard  data={data as any} />}
        {activeView === "employees"  && <EmployeeDirectory data={data as any} />}
        {activeView === "leave"      && <LeaveManagement  data={data as any} />}
        {activeView === "orgchart"   && <OrgChart         data={data as any} />}
        {activeView === "attendance" && <Attendance       data={data as any} />}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<HrApp />);
