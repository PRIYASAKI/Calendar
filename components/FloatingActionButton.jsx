"use client"

import { useState } from "react"
import { Plus, Calendar, Clock, Users } from "lucide-react"

export default function FloatingActionButton({ onClick }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-40">
  
      <div
        className={`absolute bottom-16 right-0 transition-all duration-300 ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 space-y-1 min-w-[160px]">
          <button
            onClick={onClick}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>New Event</span>
          </button>
          <button
            onClick={onClick}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Users className="w-4 h-4 text-green-500" />
            <span>Meeting</span>
          </button>
          <button
            onClick={onClick}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Clock className="w-4 h-4 text-purple-500" />
            <span>Quick Event</span>
          </button>
        </div>
      </div>


      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl
          flex items-center justify-center transition-all duration-300 group
          ${isHovered ? "scale-110" : "scale-100"}
        `}
        title="Add new event"
      >
        <Plus className={`w-6 h-6 transition-transform duration-300 ${isHovered ? "rotate-90" : "rotate-0"}`} />
      </button>

      <div className="absolute inset-0 rounded-full bg-blue-500 opacity-0 group-hover:opacity-20 animate-ping pointer-events-none" />
    </div>
  )
}
