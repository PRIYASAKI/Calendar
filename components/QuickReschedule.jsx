"use client"

import { useState } from "react"
import { Move, X } from "lucide-react"
import { dateUtil } from "@/utils/dateUtils"

export default function QuickReschedule({ event, targetDate, onConfirm, onCancel, position }) {
  const [newStartTime, setNewStartTime] = useState(event.startTime)
  const [newEndTime, setNewEndTime] = useState(event.endTime)

  const targetDateObj = dateUtil(targetDate)
  const originalDate = dateUtil(event.date)

  const handleConfirm = () => {
    onConfirm(event.id, targetDate, newStartTime, newEndTime)
  }

  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 min-w-[300px]"
      style={{
        left: Math.min(position.x, window.innerWidth - 320),
        top: Math.min(position.y, window.innerHeight - 200),
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Move className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-gray-900">Quick Reschedule</span>
        </div>
        <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="text-sm">
          <div className="font-medium text-gray-900">{event.title}</div>
          <div className="text-gray-600">
            Moving from {originalDate.format("MMM D")} to {targetDateObj.format("MMM D, YYYY")}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Move Event
          </button>
        </div>
      </div>
    </div>
  )
}
