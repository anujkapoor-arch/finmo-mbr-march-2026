// ============================================================
// DASHBOARD TEMPLATE - Finmo Pulse
// ============================================================
// Copy this file to a new name (e.g. MyDashboard.tsx), then:
// 1. Rename the default export function at the bottom
// 2. Fill in the data variables inside each tab function
// 3. Register the route in App.tsx
// 4. Add the card to MasterIndex.tsx
//
// See DASHBOARD_RUNBOOK.md for full instructions.
// ============================================================

import { useState } from "react";
import { useAuth } from "./components/AuthGuard";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer,
  // PieChart, Pie imports kept commented for pie-chart usage in derived dashboards
} from "recharts";

// ============================================================
// COLOR PALETTE
// ============================================================
const BLUE = "#3B82F6";
const GREEN = "#10B981";
const AMBER = "#F59E0B";
const CYAN = "#06B6D4";
const SLATE = "#64748B";
// RED and PINK are available in the palette for derived dashboards; add here when used.

// ============================================================
// HUBSPOT URL HELPERS
// ============================================================
// Base URL - portal ID 20889024 is the Finmo HubSpot portal
const HS = "https://app-na2.hubspot.com/contacts/20889024/record";
// Build contact links with: `${HS}/0-1/${contactId}`
// Build deal links with:    `${HS}/0-3/${dealId}`

// ============================================================
// HELPER COMPONENTS
// ============================================================

// KPI card - used in the top row of every tab for headline metrics
function MetricCard({ label, value, sub, trend, color = "blue" }: {
  label: string; value: string | number; sub?: string;
  trend?: { val: number; label: string }; color?: string;
}) {
  const borders: Record<string, string> = {
    blue: "border-l-blue-500", green: "border-l-emerald-500",
    amber: "border-l-amber-500", red: "border-l-red-500",
    purple: "border-l-violet-500", cyan: "border-l-cyan-500",
  };
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${borders[color] || borders.blue} p-4`}>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {trend && (
        <p className={`text-xs mt-1 font-medium ${trend.val >= 0 ? "text-emerald-600" : "text-red-600"}`}>
          {trend.val >= 0 ? "+" : ""}{trend.val}% {trend.label}
        </p>
      )}
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// Section wrapper - every content block goes inside one of these
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// Colored info/warning/success/danger callout box
function Callout({ type, children }: { type: "info" | "warning" | "success" | "danger"; children: React.ReactNode }) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    danger: "bg-red-50 border-red-200 text-red-800",
  };
  return <div className={`p-4 rounded-lg border text-sm ${styles[type]}`}>{children}</div>;
}

// Simple label:value row inside a stats list
function StatRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-blue-600" : "text-gray-900"}`}>{value}</span>
    </div>
  );
}

// Pill badge for categorical values (stage, status, region, etc.)
function Badge({ text, variant = "default" }: { text: string; variant?: "default" | "success" | "warning" | "danger" | "purple" }) {
  const styles = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    purple: "bg-violet-100 text-violet-700",
  };
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${styles[variant]}`}>{text}</span>;
}

// Rotating chevron for expandable rows
function Chevron({ open }: { open: boolean }) {
  return (
    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

// Hook for managing expand/collapse state on any set of keyed rows
function useExpandableRows() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (key: string) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });
  const isOpen = (key: string) => expanded.has(key);
  return { toggle, isOpen };
}

// Detail row that appears under an expanded parent row
function DetailPanel({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={99} className="p-0">
        <div className="bg-gray-50 border-t border-b border-gray-200 px-6 py-4 animate-[slideDown_0.15s_ease-out]">
          {children}
        </div>
      </td>
    </tr>
  );
}

// 4-column grid for key/value detail display inside DetailPanel
function DetailGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(i => (
        <div key={i.label}>
          <p className="text-[10px] text-gray-500 uppercase font-medium">{i.label}</p>
          <p className="text-sm font-semibold text-gray-800">{i.value}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SAMPLE TAB 1 - "Overview"
// Replace this pattern with your own data and sections
// ============================================================
function OverviewTab() {
  // Data for funnel visualization - replace with your data
  const funnelSteps = [
    { stage: "Top of Funnel", value: 1000, color: SLATE },
    { stage: "Contacted", value: 500, color: BLUE },
    { stage: "Engaged", value: 200, color: CYAN },
    { stage: "Qualified", value: 50, color: GREEN },
    { stage: "Won", value: 10, color: AMBER },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row - 5 headline metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Metric 1" value="1,000" trend={{ val: 10, label: "vs prior" }} color="blue" />
        <MetricCard label="Metric 2" value="500" sub="sub caption" color="green" />
        <MetricCard label="Metric 3" value="200" sub="sub caption" color="purple" />
        <MetricCard label="Metric 4" value="50" sub="sub caption" color="amber" />
        <MetricCard label="Metric 5" value="10" sub="sub caption" color="red" />
      </div>

      {/* Funnel section */}
      <Section title="Funnel" subtitle="Top-of-funnel to won">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={funnelSteps} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelSteps.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1">
            <Callout type="info">
              <strong>Example callout.</strong> Use this to summarize the section or highlight an insight.
            </Callout>
          </div>
        </div>
      </Section>

      {/* Two side-by-side stat sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Left Section" subtitle="subtitle">
          <StatRow label="Stat 1" value="123" />
          <StatRow label="Stat 2" value="456" highlight />
          <StatRow label="Stat 3" value="789" />
        </Section>
        <Section title="Right Section" subtitle="subtitle">
          <StatRow label="Stat 1" value="123" />
          <StatRow label="Stat 2" value="456" />
          <StatRow label="Stat 3" value="789" highlight />
        </Section>
      </div>
    </div>
  );
}

// ============================================================
// SAMPLE TAB 2 - "Details with Expandable Rows"
// Demonstrates the click-to-expand table pattern
// ============================================================
function DetailsTab() {
  const { toggle, isOpen } = useExpandableRows();

  // Sample data - each row is clickable
  const rows = [
    { id: "1", co: "Company A", hsId: "123456789", stage: "Qualified", owner: "Harini", value: "$10K", note: "Extra context goes here when expanded" },
    { id: "2", co: "Company B", hsId: "234567890", stage: "Discovery", owner: "Sukriti", value: "$25K", note: "Extra context for company B" },
    { id: "3", co: "Company C", hsId: "345678901", stage: "Won", owner: "Harini", value: "$50K", note: "Closed won details" },
  ];

  return (
    <div className="space-y-6">
      <Section title="Expandable Table" subtitle="Click any row for details">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="w-6 py-2 px-2"></th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Stage</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Owner</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <>
                  <tr key={r.id} onClick={() => toggle(r.id)} className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer">
                    <td className="py-2 px-2"><Chevron open={isOpen(r.id)} /></td>
                    <td className="py-2 px-3 font-medium">
                      <a
                        href={`${HS}/0-1/${r.hsId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-700 hover:underline"
                      >
                        {r.co} <span className="text-[10px] text-blue-400">&#8599;</span>
                      </a>
                    </td>
                    <td className="py-2 px-3">
                      <Badge text={r.stage} variant={r.stage === "Won" ? "success" : r.stage === "Qualified" ? "warning" : "default"} />
                    </td>
                    <td className="py-2 px-3 text-xs">{r.owner}</td>
                    <td className="text-right py-2 px-3 font-bold">{r.value}</td>
                  </tr>
                  {isOpen(r.id) && (
                    <DetailPanel key={`${r.id}-detail`}>
                      <DetailGrid items={[
                        { label: "Owner", value: r.owner },
                        { label: "Stage", value: r.stage },
                        { label: "Value", value: r.value },
                        { label: "HubSpot ID", value: r.hsId },
                      ]} />
                      <p className="mt-2 text-sm text-gray-700 italic">{r.note}</p>
                    </DetailPanel>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Clickable card pattern - expand list on click */}
      <Section title="Clickable Cards" subtitle="Click a card to expand its lead list">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
          <div onClick={() => toggle("card-1")} className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center cursor-pointer hover:shadow-md transition-shadow">
            <p className="text-xs text-emerald-600 font-medium">Category A</p>
            <p className="text-xl font-bold text-emerald-900">12</p>
            <p className="text-[10px] text-gray-400 mt-1">Click to expand</p>
          </div>
          <div onClick={() => toggle("card-2")} className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center cursor-pointer hover:shadow-md transition-shadow">
            <p className="text-xs text-blue-600 font-medium">Category B</p>
            <p className="text-xl font-bold text-blue-900">18</p>
            <p className="text-[10px] text-gray-400 mt-1">Click to expand</p>
          </div>
          <div onClick={() => toggle("card-3")} className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center cursor-pointer hover:shadow-md transition-shadow">
            <p className="text-xs text-amber-600 font-medium">Category C</p>
            <p className="text-xl font-bold text-amber-900">8</p>
            <p className="text-[10px] text-gray-400 mt-1">Click to expand</p>
          </div>
        </div>

        {isOpen("card-1") && (
          <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 mb-3">
            <p className="text-xs font-bold text-emerald-700 uppercase mb-2">Category A - Details</p>
            <p className="text-xs text-gray-600">Put your data table or content here.</p>
          </div>
        )}
        {isOpen("card-2") && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-3">
            <p className="text-xs font-bold text-blue-700 uppercase mb-2">Category B - Details</p>
            <p className="text-xs text-gray-600">Put your data table or content here.</p>
          </div>
        )}
        {isOpen("card-3") && (
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 mb-3">
            <p className="text-xs font-bold text-amber-700 uppercase mb-2">Category C - Details</p>
            <p className="text-xs text-gray-600">Put your data table or content here.</p>
          </div>
        )}
      </Section>
    </div>
  );
}

// ============================================================
// SAMPLE TAB 3 - "Placeholder"
// Use this pattern when a tab's data is not yet available
// ============================================================
function PlaceholderTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Data Not Yet Available</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Describe what this section will show once data is wired up.
        </p>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {["Placeholder A", "Placeholder B", "Placeholder C", "Placeholder D"].map((s) => (
            <div key={s} className="bg-gray-50 rounded-lg p-3 border border-dashed border-gray-300">
              <p className="text-xs text-gray-400 font-medium">{s}</p>
              <p className="text-lg font-bold text-gray-300">--</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN DASHBOARD - rename this function to match your filename
// ============================================================
export default function DashboardTemplate() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  // Tab labels - rename to match your domain
  const tabs = ["Overview", "Details", "Placeholder"];
  // Tab active colors - one per tab. Standard: blue / emerald / violet
  const tabActiveStyles = [
    "bg-gray-50 text-blue-700 border-t-2 border-x border-blue-500 border-gray-200 -mb-px",
    "bg-gray-50 text-emerald-700 border-t-2 border-x border-emerald-500 border-gray-200 -mb-px",
    "bg-gray-50 text-violet-700 border-t-2 border-x border-violet-500 border-gray-200 -mb-px",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              {/* Back link to master index */}
              <Link to="/" className="text-gray-400 hover:text-gray-600 transition-colors" title="Back to Dashboards">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Title</h1>
                <p className="text-sm text-gray-500">Period / Subtitle</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">Generated: DATE</span>
              <button onClick={logout} className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition">Logout</button>
            </div>
          </div>
          {/* Tab buttons */}
          <div className="flex gap-1">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                  activeTab === i ? tabActiveStyles[i] : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 0 && <OverviewTab />}
        {activeTab === 1 && <DetailsTab />}
        {activeTab === 2 && <PlaceholderTab />}
      </div>
    </div>
  );
}
