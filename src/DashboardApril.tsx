import { useState } from "react";
import { useAuth } from "./components/AuthGuard";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

// ============================================================
// COLOR PALETTE
// ============================================================
const BLUE = "#3B82F6";
const GREEN = "#10B981";
const AMBER = "#F59E0B";
const PINK = "#EC4899";

// ============================================================
// HELPER COMPONENTS (mirrored from March Dashboard.tsx)
// ============================================================
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

function Callout({ type, children }: { type: "info" | "warning" | "success" | "danger"; children: React.ReactNode }) {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    danger: "bg-red-50 border-red-200 text-red-800",
  };
  return <div className={`p-4 rounded-lg border text-sm ${styles[type]}`}>{children}</div>;
}

function StatRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-blue-600" : "text-gray-900"}`}>{value}</span>
    </div>
  );
}

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

function Chevron({ open }: { open: boolean }) {
  return (
    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function useExpandableRows() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (key: string) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  const isOpen = (key: string) => expanded.has(key);
  return { toggle, isOpen };
}

function DetailPanel({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={99} className="p-0">
        <div className="bg-gray-50 border-t border-b border-gray-200 px-6 py-4">
          {children}
        </div>
      </td>
    </tr>
  );
}

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
// OUTBOUND SALES (April 2026)
// Sources: SmartReach screenshots (full month), calls_april.json
// ============================================================
function OutboundSalesApril() {
  // SmartReach LinkedIn pie (Apr)
  const linkedInPie = [
    { name: "Profile Visits", value: 966, color: BLUE },
    { name: "Connection Requests", value: 581, color: GREEN },
    { name: "Messages", value: 289, color: PINK },
  ];

  // Daily call dials Apr 1-30 (from calls_april.json)
  const dailyCalls = [
    { d: "Apr 1", dials: 60, ans: 26 },
    { d: "Apr 2", dials: 69, ans: 18 },
    { d: "Apr 6", dials: 86, ans: 29 },
    { d: "Apr 7", dials: 78, ans: 31 },
    { d: "Apr 8", dials: 70, ans: 22 },
    { d: "Apr 9", dials: 50, ans: 14 },
    { d: "Apr 10", dials: 76, ans: 25 },
    { d: "Apr 13", dials: 57, ans: 18 },
    { d: "Apr 14", dials: 53, ans: 17 },
    { d: "Apr 15", dials: 62, ans: 23 },
    { d: "Apr 16", dials: 51, ans: 21 },
    { d: "Apr 17", dials: 39, ans: 23 },
    { d: "Apr 19", dials: 5, ans: 0 },
    { d: "Apr 20", dials: 66, ans: 26 },
    { d: "Apr 21", dials: 38, ans: 20 },
    { d: "Apr 22", dials: 36, ans: 14 },
    { d: "Apr 23", dials: 33, ans: 20 },
    { d: "Apr 24", dials: 31, ans: 16 },
    { d: "Apr 27", dials: 111, ans: 48 },
    { d: "Apr 28", dials: 103, ans: 33 },
    { d: "Apr 29", dials: 95, ans: 44 },
    { d: "Apr 30", dials: 9, ans: 4 },
  ];

  // LinkedIn engagement by sender (SmartReach)
  const liByUser = [
    { user: "Sukriti Chopra", touchpoints: 1036 },
    { user: "Harini K", touchpoints: 350 },
    { user: "Anuj Kapoor", touchpoints: 114 },
    { user: "Michelle Ling", touchpoints: 96 },
    { user: "Gibson Saw", touchpoints: 86 },
    { user: "Nouvelle Nye", touchpoints: 79 },
    { user: "Elross Pangue", touchpoints: 75 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Prospects Contacted" value="854" trend={{ val: -24, label: "vs March" }} color="blue" />
        <MetricCard label="Emails Sent" value="1,692" sub="773 prospects, 4,193 in funnel" color="blue" />
        <MetricCard label="LinkedIn Actions" value="1,836" sub="75 unique prospects" color="purple" />
        <MetricCard label="Total Calls" value="1,278" sub="251 Twilio + 1,027 Exotel" color="green" />
        <MetricCard label="Prospect Replies" value="8" sub="1 positive · 6 negative · 1 follow-up" color="amber" />
      </div>

      {/* Email Performance */}
      <Section title="Email Performance" subtitle="SmartReach campaigns - April 2026 (full month)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500">Prospects Contacted</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">773</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
            <p className="text-xs text-emerald-600">Open Rate</p>
            <p className="text-3xl font-bold text-emerald-700 mt-1">64%</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-xs text-amber-600">Reply Rate</p>
            <p className="text-3xl font-bold text-amber-700 mt-1">2%</p>
            <p className="text-[10px] text-amber-500">1% positive</p>
          </div>
        </div>
      </Section>

      <Section title="LinkedIn Performance" subtitle="SmartReach LinkedIn automation - April 2026">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <StatRow label="Prospects Contacted" value="75" highlight />
            <StatRow label="Total Actions Sent" value="1,836" />
            <StatRow label="Profile Visits" value="966" />
            <StatRow label="Connection Requests" value="581" />
            <StatRow label="Messages Sent" value="289" />
            <StatRow label="Acceptance Rate" value="26%" highlight />
            <StatRow label="Reply Rate" value="22%" highlight />
          </div>
          <div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={linkedInPie} cx="50%" cy="50%" outerRadius={90} innerRadius={45} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {linkedInPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <Callout type="success">
          <strong>LinkedIn step-change vs March:</strong> connection acceptance up from 19% → 26% (+7pp) and reply rate up from 6% → 22% (+16pp), despite contacting fewer prospects (75 vs 336). Tighter targeting is paying off - the channel is doing more work per send.
        </Callout>
      </Section>

      <Section title="LinkedIn Engagement by Sender" subtitle="SmartReach manual + automated touchpoints in April">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Sender</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Engagement Touchpoints</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Bar</th>
              </tr>
            </thead>
            <tbody>
              {liByUser.map((u) => (
                <tr key={u.user} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">{u.user}</td>
                  <td className="text-right py-2 px-3 font-bold">{u.touchpoints}</td>
                  <td className="py-2 px-3">
                    <div className="h-3 bg-blue-500 rounded-full" style={{ width: `${(u.touchpoints / 1036) * 240}px` }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">Sukriti drove ~58% of all LinkedIn touchpoints. SDR-led volume continues to dwarf AE-led volume on LinkedIn.</p>
      </Section>

      {/* Cold Calling */}
      <Section title="Cold Calling - By Region" subtitle="Twilio + Exotel, April 1-30 (full month)">
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Region</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Dials</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Answered</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Pickup %</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Conv &gt;30s</th>
              </tr>
            </thead>
            <tbody>
              {[
                { r: "Singapore", dials: 698, ans: 246, pct: 35, c30: 84 },
                { r: "Other", dials: 201, ans: 68, pct: 34, c30: 20 },
                { r: "Malaysia", dials: 175, ans: 78, pct: 45, c30: 24 },
                { r: "Australia", dials: 101, ans: 66, pct: 65, c30: 19 },
                { r: "Indonesia", dials: 33, ans: 10, pct: 30, c30: 2 },
                { r: "Philippines", dials: 22, ans: 7, pct: 32, c30: 1 },
                { r: "UK", dials: 21, ans: 6, pct: 29, c30: 1 },
                { r: "Vietnam", dials: 15, ans: 7, pct: 47, c30: 2 },
                { r: "South Africa", dials: 12, ans: 4, pct: 33, c30: 2 },
              ].map((r) => (
                <tr key={r.r} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{r.r}</td>
                  <td className="text-right py-3 px-4">{r.dials}</td>
                  <td className="text-right py-3 px-4">{r.ans}</td>
                  <td className="text-right py-3 px-4">
                    <span className={`font-bold ${r.pct >= 50 ? "text-emerald-600" : r.pct >= 35 ? "text-blue-600" : "text-amber-600"}`}>{r.pct}%</span>
                  </td>
                  <td className="text-right py-3 px-4">{r.c30}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="py-3 px-4">Total</td>
                <td className="text-right py-3 px-4">1,278</td>
                <td className="text-right py-3 px-4">492</td>
                <td className="text-right py-3 px-4">38.5%</td>
                <td className="text-right py-3 px-4">155</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-xs text-blue-600 font-medium uppercase">Conversations &gt;30s</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">155</p>
            <p className="text-xs text-blue-500">12.1% of all dials</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
            <p className="text-xs text-emerald-600 font-medium uppercase">Conversations &gt;2 min</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">27</p>
            <p className="text-xs text-emerald-500">Meaningful discovery calls</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
            <p className="text-xs text-amber-600 font-medium uppercase">Volume Surge</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">309 / 3d</p>
            <p className="text-xs text-amber-500">Apr 27-29 = 24% of monthly dials</p>
          </div>
        </div>
      </Section>

      <Section title="Top Conversations (>30s) - April" subtitle="Whisper-transcribed and classified via OpenAI. Top 12 longest substantive conversations. Phone number links to a HubSpot contact lookup.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Date</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">SDR</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Contact / Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Region</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Duration</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Classification</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Transcript Summary</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: "Apr 27", sdr: "Harini", co: "MDHR Legacy", contact: "Muhammad Danial Haikal Rosazri", region: "MY", dur: "7m26s", cls: "interested", clsV: "success" as const, phone: "+60197744892", excerpt: "Inbound signup. Dairy / lower-cholesterol milk products, owner-operator. Cross-border to ID/TH/KH and expanding to India. Curious on pricing. Booked AE follow-up with Adlin." },
                { date: "Apr 30", sdr: "Sukriti", co: "1982 VC 2026 SPV I", contact: "Scott Krivokopich", region: "SG", dur: "6m37s", cls: "interested", clsV: "success" as const, phone: "+6581570517", excerpt: "VC SPV that signed up on Finmo + submitted KYB. Sukriti walked through positioning. Two follow-up meetings booked May 4 + May 7 with Gibson on dashboard walkthrough." },
                { date: "Apr 27", sdr: "Harini", co: "(receptionist for Saima)", contact: "—", region: "Other", dur: "3m17s", cls: "substantive", clsV: "purple" as const, phone: "+971524465701", excerpt: "Reached gatekeeper. Pitched focus group framing. Receptionist took message and email. UAE number, mid-market context." },
                { date: "Apr 23", sdr: "Harini", co: "Colorfull Store", contact: "Sophia Ho", region: "SG", dur: "2m05s", cls: "busy_callback", clsV: "warning" as const, phone: "+6592382032", excerpt: "Returned the call after Sophia asked for a callback. Focus group pitch landed. SG agency, willing to engage further." },
                { date: "Apr 23", sdr: "Harini", co: "Australian Gold Capital", contact: "Michael Kukulka", region: "AU", dur: "1m49s", cls: "interested", clsV: "success" as const, phone: "+61416422364", excerpt: "Scheduled meeting kickoff. Precious metals bullion. Wants payments platform + Reckon integration. Mostly AUD with one SG corridor. AE = Justin." },
                { date: "Apr 24", sdr: "Harini", co: "PRCA Global", contact: "Ed Burleigh", region: "SG", dur: "1m40s", cls: "send_email", clsV: "default" as const, phone: "+6587524752", excerpt: "Public-relations consultancy. Polite ask to send email rather than take call - flagged for follow-up nurture." },
                { date: "Apr 23", sdr: "Harini", co: "(unknown)", contact: "Tan", region: "SG", dur: "1m31s", cls: "substantive", clsV: "purple" as const, phone: "+6580440260", excerpt: "Focus-group framing for mid-size APAC agencies. Tan engaged briefly, asked what it's regarding. Initial discovery." },
                { date: "Apr 27", sdr: "Harini", co: "The DFRNT Agency", contact: "Sharlyn Seet", region: "SG", dur: "1m21s", cls: "substantive", clsV: "purple" as const, phone: "+6598787129", excerpt: "SG creative agency. Listened to the focus-group framing for 1 minute. Did not commit." },
                { date: "Apr 29", sdr: "Harini", co: "MyagenC", contact: "Norah Zhang", region: "SG", dur: "1m20s", cls: "substantive", clsV: "purple" as const, phone: "+6583281817", excerpt: "Focus group pitch delivered. Brief Q&A on what Finmo does." },
                { date: "Apr 29", sdr: "Harini", co: "NEIV", contact: "Sidharth Bhadani", region: "SG", dur: "1m17s", cls: "substantive", clsV: "purple" as const, phone: "+6598741972", excerpt: "Asked 'what is this about'. Sat through 1 minute of pitch. No commitment." },
                { date: "Apr 29", sdr: "Harini", co: "Creo Farm", contact: "Kang Shiqiang", region: "SG", dur: "1m16s", cls: "interested", clsV: "success" as const, phone: "+6598386290", excerpt: "Asked why we called. Sat through pitch. Showed mild interest, will follow up via LinkedIn." },
                { date: "Apr 29", sdr: "Harini", co: "Trampolene", contact: "Tan Francis", region: "SG", dur: "1m08s", cls: "substantive", clsV: "purple" as const, phone: "+6582227206", excerpt: "Focus group pitch delivered to Tom Francis. Conversational, brief." },
              ].map((c, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 text-xs whitespace-nowrap">{c.date}</td>
                  <td className="py-2 px-3 text-xs">{c.sdr}</td>
                  <td className="py-2 px-3">
                    <a href={`https://app-na2.hubspot.com/contacts/20889024/objects/0-1/views/all/list?query=${encodeURIComponent(c.phone)}`}
                       target="_blank" rel="noopener noreferrer"
                       className="text-blue-700 hover:underline font-medium text-xs">
                      {c.contact} <span className="text-[10px] text-blue-400">↗</span>
                    </a>
                    <p className="text-[10px] text-gray-500">{c.co}</p>
                  </td>
                  <td className="py-2 px-3"><Badge text={c.region} variant={c.region === "AU" ? "warning" : c.region === "SG" ? "success" : "default"} /></td>
                  <td className="text-right py-2 px-3 font-mono text-xs">{c.dur}</td>
                  <td className="py-2 px-3"><Badge text={c.cls} variant={c.clsV} /></td>
                  <td className="py-2 px-3 text-xs text-gray-600 max-w-md">{c.excerpt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3 italic">Source: Whisper-transcribed recordings in <code>weekly_dashboard/data/recordings_apr23/</code> and <code>recordings_apr30_may06/</code>. Full classifications in <code>calls_apr23.json</code> / <code>calls_apr30_may06.json</code>. Earlier April conversations are summarized in <code>APRIL_2_15_CALL_ANALYSIS.md</code> and <code>APRIL_16_22_CALL_ANALYSIS.md</code>.</p>
      </Section>

      <Section title="Daily Dials + Pickup - April" subtitle="Calling volume jumped late in the month after Sukriti returned to full cadence">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dailyCalls}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="d" tick={{ fontSize: 10 }} interval={1} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="dials" fill={BLUE} name="Dials" />
            <Bar dataKey="ans" fill={GREEN} name="Answered" />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="By SDR - April" subtitle="From Twilio + Exotel call records (SDR attributed via from-number + HubSpot owner lookup)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">SDR</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Dials</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Answered</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Pickup %</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Conv &gt;30s</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 font-medium">Harini (Exotel)</td>
                <td className="text-right py-2 px-3">695</td>
                <td className="text-right py-2 px-3">295</td>
                <td className="text-right py-2 px-3 font-bold text-emerald-600">42%</td>
                <td className="text-right py-2 px-3">102</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 font-medium">Sukriti (Exotel)</td>
                <td className="text-right py-2 px-3">550</td>
                <td className="text-right py-2 px-3">189</td>
                <td className="text-right py-2 px-3 font-bold text-blue-600">34%</td>
                <td className="text-right py-2 px-3">50</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout type="info">
          <strong>SG region overshadows AU.</strong> 698 dials into SG (55% of all calls) vs 101 into AU. AU pickup is the strongest (65%) but volume is now intentionally low - the team has shifted focus away from AU agencies after the March ICP verdict.
        </Callout>
      </Section>

      {/* What Prospects Told Us (objection categories from Apr call analysis files) */}
      <Section title="What Prospects Told Us - April" subtitle="Top objection categories from transcribed call analysis (Apr 2-15 + Apr 16-22 reports)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-xs font-bold text-red-700 uppercase mb-1">Pain doesn't exist</p>
            <p className="text-3xl font-bold text-red-700 my-1">~12%</p>
            <p className="text-xs text-red-600">Small SG/MY merchants under 20 staff don't have treasury complexity. Same signal as March.</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-bold text-blue-700 uppercase mb-1">Already using competitor</p>
            <p className="text-3xl font-bold text-blue-700 my-1">~9%</p>
            <p className="text-xs text-blue-600">Airwallex + Wise dominate Asia mid-market. Pain exists but is already solved at this size.</p>
          </div>
        </div>
        <Callout type="warning">
          <strong>Top win of the month:</strong> Atypical Media (SG creative agency) booked a discovery call after a cold call → see <code>ATYPICAL_MEDIA_CALL_DEBRIEF.md</code>. Only 1 firm meeting from cold calling in April after dialing 1,278 numbers.
        </Callout>
      </Section>

      {/* Strategic Conclusion - SME Marketing Agencies (ported from BDWeeklyApr23_29) */}
      <Section title="Strategic Conclusion: Concluding Outbound to SME Marketing Agencies" subtitle="Cumulative outbound volume across Feb-Apr targeted at SME marketing agencies + adjacent small agencies has not produced ICP-fit conversion. Performance Marketing ads to the same ICP tell the same story. Time to pivot.">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total calls</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">2,000+</p>
            <p className="text-[11px] text-blue-500 mt-1">Feb-Apr cumulative (Twilio + Exotel)</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total emails</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">4,000+</p>
            <p className="text-[11px] text-blue-500 mt-1">SmartReach + follow-ups across periods</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total LinkedIn actions</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">5,000+</p>
            <p className="text-[11px] text-blue-500 mt-1">Profile visits + connection requests + messages</p>
          </div>
        </div>

        <Callout type="danger">
          <p className="font-bold mb-2 text-base">SMEs are not resonating with the cash-lite tools positioning.</p>
          <p className="text-sm">They don&apos;t have a reconciliation or cash-forecasting issue. They&apos;re happily running their own finances or using a part-time bookkeeper. <strong>Aspire / Airwallex is working fine for them.</strong> The "sell cash tools, upsell payments" motion is not converting - and not just for marketing agencies. Same pattern holds for any small agency.</p>
        </Callout>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 mb-5">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-bold text-gray-800 mb-2">BD Outbound (BD weekly reports, Feb-Apr)</h4>
            <ul className="text-xs text-gray-700 space-y-1.5">
              <li><strong>Apr 1-15:</strong> 754 prospects, 1,368 touchpoints, 601 calls, 58 conv {">"}30s, <strong>3 email replies (all negative)</strong>, 0% positive sentiment.</li>
              <li><strong>Apr 16-22:</strong> 378 prospects, 638 touchpoints, 233 calls, 28 conv {">"}30s, <strong>1 positive email reply (DataPull, exploratory call)</strong> + 2 negative.</li>
              <li><strong>Apr 23-29:</strong> 566 prospects, 1,028 touchpoints, 363 calls, 52 conv {">"}30s, <strong>0 positive replies</strong>, 7 verbatim "no time / no pain / pitch-back" quotes.</li>
              <li><strong>Cumulative:</strong> ~2,259 calls + ~4,000 emails + ~5,000 LinkedIn touches.</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-bold text-gray-800 mb-2">AI SDR Pilot (Mar 2026) - same conclusion</h4>
            <ul className="text-xs text-gray-700 space-y-1.5">
              <li>104 unique leads dialed, <strong>76 connected (73% pickup)</strong>, <strong>0 sessions booked</strong>.</li>
              <li>Verdict from the report: <em>"The pain is real but we&apos;re reaching the wrong people."</em></li>
              <li>Signals against the ICP: wrong persona (marketing / creative, not finance), no pain resonance, already solved (Xero / QBO), too small for pain (&lt;20-person agencies), role mismatch.</li>
              <li>Recommendation in March: shift to companies with 100+ employees, dedicated finance, multi-currency operations.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-5 mb-3">
          <h4 className="text-base font-bold text-emerald-900 mb-2">The Pivot</h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li><strong>Stop targeting SME small agencies for cash-tools-as-wedge.</strong> The motion is not converting and won&apos;t convert with more volume. Two independent functions (BD + Performance Marketing ads) reached the same conclusion against the same ICP.</li>
            <li><strong>For Treasury OS (TOS), target mid-market.</strong> That&apos;s where the meetings landed in 2025 (Feb-Mar 2026 best longest calls were in mid-market: Travel Action, Novara Partners, Atypical Media). 100+ employees, dedicated finance, multi-currency.</li>
            <li><strong>No vanilla TOS for "all industries".</strong> Pick an industry we deeply understand (e.g., <strong>travel</strong>) and build a custom product for that vertical. Generic positioning loses to incumbent fit.</li>
            <li><strong>Re-cut the next outbound batch.</strong> Lead Gen 3.0 (Apr 26 launch) already aligns - 76% MedTech + BPO, 60% in 100-999 employees. Hold this thesis: validate it with the next 6-8 weeks of conversion data, retire small-agency cohorts.</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 italic">Source data: <code>APRIL_2_15_CALL_ANALYSIS.md</code>, <code>APRIL_OUTREACH_REPORT.md</code>, <code>INBOUND_LEADS_APRIL_1_15_2026_ANALYSIS.md</code>, <code>CALL_ANALYSIS_REPORT.md</code> (Feb-Mar), <code>AI_SDR_PILOT_FINAL_REPORT.md</code>.</p>
      </Section>

      {/* ICP May Onwards - Lead Gen 3.0 launch (ported from BDWeeklyApr23_29) */}
      <Section title="ICP May Onwards (SG / AU / PH / Other)" subtitle="Launched Apr 26 - 101 prospects across 98 unique companies pushed to 6 SmartReach campaigns. Each prospect is in 2 campaigns simultaneously - 202 active assignments. AE-tier launched alongside SDR-tier, activating the multi-persona model.">
        <div className="mb-5 rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-base font-bold text-emerald-900">Multi-Persona Outreach - LIVE</h4>
            <Badge text="LAUNCHED APR 26" variant="success" />
          </div>
          <p className="text-sm text-gray-700 mb-4">
            <strong>Live now:</strong> every prospect is enrolled in 2 campaigns at the same time - the SDR sequence (Days 0-20) and the AE LinkedIn CR (Days 16-25), with founder push reserved for Days 28-42 on strategic / engaged-but-silent contacts.
            20 touchpoints across <strong>3 senders (SDR / AE / CEO)</strong> and <strong>3 channels (Email + LinkedIn + WhatsApp)</strong> over 35-42 days.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
            <div className="bg-white rounded-lg p-4 border border-blue-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
                  <p className="text-xs font-bold text-blue-700 uppercase">SDR (Days 0-20)</p>
                </div>
                <Badge text="101 leads" variant="default" />
              </div>
              <p className="text-xs text-gray-600 mb-2">Mix of discovery + selling. 4 emails: Pain Hypothesis, BAB, Referral / Right Person, Open Door. Plus LinkedIn CR + WhatsApp.</p>
              <p className="text-[11px] text-gray-500"><strong>Owners:</strong> Sukriti (52 prospects), Harini (49 prospects)</p>
              <p className="text-[11px] text-gray-500"><strong>Goal:</strong> qualify or disqualify based on response</p>
              <p className="text-[11px] text-gray-500 mt-1"><strong>Outcome paths:</strong></p>
              <ul className="text-[11px] text-gray-600 list-disc list-inside ml-1 space-y-0.5">
                <li><span className="text-emerald-700 font-semibold">Positive reply</span> - book call, hand to AE</li>
                <li><span className="text-red-700 font-semibold">Negative reply</span> - disqualify, nurture / DNC</li>
                <li><span className="text-amber-700 font-semibold">No response</span> - escalate to Tier 2</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-amber-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold">2</span>
                  <p className="text-xs font-bold text-amber-700 uppercase">AE (Days 16-25)</p>
                </div>
                <Badge text="101 leads" variant="warning" />
              </div>
              <p className="text-xs text-gray-600 mb-2">Mix of selling + discovery. 4 emails: PAS, Pattern Share, Relevant Question / 2 free tips, Up to You. Plus LinkedIn CR + WhatsApp.</p>
              <p className="text-[11px] text-gray-500"><strong>Owners:</strong> Michelle (28), Gibson (27), Nouvelle (23), Elross (23)</p>
              <p className="text-[11px] text-gray-500"><strong>Goal:</strong> build familiarity, earn first response with regional + industry nuance</p>
              <p className="text-[11px] text-gray-500 mt-1"><strong>Outcome paths:</strong></p>
              <ul className="text-[11px] text-gray-600 list-disc list-inside ml-1 space-y-0.5">
                <li><span className="text-emerald-700 font-semibold">Any response</span> - AE owns discovery</li>
                <li><span className="text-amber-700 font-semibold">Still no response</span> - Tier 3 eligibility</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-red-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold">3</span>
                  <p className="text-xs font-bold text-red-700 uppercase">CEO (Days 28-42)</p>
                </div>
                <Badge text="Strategic only" variant="danger" />
              </div>
              <p className="text-xs text-gray-600 mb-2">Personal founder voice. 2 emails: Personal reach-out, Value drop. Plus LinkedIn + WhatsApp.</p>
              <p className="text-[11px] text-gray-500"><strong>Eligibility:</strong> top-score companies + silent-but-engaging contacts (opens / clicks / profile views)</p>
              <p className="text-[11px] text-gray-500"><strong>Goal:</strong> remove exec-level blockers, peer-level CFO-to-founder framing</p>
              <p className="text-[11px] text-gray-500 mt-1"><strong>Outcome paths:</strong></p>
              <ul className="text-[11px] text-gray-600 list-disc list-inside ml-1 space-y-0.5">
                <li><span className="text-emerald-700 font-semibold">Response</span> - founder hands to AE</li>
                <li><span className="text-gray-700 font-semibold">No response</span> - mark closed-lost</li>
              </ul>
            </div>
          </div>
          <div className="mt-3 p-2 bg-emerald-100 rounded text-center">
            <p className="text-xs font-bold text-emerald-900">Lead Gen 3.0 launched Apr 26 - first AE / Founder-driven conversions expected in the May 5-15 window. Track acceptance + reply quality below.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Reach by Region</h4>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Philippines</td><td className="py-2 text-right font-bold">40</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Other (UK / EU / US / Nordics)</td><td className="py-2 text-right font-bold">38</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Australia</td><td className="py-2 text-right font-bold">19</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Singapore</td><td className="py-2 text-right font-bold">4</td></tr>
              </tbody>
            </table>
            <p className="text-[11px] text-gray-500 mt-3 italic">PH dominant - 40% - reflects the heavy BPO concentration. Top HQ countries: PH 19, AU 17, UK 14, SG 4, Sweden 3.</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Industry Mix</h4>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Medical / MedTech / Healthcare</td><td className="py-2 text-right"><Badge text="43 (43%)" variant="success" /></td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">BPO / Outsourcing / Offshore staffing</td><td className="py-2 text-right"><Badge text="33 (33%)" variant="success" /></td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Software / Tech consulting</td><td className="py-2 text-right">6</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Manufacturing</td><td className="py-2 text-right">5</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">E-commerce / Retail</td><td className="py-2 text-right">5</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Other (Food / Energy / Misc)</td><td className="py-2 text-right">9</td></tr>
              </tbody>
            </table>
            <p className="text-[11px] text-gray-500 mt-3 italic">Two ICP clusters dominate: <strong>MedTech distribution</strong> + <strong>BPO / offshore staffing</strong> = <strong>76%</strong> of the campaign.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Target Personas (101 contacts)</h4>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">CFO</td><td className="py-2 text-right"><Badge text="40" variant="success" /></td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Finance Director</td><td className="py-2 text-right"><Badge text="13" variant="success" /></td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Finance / Accounting Manager</td><td className="py-2 text-right">8</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Group / Global CFO</td><td className="py-2 text-right"><Badge text="7" variant="success" /></td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Controller</td><td className="py-2 text-right">7</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Head of Finance</td><td className="py-2 text-right"><Badge text="5" variant="success" /></td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">VP Finance</td><td className="py-2 text-right"><Badge text="4" variant="success" /></td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Other senior finance / treasury</td><td className="py-2 text-right">~17</td></tr>
              </tbody>
            </table>
            <p className="text-[11px] text-gray-500 mt-3 italic"><strong>74% of contacts are CFO-level</strong> (CFO / Finance Director / Group CFO / VP Finance / Head of Finance) - direct buyer or buyer-influencer. The other 26% (Controller, Manager, Specialist) serve as champion / pre-meeting prep.</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Multi-Currency Exposure (the core hook)</h4>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">USD</td><td className="py-2 text-right font-bold">41</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">AUD</td><td className="py-2 text-right font-bold">29</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">PHP</td><td className="py-2 text-right font-bold">24</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">EUR</td><td className="py-2 text-right">18</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">GBP</td><td className="py-2 text-right">18</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">SGD / NZD / INR / MYR / CNY</td><td className="py-2 text-right">10 / 8 / 8 / 7 / 6</td></tr>
              </tbody>
            </table>
            <p className="text-[11px] text-gray-500 mt-3 italic">Average prospect operates in <strong>3-4 currencies</strong> - the multi-currency treasury angle is real, not invented for personalization.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5">
          <h4 className="text-sm font-bold text-gray-800 mb-3">One-line Positioning</h4>
          <p className="text-sm text-gray-700 italic">
            Outreach to <strong>CFOs and senior finance leaders at 50-999-person mid-market firms</strong> - primarily in <strong>MedTech distribution and APAC BPO / staffing</strong> - that operate in 3-6 currencies and have outgrown bank + broker + spreadsheet treasury setups.
          </p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-start gap-2">
              <Badge text="Primary" variant="success" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Cross-Border Payments</p>
                <p className="text-[11px] text-gray-600">BPO payroll across PHP / ZAR / COP / VND. MedTech supplier payments across MYR / CNY / USD / EUR.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge text="Primary" variant="success" />
              <div>
                <p className="text-sm font-semibold text-gray-800">FX Management</p>
                <p className="text-[11px] text-gray-600">Revenue in USD / EUR / GBP vs AUD / PHP cost base. Margin protection on fixed-price contracts.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge text="Core" variant="purple" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Cash Forecasting / Treasury</p>
                <p className="text-[11px] text-gray-600">Multi-entity cash visibility, post-acquisition consolidation, treasury standup post-MBO / post-PE.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Outcomes so far - real conversations from Lead Gen 3.0 */}
        <div className="mt-5 rounded-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-base font-bold text-blue-900">Outcomes so far</h4>
            <Badge text="Early signal" variant="success" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg p-4 border border-emerald-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">1</span>
                <p className="text-sm font-bold text-gray-900">Growsari</p>
                <Badge text="PH" variant="success" />
              </div>
              <p className="text-[11px] text-gray-500 mb-2">Spoke briefly with Finance Controller</p>
              <p className="text-xs text-gray-700">Uses Oracle for accounting and different systems for payments. Nothing is centralised. Controller said they would prefer <strong>a single platform that consolidates everything</strong>.</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-emerald-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">2</span>
                <p className="text-sm font-bold text-gray-900">IRD Global</p>
                <Badge text="Non-profit" variant="default" />
              </div>
              <p className="text-[11px] text-gray-500 mb-2">Spoke to Finance Manager</p>
              <p className="text-xs text-gray-700">Not-for-profit. Uses QuickBooks for accounting with a <strong>12-person finance team</strong>. Process is fully manual.</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-red-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold">3</span>
                <p className="text-sm font-bold text-gray-900">QBtech</p>
                <Badge text="MedTech" variant="warning" />
              </div>
              <p className="text-[11px] text-gray-500 mb-2">Medical device manufacturer</p>
              <p className="text-xs text-gray-700">Already using <strong>Atlar</strong>. Competitive displacement play; not a green-field opportunity.</p>
            </div>
          </div>

          <Callout type="success">
            <strong>Growsari + IRD Global, alongside DLSP, point to a real opportunity in the mid-market segment</strong> - finance teams of 10+ people running on Oracle / QuickBooks with no consolidated payments + treasury layer. The pain is centralisation, not point-tool replacement.
          </Callout>
        </div>
      </Section>
    </div>
  );
}

// ============================================================
// INBOUND LEADS (April 2026)
// Sources: inbound_april.json (Zapier + HubSpot enrichment)
// Apr 1-30: 294 zap runs → 109 junk → 185 legit (183 unique)
// ============================================================
function InboundLeadsApril() {
  const funnel = [
    { stage: "Total zap runs", val: 294, color: "bg-gray-300" },
    { stage: "Junk / internal", val: 109, color: "bg-red-300" },
    { stage: "Legitimate signups", val: 185, color: "bg-emerald-400" },
    { stage: "Unique emails", val: 183, color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Total Zap Runs" value="294" sub="Apr 1-30" color="blue" />
        <MetricCard label="Legitimate Signups" value="185" sub="183 unique emails" trend={{ val: 203, label: "vs Mar (61)" }} color="green" />
        <MetricCard label="Junk / Internal" value="109" sub="37% (vs 78% in March)" color="amber" />
        <MetricCard label="Contacts With Deals" value="96" sub="52% of unique legit signups" color="purple" />
        <MetricCard label="Meetings Booked" value="56" sub="29 unique contacts" color="blue" />
      </div>

      <Section title="Signup Funnel - April">
        <div className="space-y-2">
          {funnel.map((s) => (
            <div key={s.stage} className="flex items-center gap-3">
              <div className="w-44 text-sm text-gray-600">{s.stage}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                <div className={`${s.color} h-full rounded-full transition-all`} style={{ width: `${(s.val / 294) * 100}%` }} />
                <span className="absolute inset-0 flex items-center justify-end pr-3 text-xs font-bold text-gray-800">{s.val}</span>
              </div>
            </div>
          ))}
        </div>
        <Callout type="success">
          <strong>3x increase in legitimate signups vs March (185 vs 61).</strong> Junk rate dropped from 78% to 37% - the Zapier filter is now catching more @finmo.net / Acidcomms test signups. Apr 1-15 ran at ~3 legit/day; the pace held through Apr 16-30.
        </Callout>
      </Section>

      <Section title="By Period - April Breakdown" subtitle="Weekly cohorts pulled from the rolling inbound reports">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Period</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Zap Runs</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Legitimate</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Personal</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Junk %</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100"><td className="py-2 px-3">Apr 1-15</td><td className="text-right py-2 px-3">92</td><td className="text-right py-2 px-3">49</td><td className="text-right py-2 px-3">36</td><td className="text-right py-2 px-3">13</td><td className="text-right py-2 px-3">47%</td></tr>
              <tr className="border-b border-gray-100"><td className="py-2 px-3">Apr 16-22</td><td className="text-right py-2 px-3">86</td><td className="text-right py-2 px-3">55</td><td className="text-right py-2 px-3">40</td><td className="text-right py-2 px-3">15</td><td className="text-right py-2 px-3">36%</td></tr>
              <tr className="border-b border-gray-100"><td className="py-2 px-3">Apr 23-30</td><td className="text-right py-2 px-3">116</td><td className="text-right py-2 px-3">81</td><td className="text-right py-2 px-3">69</td><td className="text-right py-2 px-3">10</td><td className="text-right py-2 px-3">30%</td></tr>
              <tr className="bg-gray-100 font-bold"><td className="py-2 px-3">April total</td><td className="text-right py-2 px-3">294</td><td className="text-right py-2 px-3">185</td><td className="text-right py-2 px-3">145</td><td className="text-right py-2 px-3">38</td><td className="text-right py-2 px-3">37%</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">Personal email signups still dominate (~70%). Most are individual exploratory signups from Malaysia, Indonesia, the Philippines.</p>
      </Section>

      <Section title="Top Countries - April" subtitle="From Zapier referral metadata">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Country</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Signups</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Quality</th>
              </tr>
            </thead>
            <tbody>
              {[
                { c: "Malaysia", n: 117, q: "Low (mostly personal emails)", v: "default" as const },
                { c: "Singapore", n: 22, q: "High", v: "success" as const },
                { c: "Australia", n: 22, q: "High", v: "success" as const },
                { c: "United States", n: 3, q: "Mixed", v: "warning" as const },
                { c: "United Kingdom", n: 3, q: "Mixed", v: "warning" as const },
                { c: "India", n: 2, q: "Low", v: "default" as const },
                { c: "France", n: 2, q: "Mixed", v: "warning" as const },
                { c: "Other (10 countries · 1 each)", n: 10, q: "Mixed", v: "warning" as const },
                { c: "Country not provided", n: 3, q: "Unknown", v: "default" as const },
              ].map((r) => (
                <tr key={r.c} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">{r.c}</td>
                  <td className="text-right py-2 px-3 font-bold">{r.n}</td>
                  <td className="py-2 px-3"><Badge text={r.q} variant={r.v} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Top Meetings Booked from Inbound" subtitle="31 meetings on calendar in April + 25 scheduled for May, all from April signups. Deal stage from HubSpot Sales pipeline (712777261) only.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Date</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Contact</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Deal Stage</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Owner</th>
              </tr>
            </thead>
            <tbody>
              {[
                { d: "Apr 2", contact: "Novax Novax", co: "Novax & Co.", cid: null, dealId: "320136364787", stage: "KYB", sv: "warning" as const, o: "Nouvelle" },
                { d: "Apr 8", contact: "Joanne Jitilon", co: "Omni HR", cid: null, dealId: null, stage: "No Sales deal", sv: "default" as const, o: "Justin" },
                { d: "Apr 13", contact: "Noor Ahmad Nawabi", co: "Fox Travel PTY LTD", cid: null, dealId: null, stage: "No Sales deal", sv: "default" as const, o: "Sukriti" },
                { d: "Apr 14", contact: "Laurent Bsalis", co: "Circular", cid: null, dealId: null, stage: "No Sales deal", sv: "default" as const, o: "Justin" },
                { d: "Apr 15", contact: "Angela Lin", co: "Novara Advisory Partners", cid: null, dealId: "320729427658", stage: "Contract/Commercial", sv: "success" as const, o: "Harini" },
                { d: "Apr 16", contact: "Ben Ong", co: "HeySara", cid: null, dealId: "321011271391", stage: "Qualified To Buy", sv: "success" as const, o: "Gibson" },
                { d: "Apr 17", contact: "Dustin Skinner", co: "Kadence", cid: null, dealId: "321011989236", stage: "Qualified To Buy", sv: "success" as const, o: "Gibson" },
                { d: "Apr 17", contact: "Jae uk Lee", co: "Baropass P/L", cid: null, dealId: "320839735005", stage: "Discovery Completed", sv: "warning" as const, o: "Michelle" },
                { d: "Apr 20", contact: "Avish Joseph", co: "STRATAGILE", cid: null, dealId: null, stage: "No Sales deal", sv: "default" as const, o: "Nouvelle" },
                { d: "Apr 22", contact: "Kenneth Yeow", co: "Aesir Ventures", cid: null, dealId: "322576469720", stage: "Live", sv: "success" as const, o: "Justin" },
                { d: "Apr 23", contact: "Michael Kukulka", co: "Australian Gold Capital", cid: null, dealId: "322786475754", stage: "Contract/Commercial", sv: "success" as const, o: "Harini" },
                { d: "Apr 28", contact: "Sunday Olanite", co: "Cyphalet, Inc.", cid: null, dealId: "321864282855", stage: "KYB", sv: "warning" as const, o: "Harini" },
                { d: "Apr 28", contact: "Sermpong Wongwiengchan", co: "9 PAY PTY LTD", cid: null, dealId: "323517575876", stage: "Contract/Commercial", sv: "success" as const, o: "Harini" },
                { d: "May 4", contact: "Scott Krivokopich", co: "1982 Ventures SPV", cid: null, dealId: "323357695696", stage: "Discovery Completed", sv: "warning" as const, o: "Sukriti" },
                { d: "May 7", contact: "Jejuan Sims", co: "Wells Fargo Private Trust", cid: null, dealId: "324170097383", stage: "Closed Lost", sv: "danger" as const, o: "Sukriti" },
                { d: "May 12", contact: "Tailored Experiences", co: "PICKNIC", cid: null, dealId: "324812515025", stage: "Discovery Completed", sv: "warning" as const, o: "Sukriti" },
                { d: "Apr (multi)", contact: "Lionel Tham", co: "Euge Holdings Pte Ltd", cid: null, dealId: "318929806066", stage: "Contract/Commercial", sv: "success" as const, o: "Harini" },
                { d: "Apr (multi)", contact: "Takashi Toyokawa", co: "Novara Advisory Partners", cid: null, dealId: "320729427658", stage: "Contract/Commercial", sv: "success" as const, o: "Harini" },
                { d: "Apr 27", contact: "Muhammad Danial Haikal R.", co: "MDHR Legacy", cid: null, dealId: "322694012640", stage: "Discovery Completed", sv: "warning" as const, o: "Adlin" },
                { d: "Apr (multi)", contact: "SHEN LULU", co: "ALTINO LOURENCO LIMITED", cid: null, dealId: "319637117669", stage: "Live", sv: "success" as const, o: "Michelle" },
                { d: "Apr 22", contact: "Mohamad Addouj", co: "Travel Action Pty Ltd", cid: null, dealId: "320696912582", stage: "Qualified To Buy", sv: "success" as const, o: "Harini" },
              ].map((r, i) => {
                const dealUrl = r.dealId ? `https://app-na2.hubspot.com/contacts/20889024/record/0-3/${r.dealId}` : null;
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 text-xs whitespace-nowrap">{r.d}</td>
                    <td className="py-2 px-3 font-medium text-xs">{r.contact}</td>
                    <td className="py-2 px-3 text-xs">
                      {dealUrl ? (
                        <a href={dealUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline font-medium">
                          {r.co} <span className="text-[10px] text-blue-400">↗</span>
                        </a>
                      ) : (
                        <span>{r.co}</span>
                      )}
                    </td>
                    <td className="py-2 px-3"><Badge text={r.stage} variant={r.sv} /></td>
                    <td className="py-2 px-3 text-xs">{r.o}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3 italic">Company name links to the HubSpot Sales-pipeline deal record. "No Sales deal" = contact exists in HubSpot but has no deal on pipeline 712777261. Source: <code>april_mbr_data/meetings_deal_stages.json</code>.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">14</p>
            <p className="text-xs text-blue-600">Owned by Harini (most active)</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">9</p>
            <p className="text-xs text-blue-600">Gibson - AE-led demos</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">6</p>
            <p className="text-xs text-blue-600">Sukriti</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">6</p>
            <p className="text-xs text-blue-600">Michelle / Nouvelle / Justin / Yan Ling (combined)</p>
          </div>
        </div>
      </Section>

    </div>
  );
}

// ============================================================
// SOLUTIONS (April 2026)
// Sources: sp_april_summary.json, ops_april_summary.json,
//          hubspot_sales_deals.json, metabase_april.json
// ============================================================
function SolutionsApril() {
  const { toggle, isOpen } = useExpandableRows();

  // 16 new SP cards in April (from sp_april_summary.json)
  const newCards = [
    { key: "SP-453", co: "Rivvy Group", created: "Apr 27", stage: "Presales", owner: "Mannuru Dhanush" },
    { key: "SP-452", co: "DLSP - Treasury Platform (16 schools)", created: "Apr 27", stage: "Solutioning", owner: "Anuj Kapoor" },
    { key: "SP-450", co: "Open Due", created: "Apr 16", stage: "Presales", owner: "Mannuru Dhanush" },
    { key: "SP-449", co: "Negoflow", created: "Apr 15", stage: "UAT Testing", owner: "Mannuru Dhanush" },
    { key: "SP-447", co: "PYXIS", created: "Apr 14", stage: "UAT Testing", owner: "Mannuru Dhanush" },
    { key: "SP-446", co: "Robot Farm", created: "Apr 14", stage: "Presales", owner: "Mannuru Dhanush" },
    { key: "SP-445", co: "Etoro", created: "Apr 9", stage: "Integration", owner: "Akshit Sharma" },
    { key: "SP-444", co: "Aires", created: "Apr 9", stage: "UAT Testing", owner: "Prutvi Shetty" },
    { key: "SP-443", co: "Sun Capital Investments", created: "Apr 8", stage: "Presales", owner: "Mannuru Dhanush" },
    { key: "SP-442", co: "FinanceLah", created: "Apr 6", stage: "Kick-off Stage", owner: "Prutvi Shetty" },
    { key: "SP-441", co: "Zerolink", created: "Apr 6", stage: "Presales", owner: "Prutvi Shetty" },
    { key: "SP-440", co: "PhiliPay", created: "Apr 6", stage: "Presales", owner: "Prutvi Shetty" },
    { key: "SP-439", co: "Teel", created: "Apr 6", stage: "Presales", owner: "Prutvi Shetty" },
    { key: "SP-438", co: "Thistle Business Advisory", created: "Apr 6", stage: "Presales", owner: "Prutvi Shetty" },
    { key: "SP-437", co: "Asendia", created: "Apr 6", stage: "Presales", owner: "Prutvi Shetty" },
    { key: "SP-436", co: "Credrails", created: "Apr 6", stage: "Presales", owner: "Prutvi Shetty" },
  ];

  // OPS April tasks summary
  const opsByAssignee = [
    { who: "Mannuru Dhanush", total: 19, done: 15, open: 4, avgTat: 1.2 },
    { who: "Prutvi Shetty", total: 8, done: 7, open: 1, avgTat: 1.5 },
    { who: "Akshit Sharma", total: 1, done: 1, open: 0, avgTat: 7.0 },
  ];

  // Top April revenue orgs (from org_revenue_named.json)
  const topRevenueOrgs = [
    { name: "Condor Partners Pty Ltd", revenue: 456874.75, txns: 82011, type: "Hypercare" },
    { name: "GOLDEN WAY PAYMENTS LTD.", revenue: 188653.39, txns: 58602, type: "Live" },
    { name: "Inpay A/S", revenue: 130111.51, txns: 130989, type: "Activated in April" },
    { name: "aliexpress group pty ltd", revenue: 59740.55, txns: 660, type: "Live" },
    { name: "SQ 4EX PTY LTD", revenue: 17897.01, txns: 2691, type: "Live" },
    { name: "Augenstern Holding Pty Ltd", revenue: 14829.40, txns: 616, type: "Live" },
    { name: "TSW PTY LTD", revenue: 14128.31, txns: 130, type: "Live" },
    { name: "QUICK MONEY SERVICES", revenue: 12953.86, txns: 201, type: "Live" },
    { name: "Global Trade Wallet (AU)", revenue: 11814.07, txns: 3594, type: "Partner - GTW Parent" },
    { name: "Transcash International", revenue: 11103.81, txns: 13383, type: "Live (March activation)" },
    { name: "GQC AUSTRALIA", revenue: 10756.00, txns: 514, type: "Live" },
    { name: "SECURE SEND PTY LTD", revenue: 10460.02, txns: 10120, type: "Live (April pricing setup)" },
    { name: "HDM Global", revenue: 10439.07, txns: 139, type: "Live (March pricing setup)" },
    { name: "Auptimate", revenue: 10042.09, txns: 49, type: "Live" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Demos in April" value="7" sub="Jira Merchant Demo field in April" color="purple" />
        <MetricCard label="New Pipeline Cards" value="16" sub="vs 9 in March (+78%)" color="green" />
        <MetricCard label="SP Transitions" value="18" sub="11 advancements + 1 block" color="blue" />
        <MetricCard label="April Net Revenue" value="$1.19M" sub="113 orgs, USD, Metabase" color="green" />
        <MetricCard label="Ops Tasks" value="28" sub="12 PM · 12 GCA · 4 Pricing · 89% done" color="amber" />
      </div>

      <Section title="Demos Conducted in April" subtitle="7 merchant demos across Solutions team. Jira = SP board, HubSpot = Sales pipeline.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Merchant</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Demo Date</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">AE</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Solutions Owner</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Jira Status</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">HubSpot Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: "SP-427", co: "PaySo", date: "Apr 1", ae: "Elross Pangue", solns: "Prutvi Shetty", jira: "Solutioning", jv: "default" as const, hs: "N/A", hv: "default" as const },
                { key: "SP-444", co: "Aires", date: "Apr 9", ae: "Justin Chia", solns: "Prutvi Shetty", jira: "UAT Testing", jv: "purple" as const, hs: "Live", hv: "success" as const },
                { key: "SP-446", co: "Robot Farm", date: "Apr 14", ae: "Michelle Ling", solns: "Mannuru Dhanush", jira: "Presales Stage", jv: "warning" as const, hs: "Discovery Completed", hv: "warning" as const },
                { key: "SP-457", co: "ALTINO", date: "Apr 17", ae: "Michelle Ling", solns: "Prutvi Shetty", jira: "Live", jv: "success" as const, hs: "Live", hv: "success" as const },
                { key: "SP-453", co: "Rivvy Group", date: "Apr 22", ae: "Elross Pangue", solns: "Mannuru Dhanush", jira: "Presales Stage", jv: "warning" as const, hs: "N/A", hv: "default" as const },
                { key: "SP-431", co: "VIVER", date: "Apr 24", ae: "Michelle Ling", solns: "Prutvi Shetty", jira: "Integration", jv: "purple" as const, hs: "Closed Won/Activation", hv: "success" as const },
                { key: "SP-447", co: "PYXIS", date: "Apr 28", ae: "Justin Chia", solns: "Mannuru Dhanush", jira: "UAT Testing", jv: "purple" as const, hs: "N/A", hv: "default" as const },
              ].map((r) => (
                <tr key={r.key} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">{r.co} <span className="font-mono text-[10px] text-gray-400">{r.key}</span></td>
                  <td className="py-2 px-3 text-xs">{r.date}</td>
                  <td className="py-2 px-3 text-xs">{r.ae}</td>
                  <td className="py-2 px-3 text-xs">{r.solns}</td>
                  <td className="py-2 px-3"><Badge text={r.jira} variant={r.jv} /></td>
                  <td className="py-2 px-3"><Badge text={r.hs} variant={r.hv} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout type="info">
          <strong>Michelle Ling led with 3 demos (Robot Farm, ALTINO, VIVER).</strong> Justin Chia 2 (Aires, PYXIS). Elross Pangue 2 (PaySo, Rivvy). VIVER and ALTINO have already reached the strongest stages (Integration / Live respectively).
        </Callout>
      </Section>

      <Section title="New Pipeline Cards Created in April" subtitle="16 new SP cards - biggest pipeline injection since December">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Key</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Merchant</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Created</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Current Stage</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Solutions Owner</th>
              </tr>
            </thead>
            <tbody>
              {newCards.map((c) => (
                <tr key={c.key} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-mono text-xs text-gray-500">{c.key}</td>
                  <td className="py-2 px-3 font-medium">{c.co}</td>
                  <td className="py-2 px-3 text-xs">{c.created}</td>
                  <td className="py-2 px-3">
                    <Badge text={c.stage} variant={
                      c.stage === "Integration" ? "success" :
                      c.stage.includes("UAT") ? "purple" :
                      c.stage === "Kick-off Stage" ? "warning" :
                      c.stage === "Solutioning" ? "default" : "default"
                    } />
                  </td>
                  <td className="py-2 px-3 text-xs">{c.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout type="success">
          <strong>Big Apr 6 backfill:</strong> 7 new cards created on the same day (Asendia, Credrails, Thistle, Teel, PhiliPay, Zerolink, FinanceLah). Looks like Prutvi cleared a backlog of presales conversations into Jira. The DLSP card (SP-452, 16-school PH treasury play) is the most strategic - see DLSP runbooks.
        </Callout>
      </Section>

      <Section title="First-Ever Transactions in April" subtitle="From Metabase org_analytics (min(start_time) per org) - exhaustive scan across all 449 transacting orgs. Only external customers shown. Internal master/treasury and test accounts filtered out.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Merchant</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">First Txn</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Apr Txns</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Apr Net (USD)</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Jira Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 bg-emerald-50">
                <td className="py-2 px-3 font-medium">NEGOFLOW</td>
                <td className="py-2 px-3 text-xs">Apr 1, 2026</td>
                <td className="text-right py-2 px-3 text-xs">29</td>
                <td className="text-right py-2 px-3 font-semibold">$0</td>
                <td className="py-2 px-3"><Badge text="UAT Testing (SP-449)" variant="purple" /></td>
              </tr>
              <tr className="border-b border-gray-100 bg-emerald-50">
                <td className="py-2 px-3 font-medium">PYXIS</td>
                <td className="py-2 px-3 text-xs">Apr 13, 2026</td>
                <td className="text-right py-2 px-3 text-xs">27</td>
                <td className="text-right py-2 px-3 font-semibold">$0</td>
                <td className="py-2 px-3"><Badge text="UAT Testing (SP-447)" variant="purple" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout type="success">
          <strong>2 net-new external customers transacted for the first time in April</strong> - PYXIS (Apr 13) and NEGOFLOW (Apr 1). Both are still in UAT Testing on Jira with $0 net April revenue - the txns are test/UAT flows. Real revenue follows once both go live.
        </Callout>
      </Section>

      <Section title="Top Revenue Orgs - April" subtitle="Actual net USD revenue from Metabase DB 14 (CREDIT − DEBIT). $1.19M total across 113 orgs.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="w-5 py-2 px-1"></th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Merchant</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">April Net (USD)</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Txns</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Type</th>
              </tr>
            </thead>
            <tbody>
              {topRevenueOrgs.map((m) => (
                <>
                  <tr key={m.name} onClick={() => toggle(m.name)} className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer">
                    <td className="py-2 px-1"><Chevron open={isOpen(m.name)} /></td>
                    <td className="py-2 px-3 font-medium">{m.name}</td>
                    <td className="text-right py-2 px-3 font-bold text-emerald-700">${m.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    <td className="text-right py-2 px-3 text-xs">{m.txns.toLocaleString()}</td>
                    <td className="py-2 px-3"><Badge text={m.type} variant={m.type.includes("Hypercare") ? "warning" : m.type.includes("Partner") ? "purple" : "success"} /></td>
                  </tr>
                  {isOpen(m.name) && (
                    <DetailPanel key={`${m.name}-d`}>
                      <DetailGrid items={[
                        { label: "April Net Revenue", value: `$${m.revenue.toLocaleString()}` },
                        { label: "April Transactions", value: m.txns.toLocaleString() },
                        { label: "Avg per Txn", value: `$${(m.revenue / m.txns).toFixed(2)}` },
                        { label: "Merchant Type", value: m.type },
                      ]} />
                    </DetailPanel>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        <Callout type="info">
          <strong>Top 3 orgs = $775K (65% of April revenue).</strong> Condor + Golden Way + Inpay. Heavy concentration risk. The next 12 orgs combined contribute another $232K (~20%). Long tail of 95 orgs makes up the final ~15%.
        </Callout>
      </Section>

      <Section title="Partner Performance - GTW" subtitle="GTW partner cohort (parent + 4 children). Total April revenue across the group: $12,452.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Org</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Role</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">KYB</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">First Txn</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">April Net (USD)</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">April Txns</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 bg-emerald-50/40">
                <td className="py-2 px-3 font-medium">Global Trade Wallet (AU)</td>
                <td className="py-2 px-3"><Badge text="Parent" variant="purple" /></td>
                <td className="py-2 px-3"><Badge text="APPROVED" variant="success" /></td>
                <td className="py-2 px-3 text-xs">Oct 4, 2023</td>
                <td className="text-right py-2 px-3 font-bold text-emerald-700">$11,814</td>
                <td className="text-right py-2 px-3">3,594</td>
              </tr>
              <tr className="border-b border-gray-100"><td className="py-2 px-3 pl-8">KATHMANDU INT'L TRADERS</td><td className="py-2 px-3"><Badge text="Child" variant="default" /></td><td className="py-2 px-3"><Badge text="APPROVED" variant="success" /></td><td className="py-2 px-3 text-xs">Mar 12</td><td className="text-right py-2 px-3">$102</td><td className="text-right py-2 px-3">75</td></tr>
              <tr className="border-b border-gray-100"><td className="py-2 px-3 pl-8">ECOMMS</td><td className="py-2 px-3"><Badge text="Child" variant="default" /></td><td className="py-2 px-3"><Badge text="COND. APPROVED" variant="warning" /></td><td className="py-2 px-3 text-xs">Mar 12</td><td className="text-right py-2 px-3">$537</td><td className="text-right py-2 px-3">57</td></tr>
              <tr className="border-b border-gray-100"><td className="py-2 px-3 pl-8 text-gray-400">Century Speed</td><td className="py-2 px-3"><Badge text="Child" variant="default" /></td><td className="py-2 px-3 text-xs text-gray-400">-</td><td className="py-2 px-3 text-xs text-gray-400">no txns</td><td className="text-right py-2 px-3 text-gray-400">$0</td><td className="text-right py-2 px-3 text-gray-400">0</td></tr>
              <tr className="border-b border-gray-100"><td className="py-2 px-3 pl-8 text-gray-400">Global Trade Money Exchange</td><td className="py-2 px-3"><Badge text="Child" variant="default" /></td><td className="py-2 px-3 text-xs text-gray-400">-</td><td className="py-2 px-3 text-xs text-gray-400">no txns</td><td className="text-right py-2 px-3 text-gray-400">$0</td><td className="text-right py-2 px-3 text-gray-400">0</td></tr>
              <tr className="bg-gray-100 font-bold"><td className="py-2 px-3">GTW Total (parent + 4 children)</td><td className="py-2 px-3" colSpan={3}></td><td className="text-right py-2 px-3 text-emerald-700">$12,452</td><td className="text-right py-2 px-3">3,726</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="April Activated Merchants - Actual Revenue" subtitle="Merchants with OPS tasks (PM / GCA / Pricing) created in April. Expected MRR from HubSpot deal amount; April net revenue from Metabase DB 14.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Merchant</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Activation</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">First Txn</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Expected MRR</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Apr Rev (USD)</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Done / Total</th>
              </tr>
            </thead>
            <tbody>
              {[
                { co: "ALTINO", act: "GCA + PM (EUR)", first: "May 6", mrr: "$10K", rev: 525, done: "2/2", inApril: false },
                { co: "NEGOFLOW", act: "GCA + PM (SGD, EUR)", first: "Apr 1", mrr: "$1K", rev: 0, done: "2/2", inApril: true },
                { co: "EXCHANGE ONE", act: "PM (USDT, USDC)", first: "Sep 10, 2025", mrr: "$30K", rev: 4998, done: "1/1", inApril: false },
                { co: "PYXIS", act: "GCA (DBS) + PM", first: "Apr 13", mrr: "-", rev: 0, done: "1/2", inApril: true },
                { co: "AESIR VENTURES", act: "GCA (DBS+WISE)", first: "May 4", mrr: "$2.5K", rev: 0, done: "1/1", inApril: false },
                { co: "Novara Advisory Partners", act: "GCA (DBS+WISE)", first: "—", mrr: "-", rev: 0, done: "1/1", inApril: false },
                { co: "HDM Global", act: "GCA (EMQ)", first: "May 15, 2025", mrr: "$2K", rev: 10439, done: "0/1", inApril: false },
                { co: "SUPAY", act: "GCA + PM", first: "May 5", mrr: "$5K", rev: 1, done: "2/2", inApril: false },
                { co: "Velocity Capital", act: "GCA + PM", first: "Jun 17, 2024", mrr: "$2K", rev: 120, done: "1/2", inApril: false },
                { co: "Zashx", act: "PM", first: "—", mrr: "$1K", rev: 4962, done: "1/1", inApril: false },
                { co: "Ronx", act: "GCA + PM", first: "—", mrr: "$500", rev: 0, done: "1/2", inApril: false },
                { co: "TKZ PTy LTD", act: "GCA (x2)", first: "—", mrr: "-", rev: 0, done: "2/2", inApril: false },
                { co: "Amberfin Services", act: "PM", first: "—", mrr: "-", rev: 0, done: "1/1", inApril: false },
                { co: "MS-REMIT", act: "PM", first: "—", mrr: "-", rev: 0, done: "1/1", inApril: false },
                { co: "Secure Send", act: "Pricing setup", first: "—", mrr: "-", rev: 10460, done: "1/1", inApril: false },
                { co: "GoldenWay / Paycombat", act: "GCA", first: "—", mrr: "-", rev: 188653, done: "1/1", inApril: false },
                { co: "InPay A/S", act: "PM", first: "—", mrr: "-", rev: 130112, done: "1/2", inApril: false },
                { co: "Transcash / Ipayremit", act: "Pricing setup", first: "—", mrr: "-", rev: 11104, done: "1/1", inApril: false },
                { co: "EMQ Ltd", act: "Pricing setup", first: "—", mrr: "-", rev: 2198, done: "1/1", inApril: false },
              ].map((m) => (
                <tr key={m.co} className={`border-b border-gray-50 hover:bg-gray-50 ${m.inApril ? "bg-emerald-50/40" : ""}`}>
                  <td className="py-2 px-3 font-medium">{m.co}</td>
                  <td className="py-2 px-3 text-xs">{m.act}</td>
                  <td className="py-2 px-3 text-xs">
                    {m.inApril ? <Badge text={m.first + " ★"} variant="success" /> : <span className="text-gray-600">{m.first}</span>}
                  </td>
                  <td className="text-right py-2 px-3 text-xs">{m.mrr}</td>
                  <td className={`text-right py-2 px-3 font-semibold ${m.rev > 1000 ? "text-emerald-700" : m.rev > 0 ? "text-amber-700" : "text-gray-400"}`}>
                    {m.rev > 0 ? `$${m.rev.toLocaleString()}` : "$0"}
                  </td>
                  <td className="text-right py-2 px-3 text-xs">{m.done}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout type="success">
          <strong>★ rows: first-ever transaction was in April</strong> (PYXIS, NEGOFLOW). Most April activations had not generated revenue by month-end - GCA/PM setup is the gating step, but transactions follow only after the merchant runs their first end-to-end flow.
        </Callout>
      </Section>

      <Section title="Live & Activated Merchants - Revenue & Dormancy Analysis" subtitle="17 SP 'Live' cards cross-referenced against HubSpot stage + Metabase April revenue. 1 card excluded (Klip Payments / Klippay = Offboarded in HubSpot but still shown as Live on Jira - SP card needs cleanup).">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
            <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Active</p>
            <p className="text-3xl font-bold text-emerald-700">3</p>
            <p className="text-xs text-emerald-600">≥ $1,000 April net revenue</p>
            <p className="text-[10px] text-emerald-500 mt-1">MDJ · ZashX · Gotrade</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <p className="text-xs font-bold text-amber-700 uppercase mb-1">Low</p>
            <p className="text-3xl font-bold text-amber-700">4</p>
            <p className="text-xs text-amber-600">$1 - $999 April revenue</p>
            <p className="text-[10px] text-amber-500 mt-1">ALTINO · Grandir · DCS Cards · YALA</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-xs font-bold text-red-700 uppercase mb-1">Dormant</p>
            <p className="text-3xl font-bold text-red-700">10</p>
            <p className="text-xs text-red-600">$0 April revenue, KYB approved</p>
            <p className="text-[10px] text-red-500 mt-1">59% of all "Live" cards</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Merchant</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">KYB</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Capabilities</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">First Txn</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Apr Rev (USD)</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Apr Txns</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: "SP-30", co: "Gotrade Securities", kyb: "APPROVED", caps: "PHP, IDR", first: "Feb 2025", rev: 9137, txns: 12483, cls: "Active", v: "success" as const },
                { key: "SP-397", co: "ZashX", kyb: "APPROVED", caps: "AUD, EUR, NZD, PHP, THB, IDR, USD", first: "—", rev: 4962, txns: 21, cls: "Active", v: "success" as const },
                { key: "SP-410", co: "MDJ", kyb: "APPROVED", caps: "AUD, USDT", first: "Feb 3", rev: 1094, txns: 47, cls: "Active", v: "success" as const },
                { key: "SP-405", co: "Grandir Capital", kyb: "APPROVED", caps: "SGD, EUR, NZD, USD", first: "Dec 30, 2025", rev: 859, txns: 2, cls: "Low", v: "warning" as const },
                { key: "SP-360", co: "DCS Cards", kyb: "APPROVED", caps: "—", first: "Dec 12, 2025", rev: 608, txns: 710, cls: "Low", v: "warning" as const },
                { key: "SP-457", co: "ALTINO", kyb: "APPROVED", caps: "EUR", first: "May 6", rev: 525, txns: 1, cls: "Low", v: "warning" as const },
                { key: "SP-420", co: "YALA CONSULT", kyb: "APPROVED", caps: "EUR", first: "Feb 3", rev: 10, txns: 2, cls: "Low", v: "warning" as const },
                { key: "SP-424", co: "Impressia Limited", kyb: "APPROVED", caps: "—", first: "Jan 19", rev: 0, txns: 0, cls: "Dormant", v: "danger" as const },
                { key: "SP-422", co: "TSPA SPV I", kyb: "APPROVED", caps: "—", first: "Jan 21", rev: 0, txns: 0, cls: "Dormant", v: "danger" as const },
                { key: "SP-421", co: "Kortya Softcom", kyb: "—", caps: "—", first: "—", rev: 0, txns: 0, cls: "Dormant", v: "danger" as const },
                { key: "SP-419", co: "OFFGIDER INC", kyb: "APPROVED", caps: "—", first: "—", rev: 0, txns: 0, cls: "Dormant", v: "danger" as const },
                { key: "SP-413", co: "PRIME FX", kyb: "APPROVED", caps: "AUD, EUR", first: "Feb 5", rev: 0, txns: 0, cls: "Dormant", v: "danger" as const },
                { key: "SP-404", co: "Pryvx", kyb: "APPROVED", caps: "IDR", first: "Dec 10, 2025", rev: 0, txns: 0, cls: "Dormant", v: "danger" as const },
                { key: "SP-365", co: "Kleen Strategies", kyb: "—", caps: "SGD, AUD", first: "—", rev: 0, txns: 0, cls: "Dormant", v: "danger" as const },
                { key: "SP-357", co: "Velox Tech", kyb: "APPROVED", caps: "—", first: "Dec 19, 2025", rev: 0, txns: 0, cls: "Dormant", v: "danger" as const },
                { key: "SP-338", co: "Pierre - L1 Partner", kyb: "—", caps: "—", first: "—", rev: 0, txns: 0, cls: "Dormant", v: "danger" as const },
                { key: "SP-179", co: "PREMIUM PREOWN", kyb: "APPROVED", caps: "SGD", first: "Aug 27, 2025", rev: 0, txns: 0, cls: "Dormant", v: "danger" as const },
              ].map((m) => (
                <tr key={m.key} className={`border-b border-gray-50 hover:bg-gray-50 ${m.cls === "Dormant" ? "bg-red-50/30" : ""}`}>
                  <td className="py-2 px-3 font-medium text-xs">{m.co} <span className="font-mono text-[10px] text-gray-400">{m.key}</span></td>
                  <td className="py-2 px-3"><Badge text={m.kyb} variant={m.kyb === "APPROVED" ? "success" : "default"} /></td>
                  <td className="py-2 px-3 text-xs text-gray-600">{m.caps}</td>
                  <td className="py-2 px-3 text-xs">{m.first}</td>
                  <td className={`text-right py-2 px-3 font-semibold ${m.rev > 1000 ? "text-emerald-700" : m.rev > 0 ? "text-amber-700" : "text-gray-400"}`}>${m.rev.toLocaleString()}</td>
                  <td className="text-right py-2 px-3 text-xs">{m.txns}</td>
                  <td className="py-2 px-3"><Badge text={m.cls} variant={m.v} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout type="danger">
          <strong>59% of "Live" merchants generated $0 in April.</strong> 10 of 17 cards on the Live stage (after excluding the offboarded Klippay) are dormant - KYB approved, capabilities enabled, but no transactions. These need a re-engagement workflow, not more onboarding. Highest priority: DCS Cards ($50K projected, $608 actual), Premium Preown (live since Aug 2025), Velox Tech (KYB approved Oct 2025, still $0).
        </Callout>
      </Section>

      <Section title="Capabilities Enabled in April" subtitle="Pulled from SP card 'Method Enablement Date' field. 5 merchants enabled new currencies / GCA connectors in April.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Merchant</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Local Capabilities</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">GCA Connector</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Method Enablement Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100"><td className="py-2 px-3 font-medium">NEGOFLOW</td><td className="py-2 px-3"><Badge text="SGD" variant="success" /> <Badge text="EUR" variant="success" /></td><td className="py-2 px-3"><Badge text="DBS + WISE" variant="purple" /></td><td className="py-2 px-3 text-xs">Apr 1</td></tr>
              <tr className="border-b border-gray-100"><td className="py-2 px-3 font-medium">PYXIS</td><td className="py-2 px-3 text-xs text-gray-500">(none set on card)</td><td className="py-2 px-3"><Badge text="DBS" variant="purple" /></td><td className="py-2 px-3 text-xs">Apr 13</td></tr>
              <tr className="border-b border-gray-100"><td className="py-2 px-3 font-medium">ALTINO</td><td className="py-2 px-3"><Badge text="EUR" variant="success" /></td><td className="py-2 px-3"><Badge text="DBS + WISE" variant="purple" /></td><td className="py-2 px-3 text-xs">Apr 16</td></tr>
              <tr className="border-b border-gray-100"><td className="py-2 px-3 font-medium">AESIR VENTURES</td><td className="py-2 px-3"><Badge text="SGD" variant="success" /></td><td className="py-2 px-3"><Badge text="DBS + WISE" variant="purple" /></td><td className="py-2 px-3 text-xs">Apr 23</td></tr>
              <tr className="border-b border-gray-100"><td className="py-2 px-3 font-medium">Novara Advisory Partners</td><td className="py-2 px-3 text-xs text-gray-500">(none set on card)</td><td className="py-2 px-3"><Badge text="DBS + WISE" variant="purple" /></td><td className="py-2 px-3 text-xs">Apr 29</td></tr>
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 uppercase">Currencies Enabled</p>
            <p className="text-2xl font-bold text-gray-900">3 unique</p>
            <p className="text-[10px] text-gray-500">SGD (x2) · EUR (x2)</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 uppercase">GCA Connectors</p>
            <p className="text-2xl font-bold text-gray-900">DBS + WISE</p>
            <p className="text-[10px] text-gray-500">x4 (NEGOFLOW · ALTINO · AESIR · Novara). PYXIS = DBS only.</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 uppercase">First-Txn Conversion</p>
            <p className="text-2xl font-bold text-gray-900">2 / 5</p>
            <p className="text-[10px] text-gray-500">PYXIS (Apr 13) + NEGOFLOW (Apr 1)</p>
          </div>
        </div>
      </Section>

      <Section title="Operations - April" subtitle="OPS board #24, all activation tasks (PM / GCA / Pricing) created in April">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">By Category</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={[
                  { name: "Payment Method", value: 12, color: BLUE },
                  { name: "GCA Activation", value: 12, color: GREEN },
                  { name: "Pricing Setup", value: 4, color: AMBER },
                ]} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {[BLUE, GREEN, AMBER].map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Team Performance</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600">Who</th>
                  <th className="text-right py-2 px-2 text-xs">Total</th>
                  <th className="text-right py-2 px-2 text-xs">Done</th>
                  <th className="text-right py-2 px-2 text-xs">Open</th>
                  <th className="text-right py-2 px-2 text-xs">Avg TAT</th>
                </tr>
              </thead>
              <tbody>
                {opsByAssignee.map((a) => (
                  <tr key={a.who} className="border-b border-gray-50">
                    <td className="py-2 px-2 font-medium text-sm">{a.who}</td>
                    <td className="text-right py-2 px-2">{a.total}</td>
                    <td className="text-right py-2 px-2 text-emerald-600 font-semibold">{a.done}</td>
                    <td className="text-right py-2 px-2 text-amber-600">{a.open}</td>
                    <td className="text-right py-2 px-2 text-xs">{a.avgTat}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Callout type="success">
          <strong>Healthy TAT in April.</strong> Median = 1 day, 11 of 28 closed same-day. The March bulk-close pattern (Dhanush batching to Apr 1) is gone - tasks are being resolved in real time now. 5 tasks still in backlog: Ronx (PM), Velocity Capital (GCA), PYXIS PM, HDM Global GCA, InPay PM.
        </Callout>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Methods Activated (12 PM tasks)</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-xs font-semibold text-gray-600">Merchant</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-600">Method / Currency (from SP capabilities)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50"><td className="py-2 text-xs font-medium">NEGOFLOW</td><td className="py-2 text-xs">SGD, EUR</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 text-xs font-medium">ALTINO</td><td className="py-2 text-xs">EUR</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 text-xs font-medium">AESIR VENTURES</td><td className="py-2 text-xs">SGD</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 text-xs font-medium">Pyxis</td><td className="py-2 text-xs">(not set yet, GCA via DBS)</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 text-xs font-medium">SUPAY</td><td className="py-2 text-xs">(PM + GCA both done, currency not in SP card)</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 text-xs font-medium">EXCHANGE ONE</td><td className="py-2 text-xs">USDT, USDC (stablecoins)</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 text-xs font-medium">Amberfin Services</td><td className="py-2 text-xs">(SP card not yet linked)</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 text-xs font-medium">Velocity Capital</td><td className="py-2 text-xs">(PM in-progress)</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 text-xs font-medium">Ronx</td><td className="py-2 text-xs">(BACKLOG)</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 text-xs font-medium">Zashx</td><td className="py-2 text-xs">(SP card already shows 7-currency footprint)</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 text-xs font-medium">MS-REMIT</td><td className="py-2 text-xs">(small remittance flow)</td></tr>
                <tr className="border-b border-gray-50"><td className="py-2 text-xs font-medium">InPay A/S</td><td className="py-2 text-xs">(BACKLOG, x2 tasks)</td></tr>
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">GCA Activation Breakdown (12 GCA tasks)</h4>
            <table className="w-full text-sm mb-4">
              <tbody>
                <tr className="border-b border-gray-100"><td className="py-2 text-xs text-gray-600">DBS + WISE (combined)</td><td className="py-2 text-right font-bold">4</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-xs text-gray-600">DBS only</td><td className="py-2 text-right font-bold">1</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-xs text-gray-600">EMQ</td><td className="py-2 text-right font-bold">1</td></tr>
                <tr className="border-b border-gray-100"><td className="py-2 text-xs text-gray-600">Other / not enriched</td><td className="py-2 text-right">6</td></tr>
              </tbody>
            </table>
            <p className="text-[11px] text-gray-500 italic">DBS+WISE became the dominant April connector (NEGOFLOW, ALTINO, AESIR, Novara), reversing March's EMQ dominance. PYXIS used DBS only.</p>
          </div>
        </div>
      </Section>

    </div>
  );
}

// ============================================================
// MAIN DASHBOARD
// ============================================================
export default function MBRAprilDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["Outbound Sales", "Inbound Leads", "Solutions"];
  const tabActiveStyles = [
    "bg-gray-50 text-blue-700 border-t-2 border-x border-blue-500 border-gray-200 -mb-px",
    "bg-gray-50 text-emerald-700 border-t-2 border-x border-emerald-500 border-gray-200 -mb-px",
    "bg-gray-50 text-violet-700 border-t-2 border-x border-violet-500 border-gray-200 -mb-px",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-gray-400 hover:text-gray-600 transition-colors" title="Back to Dashboards">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Finmo - Monthly Business Review</h1>
                <p className="text-sm text-gray-500">April 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">Generated: May 14, 2026</span>
              <button onClick={logout} className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition">Logout</button>
            </div>
          </div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 0 && <OutboundSalesApril />}
        {activeTab === 1 && <InboundLeadsApril />}
        {activeTab === 2 && <SolutionsApril />}
      </div>
    </div>
  );
}
