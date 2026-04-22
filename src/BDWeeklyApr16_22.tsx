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
const RED = "#EF4444";
const PINK = "#EC4899";
const CYAN = "#06B6D4";
const SLATE = "#64748B";

// ============================================================
// HELPER COMPONENTS
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
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });
  const isOpen = (key: string) => expanded.has(key);
  return { toggle, isOpen };
}

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
// OUTBOUND TAB
// Period: April 16-22, 2026
// Data sources: SmartReach dashboard (Apr 16-22 custom range), Twilio + Exotel
// (live API pull with details=true), 91 recordings transcribed via Whisper
// ============================================================
function OutboundTab() {
  const { toggle, isOpen } = useExpandableRows();

  // Funnel
  const funnelSteps = [
    { stage: "Prospects in Campaigns", value: 998, color: SLATE },
    { stage: "Prospects Contacted", value: 378, color: BLUE },
    { stage: "Email Opens (~est)", value: 137, color: CYAN },
    { stage: "Call Conversations >30s", value: 28, color: AMBER },
    { stage: "Call Conversations >2min", value: 6, color: GREEN },
    { stage: "Prospect Replies", value: 3, color: RED },
  ];

  // LinkedIn breakdown (from screenshot)
  const linkedInPie = [
    { name: "Profile Visits", value: 150, color: BLUE },
    { name: "Connection Requests", value: 100, color: GREEN },
    { name: "Messages", value: 68, color: PINK },
  ];

  // Daily email sent (from SmartReach dashboard screenshot 5)
  const emailDaily = [
    { date: "Apr 15", emails: 5 },
    { date: "Apr 16", emails: 93 },
    { date: "Apr 17", emails: 44 },
    { date: "Apr 18", emails: 0 },
    { date: "Apr 19", emails: 0 },
    { date: "Apr 20", emails: 119 },
    { date: "Apr 21", emails: 30 },
    { date: "Apr 22", emails: 37 },
  ];

  // Daily calling (Twilio + Exotel, computed from live pull)
  const callingDaily = [
    { date: "Apr 16", dials: 51, answered: 21, convGt30: 5, rate: 41 },
    { date: "Apr 17", dials: 39, answered: 23, convGt30: 9, rate: 59 },
    { date: "Apr 19", dials: 5, answered: 0, convGt30: 0, rate: 0 },
    { date: "Apr 20", dials: 66, answered: 26, convGt30: 6, rate: 39 },
    { date: "Apr 21", dials: 38, answered: 20, convGt30: 4, rate: 53 },
    { date: "Apr 22", dials: 34, answered: 14, convGt30: 4, rate: 41 },
  ];

  // Calling hours (prospect local time)
  const callingHours = [
    { hour: "8am", dials: 5, rate: 60.0, conv: 1 },
    { hour: "9am", dials: 9, rate: 33.3, conv: 2 },
    { hour: "10am", dials: 44, rate: 43.2, conv: 6 },
    { hour: "11am", dials: 11, rate: 36.4, conv: 0 },
    { hour: "12pm", dials: 13, rate: 84.6, conv: 1 },
    { hour: "1pm", dials: 24, rate: 37.5, conv: 2 },
    { hour: "2pm", dials: 26, rate: 42.3, conv: 5 },
    { hour: "3pm", dials: 46, rate: 60.9, conv: 7 },
    { hour: "4pm", dials: 20, rate: 30.0, conv: 3 },
    { hour: "5pm", dials: 18, rate: 33.3, conv: 1 },
  ];

  // Region
  const regionData = [
    { region: "SG", dials: 107, answered: 48, rate: "44.9%", failCancel: 30, conv: 16, convRate: "15.0%" },
    { region: "MY", dials: 56, answered: 25, rate: "44.6%", failCancel: 4, conv: 8, convRate: "14.3%" },
    { region: "Other", dials: 33, answered: 9, rate: "27.3%", failCancel: 18, conv: 2, convRate: "6.1%" },
    { region: "AU", dials: 24, answered: 17, rate: "70.8%", failCancel: 5, conv: 2, convRate: "8.3%" },
    { region: "VN", dials: 5, answered: 2, rate: "40.0%", failCancel: 1, conv: 0, convRate: "0.0%" },
    { region: "ID", dials: 4, answered: 2, rate: "50.0%", failCancel: 1, conv: 0, convRate: "0.0%" },
    { region: "PH", dials: 2, answered: 1, rate: "50.0%", failCancel: 1, conv: 0, convRate: "0.0%" },
    { region: "UK", dials: 1, answered: 0, rate: "0.0%", failCancel: 1, conv: 0, convRate: "0.0%" },
    { region: "ZA", dials: 1, answered: 0, rate: "0.0%", failCancel: 1, conv: 0, convRate: "0.0%" },
  ];

  // SDR (attributed only)
  const sdrData = [
    { sdr: "Harini", dials: 166, answered: 72, rate: "43.4%", conv: 18, convRate: "10.8%", gt2min: 5 },
    { sdr: "Sukriti", dials: 57, answered: 31, rate: "54.4%", conv: 9, convRate: "15.8%", gt2min: 1 },
  ];

  // SDR x Region
  const sdrRegion = {
    Harini: [
      { region: "SG", dials: 75, answered: 31, rate: "41%", conv: 12, convRate: "16%" },
      { region: "MY", dials: 44, answered: 19, rate: "43%", conv: 5, convRate: "11%" },
      { region: "AU", dials: 21, answered: 15, rate: "71%", conv: 1, convRate: "5%" },
      { region: "Other", dials: 16, answered: 4, rate: "25%", conv: 0, convRate: "0%" },
      { region: "ID", dials: 4, answered: 2, rate: "50%", conv: 0, convRate: "0%" },
      { region: "VN", dials: 3, answered: 1, rate: "33%", conv: 0, convRate: "0%" },
      { region: "UK", dials: 1, answered: 0, rate: "0%", conv: 0, convRate: "0%" },
      { region: "ZA", dials: 1, answered: 0, rate: "0%", conv: 0, convRate: "0%" },
      { region: "PH", dials: 1, answered: 0, rate: "0%", conv: 0, convRate: "0%" },
    ],
    Sukriti: [
      { region: "SG", dials: 32, answered: 17, rate: "53%", conv: 4, convRate: "12%" },
      { region: "MY", dials: 12, answered: 6, rate: "50%", conv: 3, convRate: "25%" },
      { region: "Other", dials: 9, answered: 5, rate: "56%", conv: 2, convRate: "22%" },
      { region: "VN", dials: 2, answered: 1, rate: "50%", conv: 0, convRate: "0%" },
      { region: "AU", dials: 1, answered: 1, rate: "100%", conv: 0, convRate: "0%" },
      { region: "PH", dials: 1, answered: 1, rate: "100%", conv: 0, convRate: "0%" },
    ],
  };

  // Objections (from transcript classification keywords)
  const objections = [
    { obj: "How did you get my number / who is this?", count: 6, by: "Harini: 4, Sukriti: 2" },
    { obj: "Busy / callback requested", count: 3, by: "Harini: 2, Sukriti: 1" },
    { obj: "Not interested", count: 2, by: "Harini: 1, Sukriti: 1" },
  ];

  // Reply analysis - 3 actual prospect replies captured in HubSpot this period
  const replies = [
    { hsId: "456973465333", company: "DataPull Pte", contact: "Sandeep Singh", reply: "Agreed for an exploratory call.", type: "Positive", variant: "success" as const, note: "Only positive reply of the period - move to AE immediately for the exploratory call." },
    { hsId: "457029475018", company: "Leon Communications", contact: "Tim Williamson", reply: "No thanks.", type: "Negative", variant: "danger" as const, note: "Polite decline. Move to nurture, revisit in 60 days." },
    { hsId: "457027851995", company: "Digital360 Technologies", contact: "Vikash Pandey", reply: "Hi, I don't need this service.", type: "Negative", variant: "danger" as const, note: "Not-interested - likely wrong fit. Mark closed-lost or DNC." },
  ];

  // Top conversations (from calls.json top_calls + transcript classification)
  const topConversations = [
    { rank: 1, duration: "5m04s", sdr: "Harini", region: "SG", date: "Apr 22", co: "GoInbound", contact: "Aravind Kumar Loganathan", platform: "Exotel", outcome: "Identity question", snippet: "Long exchange - prospect asked 'where are you calling from', Hannah explained Finmo, drifted into confusion." },
    { rank: 2, duration: "3m31s", sdr: "Harini", region: "SG", date: "Apr 20", co: "Ah Fok Media", contact: "Andy Jeremiah Lam", platform: "Exotel", outcome: "Substantive", snippet: "Extended dialogue - Andy from Ah Fok Media, Singapore agency." },
    { rank: 3, duration: "2m37s", sdr: "Sukriti", region: "Other", date: "Apr 17", co: "GAZILLION MATHTECH PTE LTD", contact: "Khaleelulla Baig", platform: "Twilio", outcome: "Substantive", snippet: "Prospect said audio was unclear, Sukriti re-explained Finmo. Follow-up needed." },
    { rank: 4, duration: "2m25s", sdr: "Harini", region: "SG", date: "Apr 21", co: "Futurx Creatives", contact: "Then Zhi Wei", platform: "Exotel", outcome: "Busy / callback", snippet: "Follow-up from prior week - prospect asked to call back later." },
    { rank: 5, duration: "2m14s", sdr: "Harini", region: "SG", date: "Apr 16", co: "DataPull Pte", contact: "Sandeep Singh", platform: "Exotel", outcome: "Substantive", snippet: "Harini caught Sandeep mid-meeting, rescheduled for follow-up." },
    { rank: 6, duration: "2m13s", sdr: "Harini", region: "AU", date: "Apr 16", co: "Attai International Pty Ltd", contact: "Jawid Attai", platform: "Twilio", outcome: "Interested - inbound", snippet: "Jawid had signed up on the website. Interested conversation. Meeting booked for Apr 21." },
    { rank: 7, duration: "1m43s", sdr: "Sukriti", region: "MY", date: "Apr 17", co: "Pixie", contact: "Zalila Rozali", platform: "Twilio", outcome: "Substantive", snippet: "Dahlia signed up to Finmo platform. Sukriti explained use case." },
    { rank: 8, duration: "1m40s", sdr: "Harini", region: "SG", date: "Apr 16", co: "Aleesyah", contact: "Zul Zahari", platform: "Exotel", outcome: "Conversation (unclear)", snippet: "Audio issues, conversation did not land cleanly." },
    { rank: 9, duration: "1m33s", sdr: "Unknown", region: "AU", date: "Apr 20", co: "Spinbol (inbound, via Twilio)", contact: "Moaz / Karim", platform: "Twilio", outcome: "Interested - inbound", snippet: "Inbound signup - prospect picked up, some echo, but engaged." },
    { rank: 10, duration: "1m33s", sdr: "Sukriti", region: "SG", date: "Apr 17", co: "Goldbell", contact: "Taufik Sapoan", platform: "Exotel", outcome: "Rejection", snippet: "Taufik declined politely." },
    { rank: 11, duration: "1m31s", sdr: "Harini", region: "MY", date: "Apr 20", co: "Fluffy Trading.Co", contact: "Izhan Syafiq", platform: "Exotel", outcome: "Substantive", snippet: "Extended dialogue with Izhan about Finmo." },
    { rank: 12, duration: "1m26s", sdr: "Harini", region: "SG", date: "Apr 22", co: "Esco Aster", contact: "Colin Chin", platform: "Exotel", outcome: "Substantive", snippet: "Colin engaged, asked about Finmo origin." },
    { rank: 13, duration: "1m20s", sdr: "Harini", region: "MY", date: "Apr 22", co: "CHIA", contact: "Chong Chia Chee", platform: "Exotel", outcome: "Substantive", snippet: "Chia Chee asked Harini to slow down, engaged in dialogue." },
    { rank: 14, duration: "1m14s", sdr: "Harini", region: "MY", date: "Apr 20", co: "Shok corporation", contact: "Ashok Mandal", platform: "Exotel", outcome: "Substantive", snippet: "Ashok engaged, Harini explained Singapore-based Finmo." },
    { rank: 15, duration: "1m12s", sdr: "Harini", region: "SG", date: "Apr 16", co: "SW Strategies", contact: "Jose Raymond", platform: "Exotel", outcome: "Identity question", snippet: "Jose asked who Hannah was, sharp opener needed." },
  ];

  // Outbound meetings (SG marketing-agency ICP + adjacent SG SMEs)
  const outboundMeetings = [
    {
      name: "Andy Jeremiah Lam",
      co: "Ah Fok Media",
      sdr: "Harini",
      ae: "Michelle",
      type: "AE call scheduled May 4",
      date: "Apr 20",
      website: "https://atypicalmedia.com/",
      icp: true,
      note: "Founder. Marketing agency - content creation + social media management for local F&B. Lean finance, manual invoicing, uses Xero. Interested in Finmo for payments + real-time visibility. Raised concerns: settlement timelines, security/intermediary risk, pricing clarity. Has international clients (INR/CNY/USD/CAD) - wants UX demo.",
    },
    {
      name: "Thomas Budin",
      co: "We Are Noodle",
      sdr: "Harini",
      ae: "Gibson",
      type: "Follow-up: in-person coffee",
      date: "Apr (executed last week)",
      website: "https://www.wearenoodle.com/",
      icp: false,
      note: "Strategy + digital product build (building Formdumpling, a SaaS lead-qualifier). Uses Stripe + Airwallex + Wise stitched via custom dashboard. Pain: fragmented cash visibility, reconciliation. Values simplicity + real-time view. Interested in DBS/OCBC bank-account integration. Price-sensitive, wants time.",
    },
    {
      name: "Sandeep Singh",
      co: "DataPull Pte",
      sdr: "Harini",
      ae: "-",
      type: "15-min briefing done, 30-45 min session with finance team next",
      date: "Apr 16 / Apr 21",
      website: "https://datapull.com/",
      icp: false,
      note: "Market research - clients across SEA, team mostly India. Cross-border USD payments, uses traditional banks (cost-driven). Sandeep handles most transactions, SG finance person supports taxes/compliance. Open to platform; will loop in finance contact for the deeper session.",
    },
  ];

  // Classification mix from 91 transcribed answered calls
  const classifications = [
    { key: "Voicemail / IVR", count: 24, color: "gray" },
    { key: "Other / unclear", count: 24, color: "gray" },
    { key: "Substantive conversation", count: 11, color: "blue" },
    { key: "Brief human contact", count: 10, color: "gray" },
    { key: "Identity question (who is this?)", count: 6, color: "amber" },
    { key: "Interested conversation", count: 5, color: "green" },
    { key: "Conversation (other)", count: 5, color: "blue" },
    { key: "Busy / callback", count: 3, color: "amber" },
    { key: "Rejection", count: 2, color: "red" },
    { key: "Foreign language voicemail", count: 1, color: "gray" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Prospects Contacted" value="378" trend={{ val: -31, label: "vs prior" }} color="blue" />
        <MetricCard label="Emails Sent" value="324" sub="268 prospects, 51% open, 1% reply" color="blue" />
        <MetricCard label="LinkedIn Actions" value="318" sub="150 visits, 100 requests, 68 messages" color="purple" />
        <MetricCard label="Total Calls" value="233" sub="Harini: 166, Sukriti: 57" color="green" />
        <MetricCard label="Meetings (outbound)" value="3" sub="Ah Fok (ICP), We Are Noodle, DataPull" color="amber" />
      </div>

      {/* ICP banner */}
      <Callout type="info">
        <strong>ICP this period:</strong> marketing agencies in Singapore (SMEs). 3 outbound meetings booked - 1 in-ICP (Ah Fok Media) + 2 adjacent SG SMEs (We Are Noodle, DataPull).
      </Callout>

      {/* Meetings from Outbound */}
      <Section title="Meetings Booked from Outbound" subtitle="3 meetings - all Singapore. Click any row for the full use case.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="w-6 py-2 px-2"></th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Contact</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">SDR</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">AE</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">ICP</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Next Step</th>
              </tr>
            </thead>
            <tbody>
              {outboundMeetings.map((m) => (
                <>
                  <tr key={m.co} onClick={() => toggle(`om-${m.co}`)} className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer">
                    <td className="py-2 px-2"><Chevron open={isOpen(`om-${m.co}`)} /></td>
                    <td className="py-2 px-3 font-medium">
                      <a href={m.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-700 hover:underline">
                        {m.co} <span className="text-[10px] text-blue-400">&#8599;</span>
                      </a>
                    </td>
                    <td className="py-2 px-3 text-xs">{m.name}</td>
                    <td className="py-2 px-3 text-xs">{m.sdr}</td>
                    <td className="py-2 px-3 text-xs">{m.ae}</td>
                    <td className="py-2 px-3"><Badge text={m.icp ? "In ICP" : "Adjacent"} variant={m.icp ? "success" : "warning"} /></td>
                    <td className="py-2 px-3 text-xs text-gray-500">{m.type}</td>
                  </tr>
                  {isOpen(`om-${m.co}`) && (
                    <DetailPanel key={`om-${m.co}-detail`}>
                      <DetailGrid items={[
                        { label: "Country", value: "Singapore" },
                        { label: "AE", value: m.ae },
                        { label: "Website", value: m.website },
                        { label: "Next step", value: m.type },
                      ]} />
                      <p className="mt-2 text-sm text-gray-700 italic">{m.note}</p>
                    </DetailPanel>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Outreach Funnel */}
      <Section title="Outreach Funnel" subtitle="998 prospects in campaigns - 378 contacted this period (down 31% vs prior)">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnelSteps} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={200} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelSteps.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Email Open Rate</p>
                <p className="text-xl font-bold text-blue-900">51%</p>
                <p className="text-xs text-blue-500">Down from 64% prior</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-xs text-red-600 font-medium">Email Reply Rate</p>
                <p className="text-xl font-bold text-red-900">1%</p>
                <p className="text-xs text-red-500">2 replies (1 pos / 1 neg)</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium">Call Conv Rate</p>
                <p className="text-xl font-bold text-emerald-900">12.0%</p>
                <p className="text-xs text-emerald-500">28 conversations {">"}30s - up from 9.7%</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-amber-600 font-medium">Call Pickup Rate</p>
                <p className="text-xl font-bold text-amber-900">44.6%</p>
                <p className="text-xs text-amber-500">Up from 33.2% prior period</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Email + LinkedIn Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Email Performance" subtitle="324 emails to 268 prospects via SmartReach">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Open Rate</p>
              <p className="text-2xl font-bold text-emerald-600">51%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Reply Rate</p>
              <p className="text-2xl font-bold text-red-600">1%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Positive Replies</p>
              <p className="text-2xl font-bold text-amber-600">1%</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Daily Email Volume</p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={emailDaily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="emails" fill={BLUE} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Callout type="warning">
            <strong>Open rate dropped 13pts (64% to 51%).</strong> Subject-line efficacy declining. Reply rate still 1% - body copy needs a new angle.
          </Callout>
        </Section>

        <Section title="LinkedIn Performance" subtitle="318 actions - 19% connection rate, reply content not yet synced to HubSpot">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Connection Rate</p>
              <p className="text-2xl font-bold text-emerald-600">19%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Reply Rate</p>
              <p className="text-2xl font-bold text-emerald-600">*</p>
              <p className="text-[10px] text-amber-600">SmartReach UI shows 233% (metric artifact)</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Actions Breakdown</p>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={linkedInPie} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {linkedInPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <Callout type="info">
            <strong>LinkedIn volume stayed high (318 actions)</strong> but only 3 prospects recorded as contacted in the SmartReach overview. Connection rate 19% - similar to prior. No new LinkedIn reply content landed in HubSpot this period.
          </Callout>
        </Section>
      </div>

      {/* Reply Analysis */}
      <Section title="Reply Analysis" subtitle="3 actual prospect replies in period (1 positive / 2 negative). Click any row for the HubSpot contact.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
            <p className="text-2xl font-bold text-emerald-800">1</p>
            <p className="text-xs font-medium text-emerald-600">Positive - exploratory call agreed</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-100 text-center">
            <p className="text-2xl font-bold text-red-800">2</p>
            <p className="text-xs font-medium text-red-600">Negative - polite / not interested</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-700">0</p>
            <p className="text-xs font-medium text-gray-500">Uncategorized</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Reply</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Type</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Next step</th>
              </tr>
            </thead>
            <tbody>
              {replies.map((r) => (
                <tr key={r.hsId} className="border-b border-gray-50">
                  <td className="py-2 px-3 font-medium">
                    <a
                      href={`https://app-na2.hubspot.com/contacts/20889024/record/0-1/${r.hsId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline"
                    >
                      {r.company} <span className="text-[10px] text-blue-400">&#8599;</span>
                    </a>
                    <span className="text-xs text-gray-500"> - {r.contact}</span>
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-700 italic">"{r.reply}"</td>
                  <td className="py-2 px-3"><Badge text={r.type} variant={r.variant} /></td>
                  <td className="py-2 px-3 text-xs text-gray-500">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Call Performance */}
      <Section title="Call Performance" subtitle="223 attributed dials (Harini: 166, Sukriti: 57), Apr 16-22. Click SDR rows to see region breakdown.">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
            <p className="text-xs text-emerald-600 font-medium">Customer Answered</p>
            <p className="text-xl font-bold text-emerald-900">104</p>
            <p className="text-xs text-emerald-500">44.6%</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
            <p className="text-xs text-blue-600 font-medium">Conv {">"}30s</p>
            <p className="text-xl font-bold text-blue-900">28</p>
            <p className="text-xs text-blue-500">12.0%</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center">
            <p className="text-xs text-amber-600 font-medium">Conv {">"}2min</p>
            <p className="text-xl font-bold text-amber-900">6</p>
            <p className="text-xs text-amber-500">2.6%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-medium">No Answer</p>
            <p className="text-xl font-bold text-gray-700">58</p>
            <p className="text-xs text-gray-500">24.9%</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-100 text-center">
            <p className="text-xs text-red-600 font-medium">Failed / Canceled</p>
            <p className="text-xl font-bold text-red-900">62</p>
            <p className="text-xs text-red-500">26.6% - Leg2 not reached</p>
          </div>
        </div>

        {/* What happened on connected calls */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">What Happened on Connected Calls (104 answered, 91 transcribed via Whisper)</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
            <div onClick={() => toggle("interested-list")} className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center cursor-pointer hover:shadow-md transition-shadow">
              <p className="text-xs text-emerald-600 font-medium">Interested</p>
              <p className="text-xl font-bold text-emerald-900">5</p>
              <p className="text-xs text-emerald-500">Asked questions</p>
              <p className="text-[10px] text-gray-400 mt-1">Click to expand</p>
            </div>
            <div onClick={() => toggle("substantive-list")} className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center cursor-pointer hover:shadow-md transition-shadow">
              <p className="text-xs text-blue-600 font-medium">Substantive</p>
              <p className="text-xl font-bold text-blue-900">11</p>
              <p className="text-xs text-blue-500">Extended dialogue</p>
              <p className="text-[10px] text-gray-400 mt-1">Click to expand</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
              <p className="text-xs text-gray-500 font-medium">Voicemail / IVR</p>
              <p className="text-xl font-bold text-gray-700">25</p>
              <p className="text-xs text-gray-500">24% of answered</p>
            </div>
            <div onClick={() => toggle("callback-list")} className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center cursor-pointer hover:shadow-md transition-shadow">
              <p className="text-xs text-amber-600 font-medium">Busy / Callback</p>
              <p className="text-xl font-bold text-amber-900">3</p>
              <p className="text-xs text-amber-500">Follow-up needed</p>
              <p className="text-[10px] text-gray-400 mt-1">Click to expand</p>
            </div>
            <div onClick={() => toggle("identity-list")} className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center cursor-pointer hover:shadow-md transition-shadow">
              <p className="text-xs text-amber-600 font-medium">Identity Question</p>
              <p className="text-xl font-bold text-amber-900">6</p>
              <p className="text-xs text-amber-500">"Who is this?"</p>
              <p className="text-[10px] text-gray-400 mt-1">Click to expand</p>
            </div>
          </div>

          {/* Interested */}
          {isOpen("interested-list") && (
            <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 mb-3">
              <p className="text-xs font-bold text-emerald-700 uppercase mb-2">5 Interested Conversations</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-emerald-300">
                    <th className="text-left py-1 px-2 font-semibold">Company</th>
                    <th className="text-left py-1 px-2 font-semibold">Contact</th>
                    <th className="text-left py-1 px-2 font-semibold">SDR</th>
                    <th className="text-left py-1 px-2 font-semibold">Region</th>
                    <th className="text-left py-1 px-2 font-semibold">Duration</th>
                    <th className="text-left py-1 px-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { co: "Attai International Pty Ltd", contact: "Jawid Attai", sdr: "Harini", region: "AU", dur: "2m13s", date: "Apr 16" },
                    { co: "Spinbol (inbound)", contact: "Moaz / Karim", sdr: "Unknown", region: "AU", dur: "1m33s", date: "Apr 20" },
                    { co: "FLY Entertainment", contact: "Irene Ang", sdr: "Sukriti", region: "SG", dur: "1m01s", date: "Apr 17" },
                    { co: "DataPull Pte", contact: "Sandeep Singh", sdr: "Harini", region: "SG", dur: "0m53s", date: "Apr 21" },
                    { co: "Trueworld Studios", contact: "Abizer I.", sdr: "Harini", region: "SG", dur: "0m55s", date: "Apr 21" },
                  ].map((l, i) => (
                    <tr key={i} className="border-b border-emerald-100">
                      <td className="py-1.5 px-2 font-medium">{l.co}</td>
                      <td className="py-1.5 px-2 text-gray-600">{l.contact}</td>
                      <td className="py-1.5 px-2">{l.sdr}</td>
                      <td className="py-1.5 px-2"><Badge text={l.region} variant={l.region === "AU" ? "success" : "default"} /></td>
                      <td className="py-1.5 px-2 font-medium">{l.dur}</td>
                      <td className="py-1.5 px-2 text-gray-500">{l.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Substantive */}
          {isOpen("substantive-list") && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-3">
              <p className="text-xs font-bold text-blue-700 uppercase mb-2">11 Substantive Conversations</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-blue-300">
                    <th className="text-left py-1 px-2 font-semibold">Company</th>
                    <th className="text-left py-1 px-2 font-semibold">Contact</th>
                    <th className="text-left py-1 px-2 font-semibold">SDR</th>
                    <th className="text-left py-1 px-2 font-semibold">Region</th>
                    <th className="text-left py-1 px-2 font-semibold">Duration</th>
                    <th className="text-left py-1 px-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { co: "Ah Fok Media", contact: "Andy Jeremiah Lam", sdr: "Harini", region: "SG", dur: "3m31s", date: "Apr 20" },
                    { co: "GAZILLION MATHTECH PTE LTD", contact: "Khaleelulla Baig", sdr: "Sukriti", region: "Other", dur: "2m37s", date: "Apr 17" },
                    { co: "DataPull Pte", contact: "Sandeep Singh", sdr: "Harini", region: "SG", dur: "2m14s", date: "Apr 16" },
                    { co: "Pixie", contact: "Zalila Rozali", sdr: "Sukriti", region: "MY", dur: "1m43s", date: "Apr 17" },
                    { co: "Fluffy Trading.Co", contact: "Izhan Syafiq", sdr: "Harini", region: "MY", dur: "1m31s", date: "Apr 20" },
                    { co: "Esco Aster", contact: "Colin Chin", sdr: "Harini", region: "SG", dur: "1m26s", date: "Apr 22" },
                    { co: "CHIA", contact: "Chong Chia Chee", sdr: "Harini", region: "MY", dur: "1m20s", date: "Apr 22" },
                    { co: "Shok corporation", contact: "Ashok Mandal", sdr: "Harini", region: "MY", dur: "1m14s", date: "Apr 20" },
                    { co: "Kalat", contact: "Kalat Elus", sdr: "Harini", region: "MY", dur: "1m09s", date: "Apr 21" },
                    { co: "Smittenpixels", contact: "Fiona Sng", sdr: "Harini", region: "SG", dur: "1m00s", date: "Apr 20" },
                    { co: "Display Science", contact: "Tony George", sdr: "Sukriti", region: "SG", dur: "0m37s", date: "Apr 17" },
                  ].map((l, i) => (
                    <tr key={i} className="border-b border-blue-100">
                      <td className="py-1.5 px-2 font-medium">{l.co}</td>
                      <td className="py-1.5 px-2 text-gray-600">{l.contact}</td>
                      <td className="py-1.5 px-2">{l.sdr}</td>
                      <td className="py-1.5 px-2"><Badge text={l.region} variant={l.region === "AU" ? "success" : "default"} /></td>
                      <td className="py-1.5 px-2 font-medium">{l.dur}</td>
                      <td className="py-1.5 px-2 text-gray-500">{l.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Busy/callback */}
          {isOpen("callback-list") && (
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 mb-3">
              <p className="text-xs font-bold text-amber-700 uppercase mb-2">3 Busy / Callback Requests</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-amber-300">
                    <th className="text-left py-1 px-2 font-semibold">Company</th>
                    <th className="text-left py-1 px-2 font-semibold">Contact</th>
                    <th className="text-left py-1 px-2 font-semibold">SDR</th>
                    <th className="text-left py-1 px-2 font-semibold">Region</th>
                    <th className="text-left py-1 px-2 font-semibold">Duration</th>
                    <th className="text-left py-1 px-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { co: "Futurx Creatives", contact: "Then Zhi Wei", sdr: "Harini", region: "SG", dur: "2m25s", date: "Apr 21" },
                    { co: "(unknown SG)", contact: "Jane", sdr: "Harini", region: "SG", dur: "0m29s", date: "Apr 20" },
                    { co: "(unknown SG)", contact: "Shikha", sdr: "Sukriti", region: "SG", dur: "0m28s", date: "Apr 17" },
                  ].map((l, i) => (
                    <tr key={i} className="border-b border-amber-100">
                      <td className="py-1.5 px-2 font-medium">{l.co}</td>
                      <td className="py-1.5 px-2 text-gray-600">{l.contact}</td>
                      <td className="py-1.5 px-2">{l.sdr}</td>
                      <td className="py-1.5 px-2"><Badge text={l.region} variant="default" /></td>
                      <td className="py-1.5 px-2 font-medium">{l.dur}</td>
                      <td className="py-1.5 px-2 text-gray-500">{l.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Identity question */}
          {isOpen("identity-list") && (
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 mb-3">
              <p className="text-xs font-bold text-amber-700 uppercase mb-2">6 Identity Questions - "Who is this / where are you calling from?"</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-amber-300">
                    <th className="text-left py-1 px-2 font-semibold">Company</th>
                    <th className="text-left py-1 px-2 font-semibold">Contact</th>
                    <th className="text-left py-1 px-2 font-semibold">SDR</th>
                    <th className="text-left py-1 px-2 font-semibold">Region</th>
                    <th className="text-left py-1 px-2 font-semibold">Duration</th>
                    <th className="text-left py-1 px-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { co: "GoInbound", contact: "Aravind Kumar Loganathan", sdr: "Harini", region: "SG", dur: "5m04s", date: "Apr 22" },
                    { co: "SW Strategies", contact: "Jose Raymond", sdr: "Harini", region: "SG", dur: "1m12s", date: "Apr 16" },
                    { co: "CanCollective", contact: "Regina Tan", sdr: "Sukriti", region: "SG", dur: "1m02s", date: "Apr 17" },
                    { co: "YoRipe", contact: "Xinyan Fang", sdr: "Harini", region: "SG", dur: "0m52s", date: "Apr 16" },
                    { co: "Driver", contact: "Rishnu Rish", sdr: "Sukriti", region: "MY", dur: "0m35s", date: "Apr 17" },
                    { co: "(unknown AU)", contact: "Jayden", sdr: "Harini", region: "AU", dur: "0m29s", date: "Apr 21" },
                  ].map((l, i) => (
                    <tr key={i} className="border-b border-amber-100">
                      <td className="py-1.5 px-2 font-medium">{l.co}</td>
                      <td className="py-1.5 px-2 text-gray-600">{l.contact}</td>
                      <td className="py-1.5 px-2">{l.sdr}</td>
                      <td className="py-1.5 px-2"><Badge text={l.region} variant={l.region === "AU" ? "success" : "default"} /></td>
                      <td className="py-1.5 px-2 font-medium">{l.dur}</td>
                      <td className="py-1.5 px-2 text-gray-500">{l.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-amber-800 mt-3 italic">Opener needs revision - 6 of 104 answered calls (5.8%) had prospects asking who the SDR was. Consider leading with reason-for-call earlier.</p>
            </div>
          )}
        </div>

        {/* Daily trend */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-600 mb-2">Daily Calling Trend (Apr 18 Sat = 0 dials, Apr 19 Sun = 5 dials)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={callingDaily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="dials" fill={SLATE} name="Dials" radius={[4, 4, 0, 0]} />
              <Bar dataKey="answered" fill={GREEN} name="Answered" radius={[4, 4, 0, 0]} />
              <Bar dataKey="convGt30" fill={AMBER} name="Conv >30s" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By SDR */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">By SDR (click to see region breakdown)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="w-6 py-2 px-2"></th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">SDR</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Dials</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Answered</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Pickup</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Conv {">"}30s</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Conv Rate</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">{">"}2min</th>
                </tr>
              </thead>
              <tbody>
                {sdrData.map((s) => (
                  <>
                    <tr key={s.sdr} onClick={() => toggle(`sdr-${s.sdr}`)} className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer">
                      <td className="py-2 px-2">{sdrRegion[s.sdr as keyof typeof sdrRegion] ? <Chevron open={isOpen(`sdr-${s.sdr}`)} /> : null}</td>
                      <td className="py-2 px-3 font-medium">{s.sdr}</td>
                      <td className="text-right py-2 px-3 font-bold">{s.dials}</td>
                      <td className="text-right py-2 px-3">{s.answered}</td>
                      <td className="text-right py-2 px-3">{s.rate}</td>
                      <td className="text-right py-2 px-3 font-medium">{s.conv}</td>
                      <td className="text-right py-2 px-3 font-medium">{s.convRate}</td>
                      <td className="text-right py-2 px-3">{s.gt2min}</td>
                    </tr>
                    {isOpen(`sdr-${s.sdr}`) && sdrRegion[s.sdr as keyof typeof sdrRegion] && (
                      <DetailPanel key={`sdr-${s.sdr}-detail`}>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">{s.sdr} - Region Breakdown</p>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-gray-300">
                              <th className="text-left py-1 px-2">Region</th>
                              <th className="text-right py-1 px-2">Dials</th>
                              <th className="text-right py-1 px-2">Answered</th>
                              <th className="text-right py-1 px-2">Rate</th>
                              <th className="text-right py-1 px-2">Conv {">"}30s</th>
                              <th className="text-right py-1 px-2">Conv Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sdrRegion[s.sdr as keyof typeof sdrRegion]?.map((r) => (
                              <tr key={r.region} className="border-b border-gray-100">
                                <td className="py-1 px-2">{r.region}</td>
                                <td className="text-right py-1 px-2 font-medium">{r.dials}</td>
                                <td className="text-right py-1 px-2">{r.answered}</td>
                                <td className="text-right py-1 px-2">{r.rate}</td>
                                <td className="text-right py-1 px-2">{r.conv}</td>
                                <td className="text-right py-1 px-2">{r.convRate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </DetailPanel>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* By Region */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">By Region</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Region</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Dials</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Answered</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Pickup Rate</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Failed/Canceled</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Conv {">"}30s</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Conv Rate</th>
                </tr>
              </thead>
              <tbody>
                {regionData.map((r) => (
                  <tr key={r.region} className="border-b border-gray-50">
                    <td className="py-2 px-3 font-medium">{r.region}</td>
                    <td className="text-right py-2 px-3 font-bold">{r.dials}</td>
                    <td className="text-right py-2 px-3">{r.answered}</td>
                    <td className="text-right py-2 px-3">{r.rate}</td>
                    <td className="text-right py-2 px-3 text-red-600">{r.failCancel}</td>
                    <td className="text-right py-2 px-3">{r.conv}</td>
                    <td className="text-right py-2 px-3 font-medium">{r.convRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <Callout type="success">
              <strong>SG + MY drove pickup and conversation rates.</strong> SG 44.9% pickup, 15.0% conv. MY 44.6% pickup, 14.3% conv. AU still best pickup (70.8%) but only 2 conv {">"}30s. Sukriti's MY conv rate (25%) was the single best SDR/region slice.
            </Callout>
          </div>
        </div>
      </Section>

      {/* Calling Hours */}
      <Section title="Optimal Calling Hours" subtitle="Pickup rate by prospect local time. Best hours highlighted.">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={callingHours}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} unit="%" />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="rate" name="Pickup Rate %" radius={[4, 4, 0, 0]}>
              {callingHours.map((entry, i) => (
                <Cell key={i} fill={entry.rate >= 50 ? GREEN : entry.rate >= 35 ? BLUE : SLATE} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
            <p className="text-xs text-emerald-600 font-medium">Best: 12pm</p>
            <p className="text-xl font-bold text-emerald-900">84.6%</p>
            <p className="text-xs text-emerald-500">13 dials (small sample)</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
            <p className="text-xs text-emerald-600 font-medium">Best volume: 3pm</p>
            <p className="text-xl font-bold text-emerald-900">60.9%</p>
            <p className="text-xs text-emerald-500">46 dials, 7 conv</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
            <p className="text-xs text-blue-600 font-medium">Best conv: 3pm</p>
            <p className="text-xl font-bold text-blue-900">15.2%</p>
            <p className="text-xs text-blue-500">7 conv {">"}30s</p>
          </div>
        </div>
      </Section>

      {/* Objections */}
      <Section title="Objection Analysis" subtitle="From 91 transcribed calls (Whisper). Click any row for guidance.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="w-6 py-2 px-2"></th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Objection</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Count</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">By SDR</th>
              </tr>
            </thead>
            <tbody>
              {objections.map((o) => (
                <>
                  <tr key={o.obj} onClick={() => toggle(`obj-${o.obj}`)} className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer">
                    <td className="py-2 px-2"><Chevron open={isOpen(`obj-${o.obj}`)} /></td>
                    <td className="py-2 px-3 font-medium">{o.obj}</td>
                    <td className="text-right py-2 px-3 font-bold">{o.count}</td>
                    <td className="py-2 px-3 text-xs text-gray-500">{o.by}</td>
                  </tr>
                  {isOpen(`obj-${o.obj}`) && (
                    <DetailPanel key={`obj-${o.obj}-detail`}>
                      <p className="text-xs text-gray-600">
                        {o.obj.includes("How did you get") && "Most common objection this week. SDRs should lead with reason-for-call (inbound signup reference if available) before saying their name. 'I am calling because you signed up on Finmo last week' converts better than 'Hi, this is Hannah from Finmo'."}
                        {o.obj.includes("Busy") && "Create a callback queue in HubSpot. Futurx Creatives has been a callback 2 weeks in a row - escalate."}
                        {o.obj === "Not interested" && "Small sample (2). Respect decision, move to nurture."}
                      </p>
                    </DetailPanel>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Classification Mix Visualization */}
      <Section title="Transcript Classification" subtitle="91 transcribed / 104 answered. Headline pickup (44.6%) overstates human contact - 25% of answered calls were voicemail.">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={classifications.map(c => ({ ...c, fill: c.color === "green" ? GREEN : c.color === "red" ? RED : c.color === "amber" ? AMBER : c.color === "blue" ? BLUE : SLATE }))} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" />
            <YAxis dataKey="key" type="category" width={200} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {classifications.map((c, i) => <Cell key={i} fill={c.color === "green" ? GREEN : c.color === "red" ? RED : c.color === "amber" ? AMBER : c.color === "blue" ? BLUE : SLATE} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* Top Conversations */}
      <Section title="Top 15 Conversations (Harini + Sukriti)" subtitle="Longest calls by Leg2 duration. Click any row for snippet + outcome.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="w-6 py-2 px-2"></th>
                <th className="text-center py-2 px-2 font-semibold text-gray-600">#</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company / Contact</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Duration</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">SDR</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Region</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Date</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {topConversations.map((c) => (
                <>
                  <tr key={c.rank} onClick={() => toggle(`conv-${c.rank}`)} className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer">
                    <td className="py-2 px-2"><Chevron open={isOpen(`conv-${c.rank}`)} /></td>
                    <td className="text-center py-2 px-2 font-bold text-gray-400">{c.rank}</td>
                    <td className="py-2 px-3 font-medium">{c.co || "(unknown)"}<span className="text-xs text-gray-500"> - {c.contact || "-"}</span></td>
                    <td className="py-2 px-3 font-bold text-blue-700">{c.duration}</td>
                    <td className="py-2 px-3">{c.sdr}</td>
                    <td className="py-2 px-3"><Badge text={c.region} variant={c.region === "AU" ? "success" : "default"} /></td>
                    <td className="py-2 px-3 text-xs text-gray-500">{c.date}</td>
                    <td className="py-2 px-3"><Badge text={c.outcome} variant={c.outcome.includes("Interested") ? "success" : c.outcome.includes("Rejection") ? "danger" : c.outcome.includes("Busy") || c.outcome.includes("Identity") ? "warning" : "default"} /></td>
                  </tr>
                  {isOpen(`conv-${c.rank}`) && (
                    <DetailPanel key={`conv-${c.rank}-detail`}>
                      <DetailGrid items={[
                        { label: "Platform", value: c.platform },
                        { label: "SDR", value: c.sdr },
                        { label: "Region", value: c.region },
                        { label: "Date", value: c.date },
                      ]} />
                      <p className="mt-2 text-sm text-gray-700 italic">{c.snippet}</p>
                    </DetailPanel>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Upcoming Initiative */}
      <Section title="Upcoming Outbound Initiative (SG / AU / PH / NZ)" subtitle="26 leads in the first batch scored on 5 dimensions: Company Fit, Contact Access, Opportunity Quality, Competitive Position, Outreach Readiness. Analysis dated Apr 19. PH + NZ leads enter the pipeline next.">
        {/* Multi-persona Outreach - current vs future state */}
        <div className="mb-5 rounded-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-base font-bold text-blue-900">Multi-Persona Outreach - Non-Response Escalation</h4>
            <Badge text="NEW" variant="purple" />
          </div>
          <p className="text-sm text-gray-700 mb-4">
            <strong>Today:</strong> all outreach is done by the SDR persona alone. <strong>Going forward:</strong> leads will be worked by multiple personas
            across the company. Every lead starts with SDR - from there, response drives the path. No-response leads escalate to AE outreach, then to
            a Founder-led push for strategic / engaged accounts before being marked as lost.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
            <div className="bg-white rounded-lg p-4 border border-blue-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
                  <p className="text-xs font-bold text-blue-700 uppercase">SDR - First Touch</p>
                </div>
                <Badge text="All 26 leads" variant="default" />
              </div>
              <p className="text-xs text-gray-600 mb-2">SDR runs the standard outbound sequence across SmartReach email + LinkedIn for every lead.</p>
              <p className="text-[11px] text-gray-500"><strong>Goal:</strong> qualify or disqualify based on the prospect response</p>
              <p className="text-[11px] text-gray-500"><strong>Channel:</strong> SmartReach email + LinkedIn CR / message</p>
              <p className="text-[11px] text-gray-500"><strong>Outcome paths:</strong></p>
              <ul className="text-[11px] text-gray-600 list-disc list-inside ml-1 space-y-0.5 mt-1">
                <li><span className="text-emerald-700 font-semibold">Positive reply</span> - book call, hand off to AE</li>
                <li><span className="text-red-700 font-semibold">Negative reply</span> - disqualify, nurture or DNC</li>
                <li><span className="text-amber-700 font-semibold">No response</span> - escalate to Tier 2</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-amber-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold">2</span>
                  <p className="text-xs font-bold text-amber-700 uppercase">AE - Non-Response Bucket</p>
                </div>
                <Badge text="No-response leads" variant="warning" />
              </div>
              <p className="text-xs text-gray-600 mb-2">Leads that don't respond to SDR move into an AE outreach bucket. AE re-opens the conversation with a different voice.</p>
              <p className="text-[11px] text-gray-500"><strong>Goal:</strong> build familiarity, earn a first response</p>
              <p className="text-[11px] text-gray-500"><strong>Angle:</strong> local nuance - regional references, industry-specific pain, AE peer-tone</p>
              <p className="text-[11px] text-gray-500"><strong>Channel:</strong> AE-signed email, LinkedIn, follow-up cadence</p>
              <p className="text-[11px] text-gray-500"><strong>Outcome paths:</strong></p>
              <ul className="text-[11px] text-gray-600 list-disc list-inside ml-1 space-y-0.5 mt-1">
                <li><span className="text-emerald-700 font-semibold">Any response</span> - AE owns discovery</li>
                <li><span className="text-amber-700 font-semibold">Still no response</span> - Tier 3 eligibility check</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-red-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold">3</span>
                  <p className="text-xs font-bold text-red-700 uppercase">Founder - Final Push</p>
                </div>
                <Badge text="Strategic accounts" variant="danger" />
              </div>
              <p className="text-xs text-gray-600 mb-2">Reserved for high-value companies <em>or</em> prospects engaging with content (opens / clicks / profile views) despite silence. Founder runs one last attempt before marking lost.</p>
              <p className="text-[11px] text-gray-500"><strong>Eligibility:</strong> top-score companies + silent-but-engaging contacts</p>
              <p className="text-[11px] text-gray-500"><strong>Angle:</strong> peer-level CFO-to-founder framing, warm intro, personal video</p>
              <p className="text-[11px] text-gray-500"><strong>Channel:</strong> 1:1 LinkedIn, warm intro, personal video, onsite / dinner</p>
              <p className="text-[11px] text-gray-500"><strong>Outcome paths:</strong></p>
              <ul className="text-[11px] text-gray-600 list-disc list-inside ml-1 space-y-0.5 mt-1">
                <li><span className="text-emerald-700 font-semibold">Response</span> - founder hands back to AE</li>
                <li><span className="text-gray-700 font-semibold">No response</span> - mark closed-lost</li>
              </ul>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-blue-800 font-semibold flex-wrap">
            <span>SDR first touch</span>
            <span className="text-blue-400">→</span>
            <span className="text-amber-700">no response</span>
            <span className="text-blue-400">→</span>
            <span>AE local-nuance outreach</span>
            <span className="text-blue-400">→</span>
            <span className="text-amber-700">still no response</span>
            <span className="text-blue-400">→</span>
            <span>Founder final push (strategic / engaging only)</span>
            <span className="text-blue-400">→</span>
            <span className="text-red-700">mark lost</span>
          </div>
        </div>

        {/* Personas & Products positioned */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Target Personas</h4>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-600">Group / Global CFO</td>
                  <td className="py-2 text-right"><Badge text="6" variant="success" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-600">CFO</td>
                  <td className="py-2 text-right"><Badge text="6" variant="success" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-600">Interim CFO / Head of Finance</td>
                  <td className="py-2 text-right"><Badge text="1" variant="warning" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-600">Group Finance Director</td>
                  <td className="py-2 text-right"><Badge text="1" variant="warning" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-600">Financial Controller</td>
                  <td className="py-2 text-right"><Badge text="1" variant="default" /></td>
                </tr>
              </tbody>
            </table>
            <p className="text-[11px] text-gray-500 mt-3 italic">
              CFO-dominant (12 of 15 P1 + P2). Interim CFOs and post-MBO / post-PE CFOs are the strongest trigger events - they own "build / fix finance" mandates.
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Products Positioned</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Badge text="Primary" variant="success" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Cross-Border Payments</p>
                  <p className="text-[11px] text-gray-600">BPO / EOR payroll across PHP / ZAR / COP / VND. Manufacturing supplier payments across MYR / CNY / PKR / JPY.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Badge text="Primary" variant="success" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">FX Management</p>
                  <p className="text-[11px] text-gray-600">Revenue in EUR / USD / GBP vs AUD cost base (CleanSpace, Trajan). ARS volatility on Filta payroll. Fixed-price contract margin protection.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Badge text="Core" variant="purple" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Cash Forecasting / Treasury</p>
                  <p className="text-[11px] text-gray-600">The Finmo core. Multi-entity cash visibility, post-acquisition consolidation (Multigate, Trajan), post-separation treasury standup (Invetech).</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Badge text="Secondary" variant="default" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Multi-entity Consolidation</p>
                  <p className="text-[11px] text-gray-600">M&A-active (Simba, Trajan), multi-HQ (Emapta), group-level reporting (PPC Moulding).</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-medium">Total leads</p>
            <p className="text-2xl font-bold text-gray-900">26</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-100 text-center">
            <p className="text-xs text-red-600 font-medium">P1 - Immediate</p>
            <p className="text-2xl font-bold text-red-900">10</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center">
            <p className="text-xs text-amber-600 font-medium">P2 - Standard</p>
            <p className="text-2xl font-bold text-amber-900">5</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
            <p className="text-xs text-blue-600 font-medium">P3 - Nurture</p>
            <p className="text-2xl font-bold text-blue-900">7</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-medium">P4 - Disqualify</p>
            <p className="text-2xl font-bold text-gray-700">4</p>
          </div>
        </div>

        {/* Top 3 prospects */}
        <h4 className="font-semibold text-gray-800 text-sm mb-3">Top 3 Prospects</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          {[
            { co: "Simba Global", score: 83, contact: "Harry Marfatia, Group CFO", industry: "Textile Manufacturing", countries: "AU / NZ / USA / Asia", why: "Manufacturing in US + Asia, $50M investment + $48M financing, active M&A." },
            { co: "Staff Domain", score: 79, contact: "Ben Rajah, CFO", industry: "BPO", countries: "AU / PH / ZA / UK / US", why: "AU-based BPO, PHP + ZAR payroll, AUD/USD/GBP billing. Multi-currency is core." },
            { co: "Emapta", score: 78, contact: "Chee Kiong Mak, Global CFO", industry: "Outsourcing", countries: "8 countries, 12 currencies", why: "10,000+ staff, SG-based Global CFO (Top 10 SG 2023), 14yr consecutive growth." },
          ].map((p) => (
            <div key={p.co} className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
              <div className="flex items-start justify-between">
                <p className="text-sm font-bold text-emerald-900">{p.co}</p>
                <Badge text={`${p.score}/100`} variant="success" />
              </div>
              <p className="text-xs text-emerald-700 mt-1">{p.contact}</p>
              <p className="text-[11px] text-gray-500 mt-1">{p.industry} - {p.countries}</p>
              <p className="text-xs text-gray-700 mt-2 italic">{p.why}</p>
            </div>
          ))}
        </div>

        {/* Patterns + trigger events */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Callout type="success">
            <strong>Strongest ICP fit:</strong> AU-based BPOs / EORs with offshore operations (Staff Domain, Satellite Office, Filta, Emapta). Multi-currency payroll is core to the business model - most natural Finmo buyers in this batch.
          </Callout>
          <Callout type="info">
            <strong>High-signal trigger events:</strong> Invetech (post-MBO from Fortive), Satellite Office (Interim CFO greenfield build), AP Technologies (PE investment Aug 2023), Multigate (recent NZ + UK acquisitions).
          </Callout>
        </div>

      </Section>
    </div>
  );
}

// ============================================================
// INBOUND TAB
// ============================================================
function InboundTab() {
  const signupFunnel = [
    { stage: "Total Zap Runs", value: 100, color: SLATE },
    { stage: "Junk/Internal", value: 40, color: RED },
    { stage: "Legitimate Signups", value: 59, color: GREEN },
  ];

  const junkBreakdown = [
    { category: "Finmo internal (@finmo.net)", count: 36 },
    { category: "Junk org names (Test/UAT)", count: 3 },
    { category: "Junk org names (Acme/None)", count: 1 },
  ];

  const regionData = [
    { region: "Malaysia", count: 44, quality: "Low" },
    { region: "Australia", count: 7, quality: "High" },
    { region: "Singapore", count: 6, quality: "Medium" },
    { region: "Indonesia", count: 1, quality: "Medium" },
    { region: "Not set", count: 1, quality: "Low" },
  ];

  const referralSources = [
    { source: "Not set", count: 59, pct: 100 },
  ];

  // Inbound signups had 31 contacts with HubSpot deals. We don't have deal-stage breakdown via associations,
  // so show the structural split: contacts with deals vs without. Detailed pipeline info available in MBR dashboard.
  const dealActivity = [
    { bucket: "Contacts with deals", count: 31, note: "53% of legitimate signups have at least one HubSpot deal associated" },
    { bucket: "Contacts without deals", count: 28, note: "Lower-quality personal email signups from Malaysia dominate this bucket" },
    { bucket: "Contacts with meetings", count: 6, note: "Heysara, Euge Holdings, Teel (pre-period), Baropass, Attai Intl, Al Finjan" },
  ];

  // 5 inbound meetings in period: 2 PSP / FI + 3 small MTO. All non-SME.
  const psp_meetings = [
    {
      co: "Rojifi",
      contact: "Moses Onyekaonwu",
      country: "Nigeria",
      ae: "Adlin",
      website: "https://www.rojifi.com/",
      next: "Call done, KYB in progress, dashboard demo next",
      vol: "$10M / month",
      note: "Helps African SMEs + corporations do global payments. Looking to convert USDT/USDC into USD, GBP, EUR. Customers across industries.",
    },
    {
      co: "Cyphalet",
      contact: "Sunday Olanite",
      country: "Nigeria",
      ae: "Justin",
      website: "https://cyphalet.xyz/",
      next: "Call to be scheduled with AE",
      vol: "$5-10M / month",
      note: "Cross-border payments for African businesses (mostly Nigeria) paying suppliers in China, India, US - automobiles, industrial goods, pharma. Internal stablecoin rails, wants Finmo for smooth USD payouts (USD to CN / IN / US, no local-currency support needed).",
    },
  ];

  const mto_meetings = [
    {
      co: "West Sand",
      contact: "Michael Zeng",
      country: "Hong Kong",
      ae: "-",
      website: "https://westsand.au/",
      currencies: "AUD, USD, HKD (EUR optional)",
    },
    {
      co: "Attai International Pty Ltd",
      contact: "Jawid Attai",
      country: "Australia",
      ae: "Sukriti",
      website: "http://www.jahancurrencyexchange.com.au",
      currencies: "AUD",
    },
    {
      co: "Al Finjan Currency Exchange",
      contact: "Amir Mohammad Hamad Abdelkhalig",
      country: "Australia",
      ae: "Harini",
      website: "https://www.alfinjanexchange.com.au/",
      currencies: "AUD",
    },
  ];

  const aeMeetingSummary = [
    { ae: "Adlin Norazman", type: "PSP (Rojifi)", count: 1 },
    { ae: "Justin Chia", type: "PSP (Cyphalet)", count: 1 },
    { ae: "Sukriti", type: "MTO (Attai Intl)", count: 1 },
    { ae: "Harini", type: "MTO (Al Finjan)", count: 1 },
    { ae: "Unassigned", type: "MTO (West Sand)", count: 1 },
  ];

  const callDisposition = [
    { status: "No answer", count: 49, pct: 75 },
    { status: "Connected", count: 16, pct: 25 },
  ];

  const highValueLeads = [
    { co: "Rojifi", why: "PSP, Nigeria. $10M/mo. Stablecoin to USD/GBP/EUR. AE Adlin - KYB in progress.", status: "Hot", hsId: "" },
    { co: "Cyphalet", why: "PSP, Nigeria. $5-10M/mo. Wants Finmo USD payouts to CN/IN/US. AE Justin - call to schedule.", status: "Hot", hsId: "" },
    { co: "Attai International Pty Ltd", why: "MTO, AU. AUD rails. Harini interested call + Sukriti meeting Apr 21.", status: "Hot", hsId: "" },
    { co: "Al Finjan Currency Exchange", why: "MTO, AU. AUD rails. Meeting with Harini Apr 22.", status: "Hot", hsId: "" },
    { co: "West Sand", why: "MTO, HK. AUD + USD + HKD. AE TBD - assign this week.", status: "Warm", hsId: "" },
    { co: "Ah Fok Media", why: "Marketing agency, SG (ICP). Founder Andy Lam. AE Michelle - call May 4. Needs platform UX demo + pricing clarity.", status: "Hot", hsId: "" },
    { co: "DataPull Pte", why: "Market research, SG. Sandeep Singh. 30-45 min session with finance team next.", status: "Warm", hsId: "" },
    { co: "We Are Noodle", why: "Strategy/SaaS, SG. Thomas Budin. Coffee catch-up to reconnect - price-sensitive.", status: "Warm", hsId: "" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Total Signups" value="100" sub="Apr 16-22 zap runs" color="blue" />
        <MetricCard label="Legitimate" value="59" sub="59% of total" trend={{ val: 20, label: "vs prior period" }} color="green" />
        <MetricCard label="Junk Rate" value="40%" sub="40 junk - down from 47% prior" trend={{ val: -7, label: "vs prior" }} color="red" />
        <MetricCard label="Meetings Booked" value="5" sub="2 PSP + 3 MTO - non-SME, AUD-rail heavy" color="purple" />
        <MetricCard label="Contacts Called" value="83%" sub="49/59 - 65 calls, 2.4 per lead" color="cyan" />
      </div>

      {/* Signup Funnel */}
      <Section title="Signup Funnel" subtitle="100 total runs - 59 legitimate signups (59%)">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={signupFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={160} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {signupFunnel.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Personal Email</p>
                <p className="text-xl font-bold text-blue-900">50</p>
                <p className="text-xs text-blue-500">85%</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium">Company Email</p>
                <p className="text-xl font-bold text-emerald-900">9</p>
                <p className="text-xs text-emerald-500">15%</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-amber-600 font-medium">Phone Coverage</p>
                <p className="text-xl font-bold text-amber-900">100%</p>
                <p className="text-xs text-amber-500">59/59 have phone</p>
              </div>
            </div>
            <Callout type="success">
              <strong>Junk rate at 40% - down from 47% prior period.</strong> Dominated by Finmo internal testing (36 of 40). 59 unique legitimate signups (up from 49). 59/59 in HubSpot with 56 new contacts.
            </Callout>
          </div>
        </div>
      </Section>

      {/* Junk Breakdown */}
      <Section title="Junk/Test Breakdown" subtitle="40 of 100 runs (40%). Finmo internal testing is the dominant source.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Category</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Count</th>
              </tr>
            </thead>
            <tbody>
              {junkBreakdown.map((j) => (
                <tr key={j.category} className="border-b border-gray-50">
                  <td className="py-2 px-3">{j.category}</td>
                  <td className="text-right py-2 px-3 font-bold">{j.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Region & Referral */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="By Country" subtitle="59 legitimate signups">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Country</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Count</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Quality</th>
                </tr>
              </thead>
              <tbody>
                {regionData.map((r) => (
                  <tr key={r.region} className="border-b border-gray-50">
                    <td className="py-2 px-3">{r.region}</td>
                    <td className="text-right py-2 px-3 font-bold">{r.count}</td>
                    <td className="py-2 px-3">
                      <Badge text={r.quality} variant={r.quality === "High" ? "success" : r.quality === "Medium" ? "warning" : "danger"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">Malaysia dominates volume (44/59 = 75%). Mostly low-quality gmail/yahoo signups - only 9 company emails total.</p>
        </Section>

        <Section title="Referral Sources" subtitle="Where legitimate signups came from">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={referralSources} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" />
              <YAxis dataKey="source" type="category" width={140} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill={BLUE} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <Callout type="warning">
            <strong>100% of signups this period had no referral source set.</strong> Previous period had 12% AI Search + 8% Other + 8% Online Ads. Signup form field may have regressed - investigate.
          </Callout>
        </Section>
      </div>

      {/* Call Activity on Inbound */}
      <Section title="Inbound Lead Calling Activity" subtitle="65 calls across 49 contacts. 10 contacts (17%) never called.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Call Disposition (65 calls)</h4>
            <div className="flex gap-3 mb-3">
              {callDisposition.map((d) => (
                <div key={d.status} className={`flex-1 rounded-lg p-3 border text-center ${
                  d.status === "Connected" ? "bg-emerald-50 border-emerald-100" :
                  "bg-gray-50 border-gray-200"
                }`}>
                  <p className="text-xs text-gray-600 font-medium">{d.status}</p>
                  <p className="text-xl font-bold">{d.count}</p>
                  <p className="text-xs text-gray-500">{d.pct}%</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Activity Stats</h4>
            <StatRow label="Contacts called" value="49 / 59 (83%)" />
            <StatRow label="Avg calls per lead" value="1.3" />
            <StatRow label="Contacts never called" value="10 (17%)" />
            <StatRow label="Best call: Jawid Attai" value="2m13s" highlight />
          </div>
        </div>
        <Callout type="success">
          <strong>83% of inbound leads called</strong> with 1.3 calls per lead. Same coverage as prior period (82%). Connection rate 25% - comparable.
        </Callout>
      </Section>

      {/* Deal Activity */}
      <Section title="Deal Activity" subtitle="31 of 59 legitimate signups (53%) have associated HubSpot deals. 6 contacts met.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {dealActivity.map((d) => (
            <div key={d.bucket} className={`rounded-lg p-4 border ${
              d.bucket.includes("with deals") ? "bg-emerald-50 border-emerald-100" :
              d.bucket.includes("meetings") ? "bg-blue-50 border-blue-100" :
              "bg-gray-50 border-gray-200"
            }`}>
              <p className="text-xs font-medium text-gray-600">{d.bucket}</p>
              <p className="text-2xl font-bold text-gray-900">{d.count}</p>
              <p className="text-xs text-gray-500 mt-1">{d.note}</p>
            </div>
          ))}
        </div>
        <Callout type="info">
          <strong>28 contacts (47%) have zero deals</strong> - largely low-quality personal email signups from Malaysia. Malaysia dominates volume (75%) but converts poorly to meetings. Quality-by-geo tracking is the single biggest improvement lever.
        </Callout>
      </Section>

      {/* Meetings */}
      <Section title="Meetings Booked from Inbound" subtitle="5 meetings - 2 PSP / FI + 3 small MTO. All non-SME. AUD-rail demand dominates MTO segment.">
        <div className="overflow-x-auto mb-6">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">Financial Institutions / PSP (2)</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="w-6 py-2 px-2"></th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Contact</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Country</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">AE</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Volume</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Next Step</th>
              </tr>
            </thead>
            <tbody>
              {psp_meetings.map((m) => (
                <>
                  <tr key={m.co} className="border-b border-gray-50">
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-3 font-medium">
                      <a href={m.website} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                        {m.co} <span className="text-[10px] text-blue-400">&#8599;</span>
                      </a>
                    </td>
                    <td className="py-2 px-3 text-xs">{m.contact}</td>
                    <td className="py-2 px-3 text-xs"><Badge text={m.country} variant="default" /></td>
                    <td className="py-2 px-3 text-xs">{m.ae}</td>
                    <td className="py-2 px-3 text-xs font-semibold text-emerald-700">{m.vol}</td>
                    <td className="py-2 px-3 text-xs text-gray-500">{m.next}</td>
                  </tr>
                  <tr key={`${m.co}-note`} className="border-b border-gray-100 bg-gray-50/50">
                    <td colSpan={7} className="py-1.5 px-3 text-xs text-gray-600 italic">{m.note}</td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto mb-6">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">Small Money Transfer Operators (3)</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Contact</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Country</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">AE</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Currencies</th>
              </tr>
            </thead>
            <tbody>
              {mto_meetings.map((m) => (
                <tr key={m.co} className="border-b border-gray-50">
                  <td className="py-2 px-3 font-medium">
                    <a href={m.website} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                      {m.co} <span className="text-[10px] text-blue-400">&#8599;</span>
                    </a>
                  </td>
                  <td className="py-2 px-3 text-xs">{m.contact}</td>
                  <td className="py-2 px-3 text-xs"><Badge text={m.country} variant={m.country === "Australia" ? "success" : "default"} /></td>
                  <td className="py-2 px-3 text-xs">{m.ae}</td>
                  <td className="py-2 px-3 text-xs font-semibold">{m.currencies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout type="warning">
          <strong>Segment drift vs ICP.</strong> Outbound ICP this period is SG marketing agencies (SMEs). Inbound meetings are all non-SME - 2 African PSPs doing stablecoin-to-fiat, 3 small AUD-focused MTOs. Worth deciding if this is a segment to lean into (productize AUD-rail MTO) or filter out.
        </Callout>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          {aeMeetingSummary.map((s) => (
            <div key={s.ae} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-sm font-bold text-blue-900">{s.ae}</p>
              <p className="text-xs text-blue-600 mt-1">{s.type}</p>
              <p className="text-lg font-bold text-blue-900 mt-1">{s.count}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Active Inbound Signal - segment trend */}
      <Section title="Active Inbound Signal: AUD Rails Wave" subtitle="3 of 5 inbound meetings are small MTOs asking specifically for AUD rails - emerging segment">
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-amber-900">Small MTO / AUD-rails cluster</p>
                <Badge text="SEGMENT" variant="warning" />
              </div>
              <p className="text-sm text-amber-700 mt-0.5">West Sand (HK) + Attai International (AU) + Al Finjan Exchange (AU)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-xs">
            <div><p className="text-gray-500">Volume</p><p className="font-semibold">3 meetings / same week</p></div>
            <div><p className="text-gray-500">Shared ask</p><p className="font-semibold">AUD rails (USD / HKD secondary)</p></div>
            <div><p className="text-gray-500">AEs</p><p className="font-semibold">Sukriti (Attai), Harini (Al Finjan), TBD (West Sand)</p></div>
            <div><p className="text-gray-500">Channel</p><p className="font-semibold">All inbound website signups</p></div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-amber-200 mb-3">
            <p className="text-xs font-bold text-gray-600 uppercase mb-1">What each asked for</p>
            <div className="space-y-1 text-xs text-gray-700">
              <p><span className="text-gray-400">West Sand</span> - HK MTO, wants AUD + USD + HKD (EUR optional)</p>
              <p><span className="text-gray-400">Attai International</span> - AU (Jahan Currency Exchange), AUD-only</p>
              <p><span className="text-gray-400">Al Finjan Currency Exchange</span> - AU, AUD-only</p>
            </div>
          </div>
          <Callout type="warning">
            <strong>Decision point.</strong> Three small MTOs in one week all asking for AUD rails is not coincidence. Either (a) productize the MTO + AUD play - sales motion, packaging, KYB-light track - or (b) filter at signup and route to partners. Current state: each handled bespoke by different AEs.
          </Callout>
        </div>

        <div className="mt-4 rounded-lg border-2 border-emerald-300 bg-emerald-50 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-emerald-900">PSP / FI opportunities: Rojifi + Cyphalet</p>
                <Badge text="$15M+ / MONTH" variant="success" />
              </div>
              <p className="text-sm text-emerald-700 mt-0.5">2 Nigerian PSPs - stablecoin-to-fiat + USD payouts</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-emerald-200">
            <p className="text-xs text-gray-700"><strong>Rojifi</strong> - $10M/mo, stablecoin (USDT/USDC) to USD/GBP/EUR. AE: Adlin. Status: KYB in progress, dashboard demo next.</p>
            <p className="text-xs text-gray-700 mt-1"><strong>Cyphalet</strong> - $5-10M/mo, wants Finmo USD payouts to CN / IN / US (no local currency needed). AE: Justin. Status: AE call to be scheduled.</p>
          </div>
        </div>
      </Section>

      {/* High-Value Leads */}
      <Section title="High-Value Leads to Watch" subtitle="Prioritized by meeting status, volume, and follow-up maturity">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Why</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {highValueLeads.map((l) => (
                <tr key={l.co} className="border-b border-gray-50">
                  <td className="py-2 px-3 font-medium">{l.co}</td>
                  <td className="py-2 px-3 text-xs text-gray-600">{l.why}</td>
                  <td className="py-2 px-3">
                    <Badge text={l.status} variant={l.status === "Hot" ? "danger" : l.status === "Won" ? "success" : "warning"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Key Observations */}
      <Section title="Key Observations">
        <div className="space-y-3">
          {[
            { num: "1", text: "5 inbound meetings booked - 2 PSP / FI ($15M+/mo combined volume) + 3 small MTOs. Zero SME meetings from inbound this period." },
            { num: "2", text: "3 of 5 inbound meetings are MTOs asking specifically for AUD rails (West Sand, Attai International, Al Finjan). Not a coincidence - treat as segment signal." },
            { num: "3", text: "Junk rate 40% (down from 47% prior). 36 of 40 junk records are @finmo.net internal - structural, not campaign-related." },
            { num: "4", text: "59 unique legit signups - up 20% vs April 1-15 (49). 100% in HubSpot. 95% are new contacts." },
            { num: "5", text: "Malaysia dominates signup volume (75%) but converts poorly - 0 meetings from MY signups. 9 company-email signups across the whole period." },
            { num: "6", text: "Referral source = 'Not set' for 100% of signups this period. Previous period had 12% AI Search. Signup form regression to investigate." },
            { num: "7", text: "AE coverage spread across 5 people (Adlin, Justin, Sukriti, Harini, + West Sand unassigned). West Sand needs an AE assigned." },
          ].map((o) => (
            <div key={o.num} className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex-shrink-0">{o.num}</span>
              <p className="text-sm text-gray-700">{o.text}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ============================================================
// SOLUTIONS TAB (PLACEHOLDER)
// ============================================================
function SolutionsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Solutions Data Not Yet Available</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          The Solutions report is generated separately and will be added to this dashboard once available.
          This section will include presales pipeline, solutioning status, implementation progress, and Go-Live tracking.
        </p>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {["Presales Pipeline", "Solutioning Status", "Implementation Progress", "Go-Live Tracking"].map((s) => (
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
// MAIN DASHBOARD
// ============================================================
export default function BDWeeklyApr16_22() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["Outbound", "Inbound", "Solutions"];
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
                <h1 className="text-xl font-bold text-gray-900">BD Weekly Report</h1>
                <p className="text-sm text-gray-500">April 16-22, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">Generated: April 22, 2026</span>
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
        {activeTab === 0 && <OutboundTab />}
        {activeTab === 1 && <InboundTab />}
        {activeTab === 2 && <SolutionsTab />}
      </div>
    </div>
  );
}
