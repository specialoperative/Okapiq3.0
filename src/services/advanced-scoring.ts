export interface BusinessSignals {
  sitePerformance?: number
  techDepth?: number
  backlinks?: number
  contentFreshness?: number
  adsTags?: number
  execBench?: number
  founderAge?: number
  instBackers?: boolean
  hhi?: number
  domainAge?: number
  sslScore?: number
  mobileOptimized?: boolean
}

export class AdvancedScoring {
  async calculateComprehensiveScoring(data: any): Promise<{
    acquisitionScore: number
    successionRisk: number
    digitalPresenceScore: number
    websiteQualityScore: number
    overallScore: number
  }> {
    const signals: BusinessSignals = {
      sitePerformance: Math.floor(Math.random() * 40) + 60,
      backlinks: Math.floor(Math.random() * 50) + 30,
      contentFreshness: Math.floor(Math.random() * 60) + 40,
      founderAge: Math.floor(Math.random() * 30) + 45,
      execBench: Math.floor(Math.random() * 40) + 20,
      hhi: Math.floor(Math.random() * 50) + 25,
      domainAge: Math.floor(Math.random() * 10) + 1,
      sslScore: Math.floor(Math.random() * 30) + 70,
      mobileOptimized: Math.random() > 0.3,
    }

    const digitalOpportunity = calculateDigitalOpportunityScore(signals)
    const successionRisk = calculateSuccessionRisk(signals)
    const websiteQuality = calculateWebsiteQualityScore(signals)

    const acquisitionFit = calculateAcquisitionFit({
      ebitdaInRange: true,
      revenueFit: 85,
      hhiNormalized: signals.hhi || 50,
      successionRisk,
      digitalOpportunity,
      emailsFound: Math.floor(Math.random() * 5) + 1,
      websiteQuality,
    })

    return {
      acquisitionScore: acquisitionFit,
      successionRisk,
      digitalPresenceScore: digitalOpportunity,
      websiteQualityScore: websiteQuality,
      overallScore: Math.round((acquisitionFit + digitalOpportunity + websiteQuality) / 3),
    }
  }
}

export function calculateDigitalOpportunityScore(signals: BusinessSignals): number {
  const siteQuality = signals.sitePerformance || 50
  const seoStrength = signals.backlinks || 40
  const techModernity = signals.adsTags || 30
  const contentRecency = signals.contentFreshness || 50

  return Math.round(0.4 * siteQuality + 0.25 * seoStrength + 0.2 * techModernity + 0.15 * contentRecency)
}

export function calculateSuccessionRisk(signals: BusinessSignals): number {
  const ageRisk = signals.founderAge || 50
  const benchDepth = 100 - (signals.execBench || 20)
  const contentStaleness = signals.contentFreshness || 50
  const marketConcentration = signals.hhi || 50
  const institutionalPenalty = signals.instBackers ? -15 : 0

  return Math.max(
    0,
    Math.min(
      100,
      0.35 * ageRisk + 0.25 * benchDepth + 0.2 * contentStaleness + 0.2 * marketConcentration + institutionalPenalty,
    ),
  )
}

export function calculateAcquisitionFit(params: {
  ebitdaInRange: boolean
  revenueFit: number
  hhiNormalized: number
  successionRisk: number
  digitalOpportunity: number
  emailsFound: number
  websiteQuality: number
}): number {
  const baseScore = params.ebitdaInRange ? 15 : 0
  const fragmentationBonus = 100 - params.hhiNormalized // More fragmented = better
  const contactabilityBonus = Math.min(10, params.emailsFound * 2)
  const digitalMaturityBonus = params.websiteQuality > 70 ? 5 : 0

  return Math.round(
    baseScore +
      0.2 * params.revenueFit +
      0.2 * fragmentationBonus +
      0.2 * params.successionRisk +
      0.2 * params.digitalOpportunity +
      0.1 * contactabilityBonus +
      0.1 * digitalMaturityBonus,
  )
}

export function calculateWebsiteQualityScore(signals: BusinessSignals): number {
  const performance = signals.sitePerformance || 50
  const security = signals.sslScore || 50
  const mobile = signals.mobileOptimized ? 80 : 30
  const age = Math.min(100, (signals.domainAge || 1) * 10)

  return Math.round(0.3 * performance + 0.25 * security + 0.25 * mobile + 0.2 * age)
}
