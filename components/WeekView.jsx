"use client"

import { formatTime, getEventsForDate, dateUtil } from "@/utils/dateUtils.js"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

export default function WeekView({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  onEventDrop,
  onEventReschedule,
  onQuickReschedule,
  onDragStart,
  onDragEnd,
  onPrevWeek,
  onNextWeek,
}) {

  const startOfWeek = currentDate.startOf("week")
  const weekDays = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"))

  const formatHour = (hour) => {
    if (hour === 0) return "12 AM"
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return "12 PM"
    return `${hour - 12} PM`
  }

  const getEventPosition = (event) => {
    const [startHour, startMinute] = event.startTime.split(":").map(Number)
    const [endHour, endMinute] = event.endTime.split(":").map(Number)

    const startPosition = (startHour + startMinute / 60) * 60 
    const duration = endHour + endMinute / 60 - (startHour + startMinute / 60)
    const height = Math.max(duration * 60, 30) 

    return { top: startPosition, height }
  }

  const getWeekRange = () => {
    const endOfWeek = startOfWeek.add(6, "day")
    if (startOfWeek.format("MMMM") === endOfWeek.format("MMMM")) {
      return startOfWeek.format("MMMM YYYY")
    }
    return `${startOfWeek.format("MMM")} - ${endOfWeek.format("MMM YYYY")}`
  }

  return (
    <div className="container-attractive overflow-hidden">
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 border-b border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onPrevWeek}
            className="p-2 hover:bg-white/60 rounded-lg transition-colors"
            title="Previous week"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{getWeekRange()}</div>
          </div>

          <button onClick={onNextWeek} className="p-2 hover:bg-white/60 rounded-lg transition-colors" title="Next week">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-8 gap-0">
          <div className="w-20"></div> 
          {weekDays.map((day, index) => {
            const isToday = day.isSame(dateUtil(), "day")
            return (
              <div key={index} className="text-center p-2">
                <div className="text-xs text-gray-600 font-medium">{WEEKDAYS[index]}</div>
                <div className={`text-lg font-bold ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                  {day.getDate()}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="relative overflow-y-auto max-h-[600px]">
        <div className="relative">
          {HOURS.map((hour) => (
            <div key={hour} className="relative flex border-b border-gray-100" style={{ height: "60px" }}>
              <div className="w-20 flex-shrink-0 p-2 text-xs text-gray-500 text-right">{formatHour(hour)}</div>
              <div className="flex-1 grid grid-cols-7 gap-0">
                {weekDays.map((day, dayIndex) => {
                  const dateStr = day.format("YYYY-MM-DD")
                  return (
                    <div key={dayIndex} className="relative border-l border-gray-200 first:border-l-0">
                      <button
                        onClick={() => onDateClick(dateStr)}
                        className="absolute inset-0 w-full h-full hover:bg-blue-50 transition-colors group opacity-0 hover:opacity-100"
                        title={`Add event on ${day.format("MMM D")} at ${formatHour(hour)}`}
                      >
                        <div className="flex items-center justify-center h-full">
                          <Plus className="w-3 h-3 text-blue-500" />
                        </div>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          <div className="absolute inset-0 left-20 pointer-events-none">
            <div className="grid grid-cols-7 gap-0 h-full">
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDate(events, day)
                return (
                  <div key={dayIndex} className="relative border-l border-gray-200 first:border-l-0">
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
                            className="h-full p-1 rounded text-white text-xs cursor-pointer hover:opacity-80 transition-opacity shadow-md"
                            style={{ backgroundColor: event.color }}
                            onClick={() => onEventClick(event)}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="opacity-90 truncate">{formatTime(event.startTime)}</div>
                          </div>
                        </div>
                      )
                    })}
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
