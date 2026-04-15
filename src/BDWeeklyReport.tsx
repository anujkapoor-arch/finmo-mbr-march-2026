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
// HUBSPOT
// ============================================================
const HS = "https://app-na2.hubspot.com/contacts/20889024/record";

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
// ============================================================
function OutboundTab() {
  const { toggle, isOpen } = useExpandableRows();

  // -- Funnel data (updated from corrected report)
  const funnelSteps = [
    { stage: "Prospects in Campaigns", value: 4089, color: SLATE },
    { stage: "Prospects Contacted", value: 754, color: BLUE },
    { stage: "Email Opens (~est)", value: 243, color: CYAN },
    { stage: "Call Conversations >30s", value: 58, color: AMBER },
    { stage: "Call Conversations >2min", value: 13, color: GREEN },
    { stage: "LinkedIn Replies (~est)", value: 19, color: PINK },
    { stage: "Email Replies", value: 3, color: RED },
  ];

  // -- LinkedIn breakdown
  const linkedInPie = [
    { name: "Profile Visits", value: 477, color: BLUE },
    { name: "Connection Requests", value: 290, color: GREEN },
    { name: "Messages", value: 143, color: PINK },
  ];

  // -- Daily email volume
  const emailDaily = [
    { date: "Apr 1", emails: 85 },
    { date: "Apr 2", emails: 70 },
    { date: "Apr 3", emails: 75 },
    { date: "Apr 6", emails: 275 },
    { date: "Apr 7", emails: 95 },
    { date: "Apr 8", emails: 60 },
    { date: "Apr 9", emails: 210 },
    { date: "Apr 10", emails: 125 },
    { date: "Apr 13", emails: 270 },
    { date: "Apr 14", emails: 25 },
    { date: "Apr 15", emails: 10 },
  ];

  // -- Calling by date (updated)
  const callingDaily = [
    { date: "Apr 2", dials: 69, answered: 18, convGt30: 6, rate: 26 },
    { date: "Apr 6", dials: 86, answered: 29, convGt30: 11, rate: 34 },
    { date: "Apr 7", dials: 78, answered: 31, convGt30: 10, rate: 40 },
    { date: "Apr 8", dials: 70, answered: 22, convGt30: 6, rate: 31 },
    { date: "Apr 9", dials: 50, answered: 14, convGt30: 4, rate: 28 },
    { date: "Apr 10", dials: 76, answered: 25, convGt30: 8, rate: 33 },
    { date: "Apr 13", dials: 57, answered: 18, convGt30: 6, rate: 32 },
    { date: "Apr 14", dials: 53, answered: 17, convGt30: 4, rate: 32 },
    { date: "Apr 15", dials: 62, answered: 23, convGt30: 3, rate: 37 },
  ];

  // -- Calling hours (updated)
  const callingHours = [
    { hour: "8am", dials: 21, rate: 38.1, conv: 1 },
    { hour: "9am", dials: 25, rate: 48.0, conv: 1 },
    { hour: "10am", dials: 73, rate: 31.5, conv: 4 },
    { hour: "11am", dials: 47, rate: 31.9, conv: 4 },
    { hour: "12pm", dials: 40, rate: 27.5, conv: 6 },
    { hour: "1pm", dials: 79, rate: 36.7, conv: 5 },
    { hour: "2pm", dials: 68, rate: 27.9, conv: 6 },
    { hour: "3pm", dials: 83, rate: 32.5, conv: 13 },
    { hour: "4pm", dials: 53, rate: 41.5, conv: 8 },
    { hour: "5pm", dials: 54, rate: 33.3, conv: 5 },
  ];

  // -- Region data (updated)
  const regionData = [
    { region: "SG", dials: 361, answered: 113, rate: "31.3%", failCancel: 145, conv: 34, convRate: "9.4%" },
    { region: "AU", dials: 34, answered: 19, rate: "55.9%", failCancel: 9, conv: 8, convRate: "23.5%" },
    { region: "MY", dials: 62, answered: 25, rate: "40.3%", failCancel: 8, conv: 9, convRate: "14.5%" },
    { region: "Other", dials: 95, answered: 27, rate: "28.4%", failCancel: 33, conv: 5, convRate: "5.3%" },
    { region: "UK", dials: 16, answered: 4, rate: "25.0%", failCancel: 12, conv: 1, convRate: "6.3%" },
    { region: "ID", dials: 15, answered: 4, rate: "26.7%", failCancel: 4, conv: 0, convRate: "0.0%" },
    { region: "PH", dials: 9, answered: 2, rate: "22.2%", failCancel: 3, conv: 0, convRate: "0.0%" },
  ];

  // -- SDR data (Harini + Sukriti only, updated - 98.7% attribution)
  const sdrData = [
    { sdr: "Harini", dials: 274, answered: 89, rate: "32.5%", conv: 27, convRate: "9.9%", gt2min: 6 },
    { sdr: "Sukriti", dials: 313, answered: 101, rate: "32.3%", conv: 28, convRate: "8.9%", gt2min: 6 },
  ];

  // -- SDR x Region (expandable, updated)
  const sdrRegion = {
    Harini: [
      { region: "SG", dials: 160, answered: 62, rate: "39%", conv: 23, convRate: "14%" },
      { region: "Other", dials: 37, answered: 17, rate: "46%", conv: 2, convRate: "5%" },
      { region: "MY", dials: 28, answered: 9, rate: "32%", conv: 6, convRate: "21%" },
      { region: "AU", dials: 20, answered: 7, rate: "35%", conv: 3, convRate: "15%" },
      { region: "UK", dials: 15, answered: 3, rate: "20%", conv: 0, convRate: "0%" },
      { region: "PH", dials: 6, answered: 0, rate: "0%", conv: 0, convRate: "0%" },
      { region: "ZA", dials: 4, answered: 1, rate: "25%", conv: 1, convRate: "25%" },
      { region: "ID", dials: 3, answered: 1, rate: "33%", conv: 0, convRate: "0%" },
    ],
    Sukriti: [
      { region: "SG", dials: 201, answered: 51, rate: "25%", conv: 11, convRate: "5%" },
      { region: "Other", dials: 47, answered: 10, rate: "21%", conv: 3, convRate: "6%" },
      { region: "MY", dials: 34, answered: 16, rate: "47%", conv: 3, convRate: "9%" },
      { region: "AU", dials: 12, answered: 10, rate: "83%", conv: 4, convRate: "33%" },
      { region: "ID", dials: 11, answered: 3, rate: "27%", conv: 0, convRate: "0%" },
      { region: "PH", dials: 3, answered: 2, rate: "67%", conv: 0, convRate: "0%" },
      { region: "ZA", dials: 2, answered: 0, rate: "0%", conv: 0, convRate: "0%" },
      { region: "VN", dials: 2, answered: 1, rate: "50%", conv: 0, convRate: "0%" },
      { region: "UK", dials: 1, answered: 1, rate: "100%", conv: 1, convRate: "100%" },
    ],
  };

  // -- Objections (updated)
  const objections = [
    { obj: "Not interested", count: 10, by: "Harini: 9, Sukriti: 1" },
    { obj: "Busy / bad time", count: 10, by: "Harini: 8, Sukriti: 2" },
    { obj: "Don't need it", count: 2, by: "Harini: 2" },
    { obj: "Send me an email", count: 1, by: "Sukriti: 1" },
    { obj: "How did you get my number?", count: 1, by: "Harini: 1" },
    { obj: "Wrong number/person", count: 1, by: "Sukriti: 1" },
    { obj: "Already have solution", count: 1, by: "Sukriti: 1" },
  ];

  // -- Reply analysis
  const replies = [
    { name: "Jamshed Wadia", co: "Aideate Solutions", sdr: "Harini", date: "Apr 2", reply: "Thanks for reaching out. I don't have any requirements at the moment", type: "Polite Decline", variant: "danger" as const },
    { name: "Renier Lombard", co: "The Lekker Network", sdr: "Harini", date: "Apr 7", reply: "Thanks for sending through a connection inv...", type: "Acknowledgment", variant: "default" as const },
    { name: "Raghav Ahooja", co: "Launch Cycle", sdr: "Harini", date: "Apr 7", reply: "Were pretty good with our cash flows, thanks for reaching out", type: "Polite Decline", variant: "danger" as const },
    { name: "Claus Lauter", co: "idube Pte Ltd", sdr: "Sukriti", date: "Apr 10", reply: "Thanks, but not interested", type: "Not Interested", variant: "danger" as const },
    { name: "Sheetal Dasgupta", co: "My Ten Cents", sdr: "Harini", date: "Mar 24", reply: "Will let you know if such need arises", type: "Soft Maybe", variant: "warning" as const },
    { name: "Debbie Y.", co: "Moonrise Studio", sdr: "Harini", date: "Mar 17", reply: "no. not available", type: "Not Interested", variant: "danger" as const },
  ];

  // -- Top conversations (from updated outreach report with HubSpot links and outcomes)
  const topConversations = [
    { rank: 1, duration: "7m35s", sdr: "Harini", region: "AU", date: "Apr 13", hsId: "469029666533", company: "Travel Action Pty Ltd", snippet: "Meeting booked with AE - logistics/payments AU to HK/China, $50K-$400K AUD/month" },
    { rank: 2, duration: "4m59s", sdr: "Sukriti", region: "AU", date: "Apr 13", hsId: "467863184091", company: "Khaybar Services", snippet: "Existing customer - support issue (refund not received, $9,998.71 AUD)" },
    { rank: 3, duration: "4m07s", sdr: "Harini", region: "Other", date: "Apr 14", hsId: "470800623344", company: "Novara Partners", snippet: "Meeting booked - law firm/M&A advisory, multi-currency collection UK/US" },
    { rank: 4, duration: "3m12s", sdr: "Harini", region: "SG", date: "Apr 8", hsId: "121340124327", company: "Pollyanna Consulting", snippet: "Warm - traveling until end of month, asked for email" },
    { rank: 5, duration: "2m57s", sdr: "Sukriti", region: "SG", date: "Apr 14", hsId: "456973459146", company: "Mobbin", snippet: "Rejection - 'not interested', asked 'how did you get my number?'" },
    { rank: 6, duration: "2m54s", sdr: "Harini", region: "AU", date: "Apr 14", hsId: "469029666533", company: "Travel Action Pty Ltd", snippet: "Follow-up - rescheduled meeting to Thursday 4:30pm AU time" },
    { rank: 7, duration: "2m42s", sdr: "Harini", region: "SG", date: "Apr 10", hsId: "457029412571", company: "Gimmefy", snippet: "Meeting booked - Wednesday 1pm SGT" },
    { rank: 8, duration: "2m39s", sdr: "Sukriti", region: "AU", date: "Apr 8", hsId: "467863184091", company: "Khaybar Services", snippet: "Inbound signup follow-up - travel agency + money exchange" },
    { rank: 9, duration: "2m22s", sdr: "Harini", region: "SG", date: "Apr 13", hsId: "457014168306", company: "Futurx Creatives", snippet: "Warm - busy on shoot, asked for email" },
    { rank: 10, duration: "2m17s", sdr: "Harini", region: "MY", date: "Apr 2", hsId: "456973453000", company: "Ematic Solutions", snippet: "Warm - asked to email, will discuss with senior" },
  ];

  // -- Meetings booked from outbound
  const outboundMeetings = [
    { name: "Mohamed Addouj", co: "Travel Action Pty Ltd", sdr: "Harini", type: "Meeting with AE", date: "Apr 13", hsId: "469029666533", note: "Logistics/payments AU to HK/China, $50K-$400K AUD/month. Meeting rescheduled to Thu 4:30pm AU." },
    { name: "Takashi Toyokawa", co: "Novara Partners", sdr: "Harini", type: "Meeting Booked", date: "Apr 14", hsId: "470800623344", note: "Law firm/M&A advisory, multi-currency collection UK/US." },
    { name: "Mahima P.", co: "Gimmefy", sdr: "Harini", type: "Meeting Booked", date: "Apr 10", hsId: "457029412571", note: "Meeting booked for Wednesday 1pm SGT." },
    { name: "Debbie Yong", co: "Atypical Media", sdr: "Harini", type: "Focus Group Research Call", date: "Apr 13", hsId: "457027914450", note: "Executive branding & thought leadership studio, SG." },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Prospects Contacted" value="754" trend={{ val: -6, label: "vs prior" }} color="blue" />
        <MetricCard label="Emails Sent" value="856" sub="379 prospects, ~2.3 per prospect" color="blue" />
        <MetricCard label="LinkedIn Actions" value="910" sub="75 prospects, 17% connection rate" color="purple" />
        <MetricCard label="Total Calls" value="587" sub="Harini: 274, Sukriti: 313" color="green" />
        <MetricCard label="Meetings Booked" value="4" sub="Travel Action, Novara, Gimmefy, Atypical Media" color="amber" />
      </div>

      {/* Outbound Meetings */}
      <Section title="Meetings Booked from Outbound" subtitle="4 meetings booked in the period - cold calls converting to AE meetings">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Contact</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">SDR</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Type</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {outboundMeetings.map((m) => (
                <tr key={m.hsId} className="border-b border-gray-50">
                  <td className="py-2 px-3">
                    <a href={`${HS}/0-1/${m.hsId}`} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline">
                      {m.name} <span className="text-[10px] text-blue-400">&#8599;</span>
                    </a>
                  </td>
                  <td className="py-2 px-3">{m.co}</td>
                  <td className="py-2 px-3 text-xs">{m.sdr}</td>
                  <td className="py-2 px-3 text-xs">{m.type}</td>
                  <td className="py-2 px-3 text-xs text-gray-500">{m.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 space-y-2">
          {outboundMeetings.map((m) => (
            <p key={m.hsId} className="text-xs text-gray-500"><strong>{m.co}:</strong> {m.note}</p>
          ))}
        </div>
      </Section>

      {/* Outreach Funnel */}
      <Section title="Outreach Funnel" subtitle="4,089 prospects in campaigns - 754 contacted this period">
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
                <p className="text-xs text-blue-500">Strong - subject lines work</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-xs text-red-600 font-medium">Email Reply Rate</p>
                <p className="text-xl font-bold text-red-900">1%</p>
                <p className="text-xs text-red-500">All 3 replies negative</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium">Call Conv Rate</p>
                <p className="text-xl font-bold text-emerald-900">9.7%</p>
                <p className="text-xs text-emerald-500">58 conversations {">"}30s</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-amber-600 font-medium">LinkedIn Reply Rate</p>
                <p className="text-xl font-bold text-amber-900">25%</p>
                <p className="text-xs text-amber-500">~19 replies from 75 contacted</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Email + LinkedIn Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Performance */}
        <Section title="Email Performance" subtitle="856 emails to 379 prospects via SmartReach">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Open Rate</p>
              <p className="text-2xl font-bold text-emerald-600">64%</p>
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
            <strong>Gap between opens and replies:</strong> 64% open but 1% reply - prospects open but don't find enough value to respond.
          </Callout>
        </Section>

        {/* LinkedIn Performance */}
        <Section title="LinkedIn Performance" subtitle="910 actions across 75 prospects">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Connection Rate</p>
              <p className="text-2xl font-bold text-emerald-600">17%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Reply Rate</p>
              <p className="text-2xl font-bold text-emerald-600">25%</p>
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
          <Callout type="success">
            <strong>LinkedIn outperforms email 25x</strong> on reply rate (25% vs 1%). Profile visits (477) warm prospects before connection requests.
          </Callout>
        </Section>
      </div>

      {/* Reply Analysis */}
      <Section title="Reply Analysis" subtitle="3 email replies (all negative) + LinkedIn replies in the period. Click any row for details.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-red-50 rounded-lg p-3 border border-red-100 text-center">
            <p className="text-2xl font-bold text-red-800">3</p>
            <p className="text-xs font-medium text-red-600">Polite Decline / Not Interested</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center">
            <p className="text-2xl font-bold text-amber-800">1</p>
            <p className="text-xs font-medium text-amber-600">Soft Maybe</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-700">2</p>
            <p className="text-xs font-medium text-gray-500">No Reply Captured</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="w-6 py-2 px-2"></th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Contact</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">SDR</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Type</th>
              </tr>
            </thead>
            <tbody>
              {replies.map((r) => (
                <>
                  <tr key={r.name} onClick={() => toggle(`reply-${r.name}`)} className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer">
                    <td className="py-2 px-2"><Chevron open={isOpen(`reply-${r.name}`)} /></td>
                    <td className="py-2 px-3 font-medium">{r.name}</td>
                    <td className="py-2 px-3 text-gray-600">{r.co}</td>
                    <td className="py-2 px-3 text-xs">{r.sdr}</td>
                    <td className="py-2 px-3"><Badge text={r.type} variant={r.variant} /></td>
                  </tr>
                  {isOpen(`reply-${r.name}`) && (
                    <DetailPanel key={`reply-${r.name}-detail`}>
                      <DetailGrid items={[
                        { label: "Date", value: r.date },
                        { label: "SDR", value: r.sdr },
                        { label: "Company", value: r.co },
                        { label: "Type", value: r.type },
                      ]} />
                      <p className="mt-2 text-sm text-gray-700 italic">"{r.reply}"</p>
                    </DetailPanel>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Call Performance */}
      <Section title="Call Performance" subtitle="587 dials (Harini: 274, Sukriti: 313), Apr 2-15. 98.7% SDR attribution. Click SDR rows to see region breakdown.">
        {/* Top-level call metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
            <p className="text-xs text-emerald-600 font-medium">Customer Answered</p>
            <p className="text-xl font-bold text-emerald-900">190</p>
            <p className="text-xs text-emerald-500">32.4%</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
            <p className="text-xs text-blue-600 font-medium">Conv {">"}30s</p>
            <p className="text-xl font-bold text-blue-900">55</p>
            <p className="text-xs text-blue-500">9.4%</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center">
            <p className="text-xs text-amber-600 font-medium">Conv {">"}2min</p>
            <p className="text-xl font-bold text-amber-900">12</p>
            <p className="text-xs text-amber-500">2.0%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-medium">No Answer</p>
            <p className="text-xl font-bold text-gray-700">159</p>
            <p className="text-xs text-gray-500">26.5%</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-100 text-center">
            <p className="text-xs text-red-600 font-medium">Failed / Canceled</p>
            <p className="text-xl font-bold text-red-900">166</p>
            <p className="text-xs text-red-500">Leg2 not reached</p>
          </div>
        </div>

        {/* What happened on connected calls */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">What Happened on Connected Calls (197 answered, 181 transcribed)</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
            <div onClick={() => toggle("interested-list")} className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center cursor-pointer hover:shadow-md transition-shadow">
              <p className="text-xs text-emerald-600 font-medium">Interested</p>
              <p className="text-xl font-bold text-emerald-900">12</p>
              <p className="text-xs text-emerald-500">Asked for demo/info</p>
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
              <p className="text-xl font-bold text-gray-700">68</p>
              <p className="text-xs text-gray-500">34.5% of answered</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-100 text-center">
              <p className="text-xs text-red-600 font-medium">Rejection</p>
              <p className="text-xl font-bold text-red-900">14</p>
              <p className="text-xs text-red-500">7.1% of answered</p>
            </div>
            <div onClick={() => toggle("callback-list")} className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-center cursor-pointer hover:shadow-md transition-shadow">
              <p className="text-xs text-amber-600 font-medium">Callback Request</p>
              <p className="text-xl font-bold text-amber-900">7</p>
              <p className="text-xs text-amber-500">Follow-up needed</p>
              <p className="text-[10px] text-gray-400 mt-1">Click to expand</p>
            </div>
          </div>

          {/* Interested leads list - split by inbound/outbound */}
          {isOpen("interested-list") && (
            <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 mb-3">
              <p className="text-xs font-bold text-emerald-700 uppercase mb-2">12 Interested Conversations - Prospect asked questions / requested demo</p>
              <p className="text-xs font-semibold text-gray-600 mt-3 mb-1">Inbound (3)</p>
              <table className="w-full text-xs mb-4">
                <thead>
                  <tr className="border-b border-emerald-300">
                    <th className="text-left py-1 px-2 font-semibold">Company</th>
                    <th className="text-left py-1 px-2 font-semibold">SDR</th>
                    <th className="text-left py-1 px-2 font-semibold">Region</th>
                    <th className="text-left py-1 px-2 font-semibold">Duration</th>
                    <th className="text-left py-1 px-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { co: "Travel action / Orient Travel", hsId: "", sdr: "Harini", region: "AU", dur: "7m35s", date: "Apr 13" },
                    { co: "Novara Advisory Partners", hsId: "", sdr: "Harini", region: "Other", dur: "4m07s", date: "Apr 14" },
                    { co: "Travel action / Orient Travel", hsId: "", sdr: "Harini", region: "AU", dur: "2m54s", date: "Apr 14" },
                  ].map((l, i) => (
                    <tr key={i} className="border-b border-emerald-100">
                      <td className="py-1.5 px-2 font-medium">{l.co}</td>
                      <td className="py-1.5 px-2">{l.sdr}</td>
                      <td className="py-1.5 px-2"><Badge text={l.region} variant={l.region === "AU" ? "success" : "default"} /></td>
                      <td className="py-1.5 px-2 font-medium">{l.dur}</td>
                      <td className="py-1.5 px-2 text-gray-500">{l.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs font-semibold text-gray-600 mb-1">Outbound (9)</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-emerald-300">
                    <th className="text-left py-1 px-2 font-semibold">Company</th>
                    <th className="text-left py-1 px-2 font-semibold">SDR</th>
                    <th className="text-left py-1 px-2 font-semibold">Region</th>
                    <th className="text-left py-1 px-2 font-semibold">Duration</th>
                    <th className="text-left py-1 px-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { co: "Pollyanna Consulting", hsId: "121340124327", sdr: "Harini", region: "SG", dur: "3m12s", date: "Apr 8" },
                    { co: "Mobbin", hsId: "456973459146", sdr: "Sukriti", region: "SG", dur: "2m57s", date: "Apr 14" },
                    { co: "Ematic Solutions", hsId: "456973453000", sdr: "Harini", region: "MY", dur: "2m17s", date: "Apr 2" },
                    { co: "Mic Drop Media", hsId: "443603095236", sdr: "Sukriti", region: "UK", dur: "1m51s", date: "Apr 2" },
                    { co: "JNR Entertainment", hsId: "457027988211", sdr: "Harini", region: "SG", dur: "1m22s", date: "Apr 6" },
                    { co: "The Cult", hsId: "457029495505", sdr: "Harini", region: "SG", dur: "1m22s", date: "Apr 9" },
                    { co: "Light 4 Flash Photography", hsId: "457015619320", sdr: "Harini", region: "SG", dur: "0m39s", date: "Apr 7" },
                    { co: "Weqollab", hsId: "457015513810", sdr: "Harini", region: "SG", dur: "0m33s", date: "Apr 9" },
                    { co: "Aesir Ventures", hsId: "", sdr: "Harini", region: "SG", dur: "1m01s", date: "Apr 7" },
                  ].map((l, i) => (
                    <tr key={i} className="border-b border-emerald-100">
                      <td className="py-1.5 px-2 font-medium">
                        {l.hsId ? (
                          <a href={`${HS}/0-1/${l.hsId}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                            {l.co} <span className="text-[10px] text-blue-400">&#8599;</span>
                          </a>
                        ) : l.co}
                      </td>
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

          {/* Substantive leads list - split by inbound/outbound */}
          {isOpen("substantive-list") && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-3">
              <p className="text-xs font-bold text-blue-700 uppercase mb-2">18 Substantive Conversations - Extended dialogue, prospect engaged</p>
              <p className="text-xs font-semibold text-gray-600 mt-3 mb-1">Inbound (6)</p>
              <table className="w-full text-xs mb-4">
                <thead>
                  <tr className="border-b border-blue-300">
                    <th className="text-left py-1 px-2 font-semibold">Company</th>
                    <th className="text-left py-1 px-2 font-semibold">SDR</th>
                    <th className="text-left py-1 px-2 font-semibold">Region</th>
                    <th className="text-left py-1 px-2 font-semibold">Duration</th>
                    <th className="text-left py-1 px-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { co: "Uptrade", hsId: "", sdr: "Harini", region: "AU", dur: "2m29s", date: "Apr 13" },
                    { co: "Midnight Indulgence Pte Ltd", hsId: "", sdr: "Sukriti", region: "SG", dur: "1m33s", date: "Apr 6" },
                    { co: "Ajib", hsId: "", sdr: "Harini", region: "MY", dur: "1m00s", date: "Apr 6" },
                    { co: "FF SPEED LOGISTIC", hsId: "", sdr: "Sukriti", region: "SG", dur: "0m49s", date: "Apr 13" },
                    { co: "Tasvar", hsId: "", sdr: "Harini", region: "MY", dur: "0m36s", date: "Apr 2" },
                    { co: "Alina (inbound)", hsId: "", sdr: "Sukriti", region: "MY", dur: "1m12s", date: "Apr 14" },
                  ].map((l, i) => (
                    <tr key={i} className="border-b border-blue-100">
                      <td className="py-1.5 px-2 font-medium">{l.co}</td>
                      <td className="py-1.5 px-2">{l.sdr}</td>
                      <td className="py-1.5 px-2"><Badge text={l.region} variant={l.region === "AU" ? "success" : "default"} /></td>
                      <td className="py-1.5 px-2 font-medium">{l.dur}</td>
                      <td className="py-1.5 px-2 text-gray-500">{l.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs font-semibold text-gray-600 mb-1">Outbound (12)</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-blue-300">
                    <th className="text-left py-1 px-2 font-semibold">Company</th>
                    <th className="text-left py-1 px-2 font-semibold">SDR</th>
                    <th className="text-left py-1 px-2 font-semibold">Region</th>
                    <th className="text-left py-1 px-2 font-semibold">Duration</th>
                    <th className="text-left py-1 px-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { co: "gimmefy", hsId: "457029412571", sdr: "Harini", region: "SG", dur: "2m42s", date: "Apr 10" },
                    { co: "Goodfellas", hsId: "456857414369", sdr: "Sukriti", region: "SG", dur: "2m11s", date: "Apr 7" },
                    { co: "Slashie Media", hsId: "457027618530", sdr: "Sukriti", region: "SG", dur: "1m40s", date: "Apr 7" },
                    { co: "Transpacific IP", hsId: "456973462240", sdr: "Harini", region: "SG", dur: "1m18s", date: "Apr 8" },
                    { co: "MS Works", hsId: "457014183647", sdr: "Sukriti", region: "SG", dur: "1m12s", date: "Apr 10" },
                    { co: "Lumina", hsId: "456973467347", sdr: "Harini", region: "SG", dur: "0m54s", date: "Apr 9" },
                    { co: "APT811 Design", hsId: "457025176251", sdr: "Sukriti", region: "SG", dur: "0m52s", date: "Apr 6" },
                    { co: "Dream Station", hsId: "457029503710", sdr: "Sukriti", region: "SG", dur: "0m49s", date: "Apr 15" },
                    { co: "YoRipe", hsId: "457031273169", sdr: "Harini", region: "SG", dur: "0m44s", date: "Apr 9" },
                    { co: "Virtue", hsId: "457028010710", sdr: "Harini", region: "SG", dur: "0m43s", date: "Apr 6" },
                    { co: "Linxx Consultancy", hsId: "457018553026", sdr: "Harini", region: "SG", dur: "0m31s", date: "Apr 8" },
                    { co: "Revivo BioSystems", hsId: "457029316308", sdr: "Sukriti", region: "SG", dur: "0m30s", date: "Apr 9" },
                  ].map((l, i) => (
                    <tr key={i} className="border-b border-blue-100">
                      <td className="py-1.5 px-2 font-medium">
                        <a href={`${HS}/0-1/${l.hsId}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                          {l.co} <span className="text-[10px] text-blue-400">&#8599;</span>
                        </a>
                      </td>
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

          {/* Callback requests list - split by inbound/outbound */}
          {isOpen("callback-list") && (
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 mb-3">
              <p className="text-xs font-bold text-amber-700 uppercase mb-2">8 Callback Requests - Prospects asked to be called back</p>
              <p className="text-xs font-semibold text-gray-600 mt-3 mb-1">Inbound (2)</p>
              <table className="w-full text-xs mb-4">
                <thead>
                  <tr className="border-b border-amber-300">
                    <th className="text-left py-1 px-2 font-semibold">Company</th>
                    <th className="text-left py-1 px-2 font-semibold">SDR</th>
                    <th className="text-left py-1 px-2 font-semibold">Region</th>
                    <th className="text-left py-1 px-2 font-semibold">Duration</th>
                    <th className="text-left py-1 px-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { co: "Fox Travel PTY LTD", hsId: "", sdr: "Sukriti", region: "AU", dur: "4m59s", date: "Apr 13" },
                    { co: "Fox Travel PTY LTD", hsId: "", sdr: "Sukriti", region: "AU", dur: "1m33s", date: "Apr 10" },
                  ].map((l, i) => (
                    <tr key={i} className="border-b border-amber-100">
                      <td className="py-1.5 px-2 font-medium">{l.co}</td>
                      <td className="py-1.5 px-2">{l.sdr}</td>
                      <td className="py-1.5 px-2"><Badge text={l.region} variant={l.region === "AU" ? "success" : "default"} /></td>
                      <td className="py-1.5 px-2 font-medium">{l.dur}</td>
                      <td className="py-1.5 px-2 text-gray-500">{l.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs font-semibold text-gray-600 mb-1">Outbound (6)</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-amber-300">
                    <th className="text-left py-1 px-2 font-semibold">Company</th>
                    <th className="text-left py-1 px-2 font-semibold">SDR</th>
                    <th className="text-left py-1 px-2 font-semibold">Region</th>
                    <th className="text-left py-1 px-2 font-semibold">Duration</th>
                    <th className="text-left py-1 px-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { co: "Futurx Creatives", hsId: "457014168306", sdr: "Harini", region: "SG", dur: "2m22s", date: "Apr 13" },
                    { co: "iProspect", hsId: "457015483103", sdr: "Harini", region: "SG", dur: "0m58s", date: "Apr 15" },
                    { co: "ACCSS Digital", hsId: "457027924701", sdr: "Harini", region: "SG", dur: "0m54s", date: "Apr 7" },
                    { co: "PR Communications", hsId: "457027928809", sdr: "Harini", region: "SG", dur: "0m44s", date: "Apr 15" },
                    { co: "Longevity Science Corp", hsId: "457015513844", sdr: "Harini", region: "AU", dur: "0m40s", date: "Apr 10" },
                    { co: "The Logistics Institute", hsId: "457016924908", sdr: "Harini", region: "SG", dur: "0m27s", date: "Apr 7" },
                  ].map((l, i) => (
                    <tr key={i} className="border-b border-amber-100">
                      <td className="py-1.5 px-2 font-medium">
                        <a href={`${HS}/0-1/${l.hsId}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                          {l.co} <span className="text-[10px] text-blue-400">&#8599;</span>
                        </a>
                      </td>
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

        </div>

        {/* Daily trend */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-600 mb-2">Daily Calling Trend</p>
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

        {/* By SDR - expandable to show region breakdown */}
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
                      <td className="py-2 px-2"><Chevron open={isOpen(`sdr-${s.sdr}`)} /></td>
                      <td className="py-2 px-3 font-medium">{s.sdr}</td>
                      <td className="text-right py-2 px-3 font-bold">{s.dials}</td>
                      <td className="text-right py-2 px-3">{s.answered}</td>
                      <td className="text-right py-2 px-3">{s.rate}</td>
                      <td className="text-right py-2 px-3 font-medium">{s.conv}</td>
                      <td className="text-right py-2 px-3 font-medium">{s.convRate}</td>
                      <td className="text-right py-2 px-3">{s.gt2min}</td>
                    </tr>
                    {isOpen(`sdr-${s.sdr}`) && (
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
            <Callout type="info">
              <strong>AU best performer:</strong> 55.9% pickup rate and 23.5% conversation rate - but only 34 dials. MY also strong at 14.5% conv rate.
            </Callout>
          </div>
        </div>
      </Section>

      {/* Calling Hours Heatmap */}
      <Section title="Optimal Calling Hours" subtitle="Pickup rate by prospect local time. Best hours highlighted.">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={callingHours}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} unit="%" />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="rate" name="Pickup Rate %" radius={[4, 4, 0, 0]}>
              {callingHours.map((entry, i) => (
                <Cell key={i} fill={entry.rate >= 40 ? GREEN : entry.rate >= 30 ? BLUE : SLATE} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
            <p className="text-xs text-emerald-600 font-medium">Best: 9am</p>
            <p className="text-xl font-bold text-emerald-900">48.0%</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
            <p className="text-xs text-emerald-600 font-medium">Best: 4pm</p>
            <p className="text-xl font-bold text-emerald-900">41.5%</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
            <p className="text-xs text-blue-600 font-medium">Best conv: 3pm</p>
            <p className="text-xl font-bold text-blue-900">15.7%</p>
          </div>
        </div>
      </Section>

      {/* Objections */}
      <Section title="Objection Analysis" subtitle="From 181 transcribed calls. Click any row for details.">
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
                        {o.obj === "Not interested" && "Happens when SDR has no relevant angle. Ensure research notes are reviewed before each call."}
                        {o.obj === "Busy / bad time" && "Create a callback queue in HubSpot for these prospects. Shift AU dials to 9-11am local time."}
                        {o.obj === "Don't need it" && "Small single-currency companies may not have treasury complexity. Potential ICP mismatch."}
                        {o.obj === "Send me an email" && "Not a rejection - they haven't heard enough value in 15 seconds. Refine the opening hook."}
                        {o.obj === "How did you get my number?" && "SDRs need a confident response: 'We found your details through LinkedIn / your company website.'"}
                        {o.obj === "Already have solution" && "Competitor already in place. Opportunity in the mid-market gap."}
                      </p>
                    </DetailPanel>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Top Conversations */}
      <Section title="Top 10 Conversations (Harini + Sukriti)" subtitle="Longest calls by duration. Click any row for details.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="w-6 py-2 px-2"></th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">SDR</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Duration</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Region</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {topConversations.map((c) => (
                <>
                  <tr key={c.rank} onClick={() => toggle(`conv-${c.rank}`)} className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer">
                    <td className="py-2 px-2"><Chevron open={isOpen(`conv-${c.rank}`)} /></td>
                    <td className="py-2 px-3 font-medium">
                      <a href={`${HS}/0-1/${c.hsId}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-700 hover:underline">
                        {c.company} <span className="text-[10px] text-blue-400">&#8599;</span>
                      </a>
                    </td>
                    <td className="py-2 px-3 text-xs">{c.sdr}</td>
                    <td className="py-2 px-3 font-bold text-blue-700">{c.duration}</td>
                    <td className="py-2 px-3"><Badge text={c.region} variant={c.region === "AU" ? "success" : "default"} /></td>
                    <td className="py-2 px-3 text-xs text-gray-500">{c.date}</td>
                  </tr>
                  {isOpen(`conv-${c.rank}`) && (
                    <DetailPanel key={`conv-${c.rank}-detail`}>
                      <p className="text-sm text-gray-700">{c.snippet}</p>
                    </DetailPanel>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Recommendations */}
      <Section title="Key Recommendations">
        <div className="space-y-3">
          {[
            { priority: "P0", action: "Follow up on 12 interested conversations", detail: "These prospects asked questions or requested demos. Verify they are tracked in HubSpot with next steps assigned.", color: "danger" as const },
            { priority: "P0", action: "Follow up on 8 callback requests", detail: "Prospects asked to be called back later - some interest. Ensure re-contact is scheduled.", color: "danger" as const },
            { priority: "P1", action: "Double down on LinkedIn", detail: "25% reply rate vs 1% email. LinkedIn is 25x more effective at generating engagement. Increase LinkedIn-first sequencing.", color: "warning" as const },
            { priority: "P1", action: "Increase AU call volume", detail: "47.1% pickup rate and 20.6% conv rate but only 34 dials. AU prospects are answering and engaging.", color: "warning" as const },
            { priority: "P1", action: "Fix Exotel call routing", detail: "35.6% of calls never reach the customer (canceled + failed + Leg2 N/A). SDR connects but prospect leg fails.", color: "warning" as const },
            { priority: "P2", action: "Filter voicemail earlier", detail: "68 answered calls (34.5%) are voicemail/IVR. Consider voicemail detection to save SDR time.", color: "info" as const },
            { priority: "P2", action: "Address activity gaps", detail: "No activity on Apr 2, 4-6, 11-12. Maintain daily cadence.", color: "info" as const },
          ].map((r) => (
            <div key={r.action} className="flex items-start gap-3">
              <Badge text={r.priority} variant={r.color === "danger" ? "danger" : r.color === "warning" ? "warning" : "default"} />
              <div>
                <p className="font-semibold text-sm text-gray-900">{r.action}</p>
                <p className="text-xs text-gray-600">{r.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ============================================================
// INBOUND TAB
// ============================================================
function InboundTab() {
  const { toggle, isOpen } = useExpandableRows();

  const signupFunnel = [
    { stage: "Total Zap Runs", value: 92, color: SLATE },
    { stage: "Junk/Internal", value: 43, color: RED },
    { stage: "Legitimate Signups", value: 49, color: GREEN },
  ];

  const junkBreakdown = [
    { category: "Finmo internal (@finmo.net)", count: 26 },
    { category: "AcidComms/Shaun testing", count: 9 },
    { category: "Junk org names (Test/UAT)", count: 3 },
    { category: "Junk org names (Acme/None)", count: 2 },
    { category: "Employee test accounts", count: 1 },
    { category: "UTM testing", count: 1 },
    { category: "Disposable signups", count: 1 },
  ];

  const regionData = [
    { region: "Malaysia", count: 24, quality: "Mixed" },
    { region: "Singapore", count: 9, quality: "Medium" },
    { region: "Australia", count: 5, quality: "High" },
    { region: "United Kingdom", count: 3, quality: "Medium" },
    { region: "France", count: 2, quality: "Low" },
    { region: "Other (6 countries)", count: 6, quality: "Mixed" },
  ];

  const referralSources = [
    { source: "Not set", count: 27, pct: 55 },
    { source: "AI Search", count: 6, pct: 12 },
    { source: "Other", count: 4, pct: 8 },
    { source: "Online Advertisement", count: 4, pct: 8 },
    { source: "Search Engine", count: 3, pct: 6 },
    { source: "LinkedIn", count: 2, pct: 4 },
    { source: "Referral", count: 1, pct: 2 },
    { source: "Direct Outreach", count: 1, pct: 2 },
    { source: "Event/Conference", count: 1, pct: 2 },
  ];

  const salesStages = [
    { stage: "Discovery Completed", count: 8, color: BLUE },
    { stage: "Qualified To Buy", count: 2, color: GREEN },
    { stage: "KYB", count: 1, color: AMBER },
  ];

  const kybStages = [
    { stage: "NOT_STARTED", count: 11, color: SLATE },
    { stage: "STARTED", count: 5, color: BLUE },
    { stage: "CUST_SUBMITTED", count: 8, color: CYAN },
    { stage: "APPROVED", count: 1, color: GREEN },
  ];

  // Deals with SDR + AE owner
  const salesDeals = [
    { co: "CapBay", stage: "Qualified To Buy", ae: "Michelle Ling", sdr: "-", created: "2025-11-20", email: "bryan.kwan@capbay.com" },
    { co: "PhiliPay", stage: "Qualified To Buy", ae: "Michelle Ling", sdr: "-", created: "2026-02-19", email: "sales@philipay.co.uk" },
    { co: "CABALLERO DE LA RUBIA", stage: "Discovery Completed", ae: "Nouvelle Nye", sdr: "Harini", created: "2026-04-07", email: "qijaqunone76@gmail.com" },
    { co: "RUBIO QUINTANA IVAN", stage: "Discovery Completed", ae: "Michelle Ling", sdr: "Harini", created: "2026-04-07", email: "rukabtchopp4e9@outlook.com" },
    { co: "ALTINO LOURENCO LIMITED", stage: "Discovery Completed", ae: "Michelle Ling", sdr: "Sukriti", created: "2026-04-07", email: "vtnvk5591@outlook.com" },
    { co: "Midnight Indulgence", stage: "Discovery Completed", ae: "Justin Chia", sdr: "Harini", created: "2026-04-07", email: "boykhano333@gmail.com" },
    { co: "CACPP TECH LTD", stage: "Discovery Completed", ae: "Adlin Norazman", sdr: "Sukriti", created: "2026-04-07", email: "xyvzl505@outlook.com" },
    { co: "Novax & Co.", stage: "KYB", ae: "Nouvelle Nye", sdr: "Harini", created: "2026-04-09", email: "admin@novaxandco.com" },
    { co: "Travel action pty ltd", stage: "Discovery Completed", ae: "Elross Pangue", sdr: "Harini", created: "2026-04-13", email: "info@orienttravel.com.au" },
    { co: "Novara Advisory Partners", stage: "Discovery Completed", ae: "Justin Chia", sdr: "Harini", created: "2026-04-14", email: "takashi@novara.partners" },
    { co: "Novara Advisory (Angela)", stage: "Discovery Completed", ae: "Justin Chia", sdr: "Harini", created: "2026-04-14", email: "angela@novara.partners" },
  ];

  const meetings = [
    { co: "CapBay", contact: "Bryan Kwan", meetings: 3, latest: "2026-02-09", owner: "Michelle Ling" },
    { co: "Novara Advisory Partners", contact: "Angela Lin + Takashi", meetings: 3, latest: "2026-04-16", owner: "Harini" },
    { co: "Novax & Co.", contact: "Novax", meetings: 2, latest: "2026-04-15", owner: "Nouvelle Nye" },
    { co: "Tasvar (Punitha)", contact: "Punitha Ramasamy", meetings: 1, latest: "2026-04-02", owner: "Harini" },
    { co: "ALTINO LOURENCO", contact: "SHEN LULU", meetings: 1, latest: "2026-04-13", owner: "Michelle Ling" },
    { co: "Fox Travel PTY LTD", contact: "Noor Ahmad", meetings: 1, latest: "2026-04-13", owner: "Sukriti" },
    { co: "Circular", contact: "Laurent Bsalis", meetings: 1, latest: "2026-04-14", owner: "Justin Chia" },
    { co: "Travel action pty ltd", contact: "Mohamad Addouj", meetings: 1, latest: "2026-04-16", owner: "Harini" },
    { co: "OmniHR", contact: "Joanne Jitilon", meetings: 1, latest: "2026-04-08", owner: "Justin Chia" },
    { co: "Novara Advisory", contact: "Takashi Toyokawa", meetings: 1, latest: "2026-04-16", owner: "Harini" },
  ];

  const priorMeetings = [
    { co: "Viva Republica (Toss)", contact: "Glenn Cho", date: "Apr 10", sdr: "Sukriti", note: "Major Korean fintech" },
    { co: "M&M Group Services", contact: "Ibrahim Osmani", date: "Apr 1", sdr: "Harini", note: "" },
    { co: "Fund Fast Pty Ltd", contact: "Vincent Zhong", date: "Apr 15", sdr: "Sukriti", note: "" },
    { co: "Sun Capital Investments", contact: "Ed Menegol", date: "Apr 8", sdr: "Harini", note: "Dashboard walkthrough" },
    { co: "Atypical Media", contact: "Debbie Yong", date: "Apr 13", sdr: "Harini", note: "" },
    { co: "Funding Pips", contact: "Andria Evripidou", date: "Apr 14", sdr: "Harini", note: "Contact form signup" },
  ];

  const sdrMeetingSummary = [
    { sdr: "Harini", aprSignups: 3, preApr: 4, total: 7 },
    { sdr: "Sukriti", aprSignups: 1, preApr: 2, total: 3 },
  ];

  const callDisposition = [
    { status: "No answer", count: 69, pct: 73 },
    { status: "Connected", count: 24, pct: 25 },
    { status: "Connecting", count: 2, pct: 2 },
  ];

  const highValueLeads = [
    { co: "Rous Capital / Remara Group", why: "David Verschoor - evaluating competitor, now engaging CEO on WhatsApp. Runs $5B+ lending ecosystem (Soda Capital, Dynamoney). Cross-border payments use case.", status: "Hot", hsId: "466154071740" },
    { co: "Novara Advisory Partners", why: "3+ meetings scheduled, Angela + Takashi, Discovery Completed", status: "Hot", hsId: "" },
    { co: "CapBay", why: "Pre-existing relationship, Qualified To Buy, Bryan Kwan", status: "Hot", hsId: "" },
    { co: "PhiliPay", why: "Qualified To Buy, KYB Started", status: "Warm", hsId: "" },
    { co: "Novax & Co.", why: "KYB in Sales pipeline, 2 meetings, CUST_SUBMITTED", status: "Warm", hsId: "" },
    { co: "Orient Travel / Travel action", why: "New deal + meeting, Harini following up", status: "Warm", hsId: "" },
    { co: "OmniHR", why: "Meeting done with Justin Chia", status: "Warm", hsId: "" },
    { co: "Circular", why: "KYB Started, meeting with Justin Chia", status: "Warm", hsId: "" },
    { co: "Aesir Ventures", why: "KYB Approved - Kenneth Yeow", status: "Won", hsId: "" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Total Signups" value="92" sub="Apr 1-15 zap runs" color="blue" />
        <MetricCard label="Legitimate" value="49" sub="53.3% of total" trend={{ val: 133, label: "vs Mar" }} color="green" />
        <MetricCard label="Junk Rate" value="47%" sub="43 junk - down from 78% in March" trend={{ val: -40, label: "improvement" }} color="red" />
        <MetricCard label="In Sales Pipeline" value="11" sub="22% of legit" color="purple" />
        <MetricCard label="Meetings Booked" value="15" sub="across 10 contacts" color="cyan" />
      </div>

      {/* Signup Funnel */}
      <Section title="Signup Funnel" subtitle="92 total runs - 49 legitimate signups (53.3%)">
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
                <p className="text-xl font-bold text-blue-900">36</p>
                <p className="text-xs text-blue-500">73%</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium">Company Email</p>
                <p className="text-xl font-bold text-emerald-900">13</p>
                <p className="text-xs text-emerald-500">27%</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-amber-600 font-medium">Phone Coverage</p>
                <p className="text-xl font-bold text-amber-900">100%</p>
                <p className="text-xs text-amber-500">49/49 have phone</p>
              </div>
            </div>
            <Callout type="success">
              <strong>47% junk rate - down from 78% in March.</strong> All 49 contacts have phone numbers (100% coverage vs 43% March). Finmo internal testing (26) still dominates junk.
            </Callout>
          </div>
        </div>
      </Section>

      {/* Junk Breakdown - expandable */}
      <Section title="Junk/Test Breakdown" subtitle="43 of 92 runs (47%). Click to expand.">
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
        <Section title="By Country" subtitle="49 legitimate signups">
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
          <p className="text-xs text-gray-500 mt-2">Malaysia dominates volume (24) but quality is mixed.</p>
        </Section>

        <Section title="Referral Sources" subtitle="Where legitimate signups came from">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={referralSources} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" />
              <YAxis dataKey="source" type="category" width={140} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill={BLUE} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">55% had no source set. AI Search growing as inbound channel.</p>
        </Section>
      </div>

      {/* Call Activity on Inbound */}
      <Section title="Inbound Lead Calling Activity" subtitle="95 calls across 40 contacts. 9 contacts (18%) never called.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Call Disposition (95 calls)</h4>
            <div className="flex gap-3 mb-3">
              {callDisposition.map((d) => (
                <div key={d.status} className={`flex-1 rounded-lg p-3 border text-center ${
                  d.status === "Connected" ? "bg-emerald-50 border-emerald-100" :
                  d.status === "No answer" ? "bg-gray-50 border-gray-200" :
                  "bg-blue-50 border-blue-100"
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
            <StatRow label="Contacts called" value="40 / 49 (82%)" />
            <StatRow label="Avg calls per lead" value="2.4" />
            <StatRow label="Contacts never called" value="9 (18%)" />
            <StatRow label="Best call: Orient Travel" value="7m35s" highlight />
          </div>
        </div>
        <Callout type="success">
          <strong>82% of inbound leads called</strong> with 2.4 calls per contact - major improvement over March (34 calls, 18 contacts). 100% phone coverage enables this.
        </Callout>
      </Section>

      {/* Deal Pipeline */}
      <Section title="Deal Pipeline" subtitle="11 contacts in Sales pipeline, 25 in KYB tracker. Click any deal for details.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Sales Pipeline (11 deals)</h4>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={salesStages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={160} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {salesStages.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3">KYB Tracker (25 deals)</h4>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={kybStages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={160} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {kybStages.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales deal table with SDR + AE */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="w-6 py-2 px-2"></th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Stage</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">AE Owner</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">SDR</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Created</th>
              </tr>
            </thead>
            <tbody>
              {salesDeals.map((d) => (
                <>
                  <tr key={d.co} onClick={() => toggle(`deal-${d.co}`)} className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer">
                    <td className="py-2 px-2"><Chevron open={isOpen(`deal-${d.co}`)} /></td>
                    <td className="py-2 px-3 font-medium">{d.co}</td>
                    <td className="py-2 px-3">
                      <Badge text={d.stage} variant={d.stage === "Qualified To Buy" ? "success" : d.stage === "KYB" ? "warning" : "default"} />
                    </td>
                    <td className="py-2 px-3 text-xs">{d.ae}</td>
                    <td className="py-2 px-3 text-xs">{d.sdr}</td>
                    <td className="py-2 px-3 text-xs text-gray-500">{d.created}</td>
                  </tr>
                  {isOpen(`deal-${d.co}`) && (
                    <DetailPanel key={`deal-${d.co}-detail`}>
                      <DetailGrid items={[
                        { label: "Email", value: d.email },
                        { label: "AE Owner", value: d.ae },
                        { label: "SDR", value: d.sdr },
                        { label: "Stage", value: d.stage },
                      ]} />
                    </DetailPanel>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* AE Owner distribution */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {[
            { ae: "Michelle Ling", count: 4 },
            { ae: "Justin Chia", count: 3 },
            { ae: "Nouvelle Nye", count: 2 },
            { ae: "Adlin Norazman", count: 1 },
            { ae: "Elross Pangue", count: 1 },
          ].map((a) => (
            <div key={a.ae} className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
              <p className="text-xs text-gray-500 font-medium">{a.ae}</p>
              <p className="text-xl font-bold text-gray-900">{a.count}</p>
              <p className="text-xs text-gray-400">deals</p>
            </div>
          ))}
        </div>

        <Callout type="info">
          <strong>21 contacts (43%) have zero deals</strong> - mostly low-quality personal email signups from Malaysia. 2 Qualified To Buy: CapBay and PhiliPay. 1 KYB Approved: Aesir Ventures.
        </Callout>
      </Section>

      {/* Meetings */}
      <Section title="Meetings Booked" subtitle="15 meetings across 10 April-signup contacts + 6 meetings from pre-April leads">
        <div className="overflow-x-auto mb-4">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">April Signup Meetings (15)</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Contact</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Meetings</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Latest</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Owner</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((m) => (
                <tr key={m.co} className="border-b border-gray-50">
                  <td className="py-2 px-3 font-medium">{m.co}</td>
                  <td className="py-2 px-3 text-xs">{m.contact}</td>
                  <td className="text-right py-2 px-3 font-bold">{m.meetings}</td>
                  <td className="py-2 px-3 text-xs text-gray-500">{m.latest}</td>
                  <td className="py-2 px-3 text-xs">{m.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto mb-4">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">Pre-April Leads with April Meetings (6)</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Contact</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Meeting Date</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">SDR</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Note</th>
              </tr>
            </thead>
            <tbody>
              {priorMeetings.map((m) => (
                <tr key={m.co} className="border-b border-gray-50">
                  <td className="py-2 px-3 font-medium">{m.co}</td>
                  <td className="py-2 px-3 text-xs">{m.contact}</td>
                  <td className="py-2 px-3 text-xs text-gray-500">{m.date}</td>
                  <td className="py-2 px-3 text-xs">{m.sdr}</td>
                  <td className="py-2 px-3 text-xs text-gray-500 italic">{m.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SDR Meeting Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {sdrMeetingSummary.map((s) => (
            <div key={s.sdr} className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm font-bold text-blue-900">{s.sdr}</p>
              <div className="flex gap-4 mt-2">
                <div>
                  <p className="text-xs text-blue-600">Apr signups</p>
                  <p className="text-lg font-bold text-blue-900">{s.aprSignups}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Pre-Apr</p>
                  <p className="text-lg font-bold text-blue-900">{s.preApr}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Total</p>
                  <p className="text-lg font-bold text-blue-900">{s.total}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Inbound Highlight: David Verschoor */}
      <Section title="Active Inbound Signal" subtitle="Prospect evaluating competitor, now engaging directly with CEO">
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <a href={`${HS}/0-1/466154071740`} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-red-900 hover:underline">
                  David Verschoor <span className="text-sm text-red-400">&#8599;</span>
                </a>
                <Badge text="HOT" variant="danger" />
              </div>
              <p className="text-sm text-red-700 mt-0.5">Rous Capital / In2Capital / Remara Group - Australia</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-xs">
            <div><p className="text-gray-500">Email</p><p className="font-semibold">dv@in2capital.com.au</p></div>
            <div><p className="text-gray-500">Phone</p><p className="font-semibold">+61-400579975</p></div>
            <div><p className="text-gray-500">SDR Owner</p><p className="font-semibold">Sukriti</p></div>
            <div><p className="text-gray-500">Lead Status</p><p className="font-semibold text-red-700">Replied - MQL</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-xs">
            <div><p className="text-gray-500">Source</p><p className="font-semibold">Organic Search - signed up Apr 4</p></div>
            <div><p className="text-gray-500">Background</p><p className="font-semibold">Runs $5B+ lending ecosystem (Dynamoney, Soda Capital). Cross-border supplier payments use case.</p></div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-red-200 mb-3">
            <p className="text-xs font-bold text-gray-600 uppercase mb-1">Engagement Timeline</p>
            <div className="space-y-1 text-xs text-gray-700">
              <p><span className="text-gray-400">Apr 4</span> - Signed up via organic search (In2Capital)</p>
              <p><span className="text-gray-400">Apr 6</span> - Called by Sukriti (37s) - "send me an email and hung up"</p>
              <p><span className="text-gray-400">Apr 7</span> - Custom outreach sequence created (3 emails + 3 WhatsApp targeting Soda Capital import finance angle)</p>
              <p><span className="text-gray-400">Apr 7-15</span> - 4 email touchpoints sent</p>
              <p><span className="text-gray-400">Apr 15</span> - <strong className="text-red-700">Replied - evaluating competitor. Now engaging with CEO on WhatsApp to discuss use case.</strong></p>
            </div>
          </div>
          <Callout type="danger">
            <strong>Action:</strong> David is actively evaluating. CEO is engaged on WhatsApp. Ensure AE follow-up is immediate - this is a platform/infrastructure play, not a standard SME lead.
          </Callout>
        </div>
      </Section>

      {/* High-Value Leads */}
      <Section title="High-Value Leads to Watch" subtitle="Prioritized by deal stage, meeting activity, and engagement signals">
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
                  <td className="py-2 px-3 font-medium">
                    {l.hsId ? (
                      <a href={`${HS}/0-1/${l.hsId}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                        {l.co} <span className="text-[10px] text-blue-400">&#8599;</span>
                      </a>
                    ) : l.co}
                  </td>
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
            { num: "1", text: "Junk rate at 47% - down from 78% in March. Still dominated by Finmo internal testing (26) and AcidComms (9)." },
            { num: "2", text: "100% phone coverage (49/49) - structural improvement from 43% in March. Enables high SDR call activity." },
            { num: "3", text: "82% of contacts called (40/49) with 95 total calls - 2.4 calls per lead. Much higher than March (34 calls, 18 contacts)." },
            { num: "4", text: "10 contacts had meetings (15 total) from April signups + 6 additional from pre-April leads. Harini: 7 meetings, Sukriti: 3." },
            { num: "5", text: "Personal email dominates: 73% personal vs 27% company. Malaysia drives volume but quality is mixed." },
            { num: "6", text: "AI Search growing as inbound channel (12%). 55% of signups had no referral source set." },
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
export default function BDWeeklyReport() {
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
      {/* Header */}
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
                <p className="text-sm text-gray-500">April 1-15, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">Generated: April 15, 2026</span>
              <button onClick={logout} className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition">Logout</button>
            </div>
          </div>
          {/* Tabs */}
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 0 && <OutboundTab />}
        {activeTab === 1 && <InboundTab />}
        {activeTab === 2 && <SolutionsTab />}
      </div>
    </div>
  );
}
