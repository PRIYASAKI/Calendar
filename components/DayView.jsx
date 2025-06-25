"use client"

import { formatTime, getEventsForDate, dateUtil } from "@/utils/dateUtils"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function DayView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  onEventDrop,
  onEventReschedule,
  onQuickReschedule,
  onDragStart,
  onDragEnd,
  onPrevDay,
  onNextDay,
}) {
  const dayEvents = getEventsForDate(events, currentDate)
  const dateStr = currentDate.format("YYYY-MM-DD")
  const isToday = currentDate.isSame(dateUtil(), "day")

  const formatHour = (hour) => {
    if (hour === 0) return "12 AM"
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return "12 PM"
    return `${hour - 12} PM`
  }

  const getEventPosition = (event) => {
    const [startHour, startMinute] = event.startTime.split(":").map(Number)
    const [endHour, endMinute] = event.endTime.split(":").map(Number)

    const startPosition = (startHour + startMinute / 60) * 60 // 60px per hour
    const duration = endHour + endMinute / 60 - (startHour + startMinute / 60)
    const height = Math.max(duration * 60, 30) // Minimum 30px height

    return { top: startPosition, height }
  }

  return (
    <div className="container-attractive overflow-hidden">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/30 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <button
              onClick={onPrevDay}
              className="p-2 hover:bg-white/60 rounded-lg transition-colors"
              title="Previous day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="text-sm text-gray-600 uppercase tracking-wide">
                {currentDate.format("dddd").slice(0, 3)}
              </div>
              <div className={`text-2xl font-bold ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                {currentDate.getDate()}
              </div>
              <div className="text-sm text-gray-600">{currentDate.format("MMMM YYYY")}</div>
            </div>

            <button onClick={onNextDay} className="p-2 hover:bg-white/60 rounded-lg transition-colors" title="Next day">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {dayEvents.length > 0 && (
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="text-xs text-gray-600 mb-2 font-medium">ALL DAY</div>
            <div className="space-y-1">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-2 rounded text-white text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: event.color }}
                  onClick={() => onEventClick(event)}
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="relative overflow-y-auto max-h-[600px]">
          <div className="relative">
            {HOURS.map((hour) => (
              <div key={hour} className="relative flex border-b border-gray-100" style={{ height: "60px" }}>
                <div className="w-20 flex-shrink-0 p-2 text-xs text-gray-500 text-right">{formatHour(hour)}</div>
                <div className="flex-1 relative border-l border-gray-200">
                  <button
                    onClick={() => onDateClick(dateStr)}
                    className="absolute inset-0 w-full h-full hover:bg-blue-50 transition-colors group opacity-0 hover:opacity-100"
                    title={`Add event at ${formatHour(hour)}`}
                  >
                    <div className="flex items-center justify-center h-full">
                      <Plus className="w-4 h-4 text-blue-500" />
                    </div>
                  </button>
                </div>
              </div>
            ))}

            <div className="absolute inset-0 left-20 pointer-events-none">
              {dayEvents.map((event) => {
                const position = getEventPosition(event)
                return (
                  <div
                    key={event.id}
                    className="absolute left-1 right-1 pointer-events-auto"
                    style={{
                      top: `${position.top}px`,
                      height: `${position.height}px`,
                    }}
                  >
                    <div
                      className="h-full p-2 rounded text-white text-sm cursor-pointer hover:opacity-80 transition-opacity shadow-md"
                      style={{ backgroundColor: event.color }}
                      onClick={() => onEventClick(event)}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-90">
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
