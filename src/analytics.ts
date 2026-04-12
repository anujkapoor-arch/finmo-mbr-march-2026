// MBR Dashboard analytics — adapted from Atlar/Ikigai tracker
// Additions: captures authenticated user email, tracks tab switches, section drill-downs

const WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/19580810/u7qqwud/'

interface VisitorData {
  event: string
  visitorId: string
  visitNumber: number
  firstSeenAt: string
  timestamp: string
  url: string
  referrer: string
  userAgent: string
  screenWidth: number
  screenHeight: number
  language: string
  timezone: string
  ip?: string
  city?: string
  country?: string
  org?: string
  email?: string
  activeTab?: string
  sectionsViewed: string[]
  expandedRows: string[]
  timeOnPageSeconds: number
  scrollDepthPercent: number
  project: string
}

const COOKIE_NAME = '_vid'
const COOKIE_VISITS = '_vcnt'
const COOKIE_FIRST = '_vfirst'
const COOKIE_DAYS = 365 * 2

let startTime = Date.now()
let sectionsViewed: Set<string> = new Set()
let expandedRows: Set<string> = new Set()
let maxScrollDepth = 0
let currentTab = 'Outbound Sales'

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function generateId(): string {
  return 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10)
}

function getOrCreateVisitorId(): string {
  let id = getCookie(COOKIE_NAME)
  if (!id) {
    id = generateId()
    setCookie(COOKIE_NAME, id, COOKIE_DAYS)
    setCookie(COOKIE_FIRST, new Date().toISOString(), COOKIE_DAYS)
    setCookie(COOKIE_VISITS, '0', COOKIE_DAYS)
  }
  return id
}

function incrementVisitCount(): number {
  const count = parseInt(getCookie(COOKIE_VISITS) || '0', 10) + 1
  setCookie(COOKIE_VISITS, String(count), COOKIE_DAYS)
  return count
}

function getFirstSeenAt(): string {
  return getCookie(COOKIE_FIRST) || new Date().toISOString()
}

function getScrollDepth(): number {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  return docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0
}

async function getIPInfo(): Promise<{ ip?: string; city?: string; country?: string; org?: string }> {
  try {
    const resp = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) })
    if (resp.ok) {
      const data = await resp.json()
      return { ip: data.ip, city: data.city, country: data.country_name, org: data.org }
    }
  } catch {
    // Silent fail
  }
  return {}
}

// Try to get email from Supabase session or localStorage
function getUserEmail(): string | undefined {
  try {
    // Check Supabase auth storage
    const keys = Object.keys(localStorage)
    for (const key of keys) {
      if (key.includes('supabase') && key.includes('auth')) {
        const data = JSON.parse(localStorage.getItem(key) || '{}')
        const email = data?.user?.email || data?.currentSession?.user?.email
        if (email) return email
      }
    }
    // Fallback: check for any stored email
    const storedEmail = localStorage.getItem('mbr_user_email')
    if (storedEmail) return storedEmail
  } catch {
    // Silent fail
  }
  return undefined
}

const visitorId = getOrCreateVisitorId()
let visitNumber = 0
let cachedIPInfo: { ip?: string; city?: string; country?: string; org?: string } = {}

async function sendEvent(event: string) {
  if (!WEBHOOK_URL) return

  if (event === 'page_view') {
    cachedIPInfo = await getIPInfo()
  }

  const data: VisitorData = {
    event,
    visitorId,
    visitNumber,
    firstSeenAt: getFirstSeenAt(),
    timestamp: new Date().toISOString(),
    url: window.location.href,
    referrer: document.referrer || 'direct',
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...cachedIPInfo,
    email: getUserEmail(),
    activeTab: currentTab,
    sectionsViewed: Array.from(sectionsViewed),
    expandedRows: Array.from(expandedRows),
    timeOnPageSeconds: Math.round((Date.now() - startTime) / 1000),
    scrollDepthPercent: maxScrollDepth,
    project: 'Finmo MBR - March 2026',
  }

  try {
    navigator.sendBeacon(WEBHOOK_URL, JSON.stringify(data))
  } catch {
    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true,
    }).catch(() => {})
  }
}

// Track tab switches
export function trackTabSwitch(tabName: string) {
  currentTab = tabName
  sectionsViewed.add(`tab:${tabName}`)
}

// Track expandable row clicks
export function trackRowExpand(rowName: string) {
  expandedRows.add(rowName)
}

export function initAnalytics() {
  visitNumber = incrementVisitCount()
  sendEvent('page_view')

  // Observe sections for viewport tracking
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          sectionsViewed.add(entry.target.id)
        }
      })
    },
    { threshold: 0.3 }
  )

  setTimeout(() => {
    document.querySelectorAll('section[id], [data-section]').forEach((el) => observer.observe(el))
  }, 1000)

  // Track scroll depth
  window.addEventListener('scroll', () => {
    const depth = getScrollDepth()
    if (depth > maxScrollDepth) maxScrollDepth = depth
  }, { passive: true })

  // Send exit event
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') sendEvent('page_exit')
  })

  window.addEventListener('beforeunload', () => sendEvent('page_exit'))
}
