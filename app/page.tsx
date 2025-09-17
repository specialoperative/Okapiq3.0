import BusinessLookup from "../src/components/BusinessLookup"

export default function Page() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-4">🚀 Okapiq</h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-green-300 mb-4">
            The Deal Origination Terminal for Main Street
          </h2>
          <p className="text-xl text-green-300 max-w-4xl mx-auto">
            Private-equity grade intelligence for SMB acquisitions, roll-ups, and market scans. Okapiq pulls from 8+
            data sources (SERP, Yelp, Google Places, Census, Data Axle, ArcGIS, OpenAI, Apify) to deliver real-time
            market maps, fragmentation scoring, and acquisition targets.
          </p>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-green-400 mb-8">Core Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-900 border border-green-500 rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">8+</div>
              <div className="text-green-300">Data Sources</div>
              <div className="text-sm text-green-400 mt-1">→ Aggregated in real time</div>
            </div>
            <div className="bg-gray-900 border border-green-500 rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">500+</div>
              <div className="text-green-300">NAICS Industries</div>
              <div className="text-sm text-green-400 mt-1">→ Standardized classification</div>
            </div>
            <div className="bg-gray-900 border border-green-500 rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">∞</div>
              <div className="text-green-300">Search Results</div>
              <div className="text-sm text-green-400 mt-1">→ No artificial caps</div>
            </div>
            <div className="bg-gray-900 border border-green-500 rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">50</div>
              <div className="text-green-300">States</div>
              <div className="text-sm text-green-400 mt-1">→ Nationwide coverage</div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-green-400 mb-8">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <a href="/okapiq" className="group">
              <div className="bg-gradient-to-br from-black to-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-green-500 hover:border-green-400">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-green-400 group-hover:text-green-300 transition-colors">
                      Market Intelligence Dashboard
                    </h3>
                    <p className="text-green-300">
                      PE-grade analytics: TAM / TSM / HHI fragmentation / succession risk
                    </p>
                  </div>
                </div>
                <div className="text-sm text-green-400">
                  • Roll-up opportunity mapping + heat maps
                  <br />• Dynamic NAICS-based targeting
                  <br />• Contact enrichment + verified emails/phones
                </div>
              </div>
            </a>

            <a href="/client-dashboard" className="group">
              <div className="bg-gradient-to-br from-black to-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-green-500 hover:border-green-400">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-green-400 group-hover:text-green-300 transition-colors">
                      New England Acquisition Terminal
                    </h3>
                    <p className="text-green-300">Client-ready: $900K-$2M EBITDA targets in New England</p>
                  </div>
                </div>
                <div className="text-sm text-green-400">
                  • Software + service business alternatives
                  <br />• State-by-state mapping and filtering
                  <br />• Automated tier sheets + contact enrichment
                </div>
              </div>
            </a>

            <div className="bg-gradient-to-br from-black to-gray-900 rounded-xl shadow-lg p-6 border border-green-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-green-400">Comprehensive Search</h3>
                  <p className="text-green-300">Multi-source aggregation in real time</p>
                </div>
              </div>
              <div className="text-sm text-green-400">
                • Advanced filters: revenue, team size, succession risk, density, ad spend
                <br />• AI-powered thesis-to-filter translation
                <br />• Instant CSV / CRM export
              </div>
            </div>

            <div className="bg-gradient-to-br from-black to-gray-900 rounded-xl shadow-lg p-6 border border-green-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">📑</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-green-400">Business Lookup & Tier Sheets</h3>
                  <p className="text-green-300">
                    Automated company profiles: services, SEO, reviews, end-markets, M&A signals
                  </p>
                </div>
              </div>
              <div className="text-sm text-green-400">
                • Benchmarks: compare up to 7 competitors
                <br />• LinkedIn + demographic overlays
              </div>
            </div>

            <div className="bg-gradient-to-br from-black to-gray-900 rounded-xl shadow-lg p-6 border border-green-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">📡</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-green-400">Outreach & Execution</h3>
                  <p className="text-green-300">Push targets directly into CRM</p>
                </div>
              </div>
              <div className="text-sm text-green-400">
                • Automated email + LinkedIn sequences
                <br />• Call list generation + seller qualification
                <br />• Campaign reporting: connects, replies, meetings
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-green-400 mb-8">Multi-Source API Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-gray-900 border border-green-500 rounded-lg p-4 text-center">
              <div className="text-green-400 mb-2">✅ SERP API</div>
            </div>
            <div className="bg-gray-900 border border-green-500 rounded-lg p-4 text-center">
              <div className="text-green-400 mb-2">✅ Yelp API</div>
            </div>
            <div className="bg-gray-900 border border-green-500 rounded-lg p-4 text-center">
              <div className="text-green-400 mb-2">✅ Google Maps API</div>
            </div>
            <div className="bg-gray-900 border border-green-500 rounded-lg p-4 text-center">
              <div className="text-green-400 mb-2">✅ Census API</div>
            </div>
            <div className="bg-gray-900 border border-green-500 rounded-lg p-4 text-center">
              <div className="text-green-400 mb-2">✅ Data Axle API</div>
            </div>
            <div className="bg-gray-900 border border-green-500 rounded-lg p-4 text-center">
              <div className="text-green-400 mb-2">✅ ArcGIS API</div>
            </div>
            <div className="bg-gray-900 border border-green-500 rounded-lg p-4 text-center">
              <div className="text-green-400 mb-2">✅ OpenAI API</div>
            </div>
            <div className="bg-gray-900 border border-yellow-500 rounded-lg p-4 text-center">
              <div className="text-yellow-400 mb-2">⚠️ Apify API</div>
              <div className="text-xs text-yellow-300">(pending)</div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-green-400 mb-8">Targeting & Search</h2>
          <div className="max-w-4xl mx-auto bg-gray-900 border border-green-500 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-green-400 font-semibold mb-2">Business Name (Optional)</label>
                <div className="flex items-center text-green-300">
                  <span className="mr-2">🔎</span>
                  <span>Enter a specific name…</span>
                </div>
              </div>
              <div>
                <label className="block text-green-400 font-semibold mb-2">Industry (NAICS Classification)</label>
                <div className="flex items-center text-green-300">
                  <span className="mr-2">📂</span>
                  <span>Select or search by keyword/NAICS code</span>
                </div>
              </div>
              <div>
                <label className="block text-green-400 font-semibold mb-2">Location Targeting</label>
                <div className="flex items-center text-green-300">
                  <span className="mr-2">🌎</span>
                  <span>State → City → Radius</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-green-400 mb-4">Filters</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-green-300">
                <div>• Revenue Floor / Ceiling</div>
                <div>• Team Size</div>
                <div>• Succession Risk %</div>
                <div>• Fragmentation Index</div>
                <div>• Wealth Density / Zip Code analysis</div>
                <div>• Competitive Concentration</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors">
                🔍 Run Market Scan
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-green-400 font-semibold px-6 py-3 rounded-lg border border-green-500 transition-colors">
                📤 Export Targets
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-green-400 font-semibold px-6 py-3 rounded-lg border border-green-500 transition-colors">
                📈 View Heatmap
              </button>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-green-400 mb-8">Market Visualization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-900 border border-green-500 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-3">Nationwide Coverage</h3>
              <p className="text-green-300">→ heat maps across all 50 states</p>
            </div>
            <div className="bg-gray-900 border border-green-500 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-3">Fragmentation Analysis</h3>
              <p className="text-green-300">→ HHI scores, roll-up viability</p>
            </div>
            <div className="bg-gray-900 border border-green-500 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-3">Wealth / Density Overlays</h3>
              <p className="text-green-300">→ zip code-level income + business concentration</p>
            </div>
            <div className="bg-gray-900 border border-green-500 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-3">Acquisition Opportunity Mapping</h3>
              <p className="text-green-300">→ scoring across filters</p>
            </div>
          </div>
        </div>

        {/* Main Business Lookup Component */}
        <BusinessLookup />

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-900 border border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-green-400 mb-2">Multi-Source Data</h3>
            <p className="text-green-300">
              Aggregate data from SERP, Yelp, Google Places, Census, DataAxle, Apify, and ArcGIS APIs for comprehensive
              business intelligence.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gray-900 border border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-green-400 mb-2">Nationwide Coverage</h3>
            <p className="text-green-300">
              Target businesses across all 50 US states with heat map visualizations and state-by-state analysis
              capabilities.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gray-900 border border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-green-400 mb-2">NAICS Classification</h3>
            <p className="text-green-300">
              Industry-standard NAICS codes for precise business categorization with advanced search and filtering
              capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
