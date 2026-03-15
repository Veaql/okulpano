import { NextRequest, NextResponse } from "next/server"
import { fetchWeatherStations, getFallbackDistrictsByCityCode } from "@/lib/weather"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const cityCode = request.nextUrl.searchParams.get("cityCode") ?? "34"

  try {
    const stations = await fetchWeatherStations(cityCode)
    const districtNames =
      stations.length > 0
        ? stations.map((station) => station.district)
        : getFallbackDistrictsByCityCode(cityCode)

    return NextResponse.json(
      { stations: districtNames },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch {
    return NextResponse.json(
      { stations: getFallbackDistrictsByCityCode(cityCode) },
      { headers: { "Cache-Control": "no-store" } },
    )
  }
}
