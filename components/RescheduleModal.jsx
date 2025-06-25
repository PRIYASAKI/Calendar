"use client"

import { useState, useEffect } from "react"
import { X, Calendar, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react"
import { dateUtil, formatDate, formatTime, getEventDuration } from "@/utils/dateUtils"

export default function RescheduleModal({ isOpen, onClose, event, allEvents, onReschedule, suggestedDate }) {
  const [newDate, setNewDate] = useState("")
  const [newStartTime, setNewStartTime] = useState("")
  const [newEndTime, setNewEndTime] = useState("")
  const [conflicts, setConflicts] = useState([])
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    if (event && isOpen) {
      setNewDate(suggestedDate || event.date)
      setNewStartTime(event.startTime)
      setNewEndTime(event.endTime)
      generateSuggestions()
    }
  }, [event, isOpen, suggestedDate])

  useEffect(() => {
    if (newDate && newStartTime && newEndTime && event) {
      checkForConflicts()
    }
  }, [newDate, newStartTime, newEndTime, event, allEvents])

  const generateSuggestions = () => {
    if (!event) return

    const suggestions = []
    const currentDate = dateUtil(event.date)
    const duration = getEventDuration(event.startTime, event.endTime)


    for (let i = 1; i <= 7; i++) {
      const suggestedDate = currentDate.add(i, "day")
      const suggestedDateStr = formatDate(suggestedDate)

      const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]

      for (const startTime of timeSlots) {
        const endTime = calculateEndTime(startTime, duration)
        const hasConflict = allEvents.some(
          (e) =>
            e.id !== event.id &&
            e.date === suggestedDateStr &&
            isTimeOverlapping(startTime, endTime, e.startTime, e.endTime),
        )

        if (!hasConflict) {
          suggestions.push({
            date: suggestedDateStr,
            startTime,
            endTime,
          })
        }

        if (suggestions.length >= 6) break
      }
      if (suggestions.length >= 6) break
    }

    setSuggestions(suggestions)
  }

  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const totalMinutes = hours * 60 + minutes + duration
    const endHours = Math.floor(totalMinutes / 60)
    const endMins = totalMinutes % 60
    return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`
  }

  const isTimeOverlapping = (start1, end1, start2, end2) => {
    const s1 = dateUtil(`2000-01-01 ${start1}`)
    const e1 = dateUtil(`2000-01-01 ${end1}`)
    const s2 = dateUtil(`2000-01-01 ${start2}`)
    const e2 = dateUtil(`2000-01-01 ${end2}`)

    return (s1.isSameOrBefore(s2) && e1.isAfter(s2)) || (s2.isSameOrBefore(s1) && e2.isAfter(s1))
  }

  const checkForConflicts = () => {
    if (!event) return

    const conflictingEvents = allEvents.filter(
      (e) =>
        e.id !== event.id && e.date === newDate && isTimeOverlapping(newStartTime, newEndTime, e.startTime, e.endTime),
    )

    setConflicts(conflictingEvents)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!event) return

    onReschedule(event.id, newDate, newStartTime, newEndTime)
    onClose()
  }

  const handleSuggestionClick = (suggestion) => {
    setNewDate(suggestion.date)
    setNewStartTime(suggestion.startTime)
    setNewEndTime(suggestion.endTime)
  }

  if (!isOpen || !event) return null

  const originalDate = dateUtil(event.date)
  const newDateObj = dateUtil(newDate)
  const hasConflicts = conflicts.length > 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: event.color }}
              >
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reschedule Event</h2>
                <p className="text-sm text-gray-600">{event.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Current</div>
                <div className="font-medium">{originalDate.format("MMMM D, YYYY")}</div>
                <div className="text-sm text-gray-600">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">New</div>
                <div className="font-medium">{newDate ? newDateObj.format("MMMM D, YYYY") : "Select date"}</div>
                <div className="text-sm text-gray-600">
                  {newStartTime && newEndTime
                    ? `${formatTime(newStartTime)} - ${formatTime(newEndTime)}`
                    : "Select time"}
                </div>
              </div>
            </div>
          </div>
          {suggestions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Suggested Times</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestions.map((suggestion, index) => {
                  const suggestionDate = dateUtil(suggestion.date)
                  return (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="font-medium text-gray-900">{suggestionDate.format("dddd, MMMM D")}</div>
                      <div className="text-sm text-gray-600">
                        {formatTime(suggestion.startTime)} - {formatTime(suggestion.endTime)}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            {hasConflicts && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-red-800">Scheduling Conflict Detected</span>
                </div>
                <div className="space-y-2">
                  {conflicts.map((conflict) => (
                    <div key={conflict.id} className="text-sm text-red-700">
                      <strong>{conflict.title}</strong> - {formatTime(conflict.startTime)} to{" "}
                      {formatTime(conflict.endTime)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-red-600 mt-2">
                  This will create overlapping events. Consider choosing a different time.
                </p>
              </div>
            )}
            {!hasConflicts && newDate && newStartTime && newEndTime && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-800">No conflicts found!</span>
                </div>
                <p className="text-sm text-green-600 mt-1">This time slot is available for your event.</p>
              </div>
            )}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newDate || !newStartTime || !newEndTime}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Reschedule Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
