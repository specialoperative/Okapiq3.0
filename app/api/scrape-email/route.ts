import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
  }

  try {
    console.log(`[v0] Scraping email from: ${url}`)

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    const emails = html.match(emailRegex)

    const filteredEmails = emails?.filter(
      (email) =>
        !email.includes("noreply") &&
        !email.includes("no-reply") &&
        !email.includes("donotreply") &&
        !email.includes("example.com") &&
        !email.includes("test.com") &&
        !email.includes("placeholder"),
    )

    const foundEmail = filteredEmails?.[0] || null

    console.log(`[v0] Found ${filteredEmails?.length || 0} emails, using: ${foundEmail}`)

    return NextResponse.json({
      email: foundEmail,
      totalFound: filteredEmails?.length || 0,
      url: url,
    })
  } catch (error) {
    console.log(`[v0] Error scraping email from ${url}:`, error)

    return NextResponse.json(
      {
        email: null,
        error: "Failed to scrape email",
        url: url,
      },
      { status: 500 },
    )
  }
}
