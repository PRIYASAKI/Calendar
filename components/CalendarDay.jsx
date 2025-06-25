"use client"

import { useState, useEffect } from "react"
import {
  isToday,
  isCurrentMonth,
  getEventsForDate,
  detectEventConflicts,
  formatDate,
  dateUtil,
} from "@/utils/dateUtils"
import EventComponent from "./Event"
import QuickReschedule from "./QuickReschedule"
import { Plus } from "lucide-react"

export default function CalendarDay({
  date,
  currentMonth,
  events,
  onEventClick,
  onDateClick,
  onEventDrop,
  onEventReschedule,
  onQuickReschedule,
  onDragStart,
  onDragEnd,
}) {
  const [draggedEvent, setDraggedEvent] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [showQuickReschedule, setShowQuickReschedule] = useState(false)
  const [quickReschedulePosition, setQuickReschedulePosition] = useState({ x: 0, y: 0 })
  const [clientToday, setClientToday] = useState(null)

  useEffect(() => {
    setClientToday(dateUtil())
  }, [])

  const dayEvents = getEventsForDate(events, date)
  const allConflicts = detectEventConflicts(events)

  const dayConflicts = allConflicts.filter((conflictGroup) =>
    conflictGroup.some((event) => dayEvents.some((dayEvent) => dayEvent.id === event.id)),
  )

  const conflictedEventIds = new Set(dayConflicts.flat().map((e) => e.id))

  const isCurrentDay = isToday(date)
  const isInCurrentMonth = isCurrentMonth(date, currentMonth)
  const hasEvents = dayEvents.length > 0
  const hasConflicts = dayConflicts.length > 0

  // Only compute isPastDate after clientToday is set
  const isPastDate = clientToday
    ? (isCurrentDay ? false : date.getTime() < clientToday.getTime())
    : false

  // Don't render until clientToday is set to avoid hydration mismatch
  if (!clientToday) return null

  const sortedEvents = [...dayEvents].sort((a, b) => a.startTime.localeCompare(b.startTime))

  const handleDragStart = (event, e) => {

    const eventDate = dateUtil(event.date)
    const today = dateUtil()
    const isPastEvent = eventDate.isSame(today, "day") ? false : eventDate.getTime() < today.getTime()

    if (isPastEvent) {
      e.preventDefault()
      return
    }

    setDraggedEvent(event)
    onDragStart?.(event) 
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", event.id.toString())
    e.dataTransfer.setData("application/json", JSON.stringify(event))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setIsDragOver(true)
    setDragPosition({ x: e.clientX, y: e.clientY })
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)

    try {
      const eventData = e.dataTransfer.getData("application/json")
      const droppedEvent = eventData ? JSON.parse(eventData) : null

      if (droppedEvent || draggedEvent) {
        const eventToMove = droppedEvent || draggedEvent
        const targetDateStr = formatDate(date)

        if (eventToMove.date !== targetDateStr) {
          onEventDrop?.(eventToMove, targetDateStr, { x: e.clientX, y: e.clientY })
        }
      }
    } catch (error) {
      console.error("Error parsing dropped event data:", error)
    }

    setDraggedEvent(null)
  }

  const handleQuickRescheduleConfirm = (eventId, newDate, newStartTime, newEndTime) => {
    onQuickReschedule?.(eventId, newDate, newStartTime, newEndTime)
    setShowQuickReschedule(false)
    setDraggedEvent(null)
  }

  const handleQuickRescheduleCancel = () => {
    setShowQuickReschedule(false)
    setDraggedEvent(null)
  }

  return (
    <>
      <div
        className={`
        bg-green
        min-h-[140px] border border-gray-200 p-2 relative overflow-hidden group cursor-pointer transition-all duration-200
        ${!isInCurrentMonth ? "bg-gray-100/50 text-gray-400" : ""}
        ${isCurrentDay ? "bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-400 shadow-lg" : ""}
        ${hasConflicts ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-200" : ""}
        ${isDragOver ? "bg-gradient-to-br from-blue-200 to-purple-200 border-blue-400 border-dashed" : ""}
        ${isPastDate ? "bg-gray-50/80" : "hover:bg-white/80 hover:shadow-md"}
        ${isCurrentDay ? "hover:from-blue-150 hover:to-purple-150" : ""}
      `}
        onClick={onDateClick}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >

        {isDragOver && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-300/50 to-purple-300/50 flex items-center justify-center z-10 backdrop-blur-sm border-2 border-dashed border-blue-500 rounded-lg">
            <div className="text-blue-800 font-semibold bg-white/90 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Drop event here</span>
              <div className="text-sm text-blue-600">
                {formatDate(date) !== dateUtil().format("YYYY-MM-DD")
                  ? `Move to ${date.format("MMM D")}`
                  : "Move to Today"}
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDateClick?.()
            }}
            className={`w-6 h-6 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-110 ${
              isPastDate
                ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            }`}
            title={isPastDate ? "Add past event (will be marked as completed)" : "Add event"}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {isPastDate && (
          <div className="absolute top-1 left-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
        )}

        {isCurrentDay && (
          <div className="absolute top-1 right-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-sm"></div>
          </div>
        )}
        {hasConflicts && !isPastDate && (
          <div className="absolute top-1 left-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <span
            className={`
            text-sm font-medium transition-all duration-200
            ${isPastDate ? "text-gray-500" : ""}
            ${
              isCurrentDay
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-base shadow-lg ring-2 ring-blue-200"
                : ""
            }
          `}
          >
            {date.getDate()}
          </span>

          {hasEvents && (
            <div className="flex space-x-1 items-center">
              <div
                className={`w-2 h-2 rounded-full shadow-sm ${
                  isPastDate ? "bg-gray-400" : hasConflicts ? "bg-red-400" : "bg-green-400"
                }`}
              ></div>
              {dayEvents.length > 4 && (
                <span className={`text-xs ${isCurrentDay ? "text-blue-700 font-medium" : "text-gray-500"}`}>
                  +{dayEvents.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {isCurrentDay && (
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
            <span className="text-xs font-bold text-blue-700 bg-blue-200/80 backdrop-blur-sm px-2 py-1 rounded-full">
              TODAY
            </span>
          </div>
        )}

        <div className="space-y-1 mt-6">
          {sortedEvents.slice(0, 4).map((event, index) => {
            const conflictGroup = dayConflicts.find((group) => group.some((e) => e.id === event.id))
            const conflictLevel = conflictGroup ? conflictGroup.findIndex((e) => e.id === event.id) : 0

            return (
              <EventComponent
                key={event.id}
                event={event}
                isConflicted={conflictedEventIds.has(event.id)}
                conflictLevel={conflictLevel}
                onClick={(e) => {
                  e.stopPropagation?.()
                  onEventClick(event)
                }}
                onDragStart={handleDragStart}
                onRescheduleClick={(event, e) => {
                  e.stopPropagation()
                  onEventReschedule?.(event)
                }}
              />
            )
          })}
        </div>

        {dayEvents.length > 4 && (
          <div className="mt-1 text-center">
            <button
              className="text-xs text-gray-600 hover:text-gray-800 bg-white/60 hover:bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={(e) => {
                e.stopPropagation()
                onEventClick(dayEvents[0])
              }}
            >
              +{dayEvents.length - 4} more
            </button>
          </div>
        )}

        {!hasEvents && isInCurrentMonth && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="text-xs text-gray-500 text-center bg-white/60 backdrop-blur-sm rounded-lg p-2">
              <Plus className="w-4 h-4 mx-auto mb-1" />
              {isPastDate ? "Add past event" : "Click to add event"}
            </div>
          </div>
        )}
      </div>

      {showQuickReschedule && draggedEvent && (
        <QuickReschedule
          event={draggedEvent}
          targetDate={formatDate(date)}
          onConfirm={handleQuickRescheduleConfirm}
          onCancel={handleQuickRescheduleCancel}
          position={quickReschedulePosition}
        />
      )}
    </>
  )
}
