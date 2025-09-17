import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const businessData = await request.json()

    console.log("[v0] Adding business to CRM:", businessData.name)

    // In a real application, you would save this to a database
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: "Business added to CRM successfully",
      business: {
        id: Date.now().toString(),
        ...businessData,
        lastUpdated: new Date(),
        emailScrapingStatus: "pending",
      },
    })
  } catch (error) {
    console.log("[v0] Error adding business to CRM:", error)
    return NextResponse.json({ success: false, error: "Failed to add business to CRM" }, { status: 500 })
  }
}
