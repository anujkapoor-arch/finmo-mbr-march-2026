// Master Index Page — Finmo Pulse
// Template: categories with sub-dashboards listed as cards
import { Link } from "react-router-dom"

interface DashboardItem {
  name: string
  description: string
  period: string
  status: "live" | "coming-soon" | "archived"
  url?: string
}

interface Category {
  name: string
  icon: string
  dashboards: DashboardItem[]
}

const categories: Category[] = [
  {
    name: "Monthly Business Reviews",
    icon: "MBR",
    dashboards: [
      {
        name: "March 2026",
        description: "Outbound Sales, Inbound Leads, Solutions — full pipeline review with Metabase revenue data",
        period: "March 2026",
        status: "live",
        url: "/mbr-march-2026",
      },
      {
        name: "April 2026",
        description: "Coming soon",
        period: "April 2026",
        status: "coming-soon",
      },
    ],
  },
  {
    name: "BD Weekly Reports",
    icon: "BD",
    dashboards: [
      {
        name: "April 30 - May 06, 2026",
        description: "Lower volume, higher quality - 258 calls, 103 transcribed. Aiko / Growsari outbound mockup booked. Your View Roofong (AU) inbound 12m02s call. AE LinkedIn acceptance: Gibson 24%, Elross 22%.",
        period: "Apr 30 - May 06, 2026",
        status: "live",
        url: "/bd-weekly-apr-30-may-06",
      },
      {
        name: "April 23-29, 2026",
        description: "Lead Gen 3.0 launched (101 prospects, 6 campaigns - 4 AE + 2 SDR). 7 inbound meetings, 363 calls, 131 transcribed. Multi-persona outreach now live.",
        period: "Apr 23-29, 2026",
        status: "live",
        url: "/bd-weekly-apr-23-29",
      },
      {
        name: "April 16-22, 2026",
        description: "Outbound (email, LinkedIn, calls), Inbound (signups, pipeline, meetings) - weekly BD performance. 91 calls transcribed and classified.",
        period: "Apr 16-22, 2026",
        status: "live",
        url: "/bd-weekly-apr-16-22",
      },
      {
        name: "April 1-15, 2026",
        description: "Outbound (email, LinkedIn, calls), Inbound (signups, pipeline, meetings) - weekly BD performance",
        period: "Apr 1-15, 2026",
        status: "live",
        url: "/bd-weekly-apr-1-15",
      },
    ],
  },
  {
    name: "Merchant Adoption",
    icon: "MA",
    dashboards: [
      {
        name: "Closed Won/Activation",
        description: "42 deals · $727K booked vs $24K realized. Why activated merchants aren't transacting — KYB, no-adoption, partner channel, forecast vs actual.",
        period: "Live snapshot",
        status: "live",
        url: "/merchant-adoption/closed-won",
      },
      {
        name: "Live",
        description: "Same lifecycle analysis applied to the Live stage of the Sales pipeline (67 deals). KYB / adoption / forecast vs actual / partner channel / AE breakdown.",
        period: "Live snapshot",
        status: "live",
        url: "/merchant-adoption/live",
      },
    ],
  },
  {
    name: "Sales & Pipeline",
    icon: "SP",
    dashboards: [
      {
        name: "Real-Time Pipeline Tracker",
        description: "Live deal stages, AE performance, revenue forecasting",
        period: "Always-on",
        status: "coming-soon",
      },
    ],
  },
  {
    name: "Client Presentations",
    icon: "CP",
    dashboards: [
      {
        name: "DLSP (De La Salle Philippines)",
        description: "16-school network overview - TOM sprint + 5-school POC play. Prepared for Jeng Pascual (CFO) and Catherine Santiago.",
        period: "2026 engagement",
        status: "live",
        url: "https://dlsp-dashboard.vercel.app",
      },
      {
        name: "EastWest Banking Corporation",
        description: "Meeting prep for Rafael Algarra Jr. (SEVP Financial Markets). Finmo as tech-layer on EastWest treasury + EasyBiz.",
        period: "Apr 2026 meeting",
        status: "live",
        url: "https://eastwest-dashboard.vercel.app",
      },
    ],
  },
  {
    name: "Operations",
    icon: "OPS",
    dashboards: [
      {
        name: "Ops Task Tracker",
        description: "PM activations, GCA, Pricing — team TAT and workload",
        period: "Always-on",
        status: "coming-soon",
      },
    ],
  },
]

export default function MasterIndex() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Finmo Pulse</h1>
          <p className="text-sm text-gray-500 mt-1">Internal analytics and reporting</p>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {categories.map((cat) => (
          <div key={cat.name}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                {cat.icon}
              </div>
              <h2 className="text-lg font-bold text-gray-900">{cat.name}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.dashboards.map((d) => {
                const isInternal = d.url?.startsWith("/")
                const isExternal = d.url?.startsWith("http")
                const cardClasses = `block rounded-xl border p-5 transition-all ${
                  d.status === "live"
                    ? "bg-white border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer"
                    : "bg-gray-50 border-dashed border-gray-300 cursor-default"
                }`
                const cardContent = (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-semibold ${d.status === "live" ? "text-gray-900" : "text-gray-400"}`}>
                        {d.name}
                      </h3>
                      {d.status === "live" ? (
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">LIVE</span>
                      ) : d.status === "coming-soon" ? (
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">SOON</span>
                      ) : (
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">ARCHIVED</span>
                      )}
                    </div>
                    <p className={`text-sm mb-3 ${d.status === "live" ? "text-gray-600" : "text-gray-400"}`}>
                      {d.description}
                    </p>
                    <p className="text-xs text-gray-400">{d.period}</p>
                  </>
                )

                if (d.status === "live" && isInternal) {
                  return <Link key={d.name} to={d.url!} className={cardClasses}>{cardContent}</Link>
                }
                if (d.status === "live" && isExternal) {
                  return <a key={d.name} href={d.url} target="_blank" rel="noopener noreferrer" className={cardClasses}>{cardContent}</a>
                }
                return <div key={d.name} className={cardClasses}>{cardContent}</div>
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-6 py-6 border-t border-gray-100">
        <p className="text-xs text-gray-400">Finmo Internal - Access restricted to authorized personnel</p>
      </div>
    </div>
  )
}
