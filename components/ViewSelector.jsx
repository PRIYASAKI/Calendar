"use client"

import { useState } from "react"
import { Calendar, CalendarDays, Grid3X3, MoreHorizontal, ChevronDown } from "lucide-react"

const VIEW_OPTIONS = [
  { value: "day", label: "Day", icon: Calendar, shortcut: "D" },
  { value: "week", label: "Week", icon: CalendarDays, shortcut: "W" },
  { value: "month", label: "Month", icon: Grid3X3, shortcut: "M" },
  { value: "year", label: "Year", icon: MoreHorizontal, shortcut: "Y" },
]

export default function ViewSelector({ currentView, onViewChange }) {
  const [isOpen, setIsOpen] = useState(false)

  const currentViewOption = VIEW_OPTIONS.find((option) => option.value === currentView) || VIEW_OPTIONS[2]

  return (
    <div className="relative">
      <div className="hidden md:flex items-center space-x-1 bg-white/60 backdrop-blur-sm rounded-lg p-1 border border-white/30">
        {VIEW_OPTIONS.map((option) => {
          const IconComponent = option.icon
          return (
            <button
              key={option.value}
              onClick={() => onViewChange(option.value)}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${
                  currentView === option.value
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-white/80 hover:text-blue-600"
                }
              `}
              title={`${option.label} view (${option.shortcut})`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{option.label}</span>
            </button>
          )
        })}
      </div>
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-white/30 text-gray-700 hover:bg-white/80 transition-colors"
        >
          <currentViewOption.icon className="w-4 h-4" />
          <span className="font-medium">{currentViewOption.label}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            {VIEW_OPTIONS.map((option) => {
              const IconComponent = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onViewChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors
                    ${currentView === option.value ? "bg-blue-50 text-blue-600" : "text-gray-700"}
                    first:rounded-t-lg last:rounded-b-lg
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <span className="text-xs text-gray-400">{option.shortcut}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
