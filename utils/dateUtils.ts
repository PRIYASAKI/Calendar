export interface Event {
  id: number
  title: string
  date: string
  startTime: string
  endTime: string
  color: string
  type: string
  description: string
}


export class DateUtil {
  private date: Date

  constructor(input?: string | Date | DateUtil) {
    if (input instanceof DateUtil) {
      this.date = new Date(input.date)
    } else if (input instanceof Date) {
      this.date = new Date(input)
    } else if (typeof input === "string") {
      this.date = new Date(input)
    } else {
      this.date = new Date()
    }
  }

  format(formatStr: string): string {
    if (isNaN(this.date.getTime())) {
      return "Invalid Date"
    }

    const year = this.date.getFullYear()
    const month = this.date.getMonth() + 1
    const day = this.date.getDate()
    const hours = this.date.getHours()
    const minutes = this.date.getMinutes()

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    switch (formatStr) {
      case "YYYY-MM-DD":
        return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
      case "MMMM YYYY":
        return `${monthNames[this.date.getMonth()]} ${year}`
      case "MMMM":
        return monthNames[this.date.getMonth()]
      case "MMM":
        return monthNames[this.date.getMonth()].slice(0, 3)
      case "MMM YYYY":
        return `${monthNames[this.date.getMonth()].slice(0, 3)} ${year}`
      case "dddd, MMMM D, YYYY":
        return `${dayNames[this.date.getDay()]}, ${monthNames[this.date.getMonth()]} ${day}, ${year}`
      case "h:mm A":
        const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
        const ampm = hours >= 12 ? "PM" : "AM"
        return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`
      default:
        return this.date.toISOString()
    }
  }

  startOf(unit: string): DateUtil {
    const newDate = new Date(this.date)

    switch (unit) {
      case "month":
        newDate.setDate(1)
        newDate.setHours(0, 0, 0, 0)
        break
      case "week":
        const dayOfWeek = newDate.getDay()
        newDate.setDate(newDate.getDate() - dayOfWeek)
        newDate.setHours(0, 0, 0, 0)
        break
      case "day":
        newDate.setHours(0, 0, 0, 0)
        break
    }

    return new DateUtil(newDate)
  }

  endOf(unit: string): DateUtil {
    const newDate = new Date(this.date)

    switch (unit) {
      case "month":
        newDate.setMonth(newDate.getMonth() + 1, 0)
        newDate.setHours(23, 59, 59, 999)
        break
      case "week":
        const dayOfWeek = newDate.getDay()
        newDate.setDate(newDate.getDate() + (6 - dayOfWeek))
        newDate.setHours(23, 59, 59, 999)
        break
      case "day":
        newDate.setHours(23, 59, 59, 999)
        break
    }

    return new DateUtil(newDate)
  }

  add(amount: number, unit: string): DateUtil {
    const newDate = new Date(this.date)

    switch (unit) {
      case "day":
        newDate.setDate(newDate.getDate() + amount)
        break
      case "month":
        newDate.setMonth(newDate.getMonth() + amount)
        break
      case "minute":
        newDate.setMinutes(newDate.getMinutes() + amount)
        break
    }

    return new DateUtil(newDate)
  }

  subtract(amount: number, unit: string): DateUtil {
    return this.add(-amount, unit)
  }

  isSame(other: DateUtil, unit: string): boolean {
    switch (unit) {
      case "day":
        return this.date.toDateString() === other.date.toDateString()
      case "month":
        return this.date.getFullYear() === other.date.getFullYear() && this.date.getMonth() === other.date.getMonth()
      default:
        return this.date.getTime() === other.date.getTime()
    }
  }

  isSameOrBefore(other: DateUtil): boolean {
    return this.date.getTime() <= other.date.getTime()
  }

  isSameOrAfter(other: DateUtil): boolean {
    return this.date.getTime() >= other.date.getTime()
  }

  isAfter(other: DateUtil): boolean {
    return this.date.getTime() > other.date.getTime()
  }

  getDate(): number {
    return this.date.getDate()
  }

  getTime(): number {
    return this.date.getTime()
  }
}


export type { DateUtil }

export const dateUtil = (input?: string | Date | DateUtil): DateUtil => {
  return new DateUtil(input)
}

export const formatDate = (date: DateUtil): string => {
  return date.format("YYYY-MM-DD")
}

export const formatTime = (time: string): string => {
  const parsed = dateUtil(`2000-01-01 ${time}`)
  const pretty = parsed.format("h:mm A")
  return pretty === "Invalid Date" ? "–" : pretty
}

export const getEventDuration = (startTime: string, endTime: string): number => {
  const start = dateUtil(`2000-01-01 ${startTime}`)
  const end = dateUtil(`2000-01-01 ${endTime}`)

  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60))

  return Number.isFinite(diff) && diff > 0 ? diff : 0
}

export const getMonthDays = (date: DateUtil) => {
  const startOfMonth = date.startOf("month")
  const endOfMonth = date.endOf("month")
  const startOfWeek = startOfMonth.startOf("week")
  const endOfWeek = endOfMonth.endOf("week")

  const days = []
  let current = startOfWeek

  while (current.isSameOrBefore(endOfWeek)) {
    days.push(current)
    current = current.add(1, "day")
  }

  return days
}

export const getEventsForDate = (events: Event[], date: DateUtil): Event[] => {
  const dateStr = formatDate(date)
  return events.filter((event) => event.date === dateStr)
}

export const detectEventConflicts = (events: Event[]): Event[][] => {
  const conflicts: Event[][] = []
  const processed = new Set<number>()

  events.forEach((event, index) => {
    if (processed.has(event.id)) return

    const eventStart = dateUtil(`${event.date} ${event.startTime}`)
    const eventEnd = dateUtil(`${event.date} ${event.endTime}`)

    const conflictGroup = [event]
    processed.add(event.id)

    events.slice(index + 1).forEach((otherEvent) => {
      if (processed.has(otherEvent.id) || event.date !== otherEvent.date) return

      const otherStart = dateUtil(`${otherEvent.date} ${otherEvent.startTime}`)
      const otherEnd = dateUtil(`${otherEvent.date} ${otherEvent.endTime}`)

      if (
        (eventStart.isSameOrBefore(otherStart) && eventEnd.isAfter(otherStart)) ||
        (otherStart.isSameOrBefore(eventStart) && otherEnd.isAfter(eventStart))
      ) {
        conflictGroup.push(otherEvent)
        processed.add(otherEvent.id)
      }
    })

    if (conflictGroup.length > 1) {
      conflicts.push(conflictGroup)
    }
  })

  return conflicts
}

export const isToday = (date: DateUtil): boolean => {
  return date.isSame(dateUtil(), "day")
}

export const isCurrentMonth = (date: DateUtil, currentMonth: DateUtil): boolean => {
  return date.isSame(currentMonth, "month")
}

export const getContrastColor = (hexColor: string): string => {
  const color = hexColor.replace("#", "")
  const r = Number.parseInt(color.substr(0, 2), 16)
  const g = Number.parseInt(color.substr(2, 2), 16)
  const b = Number.parseInt(color.substr(4, 2), 16)

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? "#000000" : "#ffffff"
}
