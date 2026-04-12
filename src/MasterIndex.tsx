// Master Index Page — Finmo Dashboards Hub
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
    name: "Monthly Business Review",
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
        name: "Client Dashboard",
        description: "Coming soon",
        period: "Q2 2026",
        status: "coming-soon",
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
          <h1 className="text-2xl font-bold text-gray-900">Finmo Dashboards</h1>
          <p className="text-sm text-gray-500 mt-1">Internal analytics and reporting hub</p>
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
