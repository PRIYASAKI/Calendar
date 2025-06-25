"use client"

import { useState } from "react"
import { X, Calendar, Clock, Palette, FileText, Tag, Plus, AlertTriangle } from "lucide-react"
import { dateUtil, formatDate } from "@/utils/dateUtils"

const EVENT_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#10b981" },
  { name: "Yellow", value: "#f59e0b" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Orange", value: "#f97316" },
  { name: "Lime", value: "#84cc16" },
  { name: "Pink", value: "#ec4899" },
  { name: "Gray", value: "#6b7280" },
]

const EVENT_TYPES = [
  { value: "meeting", label: "Meeting", icon: "👥" },
  { value: "presentation", label: "Presentation", icon: "📊" },
  { value: "review", label: "Review", icon: "📋" },
  { value: "planning", label: "Planning", icon: "📅" },
  { value: "workshop", label: "Workshop", icon: "🛠️" },
  { value: "social", label: "Social", icon: "🎉" },
  { value: "personal", label: "Personal", icon: "👤" },
  { value: "other", label: "Other", icon: "📌" },
]

export default function AddEventModal({ isOpen, onClose, onAddEvent, selectedDate }) {
  const [formData, setFormData] = useState({
    title: "",
    date: selectedDate || formatDate(dateUtil()),
    startTime: "09:00",
    endTime: "10:00",
    color: EVENT_COLORS[0].value,
    type: "meeting",
    description: "",
  })

  const [errors, setErrors] = useState({})
  const selectedDateObj = dateUtil(formData.date)
  const today = dateUtil()
  const isPastDate = selectedDateObj.isSame(today, "day") ? false : selectedDateObj.getTime() < today.getTime()

  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Event title is required"
    }

    if (!formData.date) {
      newErrors.date = "Date is required"
    }

    if (formData.startTime >= formData.endTime) {
      newErrors.time = "End time must be after start time"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    const newEvent = {
      title: formData.title.trim(),
      date: formData.date, 
      startTime: formData.startTime,
      endTime: formData.endTime,
      color: formData.color,
      type: formData.type,
      description: formData.description.trim(),
    }

    console.log("Creating event:", newEvent)
    onAddEvent(newEvent)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      title: "",
      date: selectedDate || formatDate(dateUtil()),
      startTime: "09:00",
      endTime: "10:00",
      color: EVENT_COLORS[0].value,
      type: "meeting",
      description: "",
    })
    setErrors({})
    onClose()
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const selectedColor = EVENT_COLORS.find((color) => color.value === formData.color) || EVENT_COLORS[0]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isPastDate ? "bg-orange-500" : "bg-blue-500"
                }`}
              >
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{isPastDate ? "Add Past Event" : "Add New Event"}</h2>
                {isPastDate && <p className="text-sm text-orange-600">This event will be marked as completed</p>}
              </div>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {isPastDate && (
          <div className="mx-6 mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-orange-800">Past Date Selected</span>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              You're adding an event to {selectedDateObj.format("MMMM D, YYYY")}. This event will appear with
              strikethrough text to indicate it's in the past.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.title ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
              placeholder="Enter event title..."
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.date ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {errors.time && <p className="text-sm text-red-600">{errors.time}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Event Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange("type", type.value)}
                  className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                    formData.type === type.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="text-lg mb-1">{type.icon}</div>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette className="w-4 h-4 inline mr-1" />
              Event Color
            </label>
            <div className="flex flex-wrap gap-2">
              {EVENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange("color", color.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color.value ? "border-gray-800 scale-110" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Selected: <span className="font-medium">{selectedColor.name}</span>
            </div>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Add event description, notes, or agenda..."
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 text-white rounded-lg transition-colors font-medium ${
                isPastDate ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isPastDate ? "Add Past Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
