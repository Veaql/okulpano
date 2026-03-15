import { NextRequest, NextResponse } from "next/server"
import { fetchWeatherForecast } from "@/lib/weather"
import { getMgmCityByCode, toTurkishLabel } from "@/lib/mgm"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const cityCode = request.nextUrl.searchParams.get("cityCode") ?? "34"
  const station = request.nextUrl.searchParams.get("station")
  const fallbackCity = toTurkishLabel(getMgmCityByCode(cityCode).name)

  try {
    const { city, selected } = await fetchWeatherForecast(cityCode, station)
    const cityName = toTurkishLabel(city.name)

    return NextResponse.json(
      {
        cityCode: city.code,
        cityName,
        stationName: selected.district,
        displayLabel: station ? selected.district : cityName,
        condition: selected.condition,
        temperature: selected.temperature,
        icon: selected.icon,
        source: "Open-Meteo",
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch {
    return NextResponse.json(
      {
        cityCode,
        cityName: fallbackCity,
        stationName: station || fallbackCity,
        displayLabel: station || fallbackCity,
        condition: "Veri alınamadı",
        temperature: "--°C",
        icon: "cloud",
        source: "Open-Meteo",
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  }
}



