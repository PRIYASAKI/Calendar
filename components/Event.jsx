"use client"

import { useState } from "react"
import { formatTime, getEventDuration, getContrastColor, dateUtil } from "@/utils/dateUtils"
import { Clock, AlertTriangle, Users, Move } from "lucide-react"

export default function EventComponent({
  event,
  isConflicted,
  conflictLevel = 0,
  onClick,
  onDragStart,
  onRescheduleClick,
}) {
  const duration = getEventDuration(event.startTime, event.endTime)
  const textColor = getContrastColor(event.color)
  const eventDate = dateUtil(event.date)
  const today = dateUtil()
  const isPastEvent = eventDate.isSame(today, "day") ? false : eventDate.getTime() < today.getTime()

  const [isDragging, setIsDragging] = useState(false)

  const handleClick = (e) => {
    e.stopPropagation()
    onClick(event, e)
  }

  const handleDragStart = (e) => {
    e.stopPropagation()
    setIsDragging(true)
    e.dataTransfer.setData("application/json", JSON.stringify(event))
    e.dataTransfer.effectAllowed = "move"

    
    const dragElement = e.currentTarget
    const rect = dragElement.getBoundingClientRect()

    e.dataTransfer.setDragImage(dragElement, rect.width / 2, rect.height / 2)

    onDragStart?.(event, e)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleRescheduleClick = (e) => {
    e.stopPropagation()
    onRescheduleClick?.(event, e)
  }

  return (
    <div
      className={`
        relative p-2 rounded-lg mb-1 cursor-pointer transition-all duration-200 group
        hover:shadow-md hover:scale-[1.02]
        ${isConflicted ? "ring-2 ring-red-400 ring-opacity-60" : ""}
        ${isPastEvent ? "opacity-70" : ""}
        ${isDragging ? "opacity-50 scale-95 rotate-2" : ""}
      `}
      style={{
        backgroundColor: isPastEvent ? `${event.color}80` : event.color, // Add transparency for past events
        color: textColor,
        marginLeft: conflictLevel * 4 + "px",
        zIndex: 10 - conflictLevel,
      }}
      onClick={handleClick}
      draggable={!isPastEvent} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      title={`${event.title} - ${formatTime(event.startTime)} to ${formatTime(event.endTime)}${isPastEvent ? " (Past Event)" : ""}`}
    >
      {!isPastEvent && (
        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleRescheduleClick}
            className="w-5 h-5 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm transition-colors"
            title="Reschedule event"
          >
            <Move className="w-2 h-2" />
          </button>
        </div>
      )}

      {isPastEvent && (
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
          <Clock className="w-2 h-2 text-white" />
        </div>
      )}


      {isConflicted && !isPastEvent && (
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-2 h-2 text-white" />
        </div>
      )}


      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className={`font-medium text-xs truncate group-hover:text-clip ${isPastEvent ? "line-through" : ""}`}>
            {event.title}
          </div>
          <div className={`flex items-center mt-1 opacity-90 ${isPastEvent ? "line-through" : ""}`}>
            <Clock className="w-2 h-2 mr-1 flex-shrink-0" />
            <span className="text-xs">{formatTime(event.startTime)}</span>
          </div>
        </div>
        <div className="ml-2 flex-shrink-0">
          {event.type === "meeting" && <Users className="w-3 h-3 opacity-70" />}
          {duration > 60 && <div className="text-xs opacity-70 mt-1">{Math.round(duration / 60)}h</div>}
        </div>
      </div>


      <div className="mt-1 h-1 bg-black bg-opacity-20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white bg-opacity-40 rounded-full transition-all duration-300"
          style={{ width: `${Math.min((duration / 120) * 100, 100)}%` }}
        />
      </div>

      {!isPastEvent && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity" />
      )}
    </div>
  )
}
