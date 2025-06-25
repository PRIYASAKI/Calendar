"use client"

import { formatTime, getEventDuration, getContrastColor } from "@/utils/dateUtils.js"
import { X, Clock, Calendar, FileText, AlertTriangle, Palette, Move, Trash2 } from "lucide-react"
import { dateUtil } from "@/utils/dateUtils"

export default function EventModal({ event, isOpen, onClose, conflictedEvents, onReschedule, onDelete }) {
  if (!isOpen || !event) return null

  const eventDate = dateUtil(event.date)
  const duration = getEventDuration(event.startTime, event.endTime)
  const hasConflicts = conflictedEvents && conflictedEvents.length > 0
  const textColor = getContrastColor(event.color)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div
          className="p-6 rounded-t-xl relative overflow-hidden"
          style={{ backgroundColor: event.color, color: textColor }}
        >
          <div className="flex items-center justify-between relative z-10">
            <h2 className="text-xl font-bold pr-4">{event.title}</h2>
            <button onClick={onClose} className="hover:bg-black hover:bg-opacity-20 p-1 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-3 flex items-center space-x-3">
            <span className="inline-block bg-black bg-opacity-20 px-3 py-1 rounded-full text-sm capitalize font-medium">
              {event.type}
            </span>
            <div className="flex items-center space-x-1">
              <Palette className="w-4 h-4 opacity-70" />
              <span className="text-sm opacity-90">{event.color}</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <div className="w-full h-full bg-white rounded-full transform translate-x-8 -translate-y-8"></div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900">{eventDate.format("dddd, MMMM D, YYYY")}</div>
                <div className="text-sm text-gray-600">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900">Duration</div>
                <div className="text-sm text-gray-600">
                  {duration} minutes ({Math.round((duration / 60) * 10) / 10} hours)
                </div>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900 mb-1">Description</div>
                <p className="text-gray-700 text-sm leading-relaxed">{event.description}</p>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={() => onReschedule?.(event)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <Move className="w-4 h-4" />
              <span>Reschedule Event</span>
            </button>
          </div>
          {hasConflicts && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 font-semibold">Schedule Conflicts</span>
                </div>
                <button
                  onClick={() => onReschedule?.(event)}
                  className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
                >
                  Resolve Conflicts
                </button>
              </div>

              <div className="space-y-3">
                {conflictedEvents?.map((conflictEvent) => (
                  <div key={conflictEvent.id} className="p-4 rounded-lg border-l-4 border-red-400 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-red-800">{conflictEvent.title}</div>
                        <div className="text-sm text-red-600 mt-1">
                          {formatTime(conflictEvent.startTime)} - {formatTime(conflictEvent.endTime)}
                        </div>
                        <div className="text-xs text-red-500 mt-1 capitalize">{conflictEvent.type}</div>
                      </div>
                      <div
                        className="w-4 h-4 rounded-full ml-3 flex-shrink-0"
                        style={{ backgroundColor: conflictEvent.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  <strong>⚠️ Recommendation:</strong> Use the reschedule feature to find available time slots and resolve
                  conflicts automatically.
                </div>
              </div>
            </div>
          )}


          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => onDelete?.(event)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Event</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
