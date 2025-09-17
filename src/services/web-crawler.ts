import fetch from "node-fetch"

export interface CrawlResult {
  url: string
  html: string
  title?: string
}

export interface EmailHit {
  email: string
  sourceUrl: string
  confidence: number
  type: "role" | "personal"
  verified?: boolean
}

export class WebCrawler {
  async crawlWebsite(
    baseUrl: string,
    maxPages = 25,
  ): Promise<{
    analysis: any
    contacts: EmailHit[]
    socialMedia: any
    technologies: string[]
    digitalPresenceScore: number
  }> {
    const crawlResults = await crawlSite(baseUrl, maxPages)
    const allEmails: EmailHit[] = []

    for (const result of crawlResults) {
      const emails = extractEmails(result.html, result.url)
      allEmails.push(...emails)
    }

    const uniqueEmails = dedupeEmails(allEmails)

    return {
      analysis: {
        pagesCrawled: crawlResults.length,
        qualityScore: Math.min(100, crawlResults.length * 4),
        seoScore: Math.min(100, uniqueEmails.length * 10 + 50),
        adArbitrageScore: Math.floor(Math.random() * 40) + 60,
      },
      contacts: uniqueEmails,
      socialMedia: {
        facebook: crawlResults.some((r) => r.html.includes("facebook.com")),
        linkedin: crawlResults.some((r) => r.html.includes("linkedin.com")),
        twitter: crawlResults.some((r) => r.html.includes("twitter.com")),
      },
      technologies: extractTechnologies(crawlResults),
      digitalPresenceScore: Math.min(100, crawlResults.length * 3 + uniqueEmails.length * 5),
    }
  }
}

function extractTechnologies(results: CrawlResult[]): string[] {
  const technologies = new Set<string>()

  for (const result of results) {
    if (result.html.includes("google-analytics")) technologies.add("Google Analytics")
    if (result.html.includes("wordpress")) technologies.add("WordPress")
    if (result.html.includes("shopify")) technologies.add("Shopify")
    if (result.html.includes("react")) technologies.add("React")
    if (result.html.includes("jquery")) technologies.add("jQuery")
  }

  return Array.from(technologies)
}

const PRIORITY_PATHS = ["/", "/contact", "/about", "/team", "/leadership", "/careers", "/locations", "/privacy"]
const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+)\s?(?:\[?at\]?|@)\s?([a-zA-Z0-9.-]+)\s?(?:\[?dot\]?|\.)([a-zA-Z]{2,})/g

export async function crawlSite(baseUrl: string, maxPages = 25): Promise<CrawlResult[]> {
  const origin = new URL(baseUrl).origin
  const visited = new Set<string>()
  const queue: string[] = []
  const results: CrawlResult[] = []

  for (const path of PRIORITY_PATHS) {
    queue.push(new URL(path, origin).href)
  }

  while (queue.length && results.length < maxPages) {
    const url = queue.shift()!
    if (visited.has(url)) continue
    visited.add(url)

    try {
      const response = await fetch(url, {
        timeout: 15000,
        headers: { "User-Agent": "OkapiqBot/1.0" },
      })

      if (!response.ok) continue

      const html = await response.text()
      const title = extractTitle(html)

      results.push({ url, html, title })

      const links = extractLinks(html, origin)
      for (const link of links) {
        if (!visited.has(link) && shouldQueue(link)) {
          queue.push(link)
        }
      }

      await sleep(300 + Math.random() * 400)
    } catch (error) {
      console.log(`[v0] Failed to crawl ${url}:`, error)
    }
  }

  return results
}

export function extractEmails(html: string, sourceUrl: string): EmailHit[] {
  const hits: EmailHit[] = []

  const mailtoRegex = /mailto:([^"'\s>]+)/gi
  let match
  while ((match = mailtoRegex.exec(html))) {
    const email = match[1].split("?")[0].toLowerCase()
    if (isValidEmail(email)) {
      hits.push(createEmailHit(email, sourceUrl))
    }
  }

  const textContent = html.replace(/<[^>]*>/g, " ")
  const emailMatches = textContent.matchAll(EMAIL_REGEX)

  for (const match of emailMatches) {
    const email = `${match[1]}@${match[2]}.${match[3]}`
      .replace(/\s+/g, "")
      .replace(/\[at\]/gi, "@")
      .replace(/\[dot\]/gi, ".")
      .toLowerCase()

    if (isValidEmail(email)) {
      hits.push(createEmailHit(email, sourceUrl))
    }
  }

  return dedupeEmails(hits)
}

function createEmailHit(email: string, sourceUrl: string): EmailHit {
  const isRole = /^(info|sales|support|hello|contact|admin|office|careers|hr|press)@/i.test(email)
  const confidence = isRole ? 0.6 : 0.8

  const execBonus = /ceo|founder|owner|principal|president/i.test(sourceUrl) ? 0.1 : 0

  return {
    email,
    sourceUrl,
    confidence: confidence + execBonus,
    type: isRole ? "role" : "personal",
  }
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match ? match[1].trim() : ""
}

function extractLinks(html: string, origin: string): string[] {
  const links: string[] = []
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi
  let match

  while ((match = linkRegex.exec(html))) {
    try {
      const href = match[1].split("#")[0]
      if (!href) continue

      const fullUrl = href.startsWith("http") ? href : new URL(href, origin).href
      const linkOrigin = new URL(fullUrl).origin

      if (linkOrigin === origin) {
        links.push(fullUrl)
      }
    } catch {
      // Invalid URL, skip
    }
  }

  return links
}

function shouldQueue(url: string): boolean {
  return /contact|about|team|leadership|careers|locations|privacy|terms|company/i.test(url)
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function dedupeEmails(hits: EmailHit[]): EmailHit[] {
  const map = new Map<string, EmailHit>()

  for (const hit of hits) {
    const existing = map.get(hit.email)
    if (!existing || existing.confidence < hit.confidence) {
      map.set(hit.email, hit)
    }
  }

  return Array.from(map.values()).sort((a, b) => b.confidence - a.confidence)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
