// API Configuration for Okapiq - Bloomberg Terminal for Main Street
// Set all API keys in your environment variables
export const API_CONFIG = {
  
  YELP_API_KEY: process.env.YELP_API_KEY || "your_yelp_api_key_here",
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "your_google_maps_api_key_here",
  GLENCOCO_API_KEY: process.env.GLENCOCO_API_KEY || "your_glencoco_api_key_here",
  CENSUS_API_KEY: process.env.CENSUS_API_KEY || "your_census_api_key_here",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "your_openai_api_key_here",
  DATA_AXLE_API_KEY: process.env.DATA_AXLE_API_KEY || "your_data_axle_api_key_here",
  SERPAPI_API_KEY: process.env.SERPAPI_API_KEY || "your_serpapi_api_key_here",
  APIFY_API_TOKEN: process.env.APIFY_API_TOKEN || "your_apify_api_token_here",
  ARCGIS_API_KEY: process.env.ARCGIS_API_KEY || "your_arcgis_api_key_here",

} as const

// API endpoints and configurations
export const API_ENDPOINTS = {
  YELP_BASE_URL: "https://api.yelp.com/v3",
  GOOGLE_PLACES_BASE_URL: "https://maps.googleapis.com/maps/api/place",
  CENSUS_BASE_URL: "https://api.census.gov/data",
  DATA_AXLE_BASE_URL: "https://api.dataaxle.com",
  SERPAPI_BASE_URL: "https://serpapi.com/search",
  APIFY_BASE_URL: "https://api.apify.com/v2",
  ARCGIS_BASE_URL: "https://geocode.arcgis.com/arcgis/rest/services",
} as const

// Validation function to check if required API keys are present
export function validateApiKeys() {
  const requiredKeys = [
    "YELP_API_KEY",
    "CENSUS_API_KEY",
    "SERPAPI_API_KEY",
    "DATA_AXLE_API_KEY",
    "ARCGIS_API_KEY",
  ] as const

  const missingKeys = requiredKeys.filter((key) => 
    !API_CONFIG[key] || 
    API_CONFIG[key].startsWith("your_") || 
    API_CONFIG[key] === "your_glencoco_api_key_here"
  )

  if (missingKeys.length > 0) {
    console.warn(`Missing API keys: ${missingKeys.join(", ")}`)
    return false
  }

  return true
}

export const config = API_CONFIG

export const DEAL_INTELLIGENCE_CONFIG = {
  YELP_API_KEY: API_CONFIG.YELP_API_KEY,
  GOOGLE_MAPS_API_KEY: API_CONFIG.GOOGLE_MAPS_API_KEY,
  CENSUS_API_KEY: API_CONFIG.CENSUS_API_KEY,
  OPENAI_API_KEY: API_CONFIG.OPENAI_API_KEY,
  DATA_AXLE_API_KEY: API_CONFIG.DATA_AXLE_API_KEY,
  SERP_API_KEY: API_CONFIG.SERPAPI_API_KEY,
  APIFY_API_KEY: API_CONFIG.APIFY_API_TOKEN,
  ARCGIS_API_KEY: API_CONFIG.ARCGIS_API_KEY,
  METRICS_URL: process.env.METRICS_URL || "http://localhost:5001",
  PORT: process.env.PORT || "4000",
} as const
