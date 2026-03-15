export interface DisplayData {
  school: {
    name: string
    shortName: string | null
    logoUrl: string | null
    city: string | null
    district: string | null
    slogan: string | null
  }
  settings: {
    theme: string
    primaryColor: string
    accentColor: string
    cardRadius: string
    fontScale: string
    dateFormat: string
    timeFormat: string
    showSeconds: boolean
    refreshInterval: number
    activeWidget: string
    widgetPosition: string
    examName: string | null
    examDate: string | null
    trtCategory: string
    showTrtNews: boolean
    showWeather: boolean
    showWidget: boolean
    weatherCityCode: string
    weatherStation: string | null
    weatherLabel: string | null
  }
  dutyTeachers: {
    id: string
    personName: string
    locationName: string
    note: string | null
    sortOrder: number
  }[]
  announcements: {
    id: string
    title: string
    content: string | null
    priority: string
    startsAt: string | null
    endsAt: string | null
  }[]
  mediaItems: {
    id: string
    type: string
    fileUrl: string
    title: string | null
    subtitle: string | null
    durationSeconds: number
  }[]
  scheduleBlocks: {
    id: string
    blockType: string
    label: string
    startTime: string
    endTime: string
    sortOrder: number
  }[]
  tickerMessages: {
    id: string
    text: string
    speed: number
    textColor: string
    backgroundColor: string
    isEmergency: boolean
  }[]
}

export interface ScheduleStatus {
  type: "lesson" | "break" | "lunch" | "before_school" | "after_school" | "weekend" | "no_schedule"
  currentBlock: {
    label: string
    blockType: string
    endTime: string
  } | null
  nextBlock: {
    label: string
    blockType: string
    startTime: string
  } | null
  remainingMinutes: number
  remainingSeconds: number
}




