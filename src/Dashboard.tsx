import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";

// ============================================================
// COLOR PALETTE
// ============================================================
const BLUE = "#3B82F6";
const GREEN = "#10B981";
const AMBER = "#F59E0B";
const RED = "#EF4444";
const PURPLE = "#8B5CF6";
const PINK = "#EC4899";
const CYAN = "#06B6D4";
const SLATE = "#64748B";
const INDIGO = "#6366F1";

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
// HUBSPOT LINKS
// ============================================================
const HS = "https://app-na2.hubspot.com/contacts/20889024/record";

const hsContactByEmail: Record<string, string> = {
  "islesptyltd@gmail.com": `${HS}/0-1/466313617111`,
  "partners@kryzo.io": `${HS}/0-1/464043913948`,
  "randy@statewidequipment.com": `${HS}/0-1/459307244230`,
  "legal@payaza.africa": `${HS}/0-1/461735342822`,
  "raza@spadecorporate.com": `${HS}/0-1/464355359465`,
  "hairacademyaustralia2026@gmail.com": `${HS}/0-1/464009566921`,
  "david.li@supay.co.nz": `${HS}/0-1/462705811149`,
  "info@suncapitalinvestments.com.au": `${HS}/0-1/456784275169`,
  "info@fastclick.com.au": `${HS}/0-1/463931792087`,
  "annie@inspri.com.au": `${HS}/0-1/462311423675`,
  "george.chan@hellowaka.com": `${HS}/0-1/454052231923`,
  "moaze@uptrade.au": `${HS}/0-1/457044957888`,
  "veridiana@usexentra.com": `${HS}/0-1/438664061689`,
  "ceo@izisend.com": `${HS}/0-1/449289059064`,
  "orientalstarinc@outlook.com": `${HS}/0-1/458470222538`,
  "ausfundfast@gmail.com": `${HS}/0-1/459057882838`,
  "blake@zerolink.me": `${HS}/0-1/450821892848`,
  "kerry0000@zerolink.me": `${HS}/0-1/443159070417`,
  "joseph.loh@sgp.pilship.com": `${HS}/0-1/447655560902`,
  "plus1australia@gmail.com": `${HS}/0-1/454174615263`,
  "dragonprotrading@outlook.com": `${HS}/0-1/455991215844`,
  "supermantravelinc@outlook.com": `${HS}/0-1/457978319605`,
  "vastlinktrade12@gmail.com": `${HS}/0-1/455977450177`,
  "krishna.chhajed@bankopen.co": `${HS}/0-1/457778943717`,
  "emmanuel@fairviewmortgages.ca": `${HS}/0-1/459233381091`,
  "apps@mindcloud.co": `${HS}/0-1/456463376111`,
  "onboarding@onramp.money": `${HS}/0-1/449139334882`,
};

// Keyed by display names used in the dashboard tables
const hsDealByName: Record<string, string> = {
  "CHOISIR PTE. LTD.": `${HS}/0-3/317245449919`,
  "Choisir Education": `${HS}/0-3/317245449919`,
  "Xentra": `${HS}/0-3/306533580482`,
  "Supay Technology": `${HS}/0-3/318930466541`,
  "Fund Fast Pty Ltd": `${HS}/0-3/317454963419`,
  "fastclick.com.au": `${HS}/0-3/319637118665`,
  "Waka": `${HS}/0-3/319661201093`,
  "ZeroLink": `${HS}/0-3/308699727552`,
  "Unlimint PSP": `${HS}/0-3/35803122532`,
  "Growth HQ": `${HS}/0-3/151662793419`,
  "Overdrive Media": `${HS}/0-3/180870457043`,
  "Damisa": `${HS}/0-3/216534949597`,
  "Zynk": `${HS}/0-3/223130201845`,
  "Y Tech (Yield)": `${HS}/0-3/174744262365`,
  "Klip Payments": `${HS}/0-3/221237414621`,
  "Impressia Limited": `${HS}/0-3/255418645180`,
  "TSPA SPV I": `${HS}/0-3/222285074162`,
  "Kortya Softcom": `${HS}/0-3/37100879468`,
  "YALA CONSULT": `${HS}/0-3/287424370390`,
  "OFFGIDER INC": `${HS}/0-3/257872541392`,
  "PRIME FX": `${HS}/0-3/285661332195`,
  "MDJ": `${HS}/0-3/260065691368`,
  "Grandir Capital": `${HS}/0-3/29608486204`,
  "Pryvx": `${HS}/0-3/223718506184`,
  "ZashX": `${HS}/0-3/157262687950`,
  "Kleen Strategies": `${HS}/0-3/229151855304`,
  "DCS Cards": `${HS}/0-3/207662018235`,
  "Velox Tech": `${HS}/0-3/231584298744`,
  "Exchange One": `${HS}/0-3/100038221551`,
  "IFTIN EXPRESS": `${HS}/0-3/181460466423`,
  "Moneywire Group": `${HS}/0-3/173488587500`,
  "FNZ Global": `${HS}/0-3/35813257876`,
  "OPULRICH": `${HS}/0-3/310971563765`,
  "OPULRICH AUSTRALIA": `${HS}/0-3/310971563765`,
  "Frankie Yu": `${HS}/0-3/315160167118`,
  "VIVER": `${HS}/0-3/195406842582`,
  "NonPublic": `${HS}/0-3/310185921241`,
  "Cosmo Remit": `${HS}/0-3/311795864267`,
  "Olympio": `${HS}/0-3/305875915500`,
  "Flexie Transfer": `${HS}/0-1/468110161645`,
  "FazWaz": `${HS}/0-3/180964520667`,
  "Zerolink": `${HS}/0-3/308699727552`,
  "Etoro": `${HS}/0-3/141008862947`,
  "PaySo": `${HS}/0-1/421034481342`,
};

function HsLink({ name, type = "deal" }: { name: string; type?: "deal" | "contact" }) {
  const url = type === "contact" ? hsContactByEmail[name] : hsDealByName[name];
  if (!url) return <span className="font-medium">{name}</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="font-medium text-blue-700 hover:text-blue-900 hover:underline">
      {name} <span className="text-[10px] text-blue-400">&#8599;</span>
    </a>
  );
}

// ============================================================
// EXPANDABLE SUB-COMPONENTS
// ============================================================
const objectionDetails: Record<string, { excerpts: { who: string; region: string; quote: string }[]; recommendation: string }> = {
  "Busy / bad time": {
    excerpts: [
      { who: "CFO, AU agency", region: "AU", quote: "Look mate, I'm driving home right now. Can you send me an email?" },
      { who: "Finance Manager, SG", region: "SG", quote: "I'm in a meeting, can you call back?" },
      { who: "CEO, AU agency", region: "AU", quote: "It's 6pm, I'm done for the day." },
    ],
    recommendation: "62% of AU calls happen after 5pm local. Shift AU dials to 9-11am AEDT. Create a callback queue in HubSpot for these 36 prospects."
  },
  "Send me an email": {
    excerpts: [
      { who: "Paolo, CFO at Dashing Group", region: "AU", quote: "Send me an email because I'm not even really sure what you're trying to tell me here." },
      { who: "Finance Director, SG agency", region: "SG", quote: "Just email me the details and I'll take a look when I have time." },
      { who: "COO, AU creative agency", region: "AU", quote: "I don't have time for this right now. Send something over." },
    ],
    recommendation: "Not a rejection - they haven't heard enough value in 15 seconds. Refine the opening to deliver a pain-specific hook before asking for time."
  },
  "Not interested": {
    excerpts: [
      { who: "Marketing Director, SG", region: "SG", quote: "Thanks but we're not looking at anything like that right now." },
      { who: "CEO, AU boutique agency", region: "AU", quote: "Nah, we're good. Thanks though." },
    ],
    recommendation: "The podcast hook ('Capital in Motion') significantly reduces this objection. It comes when the SDR has no relevant angle — ensure research notes are reviewed before each call."
  },
  "How did you get my number?": {
    excerpts: [
      { who: "CEO, AU agency", region: "AU", quote: "How did you get this number? I'm on the do-not-call register." },
      { who: "Director, SG company", region: "SG", quote: "Where did you find my details? This is my personal mobile." },
    ],
    recommendation: "Happens in both AU and SG. SDRs need a confident response: 'We found your details through LinkedIn / your company website.' In AU, verify against DNCR before dialing."
  },
  "Pain doesn't exist for us": {
    excerpts: [
      { who: "Abhishek, Moves AI (SG)", region: "SG", quote: "We have a team of less than five people. We do not really have to worry about it." },
      { who: "Amanda, SG agency", region: "SG", quote: "We only deal in one currency, SGD. The scale we're at is not really applicable." },
      { who: "Sue Sadler, AHA (AU)", region: "AU", quote: "I'm not in finance anymore." },
    ],
    recommendation: "Small single-currency agencies under 20 people don't have treasury complexity. These are ICP mismatches — shift target to companies with 100+ employees, dedicated finance teams, multi-currency operations."
  },
  "Already using competitor": {
    excerpts: [
      { who: "Leilani, Thrive PR (AU)", region: "AU", quote: "We have partnerships with Airwallex. We represent the banks here. We're pretty sorted." },
      { who: "Patrick Evans, JCDecaux (AU)", region: "AU", quote: "We've already implemented AI reconciliation tools at the corporate level." },
    ],
    recommendation: "Airwallex is the main competitor mentioned. Pain exists at larger companies but they've already addressed it. Opportunity is in the mid-market gap: too complex for Xero, not big enough for enterprise treasury tools."
  },
  "Wrong number/person": {
    excerpts: [
      { who: "Unknown contact, AU", region: "AU", quote: "Sorry, you've got the wrong person. I don't work there anymore." },
      { who: "Receptionist, SG", region: "SG", quote: "There's nobody by that name here." },
    ],
    recommendation: "Data quality issue. Verify AU numbers before dialing. Remove stale contacts from 'Other' region lists. Cross-reference LinkedIn for current roles before calling."
  },
};

function ObjectionsSection() {
  const { toggle, isOpen } = useExpandableRows();
  const objections = [
    { obj: "Busy / bad time", count: 36, insight: "62% of AU calls after 5pm local. Shift to 9-11am = potential callbacks" },
    { obj: "Send me an email", count: 22, insight: "Messaging isn't earning 15 seconds of attention. Refine opening hook" },
    { obj: "Not interested", count: 13, insight: "Podcast hook reduces this. Happens when no relevant angle is given" },
    { obj: "How did you get my number?", count: 12, insight: "SDRs need a confident, prepared response. Common in both AU and SG" },
    { obj: "Pain doesn't exist for us", count: 9, insight: "Small agencies <20 people manage cash in a spreadsheet. Wrong ICP" },
    { obj: "Already using competitor", count: 6, insight: "Airwallex, AI tools. Larger companies have solved this already" },
    { obj: "Wrong number/person", count: 7, insight: "Data quality issue. Verify AU numbers before dialing" },
  ];

  return (
    <Section title="What Prospects Told Us" subtitle="From 402 transcribed calls + 122 detailed analyses. Click any row for transcript excerpts.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs font-bold text-amber-700 uppercase mb-1">#1 Response</p>
          <p className="font-bold text-amber-900">"Send me an email"</p>
          <p className="text-2xl font-bold text-amber-700 my-1">22 / 122</p>
          <p className="text-xs text-amber-600">Not a rejection — messaging problem.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-xs font-bold text-red-700 uppercase mb-1">ICP Signal</p>
          <p className="font-bold text-red-900">"Pain doesn't exist"</p>
          <p className="text-2xl font-bold text-red-700 my-1">9 / 122</p>
          <p className="text-xs text-red-600">Small single-currency agencies. Wrong segment.</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs font-bold text-blue-700 uppercase mb-1">Competitive Intel</p>
          <p className="font-bold text-blue-900">"Already using competitor"</p>
          <p className="text-2xl font-bold text-blue-700 my-1">6 / 122</p>
          <p className="text-xs text-blue-600">Airwallex, AI reconciliation — already solved.</p>
        </div>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="w-6 py-2 px-2"></th>
              <th className="text-left py-2 px-3 font-semibold text-gray-600">Objection</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-600">Count</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-600">Actionable Insight</th>
            </tr>
          </thead>
          <tbody>
            {objections.map((r) => {
              const detail = objectionDetails[r.obj];
              return (
                <>
                  <tr key={r.obj} onClick={() => toggle(r.obj)} className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer">
                    <td className="py-2 px-2"><Chevron open={isOpen(r.obj)} /></td>
                    <td className="py-2 px-3 font-medium">{r.obj}</td>
                    <td className="text-right py-2 px-3 font-bold">{r.count}</td>
                    <td className="py-2 px-3 text-gray-600">{r.insight}</td>
                  </tr>
                  {isOpen(r.obj) && detail && (
                    <DetailPanel key={`${r.obj}-detail`}>
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Transcript Excerpts</p>
                      <div className="space-y-2 mb-3">
                        {detail.excerpts.map((e, i) => (
                          <div key={i} className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge text={e.region} variant={e.region === "AU" ? "warning" : "success"} />
                              <span className="text-xs text-gray-500">{e.who}</span>
                            </div>
                            <p className="text-sm italic text-gray-700">"{e.quote}"</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <p className="text-xs font-bold text-blue-700 uppercase mb-1">Recommendation</p>
                        <p className="text-sm text-blue-800">{detail.recommendation}</p>
                      </div>
                    </DetailPanel>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}


const topRevenueDetails: Record<string, { actualMar: string; totalRev: string; txns: string; daysInStage: number; products: string; gca: string; useCase: string }> = {
  "Unlimint PSP": { actualMar: "-", totalRev: "-", txns: "-", daysInStage: 148, products: "Money Movement", gca: "DBS+WISE", useCase: "L1 partner, PSP in Dubai. Large-scale money movement integration." },
  "Growth HQ": { actualMar: "$0.85", totalRev: "$16", txns: "17", daysInStage: 162, products: "MM, PP, AR, AP, Bal, CF", gca: "EMQ", useCase: "Strategic partner. Only 17 test txns so far despite $5K projected MRR. Needs activation push." },
  "Overdrive Media": { actualMar: "$0", totalRev: "$0.34", txns: "3", daysInStage: 59, products: "MM, Bal, FX", gca: "DBS+WISE", useCase: "Netherlands-based media company. Jira updated to UAT Testing. Only 3 test transactions. Jira assignee: Anuj Kapoor." },
  "Etoro": { actualMar: "N/A", totalRev: "N/A", txns: "N/A", daysInStage: 240, products: "-", gca: "-", useCase: "Contract/Commercial stage in HubSpot. $20K deal value. Recently added to Jira SP board. AE: Gibson Saw." },
  "Damisa": { actualMar: "N/A", totalRev: "N/A", txns: "N/A", daysInStage: 129, products: "Money Movement", gca: "-", useCase: "Jira: Presales (129d stale). HubSpot: Closed Lost — deal was lost but Jira card not updated. Clean up Jira." },
  "Zynk": { actualMar: "N/A", totalRev: "N/A", txns: "N/A", daysInStage: 129, products: "Money Movement", gca: "-", useCase: "Jira: Presales (129d stale). HubSpot: Re-Engage — deal being reactivated. Michelle Ling as AE." },
  "Y Tech (Yield)": { actualMar: "N/A", totalRev: "N/A", txns: "N/A", daysInStage: 141, products: "Money Movement", gca: "-", useCase: "Product Blocked — no reason documented. L3 partner. $10K projected MRR. Needs product team input." },
  "Klip Payments": { actualMar: "$0", totalRev: "$0", txns: "0", daysInStage: 56, products: "MM, AR, AP, Bal, CF", gca: "DBS+WISE", useCase: "Live but DORMANT. KYB Approved, all products enabled. $10K MRR projection but zero actual revenue. High-priority re-engagement." },
};

function TopRevenueTable() {
  const { toggle, isOpen } = useExpandableRows();
  const topRevenue = [
    { merchant: "Unlimint PSP", jira: "Integration", hs: "Closed Won", mrr: "$100K", ae: "Gibson Saw", risk: "Medium" },
    { merchant: "Growth HQ", jira: "UAT Testing", hs: "Live", mrr: "$5K", ae: "Gibson Saw", risk: "Low" },
    { merchant: "Overdrive Media", jira: "UAT Testing", hs: "Closed Won", mrr: "$2K", ae: "Nouvelle Nye", risk: "Medium" },
    { merchant: "Etoro", jira: "New", hs: "Contract/Commercial", mrr: "$20K", ae: "Gibson Saw", risk: "Medium" },
    { merchant: "Damisa", jira: "Presales (129d)", hs: "Closed Lost", mrr: "$2K", ae: "Michelle Ling", risk: "Closed Lost in HS" },
    { merchant: "Zynk", jira: "Presales (129d)", hs: "Re-Engage", mrr: "$2K", ae: "Michelle Ling", risk: "Re-Engage in HS" },
    { merchant: "Y Tech (Yield)", jira: "Product Blocked", hs: "Re-Engage", mrr: "$10K", ae: "Elross Pangue", risk: "Critical" },
    { merchant: "Klip Payments", jira: "Live", hs: "Closed Won", mrr: "$10K", ae: "Gibson Saw", risk: "Dormant" },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50">
            <th className="w-5 py-2 px-1"></th>
            <th className="text-left py-2 px-2 font-semibold text-gray-600">Merchant</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-600">Jira Stage</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-600">HubSpot Stage</th>
            <th className="text-right py-2 px-2 font-semibold text-gray-600">Projected MRR</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-600">AE</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-600">Risk</th>
          </tr>
        </thead>
        <tbody>
          {topRevenue.map((r) => {
            const detail = topRevenueDetails[r.merchant];
            return (
              <>
                <tr key={r.merchant} onClick={() => toggle(r.merchant)} className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer">
                  <td className="py-2 px-1"><Chevron open={isOpen(r.merchant)} /></td>
                  <td className="py-2 px-2"><HsLink name={r.merchant} /></td>
                  <td className="py-2 px-2"><Badge text={r.jira} variant={
                    r.jira.includes("Live") ? "success" : r.jira.includes("Block") ? "danger" : r.jira.includes("Presales") ? "warning" : r.jira.includes("UAT") ? "purple" : "default"
                  } /></td>
                  <td className="py-2 px-2"><Badge text={r.hs} variant={
                    r.hs === "Live" || r.hs === "Closed Won" ? "success" : r.hs === "Closed Lost" ? "danger" : r.hs === "Re-Engage" ? "warning" : r.hs.includes("Contract") ? "warning" : "default"
                  } /></td>
                  <td className="text-right py-2 px-2 font-bold text-emerald-700">{r.mrr}</td>
                  <td className="py-2 px-2 text-xs">{r.ae}</td>
                  <td className="py-2 px-2">
                    <Badge text={r.risk} variant={r.risk.includes("Critical") || r.risk.includes("Lost") ? "danger" : r.risk.includes("Dormant") || r.risk.includes("Re-Engage") ? "warning" : r.risk === "Low" ? "success" : "default"} />
                  </td>
                </tr>
                {isOpen(r.merchant) && detail && (
                  <DetailPanel key={`${r.merchant}-detail`}>
                    <DetailGrid items={[
                      { label: "Mar 2026 Actual", value: detail.actualMar },
                      { label: "Total Revenue", value: detail.totalRev },
                      { label: "Transactions", value: detail.txns },
                      { label: "Days in Stage (Jira)", value: `${detail.daysInStage}d` },
                      { label: "Products", value: detail.products },
                      { label: "GCA", value: detail.gca },
                    ]} />
                    <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-[10px] text-gray-500 uppercase font-medium mb-1">Context</p>
                      <p className="text-sm text-gray-700">{detail.useCase}</p>
                    </div>
                  </DetailPanel>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const liveMerchantDetails: Record<string, { kybDate: string; corridors: string; products: string; gca: string; monthlyTrend: { month: string; rev: number }[]; nextAction: string }> = {
  "FNZ Global": { kybDate: "Dec 2015", corridors: "IDR, SGD, AUD, NZD, THB, PHP", products: "Money Movement", gca: "DBS", monthlyTrend: [{ month: "Mar", rev: 0 }], nextAction: "6 currencies enabled Mar 10. First txn Mar 9 but $0 revenue. Jira: Solutioning. Needs push to generate revenue." },
  "VIVER": { kybDate: "Jan 2026", corridors: "SGD, EUR", products: "Money Movement", gca: "DBS+Wise", monthlyTrend: [{ month: "Mar", rev: 0 }], nextAction: "South Korea-based luxury watch merchant. First txn Mar 16 but $0 revenue. Fastest Jira mover (Solutioning to Integration in 6 days)." },
  "Cosmo Remit": { kybDate: "-", corridors: "NZD", products: "Money Movement", gca: "-", monthlyTrend: [], nextAction: "NZD activated Mar 24. No transactions yet. Remittance company based in Australia." },
  "IFTIN EXPRESS": { kybDate: "Nov 2025", corridors: "AUD, USDT", products: "Money Movement", gca: "EMQ", monthlyTrend: [{ month: "Nov", rev: 400 }, { month: "Dec", rev: 800 }, { month: "Jan", rev: 1200 }, { month: "Feb", rev: 1800 }, { month: "Mar", rev: 2359 }], nextAction: "Healthy growth. USDT + EMQ GCA added in March. Hypercare stage on Jira." },
  "Oceania Financial": { kybDate: "-", corridors: "AUD, USDT", products: "Money Movement", gca: "-", monthlyTrend: [], nextAction: "Legacy CS Handover (SP-94). USDT capability added Mar 10. No org_id or revenue data available." },
  "Choisir Education": { kybDate: "Aug 2023", corridors: "SGD, AUD, Multi-currency", products: "Money Movement", gca: "DBS", monthlyTrend: [{ month: "Oct", rev: 10200 }, { month: "Nov", rev: 12400 }, { month: "Dec", rev: 15800 }, { month: "Jan", rev: 17200 }, { month: "Feb", rev: 18400 }, { month: "Mar", rev: 19016 }], nextAction: "Healthy growth trajectory. Discuss expansion to additional corridors." },
  "DCS Cards": { kybDate: "Nov 2025", corridors: "MM, AR, AP, Bal, CF, Bank", products: "Full suite", gca: "DBS+WISE", monthlyTrend: [{ month: "Nov", rev: 80 }, { month: "Dec", rev: 120 }, { month: "Jan", rev: 95 }, { month: "Feb", rev: 190 }, { month: "Mar", rev: 309 }], nextAction: "Growing but very low vs $50K projected MRR. Investigate usage blockers with Gibson Saw." },
  "ZashX": { kybDate: "Dec 2025", corridors: "Money Movement", products: "MM", gca: "-", monthlyTrend: [{ month: "Dec", rev: 12 }, { month: "Jan", rev: 18 }, { month: "Feb", rev: 25 }, { month: "Mar", rev: 89 }], nextAction: "Revenue growing 3.5x month-over-month. Small base but promising trajectory." },
  "YALA CONSULT": { kybDate: "Dec 2025", corridors: "Money Movement", products: "MM", gca: "-", monthlyTrend: [{ month: "Feb", rev: 11 }, { month: "Mar", rev: 18 }], nextAction: "Minimal usage. Only 11 txns lifetime. Check if onboarding completed correctly." },
  "Klip Payments": { kybDate: "Nov 2025", corridors: "MM, AR, AP, Bal, CF", products: "Full suite", gca: "DBS+WISE", monthlyTrend: [], nextAction: "CRITICAL: $10K projected MRR but ZERO revenue. KYB approved, all products enabled. Must investigate what's blocking first transaction." },
  "TSPA SPV I": { kybDate: "Dec 2025", corridors: "-", products: "MM", gca: "-", monthlyTrend: [], nextAction: "KYB approved but zero transactions. Assigned to Michelle Ling. Follow up on integration status." },
  "Velox Tech": { kybDate: "Oct 2025", corridors: "-", products: "-", gca: "-", monthlyTrend: [], nextAction: "KYB approved Oct 2025 but still no transactions 6 months later. May need to re-engage or move to Sales Lost." },
};

function LiveMerchantsTable({ liveMerchants }: { liveMerchants: { merchant: string; method: string; firstTxn: string; ae: string; kyb: string; projectedMRR: string; actualMar26: string; totalRev: string; txns: number; status: "active" | "low" | "minimal" | "dormant" }[] }) {
  const { toggle, isOpen } = useExpandableRows();
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50">
            <th className="w-5 py-2 px-1"></th>
            <th className="text-left py-2 px-2 font-semibold text-gray-600">Merchant</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-600">KYB</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-600">Method Enabled</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-600">First Txn</th>
            <th className="text-right py-2 px-2 font-semibold text-gray-600">HubSpot MRR</th>
            <th className="text-right py-2 px-2 font-semibold text-gray-600">Mar 2026 Actual</th>
            <th className="text-right py-2 px-2 font-semibold text-gray-600">Total Rev (USD)</th>
            <th className="text-right py-2 px-2 font-semibold text-gray-600">Txns</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-600">AE</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody>
          {liveMerchants.map((m) => {
            const detail = liveMerchantDetails[m.merchant];
            return (
              <>
                <tr key={m.merchant} onClick={() => toggle(m.merchant)} className={`border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer ${
                  m.status === "dormant" ? "bg-red-50/40" : m.status === "minimal" ? "bg-amber-50/30" : ""
                }`}>
                  <td className="py-2 px-1"><Chevron open={isOpen(m.merchant)} /></td>
                  <td className="py-2 px-2 text-sm"><HsLink name={m.merchant} /></td>
                  <td className="py-2 px-2">
                    {m.kyb === "APPROVED" ? <Badge text="APPROVED" variant="success" /> : <Badge text={m.kyb} variant="default" />}
                  </td>
                  <td className="py-2 px-2">{m.method}</td>
                  <td className="py-2 px-2">{m.firstTxn}</td>
                  <td className="text-right py-2 px-2">{m.projectedMRR}</td>
                  <td className="text-right py-2 px-2 font-semibold">{m.actualMar26}</td>
                  <td className="text-right py-2 px-2">{m.totalRev}</td>
                  <td className="text-right py-2 px-2">{m.txns > 0 ? m.txns.toLocaleString() : "-"}</td>
                  <td className="py-2 px-2">{m.ae}</td>
                  <td className="py-2 px-2">
                    <Badge text={m.status === "active" ? "Active" : m.status === "low" ? "Low" : m.status === "minimal" ? "Minimal" : "Dormant"}
                      variant={m.status === "active" ? "success" : m.status === "low" ? "warning" : m.status === "minimal" ? "warning" : "danger"} />
                  </td>
                </tr>
                {isOpen(m.merchant) && detail && (
                  <DetailPanel key={`${m.merchant}-detail`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <DetailGrid items={[
                          { label: "KYB Approved", value: detail.kybDate },
                          { label: "Corridors", value: detail.corridors },
                          { label: "Products", value: detail.products },
                          { label: "GCA Connector", value: detail.gca },
                        ]} />
                        <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
                          <p className="text-[10px] text-gray-500 uppercase font-medium mb-1">Recommended Action</p>
                          <p className="text-sm text-gray-700">{detail.nextAction}</p>
                        </div>
                      </div>
                      {detail.monthlyTrend.length > 0 && (
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-medium mb-2">Revenue Trend (USD)</p>
                          <ResponsiveContainer width="100%" height={120}>
                            <BarChart data={detail.monthlyTrend}>
                              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip />
                              <Bar dataKey="rev" fill={BLUE} radius={[3, 3, 0, 0]} name="Revenue" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </DetailPanel>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const referralSourceDetails: Record<string, { leads: { name: string; company: string; country: string; status: string }[] }> = {
  "Online Advertisement": { leads: [
    { name: "Ibrahim Osmani", company: "fastclick.com.au", country: "AU", status: "Discovery" },
    { name: "Vincent Zhong", company: "Fund Fast Pty Ltd", country: "AU", status: "Conditional Approved" },
    { name: "Joy Quinn", company: "Hair Braiding Academy", country: "AU", status: "Not Started" },
    { name: "Bin Han", company: "Oriental Star Inc", country: "US", status: "Discovery" },
  ]},
  "AI Search": { leads: [
    { name: "Moaze Bahloul", company: "Uptrade Pty Ltd", country: "AU", status: "Discovery" },
    { name: "Nicole Stevens", company: "Stevens co", country: "AU", status: "Discovery" },
    { name: "Wei Li", company: "Supay Technology", country: "NZ", status: "KYB Submitted" },
  ]},
  "LinkedIn": { leads: [
    { name: "Annie Nguyen", company: "Inspri", country: "AU", status: "No deal" },
    { name: "Krishna Chhajed", company: "Open", country: "IN", status: "No deal" },
    { name: "Emmanuel Gionet-Lavigne", company: "Fairview Mortgages", country: "CA", status: "No deal" },
  ]},
  "Referral": { leads: [
    { name: "George Chan", company: "Waka", country: "SG", status: "Discovery - KYB Approved" },
    { name: "Admir Murataj", company: "GB TECH SERVICES", country: "CY", status: "KYB Started" },
  ]},
  "Search Engine": { leads: [
    { name: "Ahsan Zarif Gondal", company: "RemitCo / IZI Send", country: "UK", status: "Not Started" },
    { name: "Randy Reed", company: "Statewide Equipment", country: "US", status: "Discovery" },
  ]},
  "Direct Outreach": { leads: [
    { name: "Raza Merchant", company: "Spade LLC", country: "US", status: "No deal" },
    { name: "Joseph Loh", company: "Pacific Int'l Lines", country: "SG", status: "Not Started" },
  ]},
};

function ReferralSourcesChart({ referralSources }: { referralSources: { source: string; count: number; pct: number }[] }) {
  const { toggle, isOpen } = useExpandableRows();
  return (
    <Section title="Referral Sources" subtitle="Click a row for lead breakdown">
      <div className="overflow-x-auto">
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="w-6 py-2 px-2"></th>
              <th className="text-left py-2 px-3 font-semibold text-gray-600">Source</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-600">Count</th>
              <th className="text-right py-2 px-3 font-semibold text-gray-600">%</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-600">Bar</th>
            </tr>
          </thead>
          <tbody>
            {referralSources.map((r) => {
              const detail = referralSourceDetails[r.source];
              return (
                <>
                  <tr key={r.source} onClick={() => detail && toggle(r.source)} className={`border-b border-gray-50 ${detail ? "hover:bg-blue-50/40 cursor-pointer" : ""}`}>
                    <td className="py-2 px-2">{detail && <Chevron open={isOpen(r.source)} />}</td>
                    <td className="py-2 px-3 font-medium">{r.source}</td>
                    <td className="text-right py-2 px-3 font-bold">{r.count}</td>
                    <td className="text-right py-2 px-3 text-gray-500">{r.pct}%</td>
                    <td className="py-2 px-3"><div className="h-3 bg-blue-500 rounded-full" style={{ width: `${r.pct * 4}px` }} /></td>
                  </tr>
                  {isOpen(r.source) && detail && (
                    <DetailPanel key={`${r.source}-detail`}>
                      <p className="text-[10px] text-gray-500 uppercase font-medium mb-2">Sample Leads from this Source</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {detail.leads.map((l, i) => (
                          <div key={i} className="bg-white rounded-lg p-2 border border-gray-200 flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{l.name}</p>
                              <p className="text-xs text-gray-500">{l.company} ({l.country})</p>
                            </div>
                            <Badge text={l.status} variant={l.status.includes("Approved") ? "success" : l.status.includes("Discovery") ? "default" : l.status.includes("No") ? "danger" : "warning"} />
                          </div>
                        ))}
                      </div>
                    </DetailPanel>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">Paid channels lead: Online Ads (20%) + AI Search (15%) + LinkedIn (15%). Organic is only 11%.</p>
    </Section>
  );
}

// ============================================================
// OUTBOUND SALES TAB
// ============================================================
function OutboundSales() {
  const linkedInPie = [
    { name: "Profile Visits", value: 1039, color: BLUE },
    { name: "Connection Requests", value: 545, color: GREEN },
    { name: "Messages", value: 146, color: PINK },
  ];

  const weeklyTrend = [
    { week: "1", label: "Mar 2-6", calls: 257, connected: 60, rate: 23 },
    { week: "2", label: "Mar 9-13", calls: 160, connected: 29, rate: 18 },
    { week: "3", label: "Mar 16-20", calls: 153, connected: 49, rate: 32 },
    { week: "4", label: "Mar 23-27", calls: 221, connected: 91, rate: 41 },
    { week: "5", label: "Mar 28-31", calls: 87, connected: 42, rate: 48 },
  ];

  const callingHours = [
    { hour: "8am", rate: 45 }, { hour: "9am", rate: 48 }, { hour: "10am", rate: 58 },
    { hour: "11am", rate: 50 }, { hour: "12pm", rate: 50 }, { hour: "1pm", rate: 37 },
    { hour: "2pm", rate: 21 }, { hour: "3pm", rate: 39 }, { hour: "4pm", rate: 19 },
    { hour: "5pm", rate: 23 }, { hour: "6pm", rate: 9 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Prospects Contacted" value="1,133" trend={{ val: 95, label: "vs prior" }} color="blue" />
        <MetricCard label="Emails Sent" value="1,839" sub="via SmartReach" color="blue" />
        <MetricCard label="LinkedIn Actions" value="1,730" sub="336 prospects" color="purple" />
        <MetricCard label="Total Calls" value="1,070" sub="879 human (Mar) + 191 AI" color="green" />
        <MetricCard label="Meetings Booked" value="12" sub="7 warm/referral, 3 cold AU, 2 other" color="amber" />
      </div>

      {/* Email Performance */}
      <Section title="Email Performance" subtitle="SmartReach campaigns - March 2026">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AU */}
          <div className="rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">AU</span>
              <h4 className="font-semibold text-gray-800">Australia</h4>
              <Badge text="66% sequences done" variant="success" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-xs text-gray-500">Contacted</p><p className="text-xl font-bold">184</p></div>
              <div><p className="text-xs text-gray-500">Open Rate</p><p className="text-xl font-bold text-emerald-600">71%</p></div>
              <div><p className="text-xs text-gray-500">Reply Rate</p><p className="text-xl font-bold text-amber-600">3.8%</p></div>
            </div>
            <p className="text-xs text-gray-500 mt-3">7 replies from 184 prospects</p>
          </div>
          {/* SG */}
          <div className="rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">SG</span>
              <h4 className="font-semibold text-gray-800">Singapore</h4>
              <Badge text="9% sequences done" variant="warning" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-xs text-gray-500">Contacted</p><p className="text-xl font-bold">938</p></div>
              <div><p className="text-xs text-gray-500">Open Rate</p><p className="text-xl font-bold text-emerald-600">64%</p></div>
              <div><p className="text-xs text-gray-500">Reply Rate</p><p className="text-xl font-bold text-red-600">0.9%</p></div>
            </div>
            <p className="text-xs text-gray-500 mt-3">8 replies from 938 prospects. Still early - most sequences not completed.</p>
          </div>
        </div>
        <Callout type="warning">
          <strong>Key insight:</strong> Strong open rates (71% AU, 64% SG) but low reply rates. Content gets attention but the CTA isn't compelling enough. SG is early innings - only 9% sequences completed vs 66% AU.
        </Callout>

        {/* Reply Analysis */}
        <div className="mt-5">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">Reply Analysis — What 15 Prospects Said</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-red-50 rounded-lg p-3 border border-red-100 text-center">
              <p className="text-2xl font-bold text-red-800">7</p>
              <p className="text-xs font-medium text-red-600">Polite Decline / No Need</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 text-center">
              <p className="text-2xl font-bold text-emerald-800">3</p>
              <p className="text-xs font-medium text-emerald-600">Interested / Engaged</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
              <p className="text-2xl font-bold text-gray-800">5</p>
              <p className="text-xs font-medium text-gray-500">Wrong Fit / Minimal</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Contact</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Region</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Reply</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Type</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Tan Jeslyn", co: "AAMS", region: "SG", reply: "Sounds interesting. Could you share more about your podcast and past content?", type: "Interested", variant: "success" as const, hsId: "443182815964" },
                  { name: "Matt Cave", co: "B2BBD", region: "SG/AU", reply: "Hows business Sukriti?", type: "Engaged", variant: "success" as const, hsId: "457015428816" },
                  { name: "Renier Lombard", co: "The Lekker Network", region: "US", reply: "Accepted connection, introduced himself and his agency (FDC, 150+ CEO clients)", type: "Engaged", variant: "success" as const, hsId: "457031282380" },
                  { name: "Raghav Ahooja", co: "Launch Cycle", region: "SG", reply: "We're pretty good with our cash flows, thanks for reaching out.", type: "No need", variant: "danger" as const, hsId: "457029399289" },
                  { name: "Uma Rudd Chia", co: "OH MY STRAWBERRY", region: "SG", reply: "Don't need this thanks", type: "Decline", variant: "danger" as const, hsId: "457029487333" },
                  { name: "Hermann Martje", co: "RevX", region: "IN", reply: "Part of a larger group and do not face such challenges.", type: "No need", variant: "danger" as const, hsId: "443603112679" },
                  { name: "Paul Den", co: "Banter", region: "AU", reply: "No thanks", type: "Decline", variant: "danger" as const, hsId: "443603394267" },
                  { name: "Jamshed Wadia", co: "CMO Council", region: "US", reply: "Don't have any requirements at the moment", type: "No need", variant: "danger" as const, hsId: "457015571134" },
                  { name: "Sheetal Dasgupta", co: "My Ten Cents", region: "SG", reply: "Will let you know if such need arises. No requirement at the moment.", type: "No need", variant: "danger" as const, hsId: "457027982044" },
                  { name: "Mikael Lindblom", co: "MCA", region: "SG", reply: "Not relevant at this stage. Thanks.", type: "Decline", variant: "danger" as const, hsId: "457015326415" },
                  { name: "Diogo Martins", co: "Bloomr.SG (Mediacorp)", region: "SG", reply: "Part of Mediacorp, we have an entire finance department.", type: "Wrong fit", variant: "default" as const, hsId: "456973438695" },
                  { name: "Sukaimi Sukri", co: "Code&Canvas", region: "SG", reply: "Cash is holding so far 😊", type: "No pain", variant: "default" as const, hsId: "457029313266" },
                  { name: "Nigel Blake", co: "Perfect Lead Gen", region: "UK", reply: "I welcome the opportunity to connect. Thanks.", type: "Generic", variant: "default" as const, hsId: "457029384891" },
                  { name: "Erkam Kurt", co: "EK Marketing", region: "SG", reply: "Appreciate it", type: "Minimal", variant: "default" as const, hsId: "457014170310" },
                ].map((r) => (
                  <tr key={r.hsId} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <a href={`${HS}/0-1/${r.hsId}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline text-xs">
                        {r.name} <span className="text-[10px] text-blue-400">&#8599;</span>
                      </a>
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-600">{r.co}</td>
                    <td className="py-2 px-3"><Badge text={r.region} variant={r.region === "AU" ? "warning" : r.region.includes("SG") ? "success" : "default"} /></td>
                    <td className="py-2 px-3 text-xs italic text-gray-700">"{r.reply}"</td>
                    <td className="py-2 px-3"><Badge text={r.type} variant={r.variant} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout type="info">
            <strong>Only 3 of 15 replies showed real engagement.</strong> Tan Jeslyn (AAMS) asked about the podcast — this is the only reply that could convert to a meeting. 7 replied with a polite "no need". The rest are either wrong fit or minimal responses. Confirms: the open rates prove brand awareness exists, but the CTA doesn't compel action.
          </Callout>
        </div>
      </Section>

      {/* LinkedIn Performance */}
      <Section title="LinkedIn Performance" subtitle="SmartReach LinkedIn automation - March 2026">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <StatRow label="Prospects Contacted" value="336" highlight />
            <StatRow label="Total Actions Sent" value="1,730" />
            <StatRow label="Profile Visits" value="1,039" />
            <StatRow label="Connection Requests" value="545" />
            <StatRow label="Messages Sent" value="146" />
            <StatRow label="Acceptance Rate" value="19%" highlight />
            <StatRow label="Reply Rate" value="6%" highlight />
          </div>
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={linkedInPie} cx="50%" cy="50%" outerRadius={85} innerRadius={45} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {linkedInPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Section>

      {/* Cold Calling by Region */}
      <Section title="Cold Calling - By Region" subtitle="Human SDRs (Mar 1-31) + AI SDR Pilot (Mar 30 - Apr 1, AU only)">
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Region</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Human Dials</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Human Connected</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Pickup %</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">AI Dials</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">AI Connected</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600 bg-blue-50">Combined</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">Australia</td>
                <td className="text-right py-3 px-4">320</td>
                <td className="text-right py-3 px-4">53</td>
                <td className="text-right py-3 px-4"><span className="text-red-600 font-bold">17%</span></td>
                <td className="text-right py-3 px-4">191</td>
                <td className="text-right py-3 px-4">76</td>
                <td className="text-right py-3 px-4 bg-blue-50 font-bold">511</td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">Singapore</td>
                <td className="text-right py-3 px-4">340</td>
                <td className="text-right py-3 px-4">152</td>
                <td className="text-right py-3 px-4"><span className="text-emerald-600 font-bold">45%</span></td>
                <td className="text-right py-3 px-4 text-gray-300">-</td>
                <td className="text-right py-3 px-4 text-gray-300">-</td>
                <td className="text-right py-3 px-4 bg-blue-50 font-bold">340</td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">Other</td>
                <td className="text-right py-3 px-4">219</td>
                <td className="text-right py-3 px-4">65</td>
                <td className="text-right py-3 px-4"><span className="text-amber-600 font-bold">30%</span></td>
                <td className="text-right py-3 px-4 text-gray-300">-</td>
                <td className="text-right py-3 px-4 text-gray-300">-</td>
                <td className="text-right py-3 px-4 bg-blue-50 font-bold">219</td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td className="py-3 px-4">Total</td>
                <td className="text-right py-3 px-4">879</td>
                <td className="text-right py-3 px-4">270</td>
                <td className="text-right py-3 px-4">31%</td>
                <td className="text-right py-3 px-4">191</td>
                <td className="text-right py-3 px-4">76</td>
                <td className="text-right py-3 px-4 bg-blue-100">1,070</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Conversation Minutes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-xs text-blue-600 font-medium uppercase">Total Conversation Time</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">~370 min</p>
            <p className="text-xs text-blue-500">270 human (Mar) + 76 AI connected calls</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
            <p className="text-xs text-emerald-600 font-medium uppercase">SG Estimated</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">~177 min</p>
            <p className="text-xs text-emerald-500">152 connected, avg ~70s per call</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
            <p className="text-xs text-amber-600 font-medium uppercase">AU Estimated (Human + AI)</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">~97 min</p>
            <p className="text-xs text-amber-500">53 human (Mar) + 76 AI connected calls</p>
          </div>
        </div>

        {/* AI SDR Experiment */}
        <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-xl p-5">
          <h4 className="font-bold text-violet-900 mb-3">AI SDR Pilot - 3 Days, $13.50 Total</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
            <div><p className="text-xs text-violet-500">API Calls</p><p className="font-bold text-violet-900">191</p></div>
            <div><p className="text-xs text-violet-500">Unique Leads</p><p className="font-bold text-violet-900">104</p></div>
            <div><p className="text-xs text-violet-500">Connected</p><p className="font-bold text-violet-900">76 (73%)</p></div>
            <div><p className="text-xs text-violet-500">Meetings Booked</p><p className="font-bold text-red-600">0</p></div>
            <div><p className="text-xs text-violet-500">Cost/Dial</p><p className="font-bold text-violet-900">$0.07</p></div>
          </div>
          <p className="text-sm text-violet-700">
            Exceptional pickup rate (73%) at 98% cost reduction vs human SDRs. Bot can't navigate objections or ambiguous responses.
            <strong> Verdict: AI for volume screening + human for conversion (hybrid model).</strong>
          </p>
        </div>
      </Section>

      {/* Weekly Pickup Trend */}
      <Section title="Pickup Rate Trend - March" subtitle="Pickup rate improved from 23% to 48% across March (Week 1 = Mar 2-6, Week 5 = Mar 28-31)">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={weeklyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis unit="%" domain={[0, 60]} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Area type="monotone" dataKey="rate" stroke={BLUE} fill={BLUE} fillOpacity={0.12} strokeWidth={2.5} name="Pickup Rate" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Callout type="success">
            <strong>Drivers of improvement:</strong> Increased Exotel usage for SG (local +65 number = 3.2x better pickup than Twilio), better targeting, improved podcast pitch delivery.
          </Callout>
          <Callout type="info">
            <strong>Best calling window:</strong> 8am-12pm prospect local time = 50% pickup rate, but only receives 28% of dial volume. The 4-6pm window gets 45% of dials at just 19% pickup.
          </Callout>
        </div>
      </Section>

      {/* Calling Hours */}
      <Section title="Pickup Rate by Prospect Local Time" subtitle="Golden window: 8am-12pm local = 50% avg pickup">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={callingHours}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
            <YAxis unit="%" domain={[0, 70]} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="rate" name="Pickup Rate" radius={[4, 4, 0, 0]}>
              {callingHours.map((entry, i) => (
                <Cell key={i} fill={entry.rate >= 45 ? GREEN : entry.rate >= 30 ? BLUE : entry.rate >= 20 ? AMBER : RED} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* Market Insights & Objections */}
      <ObjectionsSection />

      {/* ICP Verdict */}
      <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-xl p-5 mb-6">
        <h4 className="font-bold text-red-900 mb-2">ICP Verdict: AU Marketing Agencies</h4>
        <p className="text-sm text-red-800 mb-4">
          960 dials + 2,616 emails + 3,209 LinkedIn messages produced <strong>12 meetings</strong>.
          Of those, 7 came from warm leads/referrals. Only <strong>3 from cold outreach</strong> to AU marketing agencies across 800+ touchpoints.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 border border-red-100">
            <p className="text-xs font-bold text-red-600 uppercase">Recommendation 1</p>
            <p className="text-sm font-medium mt-1">Pass AU marketing agencies to Marketing team for nurture via ads/retargeting</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-amber-100">
            <p className="text-xs font-bold text-amber-600 uppercase">Recommendation 2</p>
            <p className="text-sm font-medium mt-1">BD pivots to 100+ employee companies with dedicated finance teams, multi-currency ops</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-xs font-bold text-blue-600 uppercase">Recommendation 3</p>
            <p className="text-sm font-medium mt-1">Deploy hybrid AI + Human calling model. AI screens at $0.07/dial, human converts warm leads</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INBOUND LEADS TAB
// ============================================================

// All 25 inbound contacts with HubSpot engagement data (pulled Apr 9, 2026)
const inboundContacts = [
  { email: "info@fastclick.com.au", name: "Ibrahim Osmani", co: "fastclick.com.au", cid: "463931792087", created: "Mar 31", firstTouch: "Mar 31", delta: 0, activities: "CALL:2, EMAIL:1, MEETING:1", phone: "+61418894141", emailed: true, called: true },
  { email: "george.chan@hellowaka.com", name: "George Chan", co: "Waka", cid: "454052231923", created: "Mar 10", firstTouch: "Mar 10", delta: 0, activities: "CALL:1, EMAIL:5, INCOMING:4", phone: "+6598579870", emailed: true, called: true },
  { email: "moaze@uptrade.au", name: "Moaze Bahloul", co: "Uptrade", cid: "457044957888", created: "Mar 16", firstTouch: "Mar 16", delta: 0, activities: "CALL:1, EMAIL:3, INCOMING:1", phone: "-", emailed: true, called: true },
  { email: "veridiana@usexentra.com", name: "Veridiana Tigirlas", co: "Xentra", cid: "438664061689", created: "Feb 24", firstTouch: "Feb 24", delta: 0, activities: "EMAIL:14, INCOMING:11, MEETING:2", phone: "-", emailed: true, called: false },
  { email: "ceo@izisend.com", name: "Ahsan Zarif Gondal", co: "IZI Send", cid: "449289059064", created: "Mar 5", firstTouch: "Mar 5", delta: 0, activities: "CALL:2, EMAIL:8", phone: "-", emailed: true, called: true },
  { email: "blake@zerolink.me", name: "Wang Shuai", co: "ZeroLink", cid: "450821892848", created: "Mar 6", firstTouch: "Mar 6", delta: 0, activities: "EMAIL:7, INCOMING:4", phone: "-", emailed: true, called: false },
  { email: "kerry0000@zerolink.me", name: "Kerry Li", co: "ZeroLink", cid: "443159070417", created: "Feb 28", firstTouch: "Feb 28", delta: 0, activities: "CALL:1, EMAIL:1, MEETING:2", phone: "-", emailed: true, called: true },
  { email: "joseph.loh@sgp.pilship.com", name: "Joseph Loh", co: "Pacific Int'l Lines", cid: "447655560902", created: "Mar 4", firstTouch: "Mar 4", delta: 0, activities: "EMAIL:5, INCOMING:6, MEETING:1", phone: "-", emailed: true, called: false },
  { email: "plus1australia@gmail.com", name: "Jiaming Gu", co: "CHOISIR PTE. LTD.", cid: "454174615263", created: "Mar 10", firstTouch: "Mar 10", delta: 0, activities: "CALL:2, EMAIL:3, INCOMING:2", phone: "-", emailed: true, called: true },
  { email: "onboarding@onramp.money", name: "Gaurav Dahake", co: "FALCON FINTECH", cid: "449139334882", created: "Mar 5", firstTouch: "Mar 5", delta: 0, activities: "EMAIL:2", phone: "-", emailed: true, called: false },
  { email: "islesptyltd@gmail.com", name: "Nicole Stevens", co: "Stevens co", cid: "466313617111", created: "Mar 25", firstTouch: "Mar 25", delta: 0, activities: "EMAIL:7", phone: "+61435790453", emailed: true, called: true },
  { email: "partners@kryzo.io", name: "Marinos Kouttoupis", co: "Kryzo", cid: "464043913948", created: "Mar 31", firstTouch: "Mar 31", delta: 0, activities: "EMAIL:4, CALL:3", phone: "+37066803382", emailed: true, called: true },
  { email: "randy@statewidequipment.com", name: "Randy Reed", co: "Statewide Equipment", cid: "459307244230", created: "Mar 20", firstTouch: "Mar 20", delta: 0, activities: "EMAIL:5", phone: "-", emailed: true, called: false },
  { email: "legal@payaza.africa", name: "Tochukwu Ekwonna", co: "Payaza Africa", cid: "461735342822", created: "Mar 26", firstTouch: "Mar 26", delta: 0, activities: "EMAIL:2", phone: "+16183045310", emailed: true, called: false },
  { email: "orientalstarinc@outlook.com", name: "Bin Han", co: "Oriental Star Inc", cid: "458470222538", created: "Mar 18", firstTouch: "Mar 19", delta: 1, activities: "CALL:2, EMAIL:10", phone: "+16265929251", emailed: true, called: true },
  { email: "dragonprotrading@outlook.com", name: "Baolong Kou", co: "Dragonpro Trading", cid: "455991215844", created: "Mar 12", firstTouch: "Mar 13", delta: 1, activities: "CALL:1, EMAIL:12", phone: "+16265617300", emailed: true, called: true },
  { email: "supermantravelinc@outlook.com", name: "Guiyang Yao", co: "Superman Travel", cid: "457978319605", created: "Mar 17", firstTouch: "Mar 18", delta: 1, activities: "CALL:2, EMAIL:7", phone: "+16264172432", emailed: true, called: true },
  { email: "vastlinktrade12@gmail.com", name: "Wenyan Pang", co: "Vastlink Trade", cid: "455977450177", created: "Mar 12", firstTouch: "Mar 13", delta: 1, activities: "EMAIL:8", phone: "-", emailed: true, called: false },
  { email: "apps@mindcloud.co", name: "Apps Account", co: "MindCloud", cid: "456463376111", created: "Mar 13", firstTouch: "Mar 14", delta: 1, activities: "EMAIL:7", phone: "-", emailed: true, called: false },
  { email: "ausfundfast@gmail.com", name: "Vincent Zhong", co: "Fund Fast Pty Ltd", cid: "459057882838", created: "Mar 23", firstTouch: "Mar 25", delta: 2, activities: "EMAIL:5, INCOMING:3", phone: "+61466663988", emailed: true, called: false },
  { email: "david.li@supay.co.nz", name: "Wei Li", co: "Supay Technology", cid: "462705811149", created: "Mar 30", firstTouch: "Mar 31", delta: 1, activities: "EMAIL:3", phone: "+6421918618", emailed: true, called: false },
  { email: "annie@inspri.com.au", name: "Annie Nguyen", co: "Inspri", cid: "462311423675", created: "Mar 27", firstTouch: "Mar 30", delta: 3, activities: "CALL:3, EMAIL:5", phone: "+61405511895", emailed: true, called: true },
  { email: "info@suncapitalinvestments.com.au", name: "Edward Menegol", co: "Sun Capital Investments", cid: "456784275169", created: "Mar 15", firstTouch: "Apr 4", delta: 20, activities: "EMAIL:2", phone: "-", emailed: true, called: false },
];

// All 18 Sales Pipeline deals with HubSpot deal IDs, SDR owners, AE owners
const allPipelineDeals = [
  { co: "CHOISIR PTE. LTD.", stage: "Live", ae: "Justin Chia", sdr: "Harini", created: "Mar 23", did: "317245449919", email: "plus1australia@gmail.com", phone: "-", kybStage: "APPROVED" },
  { co: "Xentra", stage: "KYB", ae: "Nouvelle Nye", sdr: "Harini", created: "Feb 27", did: "306533580482", email: "veridiana@usexentra.com", phone: "-", kybStage: "CUST_SUBMITTED" },
  { co: "Supay Technology", stage: "KYB", ae: "Nouvelle Nye", sdr: "Nouvelle Nye", created: "Apr 2", did: "318930466541", email: "david.li@supay.co.nz", phone: "+6421918618", kybStage: "CUST_SUBMITTED" },
  { co: "Fund Fast Pty Ltd", stage: "KYB", ae: "Gibson Saw", sdr: "Sukriti", created: "Mar 30", did: "317454963419", email: "ausfundfast@gmail.com", phone: "+61466663988", kybStage: "CONDITIONAL_APPROVED" },
  { co: "Stevens co", stage: "Discovery", ae: "Michelle Ling", sdr: "Harini", created: "Mar 30", did: "318471630581", email: "islesptyltd@gmail.com", phone: "+61435790453", kybStage: "CUST_SUBMITTED" },
  { co: "Oriental Star Inc", stage: "Discovery", ae: "Ng Yan Ling", sdr: "Harini", created: "Apr 7", did: "319639327433", email: "orientalstarinc@outlook.com", phone: "+16265929251", kybStage: "CUST_SUBMITTED" },
  { co: "Vastlink Trade", stage: "Discovery", ae: "Ng Yan Ling", sdr: "Harini", created: "Apr 8", did: "320043402990", email: "vastlinktrade12@gmail.com", phone: "-", kybStage: "CUST_SUBMITTED" },
  { co: "Delivery", stage: "Discovery", ae: "Ng Yan Ling", sdr: "Sukriti", created: "Apr 7", did: "319637118680", email: "fitri_d@hotmail.com", phone: "-", kybStage: "STARTED" },
  { co: "Superman Travel", stage: "Discovery", ae: "Elross Pangue", sdr: "Sukriti", created: "Apr 7", did: "319640731340", email: "supermantravelinc@outlook.com", phone: "+16264172432", kybStage: "CUST_SUBMITTED" },
  { co: "Dragonpro Trading", stage: "Discovery", ae: "Elross Pangue", sdr: "Sukriti", created: "Apr 8", did: "319926706886", email: "dragonprotrading@outlook.com", phone: "+16265617300", kybStage: "CUST_SUBMITTED" },
  { co: "Habla Chat", stage: "Discovery", ae: "Elross Pangue", sdr: "Sukriti", created: "Apr 7", did: "319640018631", email: "hablachat.com.br@gmail.com", phone: "-", kybStage: "STARTED" },
  { co: "Statewide Equipment", stage: "Discovery", ae: "Nouvelle Nye", sdr: "Nouvelle Nye", created: "Apr 7", did: "319640735434", email: "randy@statewidequipment.com", phone: "-", kybStage: "STARTED" },
  { co: "Payaza Africa", stage: "Discovery", ae: "Nouvelle Nye", sdr: "Nouvelle Nye", created: "Apr 7", did: "319555154640", email: "legal@payaza.africa", phone: "+16183045310", kybStage: "STARTED" },
  { co: "Uptrade", stage: "Discovery", ae: "Justin Chia", sdr: "Harini", created: "Apr 7", did: "319640014568", email: "moaze@uptrade.au", phone: "-", kybStage: "CUST_SUBMITTED" },
  { co: "Waka", stage: "Discovery", ae: "Unassigned", sdr: "Sukriti", created: "Apr 7", did: "319661201093", email: "george.chan@hellowaka.com", phone: "+6598579870", kybStage: "APPROVED" },
  { co: "fastclick.com.au", stage: "Discovery", ae: "Gibson Saw", sdr: "Harini", created: "Apr 7", did: "319637118665", email: "info@fastclick.com.au", phone: "+61418894141", kybStage: "STARTED" },
  { co: "Kryzo", stage: "Discovery", ae: "Adlin Norazman", sdr: "Sukriti", created: "Apr 7", did: "319473194700", email: "partners@kryzo.io", phone: "+37066803382", kybStage: "CUST_SUBMITTED" },
  { co: "ZeroLink", stage: "Closed Lost", ae: "Michelle Ling", sdr: "Sukriti", created: "Mar 2", did: "308699727552", email: "kerry0000@zerolink.me", phone: "-", kybStage: "REJECTED" },
];

function InboundLeads() {
  const { toggle, isOpen } = useExpandableRows();

  const signupFunnel = [
    { stage: "Total Zap Runs", value: 280, color: SLATE },
    { stage: "Internal/Junk (@finmo.net)", value: 166, color: RED },
    { stage: "Other Junk", value: 53, color: AMBER },
    { stage: "Legitimate Signups", value: 61, color: GREEN },
  ];

  const regionData = [
    { region: "Malaysia", count: 12, quality: "Low" },
    { region: "Australia", count: 10, quality: "Medium" },
    { region: "United States", count: 9, quality: "Medium" },
    { region: "Singapore", count: 5, quality: "High" },
    { region: "Cyprus", count: 3, quality: "Low" },
    { region: "Canada", count: 3, quality: "Medium" },
    { region: "Other (8 countries)", count: 13, quality: "Mixed" },
  ];

  const referralSources = [
    { source: "Online Advertisement", count: 12, pct: 20 },
    { source: "AI Search", count: 9, pct: 15 },
    { source: "LinkedIn", count: 9, pct: 15 },
    { source: "Search Engine", count: 7, pct: 11 },
    { source: "Referral", count: 6, pct: 10 },
    { source: "Direct Outreach", count: 6, pct: 10 },
    { source: "Other/Event/Podcast", count: 5, pct: 8 },
  ];

  const salesStages = [
    { stage: "Discovery Completed", count: 13, color: BLUE },
    { stage: "KYB", count: 3, color: AMBER },
    { stage: "Live", count: 1, color: GREEN },
    { stage: "Closed Lost", count: 1, color: RED },
  ];

  const kybStages = [
    { stage: "STARTED", count: 12, color: BLUE },
    { stage: "CUST_SUBMITTED", count: 10, color: CYAN },
    { stage: "NOT_STARTED", count: 7, color: SLATE },
    { stage: "APPROVED", count: 2, color: GREEN },
    { stage: "REJECTED", count: 2, color: RED },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Total Signups" value="280" sub="March 2026 zap runs" color="blue" />
        <MetricCard label="Legitimate" value="61" sub="21.8% of total (56 unique emails)" color="green" />
        <MetricCard label="Junk/Internal" value="219" sub="166 @finmo.net + 53 other" color="red" />
        <MetricCard label="In Sales Pipeline" value="18" sub="35% of legit" color="purple" />
        <MetricCard label="Deals Created" value="51" sub="18 sales + 33 KYB" color="cyan" />
      </div>

      {/* Signup Funnel */}
      <Section title="Signup Funnel" subtitle="280 total zap runs -> 61 legitimate signups from 56 unique emails">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={signupFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={180} tick={{ fontSize: 11 }} />
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
                <p className="text-xl font-bold text-blue-900">31</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-xs text-emerald-600 font-medium">Company Email</p>
                <p className="text-xl font-bold text-emerald-900">25</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 font-medium">Duplicates</p>
                <p className="text-xl font-bold text-gray-700">5</p>
              </div>
            </div>
            <Callout type="warning">
              <strong>78% junk rate</strong> dominated by 166 @finmo.net internal signups. 61 legitimate signups from 56 unique emails (5 repeat signups). Personal vs company split: 55% / 45%.
            </Callout>
          </div>
        </div>
      </Section>

      {/* Region & Referral Source */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="By Region (Legit Only)" subtitle="55 signups across 15 countries">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Region</th>
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
          <p className="text-xs text-gray-500 mt-3">Malaysia dominates volume but low quality. AU and SG have better company signups.</p>
        </Section>

        <ReferralSourcesChart referralSources={referralSources} />
      </div>

      {/* Reachout Metrics */}
      <Section title="Reachout Metrics" subtitle="Click any card to see contact list with HubSpot links">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { key: "emailed", label: "Contacted via Email", value: inboundContacts.filter(c => c.emailed).length, sub: "of 23 tracked contacts", color: "blue" },
            { key: "not-emailed", label: "Never Emailed", value: inboundContacts.filter(c => !c.emailed).length, sub: "no activity found", color: "red" },
            { key: "called", label: "Called", value: inboundContacts.filter(c => c.called).length, sub: `${inboundContacts.filter(c => c.called).reduce((a, c) => a + parseInt((c.activities.match(/CALL:(\d+)/)||["","0"])[1]), 0)} calls total`, color: "emerald" },
            { key: "not-called", label: "Never Called", value: inboundContacts.filter(c => !c.called).length, sub: "no call logged", color: "amber" },
          ].map(card => (
            <div key={card.key} onClick={() => toggle(`reachout-${card.key}`)}
              className={`bg-${card.color}-50 rounded-lg p-4 border border-${card.color}-100 text-center cursor-pointer hover:shadow-md transition-shadow`}>
              <p className={`text-xs text-${card.color}-600 font-medium`}>{card.label}</p>
              <p className={`text-2xl font-bold text-${card.color}-900`}>{card.value}</p>
              <p className={`text-xs text-${card.color}-500`}>{card.sub}</p>
              <p className="text-[10px] text-gray-400 mt-1">Click to expand</p>
            </div>
          ))}
        </div>

        {/* Expandable contact lists per card */}
        {["emailed", "not-emailed", "called", "not-called"].map(key => {
          if (!isOpen(`reachout-${key}`)) return null;
          const filtered = key === "emailed" ? inboundContacts.filter(c => c.emailed)
            : key === "not-emailed" ? inboundContacts.filter(c => !c.emailed)
            : key === "called" ? inboundContacts.filter(c => c.called)
            : inboundContacts.filter(c => !c.called);
          return (
            <div key={key} className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-1 px-2 font-semibold">Contact</th>
                    <th className="text-left py-1 px-2 font-semibold">Company</th>
                    <th className="text-left py-1 px-2 font-semibold">Phone</th>
                    <th className="text-left py-1 px-2 font-semibold">Activities</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.cid} className="border-b border-gray-100">
                      <td className="py-1.5 px-2">
                        <a href={`${HS}/0-1/${c.cid}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                          {c.name} <span className="text-[10px] text-blue-400">&#8599;</span>
                        </a>
                      </td>
                      <td className="py-1.5 px-2 text-gray-600">{c.co}</td>
                      <td className="py-1.5 px-2">{c.phone}</td>
                      <td className="py-1.5 px-2 text-gray-500">{c.activities}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        {/* Phone Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Phone Number Availability</h4>
            <div className="flex gap-3">
              <div className="flex-1 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-xs text-emerald-600">With Phone</p>
                <p className="text-xl font-bold text-emerald-900">22 <span className="text-sm font-normal">(43%)</span></p>
              </div>
              <div className="flex-1 bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-xs text-red-600">Without Phone</p>
                <p className="text-xl font-bold text-red-900">29 <span className="text-sm font-normal">(57%)</span></p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Call Disposition (34 calls)</h4>
            <StatRow label="No Answer" value="22 (65%)" />
            <StatRow label="Connected" value="10 (29%)" />
            <StatRow label="Wrong Number" value="1 (3%)" />
            <p className="text-xs text-gray-500 mt-2">Best: fastclick.com.au (5m39s), Uptrade (2m36s), nusabyte (64s)</p>
          </div>
        </div>
        <Callout type="danger">
          <strong>Biggest blocker: 57% of legitimate contacts have no phone number.</strong> SDR notes repeatedly say "no. not available". This is the #1 operational gap.
        </Callout>
      </Section>

      {/* First Reachout Timing */}
      <Section title="Time to First Reachout" subtitle="Based on HubSpot engagements (emails, calls, notes). Click any row for HubSpot link.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 text-center">
            <p className="text-xs text-emerald-600 font-medium">Same-day (0d)</p>
            <p className="text-2xl font-bold text-emerald-900">{inboundContacts.filter(c => c.delta === 0).length}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-center">
            <p className="text-xs text-blue-600 font-medium">1 day</p>
            <p className="text-2xl font-bold text-blue-900">{inboundContacts.filter(c => c.delta === 1).length}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 text-center">
            <p className="text-xs text-amber-600 font-medium">2-3 days</p>
            <p className="text-2xl font-bold text-amber-900">{inboundContacts.filter(c => c.delta >= 2 && c.delta <= 3).length}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-100 text-center">
            <p className="text-xs text-red-600 font-medium">4+ days</p>
            <p className="text-2xl font-bold text-red-900">{inboundContacts.filter(c => c.delta >= 4).length}</p>
            <p className="text-xs text-red-500">Sun Capital: 20 days</p>
          </div>
        </div>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Contact</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Created</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">1st Touch</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Delta</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Activities</th>
              </tr>
            </thead>
            <tbody>
              {[...inboundContacts].sort((a, b) => a.delta - b.delta).map((c) => (
                <tr key={c.cid} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 text-xs">
                    <a href={`${HS}/0-1/${c.cid}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                      {c.name} <span className="text-[10px] text-blue-400">&#8599;</span>
                    </a>
                  </td>
                  <td className="py-2 px-3 text-xs">{c.co}</td>
                  <td className="py-2 px-3 text-xs">{c.created}</td>
                  <td className="py-2 px-3 text-xs">{c.firstTouch}</td>
                  <td className="py-2 px-3">
                    <Badge text={`${c.delta}d`} variant={c.delta === 0 ? "success" : c.delta <= 1 ? "default" : c.delta <= 3 ? "warning" : "danger"} />
                  </td>
                  <td className="py-2 px-3 text-[10px] text-gray-500">{c.activities}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout type="success">
          <strong>Median first reachout: same day.</strong> {inboundContacts.filter(c => c.delta === 0).length} of {inboundContacts.length} contacts were reached within 24 hours. Sun Capital (20-day gap) is the only significant outlier.
        </Callout>
      </Section>

      {/* Deal Pipeline */}
      <Section title="Deal Pipeline — All 18 Sales Deals" subtitle="Click any row for details. Every deal links to HubSpot.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Sales Pipeline (18 deals)</h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={salesStages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {salesStages.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3">KYB Tracker (33 deals)</h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={kybStages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {kybStages.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Full deal table */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="w-5 py-2 px-1"></th>
                <th className="text-left py-2 px-2 font-semibold text-gray-600">Company</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-600">Stage</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-600">AE Owner</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-600">SDR</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-600">Created</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-600">KYB</th>
              </tr>
            </thead>
            <tbody>
              {allPipelineDeals.map((d) => (
                <>
                  <tr key={d.did} onClick={() => toggle(`deal-${d.did}`)} className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer">
                    <td className="py-2 px-1"><Chevron open={isOpen(`deal-${d.did}`)} /></td>
                    <td className="py-2 px-2">
                      <a href={`${HS}/0-3/${d.did}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="font-medium text-blue-700 hover:underline">
                        {d.co} <span className="text-[10px] text-blue-400">&#8599;</span>
                      </a>
                    </td>
                    <td className="py-2 px-2">
                      <Badge text={d.stage} variant={d.stage === "Live" ? "success" : d.stage === "KYB" ? "warning" : d.stage === "Closed Lost" ? "danger" : "default"} />
                    </td>
                    <td className="py-2 px-2 text-xs">{d.ae}</td>
                    <td className="py-2 px-2 text-xs">{d.sdr}</td>
                    <td className="py-2 px-2 text-xs text-gray-500">{d.created}</td>
                    <td className="py-2 px-2">
                      <Badge text={d.kybStage} variant={d.kybStage === "APPROVED" || d.kybStage === "CONDITIONAL_APPROVED" ? "success" : d.kybStage === "REJECTED" ? "danger" : d.kybStage === "CUST_SUBMITTED" ? "purple" : "default"} />
                    </td>
                  </tr>
                  {isOpen(`deal-${d.did}`) && (
                    <DetailPanel key={`deal-${d.did}-detail`}>
                      <DetailGrid items={[
                        { label: "Contact Email", value: d.email },
                        { label: "Phone", value: d.phone },
                        { label: "KYB Status", value: d.kybStage },
                        { label: "SDR Owner", value: d.sdr },
                      ]} />
                      <div className="mt-2 flex gap-2">
                        <a href={`${HS}/0-3/${d.did}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 hover:underline">View Deal &#8599;</a>
                        {hsContactByEmail[d.email] && (
                          <a href={hsContactByEmail[d.email]} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 hover:underline">View Contact &#8599;</a>
                        )}
                      </div>
                    </DetailPanel>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        <Callout type="info">
          <strong>Lost deal:</strong> Only 1 Closed Lost (ZeroLink) — KYB Rejected. 21 contacts have zero deals — mostly low-quality personal email signups from Malaysia/Indonesia.
        </Callout>
      </Section>
    </div>
  );
}

// ============================================================
// SOLUTIONS TAB
// ============================================================
function SolutionsTab() {
  const pipelineFunnel = [
    { stage: "Presales", count: 42, color: SLATE },
    { stage: "Solutioning", count: 8, color: BLUE },
    { stage: "Kick-off", count: 6, color: CYAN },
    { stage: "Integration", count: 4, color: INDIGO },
    { stage: "UAT Testing", count: 5, color: PURPLE },
    { stage: "Hypercare", count: 6, color: AMBER },
    { stage: "Live", count: 14, color: GREEN },
    { stage: "CS Handover", count: 3, color: GREEN },
    { stage: "Blocked/Lost", count: 11, color: RED },
  ];

  const marchDemos = [
    { merchant: "NonPublic", date: "Mar 4", ae: "Michelle Ling", jiraStatus: "Kick-off Stage", hsStatus: "Qualified To Buy", solOwner: "Prutvi", did: "310185921241" },
    { merchant: "OPULRICH AUSTRALIA", date: "Mar 5", ae: "Gibson Saw", jiraStatus: "Kick-off Stage", hsStatus: "Closed Won", solOwner: "Dhanush", did: "310971563765" },
    { merchant: "FazWaz", date: "Mar 5", ae: "Justin Chia", jiraStatus: "Solutioning", hsStatus: "Closed Won", solOwner: "Akshit", did: "180964520667" },
    { merchant: "Zerolink", date: "Mar 6", ae: "Michelle Ling", jiraStatus: "Presales Stage", hsStatus: "Closed Lost", solOwner: "Prutvi", did: "308699727552" },
    { merchant: "Flexie Transfer", date: "Mar 18", ae: "Adlin Norazman", jiraStatus: "Solutioning", hsStatus: "N/A", solOwner: "Prutvi", did: "" },
    { merchant: "Olympio", date: "Mar 18", ae: "Adlin Norazman", jiraStatus: "Solutioning", hsStatus: "Qualified To Buy", solOwner: "Prutvi", did: "305875915500" },
    { merchant: "FinanceLah", date: "Mar 25", ae: "Nouvelle Nye", jiraStatus: "Kick-off Stage", hsStatus: "N/A", solOwner: "Prutvi", did: "" },
    { merchant: "Cosmo Remit", date: "Mar 26", ae: "Michelle Ling", jiraStatus: "UAT Testing", hsStatus: "Closed Won", solOwner: "Prutvi", did: "311795864267" },
  ];

  const marchCards = [
    { merchant: "PaySo", type: "Direct", ae: "Elross Pangue", solOwner: "Prutvi", jiraStatus: "Solutioning", hsStatus: "N/A" },
    { merchant: "FNZ Global", type: "Direct", ae: "Michelle Ling", solOwner: "Dhanush", jiraStatus: "Solutioning", hsStatus: "Closed Won" },
    { merchant: "OPULRICH", type: "Partner L3", ae: "Gibson Saw", solOwner: "Dhanush", jiraStatus: "Kick-off", hsStatus: "Closed Won" },
    { merchant: "Frankie Yu", type: "Partner L1", ae: "Gibson Saw", solOwner: "Dhanush", jiraStatus: "Kick-off", hsStatus: "KYB pipeline" },
    { merchant: "VIVER", type: "Direct", ae: "Michelle Ling", solOwner: "Prutvi", jiraStatus: "Integration", hsStatus: "Closed Won" },
    { merchant: "NonPublic", type: "Direct", ae: "Michelle Ling", solOwner: "Prutvi", jiraStatus: "Kick-off", hsStatus: "Qualified To Buy" },
    { merchant: "Cosmo Remit", type: "Direct", ae: "Michelle Ling", solOwner: "Prutvi", jiraStatus: "UAT Testing", hsStatus: "Closed Won" },
    { merchant: "Olympio", type: "Partner L3", ae: "Adlin Norazman", solOwner: "Prutvi", jiraStatus: "Solutioning", hsStatus: "Qualified To Buy" },
    { merchant: "Flexie Transfer", type: "Direct", ae: "Adlin Norazman", solOwner: "Prutvi", jiraStatus: "Solutioning", hsStatus: "N/A" },
  ];


  // Live data pulled from Metabase (revenue DB 14) + HubSpot + KYB (DB 5, table 98)
  const liveMerchants = [
    { merchant: "Choisir Education", method: "Aug 2023", firstTxn: "Jan 2024", ae: "Justin Chia", kyb: "APPROVED", projectedMRR: "$2,000", actualMar26: "$19,016", totalRev: "$158,181", txns: 6735, status: "active" as const },
    { merchant: "DCS Cards", method: "-", firstTxn: "Nov 2025", ae: "Justin Chia", kyb: "APPROVED", projectedMRR: "$50,000", actualMar26: "$309", totalRev: "$621", txns: 1050, status: "low" as const },
    { merchant: "ZashX", method: "Dec 18", firstTxn: "Dec 2025", ae: "Michelle Ling", kyb: "APPROVED", projectedMRR: "$1,000", actualMar26: "$89", totalRev: "$144", txns: 67, status: "low" as const },
    { merchant: "MDJ", method: "Feb 3", firstTxn: "Feb 2026", ae: "Michelle Ling", kyb: "-", projectedMRR: "$8,000", actualMar26: "$528", totalRev: "$749", txns: 41, status: "active" as const },
    { merchant: "YALA CONSULT", method: "Feb 3", firstTxn: "Feb 2026", ae: "Gibson Saw", kyb: "APPROVED", projectedMRR: "$2,500", actualMar26: "$18", totalRev: "$29", txns: 11, status: "minimal" as const },
    { merchant: "Pryvx", method: "-", firstTxn: "Mar 2026", ae: "Anuj Kapoor", kyb: "APPROVED", projectedMRR: "$1,000", actualMar26: "$0.35", totalRev: "$1", txns: 4, status: "minimal" as const },
    { merchant: "Impressia Limited", method: "Jan 19", firstTxn: "-", ae: "Michelle Ling", kyb: "-", projectedMRR: "$2,000", actualMar26: "$0", totalRev: "$0", txns: 0, status: "dormant" as const },
    { merchant: "TSPA SPV I", method: "Jan 20", firstTxn: "-", ae: "Justin Chia", kyb: "APPROVED", projectedMRR: "$3,500", actualMar26: "$0", totalRev: "$0", txns: 0, status: "dormant" as const },
    { merchant: "Kortya Softcom", method: "-", firstTxn: "-", ae: "Nouvelle Nye", kyb: "-", projectedMRR: "$2,000", actualMar26: "$0", totalRev: "$0", txns: 0, status: "dormant" as const },
    { merchant: "OFFGIDER INC", method: "Feb 4", firstTxn: "-", ae: "Unassigned", kyb: "APPROVED", projectedMRR: "-", actualMar26: "$0", totalRev: "$0", txns: 0, status: "dormant" as const },
    { merchant: "PRIME FX", method: "Feb 4", firstTxn: "-", ae: "Nouvelle Nye", kyb: "APPROVED", projectedMRR: "$5,000", actualMar26: "$0", totalRev: "$0", txns: 0, status: "dormant" as const },
    { merchant: "Grandir Capital", method: "Dec 30", firstTxn: "-", ae: "Michelle Ling", kyb: "APPROVED", projectedMRR: "$500", actualMar26: "$0", totalRev: "$112", txns: 2, status: "dormant" as const },
    { merchant: "Klip Payments", method: "Nov 28", firstTxn: "-", ae: "Gibson Saw", kyb: "APPROVED", projectedMRR: "$10,000", actualMar26: "$0", totalRev: "$0", txns: 0, status: "dormant" as const },
    { merchant: "Kleen Strategies", method: "Nov 7", firstTxn: "-", ae: "Nouvelle Nye", kyb: "-", projectedMRR: "$500", actualMar26: "-", totalRev: "-", txns: 0, status: "dormant" as const },
    { merchant: "Velox Tech", method: "-", firstTxn: "-", ae: "Nouvelle Nye", kyb: "APPROVED", projectedMRR: "$2,000", actualMar26: "$0", totalRev: "$0", txns: 0, status: "dormant" as const },
    // Capabilities enabled in March — not on Jira "Live" but activated
    { merchant: "FNZ Global", method: "Mar 10", firstTxn: "Mar 9, 2026", ae: "Michelle Ling", kyb: "APPROVED", projectedMRR: "$500", actualMar26: "$0", totalRev: "$0", txns: 27, status: "minimal" as const },
    { merchant: "VIVER", method: "Mar 16", firstTxn: "Mar 16, 2026", ae: "Michelle Ling", kyb: "APPROVED", projectedMRR: "$6,400", actualMar26: "$0", totalRev: "$0", txns: 28, status: "minimal" as const },
    { merchant: "Cosmo Remit", method: "Mar 24", firstTxn: "-", ae: "Michelle Ling", kyb: "-", projectedMRR: "$1,000", actualMar26: "$0", totalRev: "$0", txns: 0, status: "dormant" as const },
    { merchant: "IFTIN EXPRESS", method: "Mar 10", firstTxn: "Nov 2025", ae: "Elross Pangue", kyb: "APPROVED", projectedMRR: "$2,000", actualMar26: "$2,359", totalRev: "$8,475", txns: 2601, status: "active" as const },
    { merchant: "Oceania Financial", method: "Mar 10", firstTxn: "-", ae: "CS Handover", kyb: "-", projectedMRR: "-", actualMar26: "-", totalRev: "-", txns: 0, status: "dormant" as const },
  ];

  const marchCapabilities = [
    { merchant: "FNZ Global", currencies: "IDR, SGD, AUD, NZD, THB, PHP", gca: "DBS", date: "Mar 10-11" },
    { merchant: "VIVER", currencies: "SGD, EUR", gca: "DBS + Wise", date: "Mar 16" },
    { merchant: "Cosmo Remit", currencies: "NZD", gca: "-", date: "Mar 24" },
    { merchant: "Oceania Financial", currencies: "+USDT (added)", gca: "-", date: "Mar 10" },
    { merchant: "IFTIN EXPRESS", currencies: "+USDT (added)", gca: "EMQ (new)", date: "Mar 10" },
  ];

  const useCases = [
    { product: "Money Movement", pct: 84, color: BLUE },
    { product: "Balances", pct: 23, color: GREEN },
    { product: "Accounts Receivable", pct: 18, color: CYAN },
    { product: "Accounts Payable", pct: 16, color: PURPLE },
    { product: "Cash Forecasting", pct: 14, color: AMBER },
    { product: "Bank Connectivity", pct: 13, color: PINK },
    { product: "FX", pct: 7, color: INDIGO },
  ];

  const opsCategories = [
    { name: "Payment Method Activation", value: 13, color: BLUE },
    { name: "GCA Activation", value: 8, color: GREEN },
    { name: "Pricing Setup", value: 7, color: AMBER },
  ];

  const opsCurrencies = [
    { method: "Stables (USDT, USDC)", tasks: 5 },
    { method: "AUD - NPP", tasks: 4 },
    { method: "EUR", tasks: 2 },
    { method: "SGD", tasks: 1 },
    { method: "NZD", tasks: 1 },
    { method: "Multi-currency", tasks: 1 },
  ];


  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Demos in March" value="8" sub="across Solutions team" color="purple" />
        <MetricCard label="New Pipeline Cards" value="9" sub="+9 net (0 lost)" color="blue" />
        <MetricCard label="Live / Activated" value="19" sub="14 Jira Live + 5 Mar activated" color="green" />
        <MetricCard label="Projected MRR" value="$281K" sub="23 of 100 total cards have estimates" color="amber" />
        <MetricCard label="Ops Tasks" value="28" sub="93% completed" color="cyan" />
      </div>

      {/* Demos */}
      <Section title="Demos Conducted in March" subtitle="8 merchant demos across Solutions team. Jira = SP board, HubSpot = Sales pipeline.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-2 font-semibold text-gray-600">Merchant</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-600">Demo Date</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-600">AE</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-600">Solutions Owner</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-600">Jira Status</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-600">HubSpot Status</th>
              </tr>
            </thead>
            <tbody>
              {marchDemos.map((d) => (
                <tr key={d.merchant} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-2">
                    {d.did ? <a href={`${HS}/0-3/${d.did}`} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline">{d.merchant} <span className="text-[10px] text-blue-400">&#8599;</span></a> : <span className="font-medium">{d.merchant}</span>}
                  </td>
                  <td className="py-2 px-2">{d.date}</td>
                  <td className="py-2 px-2 text-xs">{d.ae}</td>
                  <td className="py-2 px-2 text-xs">{d.solOwner}</td>
                  <td className="py-2 px-2"><Badge text={d.jiraStatus} variant={
                    d.jiraStatus.includes("UAT") ? "purple" : d.jiraStatus.includes("Kick") ? "warning" :
                    d.jiraStatus.includes("Integration") ? "success" : "default"
                  } /></td>
                  <td className="py-2 px-2"><Badge text={d.hsStatus} variant={
                    d.hsStatus.includes("Won") ? "success" : d.hsStatus.includes("Lost") ? "danger" :
                    d.hsStatus.includes("Qualified") ? "warning" : "default"
                  } /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">Michelle Ling led with 3 demos. Adlin Norazman had 2 demos on same day (Mar 18). FazWaz is a legacy card from Oct 2025.</p>
      </Section>

      {/* Pipeline Movement */}
      <Section title="Pipeline Overview" subtitle="100 merchants total across all stages">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={pipelineFunnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {pipelineFunnel.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="font-semibold text-blue-800 text-sm mb-2">March Stage Transitions (8 total)</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>Solutioning to Kick-off: <strong>3</strong> (OPULRICH, Frankie Yu, NonPublic)</p>
                <p>Solutioning to UAT: <strong>2</strong> (VIVER, Cosmo Remit)</p>
                <p>UAT to Integration: <strong>1</strong> (VIVER)</p>
                <p>Jira to Live: <strong>0</strong></p>
              </div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <h4 className="font-semibold text-emerald-800 text-sm mb-2">First Transaction in March (Metabase)</h4>
              <p className="text-sm text-emerald-700 mb-2">4 orgs did their first-ever transaction in March — effectively "went live" even if Jira wasn't updated:</p>
              <div className="space-y-1 text-sm text-emerald-700">
                <p><strong>VIVER</strong> — first txn Mar 16, 28 txns (Jira: Integration)</p>
                <p><strong>FNZ Global</strong> — first txn Mar 9, 27 txns (Jira: Solutioning)</p>
                <p><strong>KATHMANDU</strong> (GTW child) — first txn Mar 12, 38 txns</p>
                <p><strong>ECOMMS</strong> (GTW child) — first txn Mar 12, 23 txns</p>
              </div>
            </div>
            <Callout type="warning">
              <strong>34 of 42 Presales cards are stale ({">"}60 days old).</strong> Pipeline is heavily front-loaded. Only 14% conversion from entry to Live. Recommend pipeline hygiene review.
            </Callout>
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <h4 className="font-semibold text-emerald-800 text-sm mb-2">Fastest Mover: VIVER</h4>
              <p className="text-sm text-emerald-700">Solutioning to Integration in 6 days (Mar 25 - Mar 31). South Korea-based luxury watch merchant. SGD + EUR enabled, DBS + Wise GCA.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* New Cards in March */}
      <Section title="9 New Pipeline Cards - March" subtitle="Solutions Owner = Jira assignee (not AE). Etoro added to pipeline.">
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-2 font-semibold text-gray-600">Merchant</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-600">Type</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-600">AE</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-600">Solutions Owner</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-600">Jira Status</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-600">HubSpot Status</th>
              </tr>
            </thead>
            <tbody>
              {marchCards.map((c) => (
                <tr key={c.merchant} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-2"><HsLink name={c.merchant} /></td>
                  <td className="py-2 px-2"><Badge text={c.type} variant={c.type.includes("Partner") ? "purple" : "default"} /></td>
                  <td className="py-2 px-2 text-xs">{c.ae}</td>
                  <td className="py-2 px-2 text-xs">{c.solOwner}</td>
                  <td className="py-2 px-2"><Badge text={c.jiraStatus} variant={c.jiraStatus.includes("UAT") ? "purple" : c.jiraStatus.includes("Integration") ? "success" : "default"} /></td>
                  <td className="py-2 px-2"><Badge text={c.hsStatus} variant={c.hsStatus.includes("Won") ? "success" : c.hsStatus.includes("Qualified") ? "warning" : "default"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Partner Performance */}
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-5 mb-4">
          <h4 className="font-bold text-violet-900 mb-3">Partner Performance — GTW (Only Active Partner with Children)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 border border-violet-100">
              <p className="text-[10px] text-violet-500 uppercase font-medium">Total Child Orgs</p>
              <p className="text-xl font-bold text-violet-900">4</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-violet-100">
              <p className="text-[10px] text-violet-500 uppercase font-medium">Mar Revenue (Parent+Children)</p>
              <p className="text-xl font-bold text-violet-900">$9,771</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-violet-100">
              <p className="text-[10px] text-violet-500 uppercase font-medium">Mar Txns (Parent)</p>
              <p className="text-xl font-bold text-violet-900">3,199</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-violet-100">
              <p className="text-[10px] text-violet-500 uppercase font-medium">Active Children</p>
              <p className="text-xl font-bold text-violet-900">2 of 4</p>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-violet-200">
                <th className="text-left py-2 px-2 font-semibold text-violet-700">Org</th>
                <th className="text-left py-2 px-2 font-semibold text-violet-700">KYB</th>
                <th className="text-right py-2 px-2 font-semibold text-violet-700">Mar Revenue</th>
                <th className="text-right py-2 px-2 font-semibold text-violet-700">Mar Txns</th>
                <th className="text-left py-2 px-2 font-semibold text-violet-700">First Txn</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-violet-100 bg-violet-50/50"><td className="py-2 px-2 font-semibold" colSpan={5}>GTW Parent</td></tr>
              <tr className="border-b border-violet-100">
                <td className="py-2 px-2">GTW Parent</td><td className="py-2 px-2"><Badge text="APPROVED" variant="success" /></td>
                <td className="text-right py-2 px-2 font-semibold">$9,673</td><td className="text-right py-2 px-2">3,199</td><td className="py-2 px-2">Oct 2023</td>
              </tr>
              <tr className="border-b border-violet-100 bg-violet-50/50"><td className="py-2 px-2 font-semibold" colSpan={5}>Children (partner_id linked)</td></tr>
              {[
                { name: "KATHMANDU", kyb: "APPROVED", rev: "$23", txns: "19", first: "Mar 12" },
                { name: "ECOMMS", kyb: "COND. APPROVED", rev: "$76", txns: "13", first: "Mar 12" },
                { name: "Century Speed", kyb: "APPROVED", rev: "$0", txns: "0", first: "-" },
                { name: "Glb Trade Money Exch.", kyb: "CUST_SUBMITTED", rev: "$0", txns: "0", first: "-" },
              ].map(c => (
                <tr key={c.name} className="border-b border-violet-100">
                  <td className="py-2 px-2 pl-6">{c.name}</td>
                  <td className="py-2 px-2"><Badge text={c.kyb} variant={c.kyb.includes("APPROVED") ? "success" : c.kyb === "CUST_SUBMITTED" ? "purple" : "default"} /></td>
                  <td className="text-right py-2 px-2">{c.rev}</td><td className="text-right py-2 px-2">{c.txns}</td>
                  <td className="py-2 px-2">{c.first !== "-" ? <Badge text={c.first} variant="success" /> : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-violet-600 mt-2">Klip Payments and Growth HQ are flagged as partners (is_partner=true) but have no child merchants yet.</p>
        </div>

        {/* Direct vs Partner summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-center">
            <p className="text-xs text-blue-600 font-medium">Direct Merchants (March new)</p>
            <p className="text-2xl font-bold text-blue-900">6</p>
            <p className="text-xs text-blue-500">PaySo, FNZ, VIVER, NonPublic, Cosmo Remit, Flexie</p>
          </div>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-100 text-center">
            <p className="text-xs text-violet-600 font-medium">Partner Merchants (March new)</p>
            <p className="text-2xl font-bold text-violet-900">3</p>
            <p className="text-xs text-violet-500">OPULRICH (L3), Frankie Yu (L1), Olympio (L3)</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 text-center">
            <p className="text-xs text-amber-600 font-medium">Etoro (in Top Revenue)</p>
            <p className="text-2xl font-bold text-amber-900">$20K</p>
            <p className="text-xs text-amber-500">Contract/Commercial in HS, new on Jira</p>
          </div>
        </div>
      </Section>

      {/* Top Revenue Opportunities */}
      <Section title="Top Revenue Opportunities" subtitle="$281K projected MRR across 23 of 100 total pipeline cards (not just March). Click row for Metabase actuals.">
        <TopRevenueTable />
        <Callout type="warning">
          <strong>Jira/HubSpot mismatch flagged:</strong> Damisa shows Presales in Jira but is <strong>Closed Lost</strong> in HubSpot. Zynk shows Presales in Jira but is <strong>Re-Engage</strong> in HubSpot. Jira cards need cleanup to reflect actual deal status. Etoro ($20K) added — Contract/Commercial stage.
        </Callout>

        {/* March Activated Merchants - Revenue from Metabase */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h4 className="font-bold text-blue-900 mb-3">March Activated Merchants — Actual Revenue (Metabase)</h4>
          <p className="text-xs text-blue-600 mb-3">Merchants whose activation (PM/GCA/Pricing) task was created and completed in March (OPS board), plus merchants with first-ever transaction in March. Revenue from Metabase DB 14.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-200">
                  <th className="text-left py-2 px-2 font-semibold text-blue-700">Merchant</th>
                  <th className="text-left py-2 px-2 font-semibold text-blue-700">Activation</th>
                  <th className="text-left py-2 px-2 font-semibold text-blue-700">First Txn</th>
                  <th className="text-right py-2 px-2 font-semibold text-blue-700">Expected MRR</th>
                  <th className="text-right py-2 px-2 font-semibold text-blue-700">Mar Rev (USD)</th>
                  <th className="text-right py-2 px-2 font-semibold text-blue-700">Mar Txns</th>
                  <th className="text-left py-2 px-2 font-semibold text-blue-700">Note</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { m: "Great Forex", act: "PM (USDT) + Pricing", first: "Feb 2023", mrr: "$2K", mar: "$5,195", txns: "295", note: "Existing merchant, new method. MM=$2K" },
                  { m: "Exchange One", act: "PM (USDT, USDC)", first: "Sep 2025", mrr: "$30K", mar: "$5,037", txns: "10", note: "CS Handover stage" },
                  { m: "HDM Global", act: "Pricing (Domestic)", first: "May 2025", mrr: "$2K", mar: "$4,473", txns: "135", note: "Existing merchant, pricing update" },
                  { m: "DINSUN AYA", act: "PM (EUR)", first: "Mar 2, 2026", mrr: "-", mar: "$4,340", txns: "90", note: "First txn in March" },
                  { m: "Tenstar", act: "PM (USDT, USDC)", first: "Aug 2025", mrr: "$5K", mar: "$3,430", txns: "10", note: "Existing, new stablecoin method" },
                  { m: "IFTIN EXPRESS", act: "PM (+USDT) + GCA (EMQ)", first: "Nov 2025", mrr: "$2K", mar: "$2,359", txns: "654", note: "Hypercare, USDT expansion" },
                  { m: "Kaah Express", act: "GCA (EMQ)", first: "Apr 2025", mrr: "$4K", mar: "$905", txns: "49", note: "GCA connector added" },
                  { m: "ECOMMS", act: "PM (AUD-NPP)", first: "Mar 12, 2026", mrr: "-", mar: "$76", txns: "13", note: "First txn in March, GTW child" },
                  { m: "KATHMANDU", act: "PM (AUD-NPP)", first: "Mar 12, 2026", mrr: "-", mar: "$23", txns: "19", note: "First txn in March, GTW child" },
                  { m: "FNZ Global", act: "PM (6 currencies) + GCA (DBS)", first: "Mar 9, 2026", mrr: "$500", mar: "$0", txns: "0", note: "First txn in March, 0 revenue yet" },
                  { m: "VIVER", act: "PM (SGD, EUR) + GCA (DBS+Wise)", first: "Mar 16, 2026", mrr: "-", mar: "$0", txns: "0", note: "First txn in March, 0 revenue yet" },
                  { m: "Cosmo Remit", act: "PM (NZD)", first: "-", mrr: "$1K", mar: "$0", txns: "0", note: "Activated Mar 24, no txns yet" },
                  { m: "OPULRICH", act: "Kick-off Stage", first: "-", mrr: "$20K", mar: "$0", txns: "0", note: "No txns, KYB in progress" },
                  { m: "Fang Xing", act: "PM (AUD-NPP) — OPEN", first: "-", mrr: "-", mar: "$0", txns: "0", note: "OPS-869 still To Do, 27d open" },
                ].map((r) => (
                  <tr key={r.m} className={`border-b border-blue-100 ${r.first.includes("Mar") && r.first.includes("2026") ? "bg-emerald-50/40" : ""}`}>
                    <td className="py-2 px-2"><HsLink name={r.m} /></td>
                    <td className="py-2 px-2 text-xs">{r.act}</td>
                    <td className="py-2 px-2 text-xs">
                      {r.first.includes("Mar") && r.first.includes("2026")
                        ? <Badge text={r.first} variant="success" />
                        : r.first}
                    </td>
                    <td className="text-right py-2 px-2 text-gray-500">{r.mrr}</td>
                    <td className="text-right py-2 px-2 font-semibold">{r.mar}</td>
                    <td className="text-right py-2 px-2">{r.txns}</td>
                    <td className="py-2 px-2 text-xs text-gray-500">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout type="success">
            <strong>5 merchants did their first-ever transaction in March</strong> (highlighted in green). Total March revenue from activated merchants: <strong>$25,838</strong> across 1,275 transactions. DINSUN AYA ($4.3K) is the standout new activation.
          </Callout>
        </div>
      </Section>

      {/* Live Merchants & Dormancy - WITH LIVE METABASE DATA */}
      <Section title="Live & Activated Merchants - Revenue & Dormancy Analysis" subtitle="14 Jira Live merchants + 5 merchants with capabilities enabled in March. Verified against Metabase + HubSpot.">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 text-center">
            <p className="text-xs text-emerald-600 font-medium">Active (Revenue)</p>
            <p className="text-2xl font-bold text-emerald-900">3</p>
            <p className="text-xs text-emerald-500">Choisir, MDJ, IFTIN</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 text-center">
            <p className="text-xs text-amber-600 font-medium">Low / Minimal Activity</p>
            <p className="text-2xl font-bold text-amber-900">6</p>
            <p className="text-xs text-amber-500">DCS, ZashX, YALA, Pryvx, FNZ, VIVER</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-100 text-center">
            <p className="text-xs text-red-600 font-medium">Dormant ($0 Revenue)</p>
            <p className="text-2xl font-bold text-red-900">10</p>
            <p className="text-xs text-red-500">Incl. Cosmo Remit, Oceania Financial</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-center">
            <p className="text-xs text-blue-600 font-medium">Mar 2026 Total Rev</p>
            <p className="text-2xl font-bold text-blue-900">$21,910</p>
            <p className="text-xs text-blue-500">Choisir $19K + IFTIN $2.4K + MDJ $528</p>
          </div>
        </div>

        <LiveMerchantsTable liveMerchants={liveMerchants} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Callout type="danger">
            <strong>10 of 19 merchants are dormant</strong> ($0 actual revenue). Klip Payments ($10K MRR), PRIME FX ($5K), Cosmo Remit, and Oceania Financial are priority re-engagement targets. FNZ Global and VIVER had first txns in March but $0 revenue — likely test transactions only.
          </Callout>
          <Callout type="warning">
            <strong>Choisir + IFTIN generate 98% of revenue.</strong> $19,016 + $2,359 = $21,375 of $21,910 total. MDJ ($528) is the only other meaningful contributor. Extreme concentration risk across 19 activated merchants.
          </Callout>
        </div>
      </Section>

      {/* Capabilities Enabled in March */}
      <Section title="Capabilities Enabled in March" subtitle="Payment methods and GCA connectors activated">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Merchant</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Currencies</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">GCA</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {marchCapabilities.map((c) => (
                  <tr key={c.merchant} className="border-b border-gray-50">
                    <td className="py-2 px-3"><HsLink name={c.merchant} /></td>
                    <td className="py-2 px-3 text-xs">{c.currencies}</td>
                    <td className="py-2 px-3">{c.gca}</td>
                    <td className="py-2 px-3 text-gray-500">{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Use Case Adoption (all 100 cards)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={useCases} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" unit="%" domain={[0, 100]} />
                <YAxis dataKey="product" type="category" width={130} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
                  {useCases.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2">Money Movement dominates at 84%. Treasury products (Balances, AR/AP, CF) appear in 14-23% of cards.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Callout type="info">
            <strong>Currency corridors trending:</strong> Stablecoins (USDT/USDC) are the most common payment method requests (5 tasks), followed by AUD-NPP (4). FNZ Global enabled 6 currencies in a single onboarding.
          </Callout>
          <Callout type="info">
            <strong>GCA Connectors:</strong> EMQ dominates at 63% of activations (5 tasks). DBS used for 2 tasks, Wise for 1. EMQ preferred for remittance corridors, DBS for SG/APAC direct.
          </Callout>
        </div>
      </Section>

      {/* Ops Overview */}
      <Section title="Operations Overview" subtitle="28 tasks in March across 22 merchants. 93% completed.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Task Categories</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={opsCategories} cx="50%" cy="50%" outerRadius={75} innerRadius={40} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {opsCategories.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Team Performance</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs text-blue-600">Prutvi Shetty</p>
                <p className="font-bold text-blue-900">14 tasks</p>
                <p className="text-xs text-blue-500">Median TAT: 0 days (same-day)</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-amber-600">Mannuru Dhanush</p>
                <p className="font-bold text-amber-900">14 tasks</p>
                <p className="text-xs text-amber-500">Median TAT: 19 days (bulk-closed Apr 1)</p>
              </div>
            </div>
            <Callout type="warning">
              <strong>Dhanush's 13 tasks all resolved on Apr 1</strong> - likely batch Jira update, not actual work timeline. Recommend real-time status updates for accurate TAT.
            </Callout>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Payment Methods Activated</h4>
            {opsCurrencies.map((c) => (
              <div key={c.method} className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-700">{c.method}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${c.tasks * 20}px` }} />
                  <span className="text-sm font-bold text-gray-900">{c.tasks}</span>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Open / At-Risk Tasks</h4>
            <div className="space-y-2">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="font-semibold text-red-800 text-sm">OPS-869: FANG XING PTY LTD</p>
                <p className="text-xs text-red-600">AUD-NPP activation. Status: To Do. Age: 27 days. Assigned: Prutvi.</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="font-semibold text-amber-800 text-sm">OPS-862: Pricing Setup (Merchant: NA)</p>
                <p className="text-xs text-amber-600">In Progress. Age: 30 days. Likely incomplete Zapier submission.</p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

// ============================================================
// MAIN DASHBOARD
// ============================================================
export default function MBRDashboard() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["Outbound Sales", "Inbound Leads", "Solutions"];
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
            <div>
              <h1 className="text-xl font-bold text-gray-900">Finmo - Monthly Business Review</h1>
              <p className="text-sm text-gray-500">March 2026</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">Generated: April 9, 2026</span>
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
        {activeTab === 0 && <OutboundSales />}
        {activeTab === 1 && <InboundLeads />}
        {activeTab === 2 && <SolutionsTab />}
      </div>
    </div>
  );
}
