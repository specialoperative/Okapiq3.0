import { NextResponse } from "next/server"
import { API_CONFIG } from "../../../lib/config"

export async function GET() {
  const status: Record<string, boolean> = {}

  // Test SERP API
  try {
    const response = await fetch(
      `https://serpapi.com/search.json?api_key=${API_CONFIG.SERPAPI_API_KEY}&engine=google&q=test&num=1`,
    )
    status["SERP API"] = response.ok
  } catch {
    status["SERP API"] = false
  }

  // Test Yelp API
  try {
    const response = await fetch("https://api.yelp.com/v3/businesses/search?location=test&limit=1", {
      headers: { Authorization: `Bearer ${API_CONFIG.YELP_API_KEY}` },
    })
    status["Yelp API"] = response.ok
  } catch {
    status["Yelp API"] = false
  }

  // Test Google Maps API
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=test&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`,
    )
    status["Google Maps API"] = response.ok
  } catch {
    status["Google Maps API"] = false
  }

  // Test Census API
  try {
    const response = await fetch(
      `https://api.census.gov/data/2021/acs/acs5?get=B01001_001E&for=state:*&key=${API_CONFIG.CENSUS_API_KEY}`,
    )
    status["Census API"] = response.ok
  } catch {
    status["Census API"] = false
  }

  try {
    const response = await fetch(
      `https://api.dataaxle.com/v1/businesses?api_key=${API_CONFIG.DATA_AXLE_API_KEY}&limit=1`,
    )
    status["Data Axle API"] = response.ok
  } catch {
    status["Data Axle API"] = false
  }

  try {
    const response = await fetch(
      `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?singleLine=test&f=json&token=${API_CONFIG.ARCGIS_API_KEY}`,
    )
    status["ArcGIS API"] = response.ok
  } catch {
    status["ArcGIS API"] = false
  }

  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    })
    status["OpenAI API"] = response.ok
  } catch {
    status["OpenAI API"] = false
  }

  try {
    const response = await fetch(`https://api.apify.com/v2/users/me?token=${API_CONFIG.APIFY_API_TOKEN}`)
    status["Apify API"] = response.ok
  } catch {
    status["Apify API"] = false
  }

  return NextResponse.json(status)
}
