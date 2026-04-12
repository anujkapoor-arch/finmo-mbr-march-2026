// MBR Dashboard analytics — fires only after authentication
// Sends exactly 2 webhooks per session: session_start + session_end
// session_end includes all accumulated tracking data (tabs, rows, scroll, time)

import { supabase } from '@/integrations/supabase/client'

const WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/19580810/u7qqwud/'

interface SessionData {
  event: 'session_start' | 'session_end'
  email: string
  visitorId: string
  visitNumber: number
  timestamp: string
  url: string
  referrer: string
  ip?: string
  city?: string
  country?: string
  org?: string
  device: string
  browser: string
  screen: string
  timezone: string
  activeTab: string
  tabsViewed: string[]
  expandedRows: string[]
  timeOnPageSeconds: number
  scrollDepthPercent: number
  project: string
}

const COOKIE_NAME = '_vid'
const COOKIE_VISITS = '_vcnt'
const COOKIE_DAYS = 365 * 2

let startTime = Date.now()
let tabsViewed: Set<string> = new Set()
let expandedRows: Set<string> = new Set()
let maxScrollDepth = 0
let currentTab = 'Outbound Sales'
let sessionStarted = false
let exitSent = false
let userEmail = ''

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function getOrCreateVisitorId(): string {
  let id = getCookie(COOKIE_NAME)
  if (!id) {
    id = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10)
    setCookie(COOKIE_NAME, id, COOKIE_DAYS)
    setCookie(COOKIE_VISITS, '0', COOKIE_DAYS)
  }
  return id
}

function getScrollDepth(): number {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  return docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0
}

function detectDevice(): string {
  const ua = navigator.userAgent
  if (/mobile|android|iphone/i.test(ua)) return 'Mobile'
  if (/ipad|tablet/i.test(ua)) return 'Tablet'
  return 'Desktop'
}

function detectBrowser(): string {
  const ua = navigator.userAgent
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
  if (ua.includes('Firefox')) return 'Firefox'
  return 'Other'
}

let cachedIP: { ip?: string; city?: string; country?: string; org?: string } = {}

async function fetchIPOnce() {
  if (cachedIP.ip) return
  try {
    const resp = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) })
    if (resp.ok) {
      const data = await resp.json()
      cachedIP = { ip: data.ip, city: data.city, country: data.country_name, org: data.org }
    }
  } catch { /* silent */ }
}

const visitorId = getOrCreateVisitorId()

function buildPayload(event: 'session_start' | 'session_end'): SessionData {
  return {
    event,
    email: userEmail,
    visitorId,
    visitNumber: parseInt(getCookie(COOKIE_VISITS) || '1', 10),
    timestamp: new Date().toISOString(),
    url: window.location.href,
    referrer: document.referrer || 'direct',
    ...cachedIP,
    device: detectDevice(),
    browser: detectBrowser(),
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    activeTab: currentTab,
    tabsViewed: Array.from(tabsViewed),
    expandedRows: Array.from(expandedRows),
    timeOnPageSeconds: Math.round((Date.now() - startTime) / 1000),
    scrollDepthPercent: maxScrollDepth,
    project: 'Finmo Pulse - MBR March 2026',
  }
}

function send(data: SessionData) {
  try {
    const json = JSON.stringify(data)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(WEBHOOK_URL, json)
    } else {
      fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: json, keepalive: true }).catch(() => {})
    }
  } catch { /* silent */ }
}

function sendExit() {
  if (!sessionStarted || exitSent) return
  exitSent = true
  send(buildPayload('session_end'))
}

// Called by Dashboard when tab changes
export function trackTabSwitch(tabName: string) {
  currentTab = tabName
  tabsViewed.add(tabName)
}

// Called by Dashboard when expandable row is clicked
export function trackRowExpand(rowName: string) {
  expandedRows.add(rowName)
}

// Called once from main.tsx — waits for auth before starting
export function initAnalytics() {
  // Listen for auth state — only start tracking after successful login
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session || sessionStarted) return

    const email = session.user?.email || ''
    if (!email.endsWith('@finmo.net')) return

    // Authenticated — start session
    userEmail = email
    sessionStarted = true
    startTime = Date.now()
    tabsViewed.add(currentTab)

    // Increment visit count
    const count = parseInt(getCookie(COOKIE_VISITS) || '0', 10) + 1
    setCookie(COOKIE_VISITS, String(count), COOKIE_DAYS)

    await fetchIPOnce()
    send(buildPayload('session_start'))

    // Track scroll
    window.addEventListener('scroll', () => {
      const depth = getScrollDepth()
      if (depth > maxScrollDepth) maxScrollDepth = depth
    }, { passive: true })

    // Heartbeat every 60s — ensures we capture data even if tab close kills exit event
    setInterval(() => {
      if (!sessionStarted || exitSent) return
      send(buildPayload('session_end'))
    }, 60_000)

    // Exit events — try all available hooks
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') sendExit()
    })
    window.addEventListener('pagehide', sendExit)
    window.addEventListener('beforeunload', sendExit)
  })
}
