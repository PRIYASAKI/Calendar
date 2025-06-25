"use client"

import { getEventsForDate, dateUtil } from "@/utils/dateUtils.js"
import { ChevronLeft, ChevronRight } from "lucide-react"

const MONTH_NAMES = [
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

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

export default function YearView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  onMonthClick,
  onPrevYear,
  onNextYear,
}) {
  const year = currentDate.format("YYYY")

  const getMonthDays = (monthIndex) => {
    const monthStart = dateUtil(`${year}-${(monthIndex + 1).toString().padStart(2, "0")}-01`)
    const monthEnd = monthStart.endOf("month")
    const startOfWeek = monthStart.startOf("week")
    const endOfWeek = monthEnd.endOf("week")

    const days = []
    let current = startOfWeek

    while (current.isSameOrBefore(endOfWeek)) {
      days.push(current)
      current = current.add(1, "day")
    }

    return days
  }

  const hasEventsOnDate = (date) => {
    return getEventsForDate(events, date).length > 0
  }

  const getEventsCountForDate = (date) => {
    return getEventsForDate(events, date).length
  }

  const isCurrentMonth = (monthIndex) => {
    return monthIndex === dateUtil().format("M") - 1 && year === dateUtil().format("YYYY")
  }

  const isToday = (date) => {
    return date.isSame(dateUtil(), "day")
  }

  return (
    <div className="container-attractive overflow-hidden">
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-xl border border-white/30 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <button
              onClick={onPrevYear}
              className="p-3 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              title="Previous year"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <div className="text-center">
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">{year}</h1>
              <p className="text-blue-100 text-sm mt-1">Click any month to view details</p>
            </div>

            <button
              onClick={onNextYear}
              className="p-3 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              title="Next year"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
        <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {MONTH_NAMES.map((monthName, monthIndex) => {
              const monthDays = getMonthDays(monthIndex)
              const monthDate = dateUtil(`${year}-${(monthIndex + 1).toString().padStart(2, "0")}-01`)
              const monthEvents = events.filter((event) => {
                const eventDate = dateUtil(event.date)
                return eventDate.format("YYYY-MM") === `${year}-${(monthIndex + 1).toString().padStart(2, "0")}`
              })

              return (
                <div
                  key={monthIndex}
                  className={`bg-white/80 backdrop-blur-sm border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:scale-105 ${
                    isCurrentMonth(monthIndex)
                      ? "ring-4 ring-blue-400 border-blue-400 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50"
                      : "border-white/50 hover:border-blue-300 shadow-lg"
                  }`}
                  onClick={() => onMonthClick(monthDate)}
                >

                  <div
                    className={`px-4 py-3 border-b border-white/30 ${
                      isCurrentMonth(monthIndex)
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold">{monthName}</h3>
                      {monthEvents.length > 0 && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            isCurrentMonth(monthIndex) ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {monthEvents.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-white/30">
                    {WEEKDAY_LABELS.map((day, index) => (
                      <div key={index} className="text-center text-xs font-bold text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 bg-white/60 backdrop-blur-sm">
                    {monthDays.map((date, dateIndex) => {
                      const isBrokenDate = Number.isNaN(date.getTime()) || Number.isNaN(date.getDate())

                      if (isBrokenDate) {
                        return <div key={dateIndex} className="h-8 bg-gray-50/50" />
                      }

                      const dayNumber = date.getDate() 

                      const isCurrentMonthDate = date.format("M") === (monthIndex + 1).toString()
                      const isTodayDate = isToday(date)
                      const hasEvents = hasEventsOnDate(date)

                      return (
                        <div
                          key={dateIndex}
                          className={`
                            relative h-8 flex items-center justify-center text-sm cursor-pointer transition-all duration-200
                            ${
                              !isCurrentMonthDate
                                ? "text-gray-300 hover:text-gray-400 hover:bg-gray-50/50"
                                : isTodayDate
                                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-full shadow-lg"
                                  : "text-gray-800 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-700 font-medium"
                            }
                          `}
                          onClick={(e) => {
                            e.stopPropagation()
                            onDateClick(date.format("YYYY-MM-DD"))
                          }}
                          title={`${date.format("MMMM D, YYYY")}`}
                        >
                          <span className="relative z-10">{String(dayNumber)}</span>

                          {hasEvents && !isTodayDate && (
                            <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-sm"></div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-100 via-blue-50 to-purple-50 border-t border-white/30 px-6 py-4">
          <div className="flex items-center justify-center text-sm">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-white/50">
              <span className="font-semibold text-gray-700">
                {events.filter((e) => dateUtil(e.date).format("YYYY") === year).length} events in {year}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
