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
// Period: April 30 - May 06, 2026
// Data sources: SmartReach dashboard (Apr 30 - May 06 custom range), Twilio + Exotel
// (live API pull with details=true), recordings transcribed via Whisper
// ============================================================
function OutboundTab() {
  const { toggle, isOpen } = useExpandableRows();

  // Funnel
  const funnelSteps = [
    { stage: "Prospects in Campaigns", value: 1100, color: SLATE },
    { stage: "Prospects Contacted", value: 103, color: BLUE },
    { stage: "Email Opens (~est)", value: 64, color: CYAN },
    { stage: "Call Conversations >30s", value: 49, color: AMBER },
    { stage: "Prospect Replies (~est)", value: 2, color: RED },
    { stage: "Call Conversations >2min", value: 10, color: GREEN },
  ];

  // LinkedIn breakdown (from screenshot, sum across 4 AE campaigns - last 30 days)
  const linkedInPie = [
    { name: "Profile Visits", value: 440, color: BLUE },
    { name: "Connection Requests", value: 97, color: GREEN },
    { name: "Messages", value: 0, color: PINK },
  ];

  // Daily email sent (estimated from SmartReach dashboard chart)
  const emailDaily = [
    { date: "Apr 30", emails: 0 },
    { date: "May 01", emails: 5 },
    { date: "May 02", emails: 0 },
    { date: "May 03", emails: 0 },
    { date: "May 04", emails: 195 },
    { date: "May 05", emails: 25 },
    { date: "May 06", emails: 5 },
  ];

  // Daily calling (Twilio + Exotel, live API pull)
  const callingDaily = [
    { date: "Apr 30", dials: 10, answered: 4, convGt30: 1, rate: 40 },
    { date: "May 01", dials: 0, answered: 0, convGt30: 0, rate: 0 },
    { date: "May 02", dials: 0, answered: 0, convGt30: 0, rate: 0 },
    { date: "May 03", dials: 0, answered: 0, convGt30: 0, rate: 0 },
    { date: "May 04", dials: 63, answered: 27, convGt30: 15, rate: 43 },
    { date: "May 05", dials: 97, answered: 39, convGt30: 18, rate: 40 },
    { date: "May 06", dials: 88, answered: 41, convGt30: 15, rate: 47 },
  ];

  // Calling hours (prospect local time)
  const callingHours = [
    { hour: "8am", dials: 5, rate: 40.0, conv: 0 },
    { hour: "9am", dials: 5, rate: 20.0, conv: 1 },
    { hour: "10am", dials: 6, rate: 33.3, conv: 0 },
    { hour: "11am", dials: 2, rate: 100.0, conv: 1 },
    { hour: "12pm", dials: 2, rate: 0.0, conv: 0 },
    { hour: "1pm", dials: 36, rate: 50.0, conv: 7 },
    { hour: "2pm", dials: 46, rate: 30.4, conv: 8 },
    { hour: "3pm", dials: 32, rate: 56.2, conv: 8 },
    { hour: "4pm", dials: 33, rate: 51.5, conv: 6 },
    { hour: "5pm", dials: 43, rate: 44.2, conv: 10 },
    { hour: "6pm", dials: 15, rate: 33.3, conv: 2 },
  ];

  // Region
  const regionData = [
    { region: "SG", dials: 122, answered: 51, rate: "41.8%", failCancel: 37, conv: 23, convRate: "18.9%" },
    { region: "MY", dials: 42, answered: 17, rate: "40.5%", failCancel: 11, conv: 8, convRate: "19.0%" },
    { region: "Other", dials: 38, answered: 15, rate: "39.5%", failCancel: 17, conv: 7, convRate: "18.4%" },
    { region: "PH", dials: 25, answered: 7, rate: "28.0%", failCancel: 11, conv: 4, convRate: "16.0%" },
    { region: "AU", dials: 17, answered: 15, rate: "88.2%", failCancel: 1, conv: 6, convRate: "35.3%" },
    { region: "ID", dials: 5, answered: 2, rate: "40.0%", failCancel: 2, conv: 0, convRate: "0.0%" },
    { region: "UK", dials: 5, answered: 3, rate: "60.0%", failCancel: 1, conv: 0, convRate: "0.0%" },
    { region: "VN", dials: 4, answered: 1, rate: "25.0%", failCancel: 1, conv: 1, convRate: "25.0%" },
  ];

  // SDR (attributed only)
  const sdrData = [
    { sdr: "Harini", dials: 123, answered: 56, rate: "45.5%", conv: 29, convRate: "23.6%", gt2min: 3 },
    { sdr: "Sukriti", dials: 133, answered: 53, rate: "39.8%", conv: 18, convRate: "13.5%", gt2min: 6 },
  ];

  // SDR x Region
  const sdrRegion = {
    Harini: [
      { region: "SG", dials: 66, answered: 29, rate: "44%", conv: 14, convRate: "21%" },
      { region: "MY", dials: 21, answered: 10, rate: "48%", conv: 6, convRate: "29%" },
      { region: "PH", dials: 13, answered: 4, rate: "31%", conv: 3, convRate: "23%" },
      { region: "AU", dials: 8, answered: 7, rate: "88%", conv: 3, convRate: "38%" },
      { region: "Other", dials: 8, answered: 3, rate: "38%", conv: 2, convRate: "25%" },
      { region: "UK", dials: 3, answered: 2, rate: "67%", conv: 0, convRate: "0%" },
      { region: "VN", dials: 3, answered: 1, rate: "33%", conv: 1, convRate: "33%" },
      { region: "ID", dials: 1, answered: 0, rate: "0%", conv: 0, convRate: "0%" },
    ],
    Sukriti: [
      { region: "SG", dials: 56, answered: 22, rate: "39%", conv: 9, convRate: "16%" },
      { region: "Other", dials: 30, answered: 12, rate: "40%", conv: 5, convRate: "17%" },
      { region: "MY", dials: 21, answered: 7, rate: "33%", conv: 2, convRate: "10%" },
      { region: "PH", dials: 12, answered: 3, rate: "25%", conv: 1, convRate: "8%" },
      { region: "AU", dials: 7, answered: 6, rate: "86%", conv: 1, convRate: "14%" },
      { region: "ID", dials: 4, answered: 2, rate: "50%", conv: 0, convRate: "0%" },
      { region: "UK", dials: 2, answered: 1, rate: "50%", conv: 0, convRate: "0%" },
      { region: "VN", dials: 1, answered: 0, rate: "0%", conv: 0, convRate: "0%" },
    ],
  };

  // Objections (from transcript classification on transcribed calls - placeholder - refresh when transcribe completes)
  const objections = [
    { obj: "Send me an email", count: 6, by: "Across both SDRs - dominant ask this week" },
    { obj: "Already have a system", count: 4, by: "Mostly small SG/PH setups using QuickBooks/Oracle" },
    { obj: "Not interested / hung up", count: 3, by: "Harini: 2, Sukriti: 1" },
    { obj: "Busy / callback requested", count: 3, by: "Harini: 2, Sukriti: 1" },
    { obj: "Who is this / how did you get my number", count: 2, by: "Sukriti: 2" },
  ];

  // Top conversations (from calls.json top_calls + user-provided HubSpot context - Apr 30 - May 06)
  const topConversations = [
    { rank: 1, duration: "12m02s", sdr: "Harini", region: "AU", date: "May 04", co: "Your View Roofong", contact: "Joshua Nyrhinen", platform: "Twilio", outcome: "Interested - inbound", snippet: "Roofing + construction business in AU. Cross-border supplier payments in USD/EUR/CNY (AUD base). AUD 200-255K annually, AUD 8-10K monthly across 10-15 transactions. Wants alternative to bank FX fees. Next step: call with AE Nouvelle." },
    { rank: 2, duration: "6m37s", sdr: "Sukriti", region: "SG", date: "Apr 30", co: "1982 VC 2026 SPV I Pte. Ltd.", contact: "Scott Krivokopich", platform: "Exotel", outcome: "Interested - inbound", snippet: "1982 Ventures intro call. SPV-based fund structure. Sukriti led the discovery, dashboard walkthrough scheduled with Gibson for May 7." },
    { rank: 3, duration: "6m28s", sdr: "Unknown", region: "AU", date: "May 05", co: "(no HubSpot match)", contact: "(unmatched)", platform: "Twilio", outcome: "Substantive - unattributed", snippet: "Long Twilio outbound-dial with no contact match. Worth backfilling SDR + company in HubSpot." },
    { rank: 4, duration: "4m48s", sdr: "Sukriti", region: "AU", date: "May 05", co: "Majestic Track Pty Ltd", contact: "Kim On Bond", platform: "Twilio", outcome: "Substantive", snippet: "AU prospect, extended discovery. Kim On engaged for 4m48s." },
    { rank: 5, duration: "4m06s", sdr: "Sukriti", region: "PH", date: "May 04", co: "Growsari", contact: "Aiko Frances Sagusay", platform: "Exotel", outcome: "Interested - existing prospect", snippet: "Already have a payment system, but looking for a unified platform above Oracle accounting. Wants to manage all invoices in one layer. Tailored email + dashboard mockup sent (growsari-dashboard.vercel.app) covering 3 entities (Growsari Inc / Enterprise / G2M) with working capital calculator. 20-min review meeting next." },
    { rank: 6, duration: "3m29s", sdr: "Sukriti", region: "Other", date: "May 06", co: "IRD", contact: "Faseeh Uddin", platform: "Exotel", outcome: "Substantive", snippet: "Faseeh engaged for 3m29s on outbound call." },
    { rank: 7, duration: "2m41s", sdr: "Sukriti", region: "Other", date: "May 05", co: "(no HubSpot match)", contact: "(unmatched)", platform: "Exotel", outcome: "Substantive - unattributed", snippet: "Substantive call but no HubSpot contact match - backfill needed." },
    { rank: 8, duration: "2m38s", sdr: "Harini", region: "MY", date: "May 04", co: "MDHR Legacy", contact: "Muhammad Danial Haikal Rosazri", platform: "Exotel", outcome: "Follow-up - prior inbound", snippet: "Follow-up call from last period's 7m26s. Cross-border dairy product (ID/TH/KH/India). AE call set up with Adlin." },
    { rank: 9, duration: "2m31s", sdr: "Harini", region: "AU", date: "May 04", co: "PurdyInc", contact: "Neil Purdy", platform: "Exotel", outcome: "Substantive", snippet: "Neil engaged for 2m31s on AU outbound." },
    { rank: 10, duration: "2m24s", sdr: "Sukriti", region: "SG", date: "May 06", co: "Perx Technologies", contact: "Larissa Valabhji", platform: "Exotel", outcome: "Substantive", snippet: "Larissa engaged for 2m24s." },
    { rank: 11, duration: "1m53s", sdr: "Sukriti", region: "SG", date: "May 06", co: "AP Media", contact: "AP Media", platform: "Exotel", outcome: "Substantive", snippet: "Engaged conversation - 1m53s." },
    { rank: 12, duration: "1m49s", sdr: "Harini", region: "SG", date: "May 04", co: "AWAK Technologies", contact: "Carol Su Yu Lim", platform: "Exotel", outcome: "Substantive", snippet: "Carol engaged for 1m49s." },
    { rank: 13, duration: "1m49s", sdr: "Harini", region: "SG", date: "May 06", co: "ACM Biolabs", contact: "Fong Qiwei", platform: "Exotel", outcome: "Substantive", snippet: "Qiwei engaged. ACM Biolabs follow-up from prior period's busy/callback record." },
    { rank: 14, duration: "1m39s", sdr: "Harini", region: "MY", date: "May 05", co: "GETBOX", contact: "Wang Frank", platform: "Exotel", outcome: "Substantive", snippet: "Frank Wang engaged for 1m39s." },
    { rank: 15, duration: "1m39s", sdr: "Harini", region: "SG", date: "May 05", co: "OOm", contact: "Wyvan Xu", platform: "Exotel", outcome: "Substantive", snippet: "Wyvan engaged for 1m39s." },
  ];

  // Outbound meetings - 1 booked from outbound campaign work this week (Aiko / Growsari from prior outbound nurture)
  const outboundMeetings: { name: string; co: string; sdr: string; ae: string; type: string; date: string; website: string; icp: boolean; note: string }[] = [
    {
      name: "Aiko Frances Sagusay",
      co: "Growsari",
      sdr: "Sukriti",
      ae: "Anuj",
      type: "Dashboard walkthrough (20 min)",
      date: "Week of May 11",
      website: "https://growsari-dashboard.vercel.app",
      icp: true,
      note: "Group Financial Controller. Wants a unified platform above Oracle accounting + banks/PSPs. Tailored email sent with mockup of unified view across 3 entities (Growsari Inc / Enterprise / G2M Fintech), working capital calculator (~₱440M unlock potential), and side-by-side cash flow comparison. Awaiting confirmation on in-person vs Zoom.",
    },
  ];

  // Classification mix from 103 transcribed answered calls (Apr 30 - May 06)
  const classifications = [
    { key: "Voicemail / IVR", count: 30, color: "gray" },
    { key: "Substantive conversation", count: 22, color: "blue" },
    { key: "Other / unclear", count: 12, color: "gray" },
    { key: "Brief human contact", count: 8, color: "gray" },
    { key: "Identity question (who is this?)", count: 7, color: "amber" },
    { key: "Busy / callback", count: 7, color: "amber" },
    { key: "Rejection", count: 6, color: "red" },
    { key: "Conversation (other)", count: 4, color: "blue" },
    { key: "Interested conversation", count: 3, color: "green" },
    { key: "Wrong number", count: 2, color: "gray" },
    { key: "Send email", count: 1, color: "amber" },
    { key: "Already has solution", count: 1, color: "amber" },
  ];

  // Team Leaderboard from SmartReach (Apr 30 - May 06)
  const teamLeaderboard = [
    { rank: 1, name: "Sukriti Chopra", role: "SDR", campaigns: 1, prospects: 51 },
    { rank: 2, name: "Harini Kaliyamoorthi", role: "SDR", campaigns: 1, prospects: 46 },
    { rank: 3, name: "Michelle Ling", role: "AE", campaigns: 1, prospects: 30 },
    { rank: 4, name: "Gibson Saw", role: "AE", campaigns: 1, prospects: 24 },
    { rank: 5, name: "Elross Pangue", role: "AE", campaigns: 1, prospects: 22 },
    { rank: 6, name: "Nouvelle Nye", role: "AE", campaigns: 1, prospects: 20 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Prospects Contacted" value="103" trend={{ val: -78, label: "vs prior" }} color="blue" />
        <MetricCard label="Emails Sent" value="~230" sub="97 unique prospects, 64% open (30d), 2% reply" color="blue" />
        <MetricCard label="LinkedIn Actions" value="294" sub="Engagement touchpoints across 4 AE accounts" color="purple" />
        <MetricCard label="Total Calls" value="258" sub="Harini: 123, Sukriti: 133" color="green" />
        <MetricCard label="Meetings (outbound)" value="1" sub="Aiko / Growsari - dashboard mockup walkthrough" color="amber" />
      </div>

      {/* ICP banner */}
      <Callout type="info">
        <strong>Period dominated by deep-touch follow-ups, not new volume.</strong> SmartReach activity dropped sharply (Prospects contacted 103, down 78% vs prior) as the team prioritized engaging the Apr 26 Lead Gen 3.0 cohort already in flight. Quality of conversations stayed high - 49 calls {'>'}30s on 258 dials (19%, up from 14%) and 10 conversations {'>'}2 min (up from 4). Aiko / Growsari outbound nurture matured into a tailored mockup + dashboard walk-through ask.
      </Callout>

      {/* Meetings from Outbound */}
      <Section title="Meetings Booked from Outbound" subtitle="1 meeting booked from outbound nurture this week.">
        <Callout type="success">
          <strong>Growsari (Aiko Sagusay, Group Financial Controller) - 20 min walkthrough scheduled.</strong> Outbound conversation matured: Aiko confirmed they have payment infra but want a unified platform above Oracle. Anuj sent a tailored email + a custom dashboard mockup at growsari-dashboard.vercel.app covering all 3 entities, a working-capital calculator (~₱440M unlock potential), and a side-by-side current vs unified flow.
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
      <Section title="Outreach Funnel" subtitle="~1,100 prospects in campaigns - 103 contacted this period (down 78% vs prior)">
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
                <p className="text-xl font-bold text-blue-900">64%</p>
                <p className="text-xs text-blue-500">30-day rolling - up from 58%</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-xs text-red-600 font-medium">Email Reply Rate</p>
                <p className="text-xl font-bold text-red-900">2%</p>
                <p className="text-xs text-red-500">1% positive (30d rolling)</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium">Call Conv Rate</p>
                <p className="text-xl font-bold text-emerald-900">19.0%</p>
                <p className="text-xs text-emerald-500">49 conversations {">"}30s - up from 14.3%</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-amber-600 font-medium">Call Pickup Rate</p>
                <p className="text-xl font-bold text-amber-900">43.0%</p>
                <p className="text-xs text-amber-500">Up slightly from 42.1%</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Email + LinkedIn Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Email Performance" subtitle="~230 emails sent (Sukriti 51 + Harini 46 unique prospects contacted)">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Open Rate</p>
              <p className="text-2xl font-bold text-emerald-600">64%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Reply Rate</p>
              <p className="text-2xl font-bold text-red-600">2%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Positive Replies</p>
              <p className="text-2xl font-bold text-red-600">1%</p>
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
          <Callout type="success">
            <strong>30-day open rate climbed to 64% (up from 58%).</strong> Bulk send concentrated on May 04. Reply rate 2% with 1% positive on a 30-day window - first positive sentiment ticks since the campaign began. Volume in-period was deliberately throttled while the team focused on call-driven follow-ups.
          </Callout>
        </Section>

        <Section title="LinkedIn Performance" subtitle="294 engagement touchpoints across 4 AE accounts (Michelle, Gibson, Nouvelle, Elross)">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Connection Rate (avg)</p>
              <p className="text-2xl font-bold text-emerald-600">18%</p>
              <p className="text-[10px] text-gray-500">across 4 AE campaigns</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Reply Rate</p>
              <p className="text-2xl font-bold text-red-600">0%</p>
              <p className="text-[10px] text-gray-500">0 LinkedIn replies recorded</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Actions Breakdown (last 30 days, post-launch)</p>
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
            <strong>Per-AE acceptance: Gibson 24%, Elross 22%, Michelle 16%, Nouvelle 10%.</strong> Gibson and Elross consolidating their lead in connection acceptance. Michelle holding 16%. Nouvelle slipped to 10% on 131 actions sent - connection-request copy may need a revisit. Still zero replies across the board - sequence step 2-3 messaging needs work.
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
          <strong>Email volume rebalanced this week - Sukriti 51, Harini 46.</strong> 4 AE LinkedIn campaigns combined = 96 prospects (49% of total contacted), reflecting a more balanced multi-persona distribution. SDR campaigns no longer dominate volume in the way they did at launch.
        </Callout>
      </Section>

      {/* Feedback from Outbound Calls - User-provided HubSpot key conversations */}
      <Section title="Feedback from Outbound Calls" subtitle="5 verbatim prospect responses captured from outbound calls this period. Pattern: 2x 'small setup / no fit', 2x 'send tailored email', 1x 'not interested'.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center">
            <p className="text-2xl font-bold text-amber-800">2</p>
            <p className="text-xs font-medium text-amber-600">Send tailored email</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-100 text-center">
            <p className="text-2xl font-bold text-red-800">2</p>
            <p className="text-xs font-medium text-red-600">Small setup / no fit</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-700">1</p>
            <p className="text-xs font-medium text-gray-500">Not interested - hung up</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">HubSpot call</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Notes from call</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Read</th>
              </tr>
            </thead>
            <tbody>
              {[
                { hsId: "474171829961", quote: "Already have a system in place for payments but they are looking for a functional platform that can manage all of their invoices. For accounting they use Oracle. Need to send tailored email including all the ways we can help.", read: "Send tailored email - Aiko / Growsari", variant: "success" as const },
                { hsId: "457015494363", quote: "He was busy but mentioned they have an in-house finance team plus a team in Singapore and Europe. Hesitant on the cross-border payments platform. Asked for an email he can forward to the concerned team.", read: "Send tailored email - in-house team", variant: "warning" as const },
                { hsId: "456973460217", quote: "Remembered the LinkedIn outreach, very pleasant. Around 10-12 people in finance, uses QuickBooks for accounting, everything else manual but happy with current setup as they are going through changes.", read: "No pain - happy with QuickBooks stack", variant: "default" as const },
                { hsId: "457027968706", quote: "They have a very small-scale setup, everything managed mostly in Singapore itself, so they do not need any payment solutions. Using traditional banks for now.", read: "Small setup - no fit", variant: "danger" as const },
                { hsId: "443182799605", quote: "Said they are not interested in any financial services and hung up.", read: "Not interested - hung up", variant: "danger" as const },
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
        <Callout type="success">
          <strong>"Send tailored email" is the new dominant ask (2 of 5).</strong> Aiko / Growsari turned a 4m call into a 20-min walkthrough off the back of the email + custom dashboard mockup. Repeat this play - tailored mockup + 5-min link instead of generic deck for every "send something over" ask.
        </Callout>
      </Section>

      {/* Call Performance */}
      <Section title="Call Performance" subtitle="258 attributed dials (Harini: 123, Sukriti: 133), Apr 30 - May 06. Calls transcribed via Whisper. Click SDR rows to see region breakdown.">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
            <p className="text-xs text-emerald-600 font-medium">Customer Answered</p>
            <p className="text-xl font-bold text-emerald-900">111</p>
            <p className="text-xs text-emerald-500">43.0%</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
            <p className="text-xs text-blue-600 font-medium">Conv {">"}30s</p>
            <p className="text-xl font-bold text-blue-900">49</p>
            <p className="text-xs text-blue-500">19.0%</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center">
            <p className="text-xs text-amber-600 font-medium">Conv {">"}2min</p>
            <p className="text-xl font-bold text-amber-900">10</p>
            <p className="text-xs text-amber-500">3.9%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-medium">No Answer / Busy</p>
            <p className="text-xl font-bold text-gray-700">66</p>
            <p className="text-xs text-gray-500">25.6%</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-100 text-center">
            <p className="text-xs text-red-600 font-medium">Failed / Canceled</p>
            <p className="text-xl font-bold text-red-900">81</p>
            <p className="text-xs text-red-500">31.4% - Leg2 not reached</p>
          </div>
        </div>

        {/* What happened on connected calls */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">What Happened on Connected Calls (111 answered, 103 transcribed via Whisper)</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
            <div onClick={() => toggle("interested-list")} className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center cursor-pointer hover:shadow-md transition-shadow">
              <p className="text-xs text-emerald-600 font-medium">Interested</p>
              <p className="text-xl font-bold text-emerald-900">3</p>
              <p className="text-xs text-emerald-500">Asked questions</p>
              <p className="text-[10px] text-gray-400 mt-1">Click to expand</p>
            </div>
            <div onClick={() => toggle("substantive-list")} className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center cursor-pointer hover:shadow-md transition-shadow">
              <p className="text-xs text-blue-600 font-medium">Substantive</p>
              <p className="text-xl font-bold text-blue-900">22</p>
              <p className="text-xs text-blue-500">Extended dialogue</p>
              <p className="text-[10px] text-gray-400 mt-1">Click to expand</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
              <p className="text-xs text-gray-500 font-medium">Voicemail / IVR</p>
              <p className="text-xl font-bold text-gray-700">30</p>
              <p className="text-xs text-gray-500">29% of answered</p>
            </div>
            <div onClick={() => toggle("callback-list")} className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center cursor-pointer hover:shadow-md transition-shadow">
              <p className="text-xs text-amber-600 font-medium">Busy / Callback</p>
              <p className="text-xl font-bold text-amber-900">7</p>
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
              <p className="text-xs font-bold text-emerald-700 uppercase mb-2">3 Interested Conversations</p>
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
                    { co: "1982 VC 2026 SPV I Pte. Ltd.", contact: "Scott Krivokopich", sdr: "Sukriti", region: "SG", dur: "6m37s", date: "Apr 30" },
                    { co: "AWAK Technologies", contact: "Carol Su Yu Lim", sdr: "Harini", region: "SG", dur: "1m49s", date: "May 04" },
                    { co: "Ah Fok Media", contact: "Andy Jeremiah Lam", sdr: "Harini", region: "SG", dur: "0m50s", date: "May 04" },
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
              <p className="text-xs text-emerald-800 mt-3 italic">1982 VC was an inbound intro that converted to a dashboard walkthrough booked May 7 with Gibson. AWAK + Ah Fok Media are outbound prospects - verify next steps in HubSpot.</p>
            </div>
          )}

          {/* Substantive */}
          {isOpen("substantive-list") && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-3">
              <p className="text-xs font-bold text-blue-700 uppercase mb-2">22 Substantive Conversations</p>
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
                    { co: "IRD", contact: "Faseeh Uddin", sdr: "Sukriti", region: "Other", dur: "3m29s", date: "May 06" },
                    { co: "(unknown)", contact: "-", sdr: "Sukriti", region: "Other", dur: "2m41s", date: "May 05" },
                    { co: "Perx Technologies", contact: "Larissa Valabhji", sdr: "Sukriti", region: "SG", dur: "2m24s", date: "May 06" },
                    { co: "GETBOX", contact: "Wang Frank", sdr: "Harini", region: "MY", dur: "1m39s", date: "May 05" },
                    { co: "Analytic Edge", contact: "Steve Sinha", sdr: "Harini", region: "AU", dur: "1m08s", date: "May 05" },
                    { co: "AP Technologies", contact: "Julia Leem", sdr: "Harini", region: "SG", dur: "1m08s", date: "May 04" },
                    { co: "Yenljmk", contact: "Fhaidalyn Binti Mohd Yuso", sdr: "Harini", region: "MY", dur: "1m01s", date: "May 04" },
                    { co: "Global Finance & Technology Network", contact: "James Boey", sdr: "Harini", region: "SG", dur: "0m59s", date: "May 06" },
                    { co: "(unknown)", contact: "-", sdr: "Unknown", region: "AU", dur: "0m58s", date: "May 05" },
                    { co: "Rhea Fertility", contact: "Gilad Rave", sdr: "Harini", region: "Other", dur: "0m54s", date: "May 06" },
                    { co: "iProspect", contact: "Luke Janich", sdr: "Harini", region: "SG", dur: "0m53s", date: "May 05" },
                    { co: "AsiaOne", contact: "Sean Ler", sdr: "Sukriti", region: "SG", dur: "0m51s", date: "May 06" },
                    { co: "(unknown)", contact: "-", sdr: "Sukriti", region: "Other", dur: "0m49s", date: "May 05" },
                    { co: "The Ortus Club", contact: "Jamie A.", sdr: "Harini", region: "PH", dur: "0m44s", date: "May 06" },
                    { co: "AP Technologies", contact: "Julia Leem", sdr: "Harini", region: "SG", dur: "0m41s", date: "May 04" },
                    { co: "Goku", contact: "Brett King", sdr: "Sukriti", region: "Other", dur: "0m41s", date: "May 04" },
                    { co: "Transpacific IP", contact: "Michelle Luo", sdr: "Harini", region: "SG", dur: "0m41s", date: "May 05" },
                    { co: "MDHR Legacy", contact: "Muhammad Danial Haikal Rosazri", sdr: "Harini", region: "MY", dur: "0m40s", date: "May 06" },
                    { co: "(unknown)", contact: "-", sdr: "Sukriti", region: "Other", dur: "0m39s", date: "May 05" },
                    { co: "Esco Aster", contact: "Colin Chin", sdr: "Harini", region: "SG", dur: "0m34s", date: "May 05" },
                    { co: "Anchor Abodes", contact: "Vinay Sharma", sdr: "Harini", region: "Other", dur: "0m31s", date: "May 04" },
                    { co: "MDHR Legacy", contact: "Muhammad Danial Haikal Rosazri", sdr: "Harini", region: "MY", dur: "0m30s", date: "May 06" },
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
              <p className="text-xs text-blue-800 mt-3 italic">22 substantive (vs 18 last week, +22%). MDHR Legacy carrying as repeat follow-up. Several mid-market SG names (Perx, AsiaOne, Esco Aster, Global Finance Tech) - watch for proper next-step logging.</p>
            </div>
          )}

          {/* Busy/callback */}
          {isOpen("callback-list") && (
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 mb-3">
              <p className="text-xs font-bold text-amber-700 uppercase mb-2">7 Busy / Callback Requests</p>
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
                    { co: "MDHR Legacy", contact: "Muhammad Danial Haikal Rosazri", sdr: "Harini", region: "MY", dur: "2m38s", date: "May 04" },
                    { co: "OOm", contact: "Wyvan Xu", sdr: "Harini", region: "SG", dur: "1m39s", date: "May 05" },
                    { co: "MVP Asia Pacific", contact: "Rommel Patio", sdr: "Harini", region: "PH", dur: "1m09s", date: "May 04" },
                    { co: "Singapore Accountants", contact: "Jibran Nasir", sdr: "Sukriti", region: "SG", dur: "1m04s", date: "May 05" },
                    { co: "(unknown SG)", contact: "-", sdr: "Harini", region: "SG", dur: "0m29s", date: "May 05" },
                    { co: "(unknown MY)", contact: "-", sdr: "Harini", region: "MY", dur: "0m26s", date: "May 04" },
                    { co: "(unknown SG)", contact: "-", sdr: "Sukriti", region: "SG", dur: "0m16s", date: "May 06" },
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
              <p className="text-xs text-amber-800 mt-3 italic">MDHR Legacy still in callback queue - 2m38s this week after a 7m26s breakthrough last week. OOm and MVP Asia Pacific both warm reschedule candidates - schedule into next week's calling block.</p>
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
                    { co: "Your View Roofong", contact: "Joshua Nyrhinen", sdr: "Harini", region: "AU", dur: "12m02s", date: "May 04" },
                    { co: "Majestic Track Pty Ltd", contact: "Kim On Bond", sdr: "Sukriti", region: "AU", dur: "4m48s", date: "May 05" },
                    { co: "PurdyInc", contact: "Neil Purdy", sdr: "Harini", region: "AU", dur: "2m31s", date: "May 04" },
                    { co: "CEO Asia", contact: "Glenn Lim", sdr: "Sukriti", region: "SG", dur: "1m21s", date: "May 06" },
                    { co: "Raelyn Tan", contact: "Raelyn Tan Xin Hui", sdr: "Harini", region: "SG", dur: "1m15s", date: "May 05" },
                    { co: "Horn", contact: "Haikal Kimi", sdr: "Sukriti", region: "MY", dur: "1m09s", date: "May 04" },
                    { co: "Middleeastretail", contact: "Timo Josten", sdr: "Sukriti", region: "SG", dur: "1m00s", date: "May 06" },
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
              <p className="text-xs text-amber-800 mt-3 italic">Identity-question rate dropped to 6.3% of answered (7 of 111). Notably 3 of 7 are AU - despite asking who's calling, prospects engaged for substantial time (Joshua Nyrhinen 12m02s -- already inbound, Kim On 4m48s, Neil Purdy 2m31s). The opener works once context lands.</p>
            </div>
          )}
        </div>

        {/* Daily trend */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-600 mb-2">Daily Calling Trend (May 1-3 = 0 dials, public-holiday + weekend)</p>
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
              <strong>AU jumped to 88% pickup with 35% conv rate.</strong> Driven by Your View Roofong (12m02s), Majestic Track (4m48s), PurdyInc (2m31s), Analytic Edge. SG still dominant volume (122 dials, 19% conv) and MY hit 19% conv on 42 dials. PH connection rate weakest (28%) - same regression as last week, recommend hour-window experiments.
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
            <p className="text-xs text-emerald-600 font-medium">Best: 3pm</p>
            <p className="text-xl font-bold text-emerald-900">56.2%</p>
            <p className="text-xs text-emerald-500">32 dials, 8 conv</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
            <p className="text-xs text-emerald-600 font-medium">Best volume: 2pm</p>
            <p className="text-xl font-bold text-emerald-900">30.4%</p>
            <p className="text-xs text-emerald-500">46 dials, 8 conv</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
            <p className="text-xs text-blue-600 font-medium">Best conv: 5pm</p>
            <p className="text-xl font-bold text-blue-900">23.3%</p>
            <p className="text-xs text-blue-500">10 conv {">"}30s on 43 dials</p>
          </div>
        </div>
      </Section>

      {/* Objections */}
      <Section title="Objection Analysis" subtitle="From 103 transcribed calls (Whisper). Click any row for guidance.">
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
                        {o.obj.includes("Send me an email") && "Don't default to a generic deck. Aiko / Growsari turned a 'send tailored email' ask into a booked walkthrough by getting a custom dashboard mockup. Replicate: 1-page mockup + interactive link instead of a PDF."}
                        {o.obj.includes("Already have a system") && "Probe what they have vs what they want. The Growsari case is a counter-example: they 'already had a system' but still wanted a unified layer above. Look for 'looking for' even after 'already have'."}
                        {o.obj.includes("Not interested") && "Respect decision, move to nurture. 3 of 6 rejections clustered on May 5-6 in SG - check if calling cadence has saturated those numbers."}
                        {o.obj.includes("Busy") && "MDHR Legacy is now a 3-week running callback - schedule with calendar invite + holdover comms. Don't let warm prospects go cold via repeated cold dials."}
                        {o.obj.includes("Who is this") && "Identity rate down to 6.3% (from 4.6% on a smaller answered base). Notable - 3 of 7 still engaged 2-12 minutes after asking. Opener is fine; what we say after 'this is X from Finmo' is what holds them."}
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
      <Section title="Transcript Classification" subtitle="103 transcribed / 111 answered. Voicemail dropped to 27% of answered (from prior 25% of answered) and substantive conversations rose to 21%.">
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
          <p className="text-[11px] text-gray-500 mb-3 italic">Per-AE LinkedIn campaign performance. Tracked over the last 30 days (post-Apr 26 launch).</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { ae: "Gibson", rate: 24, actions: 133, profileVisits: 108, connReqs: 25, color: "emerald" },
              { ae: "Elross", rate: 22, actions: 111, profileVisits: 89, connReqs: 22, color: "emerald" },
              { ae: "Michelle", rate: 16, actions: 162, profileVisits: 132, connReqs: 30, color: "amber" },
              { ae: "Nouvelle", rate: 10, actions: 131, profileVisits: 111, connReqs: 20, color: "amber" },
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
            <strong>Gibson + Elross extend their lead</strong> at 24% and 22% acceptance respectively, both above outbound benchmark for SDR campaigns. Michelle held 16% while pushing the most actions (162). Nouvelle slipped to 10% on 131 actions sent - connection-request copy needs an A/B refresh. Still 0 LinkedIn replies across all 4 - the connection accept-to-reply gap is the next thing to crack.
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
    { stage: "Total Zap Runs", value: 90, color: SLATE },
    { stage: "Junk/Internal", value: 29, color: RED },
    { stage: "Legitimate Signups", value: 61, color: GREEN },
  ];

  const junkBreakdown = [
    { category: "Finmo internal (@finmo.net)", count: 28 },
    { category: "Test org", count: 1 },
  ];

  const regionData = [
    { region: "Malaysia", count: 31, quality: "Low" },
    { region: "Australia", count: 11, quality: "High" },
    { region: "New Zealand", count: 7, quality: "High" },
    { region: "Singapore", count: 6, quality: "Medium" },
    { region: "Canada", count: 1, quality: "Medium" },
    { region: "Hong Kong", count: 1, quality: "Medium" },
    { region: "Cook Islands", count: 1, quality: "Low" },
    { region: "United States", count: 1, quality: "Medium" },
    { region: "Vietnam", count: 1, quality: "Low" },
    { region: "Not set", count: 1, quality: "Low" },
  ];

  const referralSources = [
    { source: "Not set", count: 61, pct: 100 },
  ];

  const dealActivity = [
    { bucket: "Contacts with deals", count: 35, note: "57% of legitimate signups have at least one HubSpot deal associated - up from 48% prior" },
    { bucket: "Contacts without deals", count: 26, note: "Personal-email Malaysia signups dominate this bucket - similar pattern as prior weeks" },
    { bucket: "Contacts with meetings", count: 6, note: "1982 VC + Busker Beat (this period), Your View Roofong (user-detailed AE call), plus 3 from auto-pull (UTSIT, ELRC follow-up, afini)" },
  ];

  // 3 inbound meetings + 3 auto-pull engagements this period
  const fi_meetings = [
    {
      co: "1982 VC 2026 SPV I Pte. Ltd.",
      contact: "Scott Krivokopich",
      country: "Singapore",
      ae: "Sukriti / Gibson",
      website: "",
      hsId: "",
      next: "Intro call done May 4 (Sukriti), Dashboard walkthrough May 7 (Gibson)",
      vol: "VC-fund SPV structure - investment management",
      note: "1982 Ventures inbound signup. Discovery call run by Sukriti, next session a dashboard walkthrough with Gibson scheduled May 7. SPV-based fund structure - watch for cross-border capital deployment use case.",
    },
  ];

  const non_fi_meetings = [
    {
      co: "Your View Roofong",
      contact: "Joshua Nyrhinen",
      country: "Australia",
      ae: "Nouvelle",
      website: "",
      hsId: "480348228319",
      next: "AE call scheduled with Nouvelle",
      vol: "AUD 200-255K annually, AUD 8-10K monthly across 10-15 txns",
      note: "Roofing + construction in AU. Cross-border supplier payments in USD, EUR, CNY (AUD base) for material procurement. Looking to escape bank FX fees. 12m02s discovery call - longest call of the period.",
    },
    {
      co: "Busker Beat",
      contact: "Hendri Tjung",
      country: "Singapore",
      ae: "Sukriti",
      website: "",
      hsId: "",
      next: "Discovery call done May 5",
      vol: "TBD - early stage discovery",
      note: "BuskerBeat x Finmo discovery call run by Sukriti.",
    },
  ];

  const auto_pull_meetings = [
    {
      co: "UTSIT",
      contact: "Stephane Li",
      ae: "Nouvelle",
      meetings: 1,
      latest: "Apr 28",
      note: "Dashboard-lite update + new features session - second meeting in the engagement (first was Nov 2025 in-person at Finmo Office).",
    },
    {
      co: "ELRC Trading (carry-over)",
      contact: "Hao Chen",
      ae: "Sukriti / Harini",
      meetings: 2,
      latest: "Apr 27",
      note: "Two prior meetings logged - 'Contact Us' meeting and intro call. Cross-period engagement continuation - watch for KYB progression.",
    },
    {
      co: "afini",
      contact: "Michael Kolman",
      ae: "Tom Kang",
      meetings: 1,
      latest: "Apr 29",
      note: "Re-engagement meeting (prior session was Mar 10). Tom Kang owns the engagement.",
    },
  ];

  const aeMeetingSummary = [
    { ae: "Sukriti", type: "1982 VC + Busker Beat", count: 2 },
    { ae: "Gibson", type: "1982 VC dashboard walk", count: 1 },
    { ae: "Nouvelle", type: "Your View Roofong + UTSIT", count: 2 },
    { ae: "Tom Kang", type: "afini", count: 1 },
    { ae: "Sukriti / Harini", type: "ELRC carry-over", count: 2 },
  ];

  const callDisposition = [
    { status: "No answer", count: 48, pct: 76 },
    { status: "Connected", count: 15, pct: 24 },
  ];

  const highValueLeads = [
    { co: "Your View Roofong", why: "AU construction, AUD 200-255K/year cross-border to USD/EUR/CNY suppliers. AE call with Nouvelle scheduled. 12m02s discovery call - longest of period.", status: "Hot", hsId: "480348228319" },
    { co: "1982 VC 2026 SPV I", why: "SG VC SPV. Sukriti ran intro May 4, Gibson dashboard walkthrough scheduled May 7. Watch for capital-deployment volume signal.", status: "Hot", hsId: "" },
    { co: "Growsari (outbound)", why: "PH FMCG distribution + ELista BNPL. Aiko Sagusay (Group Financial Controller) - 20-min walkthrough scheduled with Anuj after tailored mockup sent.", status: "Hot", hsId: "20889024" },
    { co: "Busker Beat", why: "SG inbound. Sukriti ran discovery call May 5. Volume + use case TBD.", status: "Warm", hsId: "" },
    { co: "ELRC Trading (carry)", why: "AU FI follow-up from prior period. Two meetings logged Apr 27. KYB + AE follow-up still in flight.", status: "Warm", hsId: "475047136965" },
    { co: "MDHR Legacy (carry)", why: "MY dairy cross-border. Two further calls this period (2m38s + 0m40s + 0m30s). Adlin's AE call still pending close.", status: "Warm", hsId: "476981142203" },
    { co: "STRATAGILE / CrossXpay (carry)", why: "Nouvelle's existing engagement from prior period. No new meetings logged this week - check on M H Express NZ proposal status.", status: "Warm", hsId: "" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Total Signups" value="90" sub="Apr 30 - May 06 zap runs" color="blue" />
        <MetricCard label="Legitimate" value="61" sub="68% of total" trend={{ val: 22, label: "vs prior" }} color="green" />
        <MetricCard label="Junk Rate" value="32%" sub="29 junk - up from 25% prior" trend={{ val: 7, label: "vs prior" }} color="red" />
        <MetricCard label="Meetings Booked" value="3" sub="1982 VC + Busker Beat + Your View Roofong" color="purple" />
        <MetricCard label="Contacts Called" value="77%" sub="47/61 - 63 calls, 1.3 per lead" color="cyan" />
      </div>

      {/* Signup Funnel */}
      <Section title="Signup Funnel" subtitle="90 total runs - 61 legitimate signups (68%) - junk rate climbed to 32%">
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
                <p className="text-xl font-bold text-blue-900">48</p>
                <p className="text-xs text-blue-500">79%</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium">Company Email</p>
                <p className="text-xl font-bold text-emerald-900">13</p>
                <p className="text-xs text-emerald-500">21%</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-amber-600 font-medium">Phone Coverage</p>
                <p className="text-xl font-bold text-amber-900">100%</p>
                <p className="text-xs text-amber-500">61/61 have phone</p>
              </div>
            </div>
            <Callout type="warning">
              <strong>Junk rate climbed back to 32% (up 7pts).</strong> Driven entirely by Finmo internal testing - 28 @finmo.net signups (vs 16 prior) means somebody's testing more aggressively. 61 unique legitimate signups (up from 50, +22%) - volume recovered. 60/61 in HubSpot with 55 new contacts. Company-email share also up to 21%.
            </Callout>
          </div>
        </div>
      </Section>

      {/* Junk Breakdown */}
      <Section title="Junk/Test Breakdown" subtitle="29 of 90 runs (32%). Finmo internal testing nearly doubled this period.">
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
        <Section title="By Country" subtitle="61 legitimate signups">
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
          <p className="text-xs text-gray-500 mt-2">Malaysia still leads (31/61 = 51%) but share dropped from 70%. Australia + New Zealand combined = 18 (30%) - the AU/NZ block is now a real second pillar. Singapore at 6 (10%).</p>
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
          <Callout type="danger">
            <strong>100% of signups this period (61/61) had no referral source set.</strong> Three consecutive weeks now - this is a confirmed structural form regression. Action: escalate the signup form referral_source field fix to engineering this week.
          </Callout>
        </Section>
      </div>

      {/* Call Activity on Inbound */}
      <Section title="Inbound Lead Calling Activity" subtitle="63 calls across 47 contacts. 14 contacts (23%) never called.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Call Disposition (63 calls)</h4>
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
            <StatRow label="Contacts called" value="47 / 61 (77%)" />
            <StatRow label="Avg calls per lead" value="1.3" />
            <StatRow label="Contacts never called" value="14 (23%)" />
            <StatRow label="Best inbound call: Your View Roofong" value="12m02s" highlight />
          </div>
        </div>
        <Callout type="warning">
          <strong>Inbound call coverage dropped to 77% (down from 88%).</strong> 14 inbound contacts never received a call - mostly the personal-email Malaysia bucket but worth a sweep before next period. Connected rate stayed steady at 24%. Best call of the week was Your View Roofong at 12m02s (Harini, AU - inbound signup that became Nouvelle's AE meeting).
        </Callout>
      </Section>

      {/* Deal Activity */}
      <Section title="Deal Activity" subtitle="35 of 61 legitimate signups (57%) have associated HubSpot deals. 6 contacts had meetings.">
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
        <Callout type="success">
          <strong>Deal-association rate up to 57% (from 48%).</strong> Volume of deals attached to signups (38) outpaced contacts (35) - some signups now have multiple deals. AU + SG inbounds (Your View Roofong, 1982 VC, Busker Beat) drove the meeting-conversion this week.
        </Callout>
      </Section>

      {/* Meetings */}
      <Section title="Meetings Booked from Inbound" subtitle="3 fresh inbound meetings + 3 from auto-pull (UTSIT, ELRC carry-over, afini).">
        <div className="overflow-x-auto mb-6">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">Financial Institutions / VC (1)</h4>
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
          <p className="text-[11px] text-gray-500 mb-3 italic">Your View Roofong was a user-detailed AE call with Nouvelle. The longest call this period (12m02s) - cross-border supplier payments use case.</p>
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
          <h4 className="font-semibold text-gray-800 text-sm mb-3">Auto-pulled from HubSpot (3)</h4>
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

        <Callout type="info">
          <strong>3 fresh inbound meetings + 3 carry-overs.</strong> Volume softer than prior period (6 fresh) but Your View Roofong (12m02s discovery, AU) and 1982 VC (SG VC SPV) are both quality sourced ICP names. AU + NZ continue to surface as a viable second-pillar geography - 18 signups (30% of legit) now matches MY share trajectory.
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

      {/* Active Inbound Signal - AU/NZ */}
      <Section title="Active Inbound Signal: AU/NZ Construction + Crypto / VC Cluster" subtitle="Your View Roofong (AU construction, 12m02s) + 1982 VC (SG VC SPV) - smallest fresh-meeting count in 4 weeks but quality of names is up.">
        <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-emerald-900">AU/NZ inbound block</p>
                <Badge text="2nd PILLAR" variant="success" />
              </div>
              <p className="text-sm text-emerald-700 mt-0.5">11 AU + 7 NZ legitimate signups (30% of total)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-xs">
            <div><p className="text-gray-500">Volume</p><p className="font-semibold">18 signups, &gt;1 meeting confirmed</p></div>
            <div><p className="text-gray-500">Shared ask</p><p className="font-semibold">AUD/USD/EUR/CNY cross-border, supplier payments</p></div>
            <div><p className="text-gray-500">AEs</p><p className="font-semibold">Nouvelle (Your View Roofong)</p></div>
            <div><p className="text-gray-500">Channel</p><p className="font-semibold">Inbound website signups</p></div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-emerald-200 mb-3">
            <p className="text-xs font-bold text-gray-600 uppercase mb-1">Per-prospect detail</p>
            <div className="space-y-1 text-xs text-gray-700">
              <p><span className="text-gray-400">Your View Roofong</span> - AUD 200-255K/year, 10-15 txns/mo. Cross-border to USD/EUR/CNY suppliers. Replacing bank FX. AE call with Nouvelle.</p>
              <p><span className="text-gray-400">1982 VC</span> - SG VC SPV. Sukriti intro May 4, Gibson dashboard walk May 7. Capital deployment volume TBD.</p>
              <p><span className="text-gray-400">Busker Beat</span> - SG. Sukriti discovery May 5. Use case TBD.</p>
            </div>
          </div>
          <Callout type="info">
            <strong>AU/NZ continues to surface as a real second pillar.</strong> 18 of 61 legitimate signups now from this block (30%). Pattern recognized 3 weeks running: AU has both small SME (Your View Roofong) + FI (ELRC carry-over) demand. Productize-or-partner decision still overdue.
          </Callout>
        </div>

        <div className="mt-4 rounded-lg border-2 border-violet-300 bg-violet-50 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-violet-900">Growsari (outbound nurture)</p>
                <Badge text="HIGH ENGAGEMENT" variant="purple" />
              </div>
              <p className="text-sm text-violet-700 mt-0.5">Aiko Sagusay - tailored mockup + 20 min walkthrough scheduled</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-violet-200">
            <p className="text-xs text-gray-700">PH FMCG distributor + ELista BNPL + SariPay wallet (250K merchants, $115M KKR/Tencent/IFC). 4m06s discovery call May 4 - already have payment system but want a unified platform above Oracle accounting. Anuj sent a tailored email + custom dashboard mockup at growsari-dashboard.vercel.app covering 3 entities, working capital calculator (~₱440M unlock potential), and side-by-side cash flow visualization. 20-min walkthrough scheduled. The mockup-first play is the conversion pattern to replicate.</p>
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

      {/* Strategic Conclusion - SME Marketing Agencies */}
      <Section title="Strategic Conclusion: Concluding Outbound to SME Marketing Agencies" subtitle="Cumulative outbound volume across Feb-Apr targeted at SME marketing agencies + adjacent small agencies has not produced ICP-fit conversion. Performance Marketing ads to the same ICP tell the same story. Time to pivot.">
        {/* Cumulative volume - the proof */}
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

        {/* The conclusion */}
        <Callout type="danger">
          <p className="font-bold mb-2 text-base">SMEs are not resonating with the cash-lite tools positioning.</p>
          <p className="text-sm">They don&apos;t have a reconciliation or cash-forecasting issue. They&apos;re happily running their own finances or using a part-time bookkeeper. <strong>Aspire / Airwallex is working fine for them.</strong> The "sell cash tools, upsell payments" motion is not converting - and not just for marketing agencies. Same pattern holds for any small agency.</p>
        </Callout>

        {/* Cross-functional consistency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 mb-5">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-bold text-gray-800 mb-2">BD Outbound (BD weekly reports, Feb-May)</h4>
            <ul className="text-xs text-gray-700 space-y-1.5">
              <li><strong>Apr 1-15:</strong> 754 prospects, 1,368 touchpoints, 601 calls, 58 conv {">"}30s, <strong>3 email replies (all negative)</strong>, 0% positive sentiment.</li>
              <li><strong>Apr 16-22:</strong> 378 prospects, 638 touchpoints, 233 calls, 28 conv {">"}30s, <strong>1 positive email reply (DataPull, exploratory call)</strong> + 2 negative.</li>
              <li><strong>Apr 23-29:</strong> 566 prospects, 1,028 touchpoints, 363 calls, 52 conv {">"}30s, <strong>0 positive replies</strong>, 7 verbatim "no time / no pain / pitch-back" quotes.</li>
              <li><strong>Apr 30 - May 06:</strong> 103 prospects, 393 touchpoints, 258 calls, 49 conv {">"}30s, <strong>1 positive: Aiko / Growsari (tailored mockup -&gt; walkthrough)</strong>. Lower volume, higher quality.</li>
              <li><strong>Cumulative:</strong> ~2,517 calls + ~4,200 emails + ~5,300 LinkedIn touches.</li>
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

        {/* The pivot */}
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

      {/* Key Observations */}
      <Section title="Key Observations">
        <div className="space-y-3">
          {[
            { num: "1", text: "3 fresh inbound meetings (vs 6 prior, -50%) + 3 carry-overs. Volume down but quality of names up - Your View Roofong (12m02s discovery) and 1982 VC are both proper-ICP names." },
            { num: "2", text: "Outbound volume dropped sharply (Prospects contacted 103, down 78%) but conversation quality jumped: 49 calls >30s out of 258 dials = 19% (up from 14%) and 10 calls >2 min (up from 4)." },
            { num: "3", text: "Aiko / Growsari nurture matured into a booked walkthrough off the back of a tailored email + custom dashboard mockup. First confirmed positive outbound conversion in weeks. Mockup-first play is the pattern to replicate." },
            { num: "4", text: "AU pickup 88% with 35% conv rate - dominant region this week. SG still leads volume (122 dials, 19% conv) but AU + MY both at 19% conv now." },
            { num: "5", text: "AE LinkedIn acceptance: Gibson 24%, Elross 22% pulling ahead. Michelle 16%, Nouvelle 10% trailing. Connection-request copy A/B test overdue. Still 0 LinkedIn replies across all 4 AE campaigns." },
            { num: "6", text: "Junk rate climbed to 32% (from 25%) - driven by 28 @finmo.net internal signups. Someone testing more aggressively this period - check for product/QA work in progress." },
            { num: "7", text: "Referral source = Not set 100% again - week 3 confirmed form regression. Escalate engineering fix this week, no more waiting." },
            { num: "8", text: "Inbound call coverage dropped to 77% (from 88%). 14 contacts never called - sweep before next period to avoid leakage on the personal-email MY bucket." },
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
export default function BDWeeklyApr30_May06() {
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
                <p className="text-sm text-gray-500">April 30 - May 06, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">Generated: May 06, 2026</span>
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
