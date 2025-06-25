"use client"

import { useState, useEffect } from "react"
import { formatTime } from "@/utils/dateUtils"
import { Move } from "lucide-react"

export default function DragPreview({ event, isVisible, position }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !event || !isVisible) return null

  return (
    <div
      className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div
        className="p-3 rounded-lg shadow-2xl border-2 border-dashed border-blue-400 bg-white/95 backdrop-blur-sm max-w-xs"
        style={{
          borderColor: event.color,
        }}
      >
        <div className="flex items-center space-x-2 mb-2">
          <Move className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">Moving Event</span>
        </div>
        <div className="p-2 rounded text-white text-sm font-medium mb-1" style={{ backgroundColor: event.color }}>
          {event.title}
        </div>
        <div className="text-xs text-gray-600">
          {formatTime(event.startTime)} - {formatTime(event.endTime)}
        </div>
        <div className="text-xs text-gray-500 capitalize mt-1">{event.type}</div>
      </div>
    </div>
  )
}
