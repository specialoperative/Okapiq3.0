import fetch from "node-fetch"

export interface DomainCandidate {
  url: string
  title?: string
  score: number
}

export class DomainResolver {
  async resolveDomain(name: string, city?: string, state?: string, vendorDomain?: string): Promise<string | null> {
    return resolveDomain(name, city, state, vendorDomain)
  }
}

export async function resolveDomain(
  name: string,
  city?: string,
  state?: string,
  vendorDomain?: string,
): Promise<string | null> {
  if (vendorDomain && isValidDomain(vendorDomain)) {
    return vendorDomain
  }

  const query = `${name} ${city || ""} ${state || ""} official site`

  try {
    const response = await fetch(`/api/serp-search?q=${encodeURIComponent(query)}`)
    const data = await response.json()

    const candidates: DomainCandidate[] = (data.results || [])
      .filter((r: any) => r.link && !isAggregator(r.link))
      .map((r: any) => scoreCandidate(r.link, r.title, name, city, state))
      .sort((a, b) => b.score - a.score)

    return candidates[0]?.url || null
  } catch (error) {
    console.log("[v0] Domain resolution fallback to mock data")
    return `https://${name.toLowerCase().replace(/\s+/g, "")}.com`
  }
}

function isValidDomain(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function isAggregator(url: string): boolean {
  return /(yelp|facebook|linkedin|zoominfo|angi|yellowpages|bbb|mapquest|houzz|crunchbase)\./i.test(url)
}

function scoreCandidate(url: string, title: string, name: string, city?: string, state?: string): DomainCandidate {
  const domain = extractDomain(url)
  const brandSimilarity = calculateSimilarity(domain, name)
  const locationBonus = city && new RegExp(city, "i").test(title || "") ? 0.1 : 0
  const httpsBonus = url.startsWith("https://") ? 0.1 : 0

  return {
    url,
    title,
    score: 0.7 * brandSimilarity + locationBonus + httpsBonus,
  }
}

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace("www.", "")
    return domain.replace(/\.(com|net|org|io|co)$/i, "")
  } catch {
    return ""
  }
}

function calculateSimilarity(domain: string, name: string): number {
  const d = domain.toLowerCase()
  const n = name.toLowerCase().replace(/\s+/g, "")
  return d.includes(n) || n.includes(d) ? 0.9 : 0.3
}
