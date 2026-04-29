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
// Period: April 23-29, 2026
// Data sources: SmartReach dashboard (Apr 23-29 custom range), Twilio + Exotel
// (live API pull with details=true), 131 recordings transcribed via Whisper
// ============================================================
function OutboundTab() {
  const { toggle, isOpen } = useExpandableRows();

  // Funnel
  const funnelSteps = [
    { stage: "Prospects in Campaigns", value: 1100, color: SLATE },
    { stage: "Prospects Contacted", value: 566, color: BLUE },
    { stage: "Email Opens (~est)", value: 231, color: CYAN },
    { stage: "Call Conversations >30s", value: 52, color: AMBER },
    { stage: "Prospect Replies (~est)", value: 4, color: RED },
    { stage: "Call Conversations >2min", value: 4, color: GREEN },
  ];

  // LinkedIn breakdown (from screenshot)
  const linkedInPie = [
    { name: "Profile Visits", value: 247, color: BLUE },
    { name: "Connection Requests", value: 190, color: GREEN },
    { name: "Messages", value: 78, color: PINK },
  ];

  // Daily email sent (from SmartReach dashboard screenshot)
  const emailDaily = [
    { date: "Apr 23", emails: 105 },
    { date: "Apr 24", emails: 60 },
    { date: "Apr 25", emails: 0 },
    { date: "Apr 26", emails: 0 },
    { date: "Apr 27", emails: 195 },
    { date: "Apr 28", emails: 115 },
    { date: "Apr 29", emails: 35 },
  ];

  // Daily calling (Twilio + Exotel, live API pull)
  const callingDaily = [
    { date: "Apr 23", dials: 33, answered: 20, convGt30: 10, rate: 61 },
    { date: "Apr 24", dials: 31, answered: 16, convGt30: 8, rate: 52 },
    { date: "Apr 27", dials: 111, answered: 48, convGt30: 18, rate: 43 },
    { date: "Apr 28", dials: 103, answered: 33, convGt30: 3, rate: 32 },
    { date: "Apr 29", dials: 85, answered: 36, convGt30: 13, rate: 42 },
  ];

  // Calling hours (prospect local time)
  const callingHours = [
    { hour: "8am", dials: 15, rate: 60.0, conv: 5 },
    { hour: "9am", dials: 17, rate: 47.1, conv: 6 },
    { hour: "10am", dials: 30, rate: 36.7, conv: 4 },
    { hour: "11am", dials: 51, rate: 43.1, conv: 7 },
    { hour: "12pm", dials: 23, rate: 34.8, conv: 4 },
    { hour: "1pm", dials: 21, rate: 61.9, conv: 7 },
    { hour: "2pm", dials: 33, rate: 30.3, conv: 4 },
    { hour: "3pm", dials: 48, rate: 39.6, conv: 8 },
    { hour: "4pm", dials: 39, rate: 46.2, conv: 4 },
    { hour: "5pm", dials: 47, rate: 44.7, conv: 3 },
  ];

  // Region
  const regionData = [
    { region: "SG", dials: 198, answered: 73, rate: "36.9%", failCancel: 70, conv: 28, convRate: "14.1%" },
    { region: "Other", dials: 66, answered: 29, rate: "43.9%", failCancel: 23, conv: 11, convRate: "16.7%" },
    { region: "MY", dials: 44, answered: 23, rate: "52.3%", failCancel: 3, conv: 5, convRate: "11.4%" },
    { region: "AU", dials: 22, answered: 13, rate: "59.1%", failCancel: 7, conv: 4, convRate: "18.2%" },
    { region: "ID", dials: 12, answered: 4, rate: "33.3%", failCancel: 4, conv: 1, convRate: "8.3%" },
    { region: "PH", dials: 9, answered: 4, rate: "44.4%", failCancel: 3, conv: 1, convRate: "11.1%" },
    { region: "VN", dials: 6, answered: 3, rate: "50.0%", failCancel: 2, conv: 1, convRate: "16.7%" },
    { region: "ZA", dials: 4, answered: 3, rate: "75.0%", failCancel: 1, conv: 1, convRate: "25.0%" },
    { region: "UK", dials: 2, answered: 1, rate: "50.0%", failCancel: 1, conv: 0, convRate: "0.0%" },
  ];

  // SDR (attributed only)
  const sdrData = [
    { sdr: "Harini", dials: 218, answered: 101, rate: "46.3%", conv: 40, convRate: "18.3%", gt2min: 4 },
    { sdr: "Sukriti", dials: 143, answered: 51, rate: "35.7%", conv: 12, convRate: "8.4%", gt2min: 0 },
  ];

  // SDR x Region
  const sdrRegion = {
    Harini: [
      { region: "SG", dials: 120, answered: 48, rate: "40%", conv: 22, convRate: "18%" },
      { region: "Other", dials: 30, answered: 19, rate: "63%", conv: 9, convRate: "30%" },
      { region: "MY", dials: 30, answered: 15, rate: "50%", conv: 3, convRate: "10%" },
      { region: "AU", dials: 17, answered: 9, rate: "53%", conv: 3, convRate: "18%" },
      { region: "PH", dials: 6, answered: 2, rate: "33%", conv: 1, convRate: "17%" },
      { region: "ID", dials: 6, answered: 3, rate: "50%", conv: 0, convRate: "0%" },
      { region: "VN", dials: 4, answered: 2, rate: "50%", conv: 1, convRate: "25%" },
      { region: "ZA", dials: 3, answered: 2, rate: "67%", conv: 1, convRate: "33%" },
      { region: "UK", dials: 2, answered: 1, rate: "50%", conv: 0, convRate: "0%" },
    ],
    Sukriti: [
      { region: "SG", dials: 78, answered: 25, rate: "32%", conv: 6, convRate: "8%" },
      { region: "Other", dials: 35, answered: 10, rate: "29%", conv: 2, convRate: "6%" },
      { region: "MY", dials: 14, answered: 8, rate: "57%", conv: 2, convRate: "14%" },
      { region: "ID", dials: 6, answered: 1, rate: "17%", conv: 1, convRate: "17%" },
      { region: "AU", dials: 4, answered: 3, rate: "75%", conv: 1, convRate: "25%" },
      { region: "PH", dials: 3, answered: 2, rate: "67%", conv: 0, convRate: "0%" },
      { region: "VN", dials: 2, answered: 1, rate: "50%", conv: 0, convRate: "0%" },
      { region: "ZA", dials: 1, answered: 1, rate: "100%", conv: 0, convRate: "0%" },
    ],
  };

  // Objections (from transcript classification on 131 transcribed calls)
  const objections = [
    { obj: "Busy / callback requested", count: 9, by: "Harini: 7, Sukriti: 2" },
    { obj: "How did you get my number / who is this?", count: 7, by: "Harini: 3, Sukriti: 4" },
    { obj: "Not interested", count: 3, by: "Harini: 2, Sukriti: 1" },
    { obj: "Send me an email", count: 2, by: "Harini: 1, Sukriti: 1" },
    { obj: "Wrong number / wrong person", count: 2, by: "Harini: 2" },
  ];

  // Top conversations (from calls.json top_calls + transcript classification - Apr 23-29)
  // Excludes calls with no HubSpot match (the 2 unknown long calls have been moved to a "follow-up needed" note below).
  const topConversations = [
    { rank: 1, duration: "7m26s", sdr: "Harini", region: "MY", date: "Apr 27", co: "MDHR Legacy", contact: "Muhammad Danial Haikal Rosazri", platform: "Exotel", outcome: "Interested - inbound", snippet: "Saw your sign up on website. Dairy / lower-cholesterol milk products. Already cross-border to ID/TH/KH, expanding to India. Asked about pricing. AE call set up with Adlin." },
    { rank: 2, duration: "2m55s", sdr: "Harini", region: "AU", date: "Apr 23", co: "ELRC Trading Pty Ltd", contact: "Eric Chen", platform: "Twilio", outcome: "Identity question - inbound", snippet: "AU remittance + crypto on/off-ramp. ~$15M AUD/mo, 100-150 transactions. Eric initially asked who was calling, then engaged. KYB next." },
    { rank: 3, duration: "2m05s", sdr: "Harini", region: "SG", date: "Apr 23", co: "Colorfull Store", contact: "Sophia Ho", platform: "Exotel", outcome: "Busy / callback", snippet: "Sophia asked Harini to call back an hour later, then took the second call - 2m05s on the callback." },
    { rank: 4, duration: "1m53s", sdr: "Sukriti", region: "AU", date: "Apr 27", co: "Create 3D Printing Solutions", contact: "Caleb Hilder", platform: "Twilio", outcome: "Rejection", snippet: "Caleb signed up but then declined politely on the call." },
    { rank: 5, duration: "1m49s", sdr: "Harini", region: "AU", date: "Apr 23", co: "Australian Gold Capital Pty Ltd", contact: "Michael Kukulka", platform: "Twilio", outcome: "Interested - inbound", snippet: "Precious metals bullion (gold/silver/platinum/palladium). 2.5-3.5k bank txns/mo. Wants payments platform with API + Reckon integration. Mostly AUD; 1 SG partner. AE call done, KYB + demo next." },
    { rank: 6, duration: "1m40s", sdr: "Harini", region: "SG", date: "Apr 24", co: "PRCA Global", contact: "Ed Burleigh", platform: "Exotel", outcome: "Substantive", snippet: "Engaged conversation about Finmo." },
    { rank: 7, duration: "1m33s", sdr: "Harini", region: "SG", date: "Apr 23", co: "Iab Sea+India", contact: "Miranda Dimopoulos", platform: "Exotel", outcome: "Identity question", snippet: "Miranda asked where Harini was calling from before engaging." },
    { rank: 8, duration: "1m21s", sdr: "Harini", region: "SG", date: "Apr 27", co: "The DFRNT Agency", contact: "Sharlyn Seet", platform: "Exotel", outcome: "Substantive", snippet: "Sharlene engaged for ~80s on the Finmo pitch." },
    { rank: 9, duration: "1m21s", sdr: "Harini", region: "SG", date: "Apr 29", co: "Olief", contact: "Tinaga Angkasa", platform: "Exotel", outcome: "Rejection", snippet: "Tinaga declined politely." },
    { rank: 10, duration: "1m20s", sdr: "Harini", region: "SG", date: "Apr 29", co: "MyagenC", contact: "Norah Zhang", platform: "Exotel", outcome: "Substantive", snippet: "Nora engaged in extended dialogue." },
    { rank: 11, duration: "1m18s", sdr: "Harini", region: "Other", date: "Apr 24", co: "Cyphalet Inc", contact: "Sunday Olanite", platform: "Exotel", outcome: "Follow-up - prior period inbound", snippet: "Follow-up from last week's PSP meeting. Sunday is the Cyphalet contact - $5-10M/mo USD payouts to CN / IN / US." },
    { rank: 12, duration: "1m17s", sdr: "Harini", region: "SG", date: "Apr 29", co: "NEIV", contact: "Sidharth Bhadani", platform: "Exotel", outcome: "Substantive", snippet: "Siddharth engaged for the pitch." },
    { rank: 13, duration: "1m16s", sdr: "Harini", region: "SG", date: "Apr 29", co: "Creo Farm", contact: "Kang Shiqiang", platform: "Exotel", outcome: "Interested", snippet: "Kang signed up on website. Engaged in conversation." },
    { rank: 14, duration: "1m08s", sdr: "Harini", region: "SG", date: "Apr 29", co: "Trampolene", contact: "Tan Francis", platform: "Exotel", outcome: "Substantive", snippet: "Tom Francis engaged for the pitch." },
    { rank: 15, duration: "1m05s", sdr: "Harini", region: "SG", date: "Apr 27", co: "Singapore Institute of Manufacturing Technology", contact: "David Low", platform: "Exotel", outcome: "Substantive", snippet: "David engaged for ~65s, asked Harini to be quick." },
  ];

  // Outbound meetings - 0 booked from outbound campaigns this week
  // (STRATAGILE / CrossXpay was inbound-sourced and lives in the Inbound tab)
  const outboundMeetings: { name: string; co: string; sdr: string; ae: string; type: string; date: string; website: string; icp: boolean; note: string }[] = [];

  // Classification mix from 131 transcribed answered calls (Apr 23-29)
  const classifications = [
    { key: "Voicemail / IVR", count: 36, color: "gray" },
    { key: "Other / unclear", count: 26, color: "gray" },
    { key: "Substantive conversation", count: 18, color: "blue" },
    { key: "Brief human contact", count: 14, color: "gray" },
    { key: "Busy / callback", count: 9, color: "amber" },
    { key: "Identity question (who is this?)", count: 7, color: "amber" },
    { key: "Interested conversation", count: 6, color: "green" },
    { key: "Conversation (other)", count: 5, color: "blue" },
    { key: "Foreign language voicemail", count: 3, color: "gray" },
    { key: "Rejection", count: 3, color: "red" },
    { key: "Send email", count: 2, color: "amber" },
    { key: "Wrong number", count: 2, color: "gray" },
  ];

  // Team Leaderboard from SmartReach (Apr 23-29) - rendered in the section below
  const teamLeaderboard = [
    { rank: 1, name: "Sukriti Chopra", role: "SDR", campaigns: 2, prospects: 410 },
    { rank: 2, name: "Harini Kaliyamoorthi", role: "SDR", campaigns: 2, prospects: 61 },
    { rank: 3, name: "Michelle Ling", role: "AE", campaigns: 1, prospects: 28 },
    { rank: 4, name: "Gibson Saw", role: "AE", campaigns: 1, prospects: 25 },
    { rank: 5, name: "Elross Pangue", role: "AE", campaigns: 1, prospects: 22 },
    { rank: 6, name: "Nouvelle Nye", role: "AE", campaigns: 1, prospects: 20 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Prospects Contacted" value="566" trend={{ val: 50, label: "vs prior" }} color="blue" />
        <MetricCard label="Emails Sent" value="513" sub="398 prospects, 58% open, 1% reply" color="blue" />
        <MetricCard label="LinkedIn Actions" value="515" sub="247 visits, 190 requests, 78 messages" color="purple" />
        <MetricCard label="Total Calls" value="363" sub="Harini: 218, Sukriti: 143" color="green" />
        <MetricCard label="Meetings (outbound)" value="0" sub="No outbound-sourced meetings this week" color="amber" />
      </div>

      {/* ICP banner */}
      <Callout type="info">
        <strong>ICP this period:</strong> marketing agencies in SG / AU / PH / Other (SMEs). <strong>0 outbound meetings booked this week.</strong> The Lead Gen 3.0 campaigns went live Apr 26 and are still in their early days - measure conversion in the next 2-3 weeks. All 6 meetings this week came from inbound - see the Inbound tab.
      </Callout>

      {/* Meetings from Outbound */}
      <Section title="Meetings Booked from Outbound" subtitle="0 meetings booked from outbound campaigns this week.">
        <Callout type="info">
          <strong>No outbound-sourced meetings this week.</strong> The Lead Gen 3.0 campaigns launched Apr 26 (3 days into this period). Sequence is built for 35-42 days, so first AE / Founder-driven conversions are expected in the May 5-15 window. Watch acceptance rates and reply quality in the New Outbound Initiative section below.
        </Callout>
        {outboundMeetings.length > 0 && <div className="overflow-x-auto mt-4">
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
                        { label: "AE", value: m.ae },
                        { label: "Sessions", value: m.date },
                        { label: "Website", value: m.website || "(not listed)" },
                        { label: "Next step", value: m.type },
                      ]} />
                      <p className="mt-2 text-sm text-gray-700 italic">{m.note}</p>
                    </DetailPanel>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>}
      </Section>

      {/* Outreach Funnel */}
      <Section title="Outreach Funnel" subtitle="~1,100 prospects in campaigns - 566 contacted this period (up 50% vs prior)">
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
                <p className="text-xl font-bold text-blue-900">58%</p>
                <p className="text-xs text-blue-500">Up from 51% prior</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-xs text-red-600 font-medium">Email Reply Rate</p>
                <p className="text-xl font-bold text-red-900">1%</p>
                <p className="text-xs text-red-500">~4 replies est. (sentiment TBD)</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium">Call Conv Rate</p>
                <p className="text-xl font-bold text-emerald-900">14.3%</p>
                <p className="text-xs text-emerald-500">52 conversations {">"}30s - up from 12.0%</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-amber-600 font-medium">Call Pickup Rate</p>
                <p className="text-xl font-bold text-amber-900">42.1%</p>
                <p className="text-xs text-amber-500">Down slightly from 44.6%</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Email + LinkedIn Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Email Performance" subtitle="513 emails to 398 prospects via SmartReach">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Open Rate</p>
              <p className="text-2xl font-bold text-emerald-600">58%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Reply Rate</p>
              <p className="text-2xl font-bold text-red-600">1%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Positive Replies</p>
              <p className="text-2xl font-bold text-red-600">0%</p>
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
            <strong>Open rate climbed 7pts (51% to 58%).</strong> Subject lines are working better. Reply rate still 1% and 0% positive - body copy needs a new angle.
          </Callout>
        </Section>

        <Section title="LinkedIn Performance" subtitle="515 actions - 20% connection rate, 0 replies recorded this period">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Connection Rate</p>
              <p className="text-2xl font-bold text-emerald-600">20%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Reply Rate</p>
              <p className="text-2xl font-bold text-red-600">0%</p>
              <p className="text-[10px] text-gray-500">0 LinkedIn replies in period</p>
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
            <strong>LinkedIn volume up 62% (318 to 515 actions).</strong> Big jump driven by 4 new AE-led campaigns (Elross, Gibson, Michelle, Nouvelle) running in parallel. Connection rate 20% - similar to prior. Zero LinkedIn replies recorded this period - watch this.
          </Callout>
        </Section>
      </div>

      {/* Team Leaderboard */}
      <Section title="Team Leaderboard" subtitle="Per-team-member SmartReach activity this period. SDR campaigns dominate volume; AE campaigns are smaller but newly launched.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Rank</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Name</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Role</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Sent campaigns</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Prospects contacted</th>
              </tr>
            </thead>
            <tbody>
              {teamLeaderboard.map((t) => (
                <tr key={t.name} className="border-b border-gray-50">
                  <td className="py-2 px-3 font-bold text-gray-400">{t.rank}</td>
                  <td className="py-2 px-3 font-medium">{t.name}</td>
                  <td className="py-2 px-3"><Badge text={t.role} variant={t.role === "SDR" ? "default" : "warning"} /></td>
                  <td className="text-right py-2 px-3">{t.campaigns}</td>
                  <td className="text-right py-2 px-3 font-bold">{t.prospects}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout type="info">
          <strong>Sukriti carrying 72% of SDR volume</strong> (410 of 471 SDR-attributed prospects). 4 AE campaigns combined = 95 prospects (17% of total). The multi-persona model is now distributing work, but SDR remains the volume engine.
        </Callout>
      </Section>

      {/* Feedback from Outbound Calls */}
      <Section title="Feedback from Outbound Calls" subtitle="7 verbatim prospect responses captured from outbound calls this period. Pattern: 4 of 7 are 'no time / not now', 1 is 'no pain', 1 is a pitch-back, 1 is off-topic. Zero positive signals.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center">
            <p className="text-2xl font-bold text-amber-800">4</p>
            <p className="text-xs font-medium text-amber-600">No time / not now</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-100 text-center">
            <p className="text-2xl font-bold text-red-800">2</p>
            <p className="text-xs font-medium text-red-600">No pain / not relevant</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-700">1</p>
            <p className="text-xs font-medium text-gray-500">Pitch-back / off-topic</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">HubSpot contact</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Quote</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Read</th>
              </tr>
            </thead>
            <tbody>
              {[
                { hsId: "457029405379", quote: "My vision goes out to infinity. Cash will hold forever. Doesn\'t require guts.", read: "Off-topic / philosophical decline", variant: "default" as const },
                { hsId: "443182799570", quote: "Have two people in finance, uses Xero for accounting. Everything is smooth.", read: "No pain - happy with current stack", variant: "danger" as const },
                { hsId: "94576446549", quote: "Thanks for reaching out Harini. This is not relevant to me but I can find you new clients on LinkedIn. Please let me know if you would be interested in using our highly recommended LinkedIn Marketing services.", read: "Pitch-back - prospect selling to us", variant: "default" as const },
                { hsId: "457015583446", quote: "Unfortunately, I really don\'t have the time to prepare. It\'s a really small team.", read: "No time / capacity", variant: "warning" as const },
                { hsId: "457029392060", quote: "Thank you so much for the invite, but I\'m not so interested.", read: "Polite not-interested", variant: "warning" as const },
                { hsId: "457015414520", quote: "At this moment, we are not looking into that. I would not be interested to explore that at the moment.", read: "Not now", variant: "warning" as const },
                { hsId: "457027844797", quote: "I don\'t think I have the time. Really, thank you for the offer.", read: "No time / capacity", variant: "warning" as const },
              ].map((r) => (
                <tr key={r.hsId} className="border-b border-gray-50">
                  <td className="py-2 px-3 font-medium">
                    <a
                      href={`https://app-na2.hubspot.com/contacts/20889024/record/0-1/${r.hsId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline"
                    >
                      {r.hsId} <span className="text-[10px] text-blue-400">&#8599;</span>
                    </a>
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-700 italic">"{r.quote}"</td>
                  <td className="py-2 px-3"><Badge text={r.read} variant={r.variant} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout type="warning">
          <strong>"No time / not now" is the dominant signal (4 of 7).</strong> Reads like opener-fatigue or wrong-context interruption rather than wrong-fit. Worth testing a permission-based opener ("got 30 seconds?") or async outreach (LinkedIn / WhatsApp) for these cohorts.
        </Callout>
      </Section>

      {/* Call Performance */}
      <Section title="Call Performance" subtitle="361 attributed dials (Harini: 218, Sukriti: 143), Apr 23-29. 131 calls transcribed via Whisper. Click SDR rows to see region breakdown.">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
            <p className="text-xs text-emerald-600 font-medium">Customer Answered</p>
            <p className="text-xl font-bold text-emerald-900">153</p>
            <p className="text-xs text-emerald-500">42.1%</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
            <p className="text-xs text-blue-600 font-medium">Conv {">"}30s</p>
            <p className="text-xl font-bold text-blue-900">52</p>
            <p className="text-xs text-blue-500">14.3%</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center">
            <p className="text-xs text-amber-600 font-medium">Conv {">"}2min</p>
            <p className="text-xl font-bold text-amber-900">4</p>
            <p className="text-xs text-amber-500">1.1%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-medium">No Answer</p>
            <p className="text-xl font-bold text-gray-700">83</p>
            <p className="text-xs text-gray-500">22.9%</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-100 text-center">
            <p className="text-xs text-red-600 font-medium">Failed / Canceled</p>
            <p className="text-xl font-bold text-red-900">114</p>
            <p className="text-xs text-red-500">31.4% - Leg2 not reached</p>
          </div>
        </div>

        {/* What happened on connected calls */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">What Happened on Connected Calls (153 answered, 131 transcribed via Whisper)</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
            <div onClick={() => toggle("interested-list")} className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center cursor-pointer hover:shadow-md transition-shadow">
              <p className="text-xs text-emerald-600 font-medium">Interested</p>
              <p className="text-xl font-bold text-emerald-900">6</p>
              <p className="text-xs text-emerald-500">Asked questions</p>
              <p className="text-[10px] text-gray-400 mt-1">Click to expand</p>
            </div>
            <div onClick={() => toggle("substantive-list")} className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center cursor-pointer hover:shadow-md transition-shadow">
              <p className="text-xs text-blue-600 font-medium">Substantive</p>
              <p className="text-xl font-bold text-blue-900">18</p>
              <p className="text-xs text-blue-500">Extended dialogue</p>
              <p className="text-[10px] text-gray-400 mt-1">Click to expand</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
              <p className="text-xs text-gray-500 font-medium">Voicemail / IVR</p>
              <p className="text-xl font-bold text-gray-700">39</p>
              <p className="text-xs text-gray-500">25% of answered</p>
            </div>
            <div onClick={() => toggle("callback-list")} className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center cursor-pointer hover:shadow-md transition-shadow">
              <p className="text-xs text-amber-600 font-medium">Busy / Callback</p>
              <p className="text-xl font-bold text-amber-900">9</p>
              <p className="text-xs text-amber-500">Follow-up needed</p>
              <p className="text-[10px] text-gray-400 mt-1">Click to expand</p>
            </div>
            <div onClick={() => toggle("identity-list")} className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center cursor-pointer hover:shadow-md transition-shadow">
              <p className="text-xs text-amber-600 font-medium">Identity Question</p>
              <p className="text-xl font-bold text-amber-900">7</p>
              <p className="text-xs text-amber-500">"Who is this?"</p>
              <p className="text-[10px] text-gray-400 mt-1">Click to expand</p>
            </div>
          </div>

          {/* Interested */}
          {isOpen("interested-list") && (
            <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 mb-3">
              <p className="text-xs font-bold text-emerald-700 uppercase mb-2">6 Interested Conversations</p>
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
                    { co: "MDHR Legacy", contact: "Muhammad Danial Haikal Rosazri", sdr: "Harini", region: "MY", dur: "7m26s", date: "Apr 27" },
                    { co: "Australian Gold Capital Pty Ltd", contact: "Michael Kukulka", sdr: "Harini", region: "AU", dur: "1m49s", date: "Apr 23" },
                    { co: "Creo Farm", contact: "Kang Shiqiang", sdr: "Harini", region: "SG", dur: "1m16s", date: "Apr 29" },
                    { co: "AM Productions", contact: "Melvin Koh", sdr: "Harini", region: "SG", dur: "1m04s", date: "Apr 27" },
                    { co: "Launch Cycle", contact: "Raghav Ahooja", sdr: "Harini", region: "SG", dur: "0m33s", date: "Apr 23" },
                    { co: "Tangible", contact: "Charlie Scott", sdr: "Sukriti", region: "SG", dur: "0m30s", date: "Apr 27" },
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
              <p className="text-xs text-emerald-800 mt-3 italic">2 of 6 are inbound signups (MDHR Legacy + Australian Gold Capital) - both have AE meetings booked. Verify the other 4 are tracked in HubSpot with next steps.</p>
            </div>
          )}

          {/* Substantive */}
          {isOpen("substantive-list") && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-3">
              <p className="text-xs font-bold text-blue-700 uppercase mb-2">18 Substantive Conversations</p>
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
                    { co: "Cyphalet Inc", contact: "Sunday Olanite", sdr: "Harini", region: "Other", dur: "1m18s", date: "Apr 24" },
                    { co: "PRCA Global", contact: "Ed Burleigh", sdr: "Harini", region: "SG", dur: "1m40s", date: "Apr 24" },
                    { co: "MyagenC", contact: "Norah Zhang", sdr: "Harini", region: "SG", dur: "1m20s", date: "Apr 29" },
                    { co: "The DFRNT Agency", contact: "Sharlyn Seet", sdr: "Harini", region: "SG", dur: "1m21s", date: "Apr 27" },
                    { co: "NEIV", contact: "Sidharth Bhadani", sdr: "Harini", region: "SG", dur: "1m17s", date: "Apr 29" },
                    { co: "Trampolene", contact: "Tan Francis", sdr: "Harini", region: "SG", dur: "1m08s", date: "Apr 29" },
                    { co: "Singapore Institute of Manufacturing Technology", contact: "David Low", sdr: "Harini", region: "SG", dur: "1m05s", date: "Apr 27" },
                    { co: "Teckwah Industrial", contact: "Sammi Sim", sdr: "Harini", region: "SG", dur: "1m00s", date: "Apr 27" },
                    { co: "Vertical Green", contact: "Darren Neo", sdr: "Sukriti", region: "SG", dur: "1m01s", date: "Apr 29" },
                    { co: "Arvin", contact: "Sharven Selvam", sdr: "Harini", region: "MY", dur: "0m49s", date: "Apr 27" },
                    { co: "9 PAY PTY LTD", contact: "Sermpong Wongwiengchan", sdr: "Harini", region: "Other", dur: "0m43s", date: "Apr 23" },
                    { co: "SA CORN", contact: "Syamer Aiman", sdr: "Harini", region: "MY", dur: "0m57s", date: "Apr 24" },
                    { co: "Vivid Creations", contact: "Maho Saito", sdr: "Sukriti", region: "SG", dur: "0m41s", date: "Apr 27" },
                    { co: "Peptobiotics", contact: "Jonathan Bester", sdr: "Harini", region: "SG", dur: "0m40s", date: "Apr 29" },
                    { co: "YOYO Holdings", contact: "Anisha Myrdell Liwas", sdr: "Harini", region: "PH", dur: "0m36s", date: "Apr 24" },
                    { co: "Story Lab Consulting", contact: "Jayeeta Mazumder", sdr: "Sukriti", region: "SG", dur: "0m35s", date: "Apr 27" },
                    { co: "Scalelist", contact: "Youssef El Kaddioui", sdr: "Sukriti", region: "Other", dur: "0m33s", date: "Apr 27" },
                    { co: "(unknown SG / Tan)", contact: "-", sdr: "Harini", region: "SG", dur: "1m31s", date: "Apr 23" },
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
              <p className="text-xs text-blue-800 mt-3 italic">18 substantive vs 11 last week (+64%). Cyphalet (last week's PSP follow-up) shows up here - momentum building.</p>
            </div>
          )}

          {/* Busy/callback */}
          {isOpen("callback-list") && (
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 mb-3">
              <p className="text-xs font-bold text-amber-700 uppercase mb-2">9 Busy / Callback Requests (3x last week)</p>
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
                    { co: "Colorfull Store", contact: "Sophia Ho", sdr: "Harini", region: "SG", dur: "2m05s", date: "Apr 23" },
                    { co: "Spurwing Communications", contact: "Emma Thompson", sdr: "Sukriti", region: "SG", dur: "0m50s", date: "Apr 29" },
                    { co: "PR Communications", contact: "Eric Chan", sdr: "Harini", region: "SG", dur: "0m49s", date: "Apr 28" },
                    { co: "ACM Biolabs", contact: "Madhavan Nallani", sdr: "Harini", region: "SG", dur: "0m31s", date: "Apr 29" },
                    { co: "Colorfull Store (1st call)", contact: "Sophia Ho", sdr: "Harini", region: "SG", dur: "0m35s", date: "Apr 23" },
                    { co: "(unknown SG)", contact: "Ryan", sdr: "Harini", region: "SG", dur: "0m29s", date: "Apr 27" },
                    { co: "(unknown SG)", contact: "Peggy", sdr: "Harini", region: "SG", dur: "0m27s", date: "Apr 27" },
                    { co: "(unknown SG)", contact: "Phuong", sdr: "Harini", region: "SG", dur: "0m24s", date: "Apr 28" },
                    { co: "(unknown SG)", contact: "Jacob", sdr: "Sukriti", region: "SG", dur: "0m21s", date: "Apr 28" },
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
              <p className="text-xs text-amber-800 mt-3 italic">Colorfull Store / Sophia Ho is a clean playbook example - 35s "call back in an hour", then 2m05s on the callback. Schedule the rest similarly.</p>
            </div>
          )}

          {/* Identity question */}
          {isOpen("identity-list") && (
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 mb-3">
              <p className="text-xs font-bold text-amber-700 uppercase mb-2">7 Identity Questions - "Who is this / where are you calling from?"</p>
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
                    { co: "ELRC Trading Pty Ltd", contact: "Eric Chen", sdr: "Harini", region: "AU", dur: "2m55s", date: "Apr 23" },
                    { co: "Iab Sea+India", contact: "Miranda Dimopoulos", sdr: "Harini", region: "SG", dur: "1m33s", date: "Apr 23" },
                    { co: "Oxygen Content", contact: "Jaclyn Tze Wey", sdr: "Sukriti", region: "MY", dur: "1m13s", date: "Apr 29" },
                    { co: "SuperAI", contact: "Marcos Antonio", sdr: "Sukriti", region: "Other", dur: "0m47s", date: "Apr 29" },
                    { co: "Photoplay Singapore", contact: "Welly Budiman", sdr: "Sukriti", region: "SG", dur: "0m44s", date: "Apr 27" },
                    { co: "SW Strategies", contact: "Jose Raymond", sdr: "Harini", region: "SG", dur: "0m39s", date: "Apr 28" },
                    { co: "(unknown SG / Zakia)", contact: "Zakia", sdr: "Harini", region: "SG", dur: "0m23s", date: "Apr 24" },
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
              <p className="text-xs text-amber-800 mt-3 italic">Opener still needs work - 7 of 153 answered calls (4.6%) had prospects asking who the SDR was. ELRC Trading and SW Strategies both repeat from prior weeks - SW Strategies asked on Apr 16 too.</p>
            </div>
          )}
        </div>

        {/* Daily trend */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-600 mb-2">Daily Calling Trend (Apr 25 Sat + Apr 26 Sun = 0 dials)</p>
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
              <strong>AU + ZA highest pickup rates this period.</strong> AU 59.1% pickup with 18.2% conv rate. ZA 75% pickup but tiny base (4 dials). SG dominates volume (198 dials, 14.1% conv). Harini delivered 30% conv rate in "Other" region (mainly inbound follow-ups like Cyphalet).
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
            <p className="text-xs text-emerald-600 font-medium">Best: 1pm</p>
            <p className="text-xl font-bold text-emerald-900">61.9%</p>
            <p className="text-xs text-emerald-500">21 dials, 7 conv</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
            <p className="text-xs text-emerald-600 font-medium">Best volume: 11am</p>
            <p className="text-xl font-bold text-emerald-900">43.1%</p>
            <p className="text-xs text-emerald-500">51 dials, 7 conv</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
            <p className="text-xs text-blue-600 font-medium">Best conv: 3pm</p>
            <p className="text-xl font-bold text-blue-900">16.7%</p>
            <p className="text-xs text-blue-500">8 conv {">"}30s on 48 dials</p>
          </div>
        </div>
      </Section>

      {/* Objections */}
      <Section title="Objection Analysis" subtitle="From 131 transcribed calls (Whisper). Click any row for guidance.">
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

      {/* New Outbound Initiative - Lead Gen 3.0 Launch */}
      <Section title="New Outbound Initiative (SG / AU / PH / Other)" subtitle="Launched Apr 26 - 101 prospects across 98 unique companies pushed to 6 SmartReach campaigns. Each prospect is in 2 campaigns simultaneously - 202 active assignments. AE-tier launched alongside SDR-tier, activating the multi-persona model.">
        {/* Multi-persona Outreach - now LIVE */}
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

        {/* Campaign Launch KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-medium">Total prospects</p>
            <p className="text-2xl font-bold text-gray-900">101</p>
            <p className="text-[10px] text-gray-500">98 unique companies</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
            <p className="text-xs text-blue-600 font-medium">Active campaigns</p>
            <p className="text-2xl font-bold text-blue-900">6</p>
            <p className="text-[10px] text-blue-500">4 AE + 2 SDR</p>
          </div>
          <div className="bg-violet-50 rounded-lg p-3 border border-violet-100 text-center">
            <p className="text-xs text-violet-600 font-medium">Campaign assignments</p>
            <p className="text-2xl font-bold text-violet-900">202</p>
            <p className="text-[10px] text-violet-500">2 per prospect</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
            <p className="text-xs text-emerald-600 font-medium">HIGH priority</p>
            <p className="text-2xl font-bold text-emerald-900">63</p>
            <p className="text-[10px] text-emerald-500">63% (score 65+)</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center">
            <p className="text-xs text-amber-600 font-medium">Mean lead score</p>
            <p className="text-2xl font-bold text-amber-900">56.3</p>
            <p className="text-[10px] text-amber-500">/ 100</p>
          </div>
        </div>

        {/* Region + Industry */}
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

        {/* Personas + Multi-currency */}
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

        {/* Products positioned + One-line positioning */}
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

        {/* Campaign breakdown table */}
        <div className="overflow-x-auto mb-5">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">Campaign Breakdown (6 campaigns)</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Tier</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Owner</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Channel / Sequence</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Prospects</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50"><td className="py-2 px-3"><Badge text="AE" variant="warning" /></td><td className="py-2 px-3 font-medium">Michelle Ling</td><td className="py-2 px-3 text-xs text-gray-500">LinkedIn CR sequence</td><td className="text-right py-2 px-3 font-bold">28</td></tr>
              <tr className="border-b border-gray-50"><td className="py-2 px-3"><Badge text="AE" variant="warning" /></td><td className="py-2 px-3 font-medium">Gibson Saw</td><td className="py-2 px-3 text-xs text-gray-500">LinkedIn CR sequence</td><td className="text-right py-2 px-3 font-bold">27</td></tr>
              <tr className="border-b border-gray-50"><td className="py-2 px-3"><Badge text="AE" variant="warning" /></td><td className="py-2 px-3 font-medium">Nouvelle Nye</td><td className="py-2 px-3 text-xs text-gray-500">LinkedIn CR sequence</td><td className="text-right py-2 px-3 font-bold">23</td></tr>
              <tr className="border-b border-gray-50"><td className="py-2 px-3"><Badge text="AE" variant="warning" /></td><td className="py-2 px-3 font-medium">Elross Pangue</td><td className="py-2 px-3 text-xs text-gray-500">LinkedIn CR sequence</td><td className="text-right py-2 px-3 font-bold">23</td></tr>
              <tr className="border-b border-gray-50"><td className="py-2 px-3"><Badge text="SDR" variant="default" /></td><td className="py-2 px-3 font-medium">Sukriti Chopra</td><td className="py-2 px-3 text-xs text-gray-500">Email + LinkedIn + WhatsApp sequence</td><td className="text-right py-2 px-3 font-bold">52</td></tr>
              <tr className="border-b border-gray-50"><td className="py-2 px-3"><Badge text="SDR" variant="default" /></td><td className="py-2 px-3 font-medium">Harini Kaliyamoorthi</td><td className="py-2 px-3 text-xs text-gray-500">Email + LinkedIn + WhatsApp sequence</td><td className="text-right py-2 px-3 font-bold">49</td></tr>
            </tbody>
          </table>
          <p className="text-[11px] text-gray-500 mt-2 italic">All 4 AE campaigns and 2 SDR campaigns went live Apr 26. Each prospect is in their region-assigned SDR sequence + their persona-assigned AE campaign simultaneously.</p>
        </div>

        {/* AE LinkedIn Connection-Rate Acceptance (last 30 days, post-launch) */}
        <div className="overflow-x-auto mb-5">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">AE LinkedIn Connection-Rate Acceptance</h4>
          <p className="text-[11px] text-gray-500 mb-3 italic">Per-AE LinkedIn campaign performance from the new launch. Tracked over the last 30 days (post-Apr 26 launch).</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { ae: "Elross", rate: 23, actions: 53, profileVisits: 32, connReqs: 21, color: "emerald" },
              { ae: "Gibson", rate: 20, actions: 62, profileVisits: 37, connReqs: 25, color: "emerald" },
              { ae: "Michelle", rate: 14, actions: 68, profileVisits: 40, connReqs: 28, color: "amber" },
              { ae: "Nouvelle", rate: 10, actions: 60, profileVisits: 40, connReqs: 20, color: "amber" },
            ].map((a) => (
              <div key={a.ae} className={`rounded-lg p-3 border ${a.color === "emerald" ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm font-bold ${a.color === "emerald" ? "text-emerald-900" : "text-amber-900"}`}>{a.ae}</p>
                  <Badge text={`${a.rate}%`} variant={a.color === "emerald" ? "success" : "warning"} />
                </div>
                <p className="text-[11px] text-gray-600">Actions sent: <strong>{a.actions}</strong></p>
                <p className="text-[11px] text-gray-600">Profile visits: {a.profileVisits}</p>
                <p className="text-[11px] text-gray-600">Connection requests: {a.connReqs}</p>
              </div>
            ))}
          </div>
          <Callout type="info">
            <strong>Elross + Gibson leading the AE acceptance race</strong> at 23% and 20% respectively - similar to outbound benchmark for SDR campaigns. Michelle (14%) and Nouvelle (10%) trailing - their connection messaging may need a refresh. Worth A/B testing the connection-request copy across AEs.
          </Callout>
        </div>

        {/* Top 3 prospects */}
        <h4 className="font-semibold text-gray-800 text-sm mb-3">Top 3 Prospects in Batch</h4>
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

        {/* Patterns + open follow-ups */}
        <div className="mb-4">
          <Callout type="success">
            <strong>60% in Finmo SME sweet spot (100-999 employees).</strong> 17 in 500-999 band. The 1k+ tail (17 companies) is acknowledged stretch-ICP, calibrated with regional / entity-level framing in their content.
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
    { stage: "Total Zap Runs", value: 68, color: SLATE },
    { stage: "Junk/Internal", value: 17, color: RED },
    { stage: "Legitimate Signups", value: 50, color: GREEN },
  ];

  const junkBreakdown = [
    { category: "Finmo internal (@finmo.net)", count: 16 },
    { category: "Known test (acme/etc)", count: 1 },
  ];

  const regionData = [
    { region: "Malaysia", count: 35, quality: "Low" },
    { region: "Australia", count: 7, quality: "High" },
    { region: "Singapore", count: 3, quality: "Medium" },
    { region: "India", count: 1, quality: "Medium" },
    { region: "Italy", count: 1, quality: "Low" },
    { region: "UAE", count: 1, quality: "Low" },
    { region: "Andorra", count: 1, quality: "Low" },
    { region: "Not set", count: 1, quality: "Low" },
  ];

  const referralSources = [
    { source: "Not set", count: 50, pct: 100 },
  ];

  const dealActivity = [
    { bucket: "Contacts with deals", count: 24, note: "48% of legitimate signups have at least one HubSpot deal associated" },
    { bucket: "Contacts without deals", count: 26, note: "Personal-email Malaysia signups dominate this bucket" },
    { bucket: "Contacts with meetings", count: 7, note: "AGC, MDHR, ELRC, Uptrade (user-detailed) + STRATAGILE/CrossXpay (3 meetings, Nouvelle), 9 PAY (2 meetings), PICKNIC" },
  ];

  // 7 inbound meetings: 2 FI / crypto-adjacent + 2 non-FI + 3 from auto-pull (engaged signups).
  const fi_meetings = [
    {
      co: "ELRC Trading Pty Ltd",
      contact: "Eric Chen",
      country: "Australia",
      ae: "BD team (no AE)",
      website: "https://www.elrctrading.com",
      hsId: "475047136965",
      next: "Qualification call done, KYB next, dashboard demo to follow",
      vol: "$15M AUD / month, 100-150 transactions",
      note: "AU remittance + crypto on/off-ramp (fiat to stablecoin). Three customer types: import/export, payroll/gig payouts, corporate stablecoin trading. ~90% AUD volume + USD/HKD/THB. Wants virtual accounts, stable settlement, pricing clarity.",
    },
    {
      co: "Uptrade",
      contact: "Moaze Bahloul",
      country: "Australia",
      ae: "Justin",
      website: "https://uptrade.co/",
      hsId: "457044957888",
      next: "Qualification call done, AE follow-up to be scheduled",
      vol: "$5-10M / month, 200-300 payments",
      note: "Crypto brokerage with retail clients across AU, US, EU, Asia. ~95% AUD plus USD/EUR/GBP/CAD/NZD. Prefers local payment rails + SWIFT. Larger transactions, lower volume model.",
    },
  ];

  const non_fi_meetings = [
    {
      co: "Australian Gold Capital",
      contact: "Michael Kukulka",
      country: "Australia",
      ae: "Justin",
      website: "https://www.australiangoldcapital.com.au/",
      hsId: "474430188231",
      next: "AE call done, KYB + platform demo next",
      vol: "2.5-3.5k bank txns / month",
      note: "Precious metals bullion (gold/silver/platinum/palladium). Initially routed via Sun Capital but AGC will collect directly for 8 offices. Wants payments platform with API + Reckon integration. Mostly AUD; 1 SG cross-border partner.",
    },
    {
      co: "MDHR Legacy",
      contact: "Muhammad Danial Haikal Rosazri",
      country: "Malaysia",
      ae: "Adlin",
      website: "",
      hsId: "476981142203",
      next: "AE call set up",
      vol: "Cross-border to ID/TH/KH, expanding to India",
      note: "Dairy / lower-cholesterol milk products. Owner runs marketing + sales. Curious on pricing.",
    },
  ];

  const auto_pull_meetings = [
    {
      co: "STRATAGILE / CrossXpay",
      contact: "Avish Joseph",
      ae: "Nouvelle",
      meetings: 3,
      latest: "Apr 29",
      note: "Apr 20 intro -> Apr 28 pricing sync -> Apr 29 M H Express NZ proposal. Inbound-sourced; Nouvelle owns the engagement end-to-end.",
    },
    {
      co: "9 PAY PTY LTD",
      contact: "Sermpong Wongwiengchan",
      ae: "Sukriti / Harini",
      meetings: 2,
      latest: "Apr 28",
      note: "Inbound 'Contact Us' form. Two meetings scheduled across both SDRs.",
    },
  ];

  const aeMeetingSummary = [
    { ae: "Justin Chia", type: "AGC + Uptrade", count: 2 },
    { ae: "Adlin Norazman", type: "MDHR Legacy", count: 1 },
    { ae: "Nouvelle", type: "STRATAGILE / CrossXpay", count: 3 },
    { ae: "Sukriti / Harini", type: "9 PAY PTY LTD", count: 2 },
    { ae: "BD team", type: "ELRC Trading", count: 1 },
  ];

  const callDisposition = [
    { status: "No answer", count: 49, pct: 75 },
    { status: "Connected", count: 16, pct: 25 },
  ];

  const highValueLeads = [
    { co: "ELRC Trading Pty Ltd", why: "AU FI, $15M AUD/mo. KYB next, demo to follow. Eric Chen.", status: "Hot", hsId: "475047136965" },
    { co: "Uptrade", why: "AU crypto brokerage, $5-10M/mo. AE Justin - follow-up call to schedule. Moaze Bahloul.", status: "Hot", hsId: "457044957888" },
    { co: "Australian Gold Capital", why: "AU bullion dealer, 2.5-3.5k txns/mo. AE Justin - KYB + demo next. API + Reckon integration ask.", status: "Hot", hsId: "474430188231" },
    { co: "MDHR Legacy", why: "MY dairy / cross-border to ID/TH/KH, expanding to India. AE Adlin - call set up.", status: "Hot", hsId: "476981142203" },
    { co: "STRATAGILE / CrossXpay", why: "Avish Joseph, AE Nouvelle. 3 meetings already booked - virtual-account proposal for M H Express NZ.", status: "Hot", hsId: "" },
    { co: "Cyphalet (carry-over)", why: "Nigerian PSP, $5-10M/mo. Last week's meeting + this week's 1m18s follow-up call.", status: "Warm", hsId: "" },
    { co: "9 PAY PTY LTD", why: "Sermpong Wongwiengchan. 2 meetings booked across Sukriti + Harini.", status: "Warm", hsId: "" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Total Signups" value="68" sub="Apr 23-29 zap runs" color="blue" />
        <MetricCard label="Legitimate" value="50" sub="74% of total" trend={{ val: -15, label: "vs prior" }} color="green" />
        <MetricCard label="Junk Rate" value="25%" sub="17 junk - down from 40% prior" trend={{ val: -15, label: "vs prior" }} color="red" />
        <MetricCard label="Meetings Booked" value="6" sub="2 FI + 2 non-FI + 2 from auto-pull (STRATAGILE + 9 PAY)" color="purple" />
        <MetricCard label="Contacts Called" value="88%" sub="44/50 - 65 calls, 1.5 per lead" color="cyan" />
      </div>

      {/* Signup Funnel */}
      <Section title="Signup Funnel" subtitle="68 total runs - 50 legitimate signups (74%) - junk rate dropped to 25%">
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
                <p className="text-xl font-bold text-blue-900">41</p>
                <p className="text-xs text-blue-500">82%</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium">Company Email</p>
                <p className="text-xl font-bold text-emerald-900">9</p>
                <p className="text-xs text-emerald-500">18%</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-amber-600 font-medium">Phone Coverage</p>
                <p className="text-xl font-bold text-amber-900">100%</p>
                <p className="text-xs text-amber-500">50/50 have phone</p>
              </div>
            </div>
            <Callout type="success">
              <strong>Junk rate at 25% - down from 40% prior period.</strong> Dominated by Finmo internal testing (16 of 17). 50 unique legitimate signups (down from 59). 50/50 in HubSpot with 47 new contacts.
            </Callout>
          </div>
        </div>
      </Section>

      {/* Junk Breakdown */}
      <Section title="Junk/Test Breakdown" subtitle="17 of 68 runs (25%). Finmo internal testing is still the dominant source.">
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
        <Section title="By Country" subtitle="50 legitimate signups">
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
          <p className="text-xs text-gray-500 mt-2">Malaysia dominates volume (35/50 = 70%). Mostly low-quality gmail/yahoo signups - only 9 company emails total.</p>
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
            <strong>100% of signups this period (50/50) had no referral source set.</strong> Same as prior period. Two consecutive weeks - this is a structural form regression. Action: check the signup form referral_source field is being captured.
          </Callout>
        </Section>
      </div>

      {/* Call Activity on Inbound */}
      <Section title="Inbound Lead Calling Activity" subtitle="65 calls across 44 contacts. 6 contacts (12%) never called.">
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
            <StatRow label="Contacts called" value="44 / 50 (88%)" />
            <StatRow label="Avg calls per lead" value="1.5" />
            <StatRow label="Contacts never called" value="6 (12%)" />
            <StatRow label="Best call: MDHR Legacy" value="7m26s" highlight />
          </div>
        </div>
        <Callout type="success">
          <strong>88% of inbound leads called</strong> with 1.5 calls per lead - up from 83% / 1.3 prior. Best inbound call of the week was MDHR Legacy at 7m26s (Harini).
        </Callout>
      </Section>

      {/* Deal Activity */}
      <Section title="Deal Activity" subtitle="24 of 50 legitimate signups (48%) have associated HubSpot deals. 7 contacts had meetings.">
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
          <strong>26 contacts (52%) have zero deals</strong> - again largely low-quality personal email signups from Malaysia. AU + FI inbounds (AGC, ELRC, Uptrade) are this week's high-conversion segment - 3 of 4 booked AE meetings.
        </Callout>
      </Section>

      {/* Meetings */}
      <Section title="Meetings Booked from Inbound" subtitle="6 meetings: 2 FI / crypto-adjacent (AU) + 2 non-FI (AU + MY) + 2 from auto-pull (STRATAGILE 3 sessions, 9 PAY 2 sessions).">
        <div className="overflow-x-auto mb-6">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">Financial Institutions / Crypto-adjacent (2)</h4>
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
              {fi_meetings.map((m) => (
                <>
                  <tr key={m.co} className="border-b border-gray-50">
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-3 font-medium">
                      <a href={`https://app-na2.hubspot.com/contacts/20889024/record/0-1/${m.hsId}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                        {m.co} <span className="text-[10px] text-blue-400">&#8599;</span>
                      </a>
                    </td>
                    <td className="py-2 px-3 text-xs">{m.contact}</td>
                    <td className="py-2 px-3 text-xs"><Badge text={m.country} variant={m.country === "Australia" ? "success" : "default"} /></td>
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
          <h4 className="font-semibold text-gray-800 text-sm mb-3">Non-FI / Operating businesses (2)</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="w-6 py-2 px-2"></th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Contact</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Country</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">AE</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Volume / Scope</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Next Step</th>
              </tr>
            </thead>
            <tbody>
              {non_fi_meetings.map((m) => (
                <>
                  <tr key={m.co} className="border-b border-gray-50">
                    <td className="py-2 px-2"></td>
                    <td className="py-2 px-3 font-medium">
                      <a href={`https://app-na2.hubspot.com/contacts/20889024/record/0-1/${m.hsId}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                        {m.co} <span className="text-[10px] text-blue-400">&#8599;</span>
                      </a>
                    </td>
                    <td className="py-2 px-3 text-xs">{m.contact}</td>
                    <td className="py-2 px-3 text-xs"><Badge text={m.country} variant={m.country === "Australia" ? "success" : "default"} /></td>
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
          <h4 className="font-semibold text-gray-800 text-sm mb-3">Auto-pulled from HubSpot (2)</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Contact</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">AE / Owner</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Meetings</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Latest</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Note</th>
              </tr>
            </thead>
            <tbody>
              {auto_pull_meetings.map((m) => (
                <tr key={m.co} className="border-b border-gray-50">
                  <td className="py-2 px-3 font-medium">{m.co}</td>
                  <td className="py-2 px-3 text-xs">{m.contact}</td>
                  <td className="py-2 px-3 text-xs">{m.ae}</td>
                  <td className="text-right py-2 px-3 font-bold">{m.meetings}</td>
                  <td className="py-2 px-3 text-xs text-gray-500">{m.latest}</td>
                  <td className="py-2 px-3 text-xs text-gray-500 italic">{m.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout type="success">
          <strong>Strong inbound week - 6 meetings vs 5 prior period.</strong> AU is the dominant geography (4 of 6 meetings). Both FI prospects (ELRC, Uptrade) and AGC have committed AE follow-ups. STRATAGILE / CrossXpay drove 3 meetings with Nouvelle inside 9 days.
        </Callout>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {aeMeetingSummary.map((s) => (
            <div key={s.ae} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-sm font-bold text-blue-900">{s.ae}</p>
              <p className="text-xs text-blue-600 mt-1">{s.type}</p>
              <p className="text-lg font-bold text-blue-900 mt-1">{s.count}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Active Inbound Signal - AU FI / crypto-adjacent cluster */}
      <Section title="Active Inbound Signal: AU FI / Crypto-Adjacent Cluster" subtitle="2 high-volume AU FIs (ELRC + Uptrade) + 1 high-volume AU bullion dealer (AGC) - $20M+ AUD/mo combined potential">
        <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-emerald-900">AU FI Cluster</p>
                <Badge text="$20M+ AUD / MONTH" variant="success" />
              </div>
              <p className="text-sm text-emerald-700 mt-0.5">ELRC Trading + Uptrade + Australian Gold Capital</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-xs">
            <div><p className="text-gray-500">Volume</p><p className="font-semibold">$20M+ AUD / month combined</p></div>
            <div><p className="text-gray-500">Shared ask</p><p className="font-semibold">AUD rails + virtual accounts + API</p></div>
            <div><p className="text-gray-500">AEs</p><p className="font-semibold">Justin (AGC + Uptrade), BD team (ELRC)</p></div>
            <div><p className="text-gray-500">Channel</p><p className="font-semibold">All inbound website signups</p></div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-emerald-200 mb-3">
            <p className="text-xs font-bold text-gray-600 uppercase mb-1">Per-prospect detail</p>
            <div className="space-y-1 text-xs text-gray-700">
              <p><span className="text-gray-400">ELRC Trading</span> - $15M AUD/mo, 100-150 transactions. Fiat to stablecoin remittance + corporate stablecoin trading. Wants virtual accounts.</p>
              <p><span className="text-gray-400">Uptrade</span> - $5-10M/mo, 200-300 payments. Crypto brokerage retail clients across AU, US, EU, Asia. ~95% AUD + USD/EUR/GBP/CAD/NZD.</p>
              <p><span className="text-gray-400">Australian Gold Capital</span> - 2.5-3.5k bank txns/mo. Bullion dealer (gold/silver/platinum/palladium). Wants API + Reckon integration.</p>
            </div>
          </div>
          <Callout type="success">
            <strong>Pattern continuing.</strong> Three weeks in a row inbound has surfaced AU AUD-rails demand (this week: 2 FI + 1 bullion; last week: 3 small MTOs; pattern is structural). Decision time: productize or partner-route. Current Vol estimate: $20M+ AUD/mo from these 3 alone.
          </Callout>
        </div>

        <div className="mt-4 rounded-lg border-2 border-violet-300 bg-violet-50 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-violet-900">STRATAGILE / CrossXpay (inbound)</p>
                <Badge text="HIGH ENGAGEMENT" variant="purple" />
              </div>
              <p className="text-sm text-violet-700 mt-0.5">3 meetings with Nouvelle inside 9 days</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-violet-200">
            <p className="text-xs text-gray-700">Apr 20 intro -&gt; Apr 28 pricing sync -&gt; Apr 29 M H Express NZ proposal. Avish Joseph engaged across 9 days. Inbound-sourced lead, Nouvelle owns the engagement end-to-end. Fastest-moving inbound conversation of the week.</p>
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
            { num: "1", text: "6 inbound meetings booked (vs 5 prior week, +20%). 4 user-detailed (AGC, MDHR, ELRC, Uptrade) + 2 from auto-pull (STRATAGILE 3 sessions, 9 PAY 2 sessions)." },
            { num: "2", text: "AU AUD-rails pattern repeats - week 3 in a row. ELRC + Uptrade + AGC = $20M+ AUD/mo combined. Productize vs partner-route decision is overdue." },
            { num: "3", text: "Junk rate 25% (down from 40% prior). 16 of 17 junk records are @finmo.net internal - same structural source." },
            { num: "4", text: "50 unique legit signups - down from 59 last week, but quality up: 88% called, 6 meetings (vs 88% / 5 last week, on a smaller base)." },
            { num: "5", text: "Malaysia still dominates signup volume (70%) but converts poorly - 1 meeting from 35 MY signups (MDHR Legacy). MDHR was the standout via 7m26s call." },
            { num: "6", text: "Referral source = Not set 100% again. Two consecutive weeks - this is a confirmed form regression. Action: fix signup form referral_source field this week." },
            { num: "7", text: "AE coverage spread - Justin owns 2 (AGC + Uptrade), Adlin 1 (MDHR), Nouvelle 3 (CrossXpay), BD team 1 (ELRC), Sukriti / Harini 1 split (9 PAY)." },
            { num: "8", text: "STRATAGILE / CrossXpay (inbound) - 3 meetings with Nouvelle inside 9 days. Fastest-moving inbound conversation of the week. Watch this conversion path." },
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
export default function BDWeeklyApr23_29() {
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
                <p className="text-sm text-gray-500">April 23-29, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">Generated: April 29, 2026</span>
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
