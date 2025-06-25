"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Filter, Home, Plus } from "lucide-react"
import { dateUtil, getMonthDays, detectEventConflicts, formatDate, formatTime } from "@/utils/dateUtils"
import CalendarDay from "./CalendarDay"
import DayView from "./DayView"
import WeekView from "./WeekView"
import YearView from "./YearView"
import EventModal from "./EventModal"
import AddEventModal from "./AddEventModal"
import RescheduleModal from "./RescheduleModal"
import FloatingActionButton from "./FloatingActionButton"
import UserProfile from "./UserProfile"
import ViewSelector from "./ViewSelector"
import DragPreview from "./DragPreview"
import eventsData from "@/data/events.json"

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const SHORT_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(() => dateUtil())
  const [currentView, setCurrentView] = useState("month")
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState("")
  const [eventToReschedule, setEventToReschedule] = useState(null)
  const [suggestedRescheduleDate, setSuggestedRescheduleDate] = useState("")
  const [filterType, setFilterType] = useState("all")

  const [dragPreview, setDragPreview] = useState({
    event: null,
    isVisible: false,
    position: { x: 0, y: 0 },
  })

  const [clientToday, setClientToday] = useState(null)

  useEffect(() => {
    setClientToday(dateUtil())
  }, [])

  useEffect(() => {
    setEvents(eventsData)
  }, [])

  const monthDays = getMonthDays(currentDate)
  const filteredEvents = filterType === "all" ? events : events.filter((event) => event.type === filterType)

  const allConflicts = detectEventConflicts(events)
  const conflictedEvents =
    allConflicts
      .find((group) => group.some((e) => e.id === selectedEvent?.id))
      ?.filter((e) => e.id !== selectedEvent?.id) || []

  const eventTypes = [...new Set(events.map((e) => e.type))]

  const currentMonthEvents = filteredEvents.filter((event) => {
    const eventDate = dateUtil(event.date)
    return eventDate.isSame(currentDate, "month")
  })
  const handlePrevious = () => {
    switch (currentView) {
      case "day":
        setCurrentDate(currentDate.subtract(1, "day"))
        break
      case "week":
        setCurrentDate(currentDate.subtract(1, "week"))
        break
      case "month":
        setCurrentDate(currentDate.subtract(1, "month"))
        break
      case "year":
        setCurrentDate(currentDate.subtract(1, "year"))
        break
    }
  }

  const handleNext = () => {
    switch (currentView) {
      case "day":
        setCurrentDate(currentDate.add(1, "day"))
        break
      case "week":
        setCurrentDate(currentDate.add(1, "week"))
        break
      case "month":
        setCurrentDate(currentDate.add(1, "month"))
        break
      case "year":
        setCurrentDate(currentDate.add(1, "year"))
        break
    }
  }

  const handleToday = () => {
    setCurrentDate(dateUtil())
  }

  const handleViewChange = (view) => {
    setCurrentView(view)
  }

  const handleMonthClick = (date) => {
    setCurrentDate(date)
    setCurrentView("month")
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }

  const handleCloseEventModal = () => {
    setIsEventModalOpen(false)
    setSelectedEvent(null)
  }

  const handleAddEventClick = (selectedDate) => {
    setSelectedDateForNewEvent(selectedDate || formatDate(dateUtil()))
    setIsAddEventModalOpen(true)
  }

  const handleCloseAddEventModal = () => {
    setIsAddEventModalOpen(false)
    setSelectedDateForNewEvent("")
  }

  const handleAddEvent = (newEventData) => {
    const newEvent = {
      ...newEventData,
      id: Math.max(...events.map((e) => e.id), 0) + 1,
    }

    setEvents((prev) => {
      const updatedEvents = [...prev, newEvent]
      return updatedEvents
    })

    handleCloseAddEventModal()
  }

  const handleRescheduleClick = (event, suggestedDate) => {
    setEventToReschedule(event)
    setSuggestedRescheduleDate(suggestedDate || "")
    setIsRescheduleModalOpen(true)
  }

  const handleCloseRescheduleModal = () => {
    setIsRescheduleModalOpen(false)
    setEventToReschedule(null)
    setSuggestedRescheduleDate("")
  }

  const handleRescheduleEvent = (eventId, newDate, newStartTime, newEndTime) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? {
              ...event,
              date: newDate,
              startTime: newStartTime,
              endTime: newEndTime,
            }
          : event,
      ),
    )
  }

  const handleEventDrop = (event, targetDate, position) => {
 
    setDragPreview({ event: null, isVisible: false, position: { x: 0, y: 0 } })


    const targetDateObj = dateUtil(targetDate)
    const originalDateObj = dateUtil(event.date)

    if (targetDateObj.format("YYYY-MM-DD") !== originalDateObj.format("YYYY-MM-DD")) {
      handleRescheduleEvent(event.id, targetDate, event.startTime, event.endTime)

      console.log(`Moved "${event.title}" from ${originalDateObj.format("MMM D")} to ${targetDateObj.format("MMM D")}`)
    }
  }

  const handleDragStart = (event) => {
    setDragPreview({
      event,
      isVisible: true,
      position: { x: 0, y: 0 },
    })
  }

  const handleDragEnd = () => {
    setDragPreview({ event: null, isVisible: false, position: { x: 0, y: 0 } })
  }

  const handleDeleteEvent = (event) => {
    setEvents((prev) => prev.filter((e) => e.id !== event.id))
    setIsEventModalOpen(false)
    setSelectedEvent(null)
  }

  const handleDateClick = (date) => {
    handleAddEventClick(date)
  }

  const totalConflicts = allConflicts.length
  const totalEvents = events.length
  const filteredEventsCount = filteredEvents.length
  const currentMonthEventsCount = currentMonthEvents.length
  const getViewTitle = () => {
    switch (currentView) {
      case "day":
        return currentDate.format("dddd, MMMM D, YYYY")
      case "week":
        const startOfWeek = currentDate.startOf("week")
        const endOfWeek = currentDate.endOf("week")
        if (startOfWeek.format("MMMM") === endOfWeek.format("MMMM")) {
          return startOfWeek.format("MMMM YYYY")
        }
        return `${startOfWeek.format("MMM")} - ${endOfWeek.format("MMM YYYY")}`
      case "month":
        return currentDate.format("MMMM YYYY")
      case "year":
        return currentDate.format("YYYY")
      default:
        return currentDate.format("MMMM YYYY")
    }
  }

  const renderCalendarView = () => {
    switch (currentView) {
      case "day":
        return (
          <DayView
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onEventDrop={handleEventDrop}
            onEventReschedule={(event) => handleRescheduleClick(event)}
            onQuickReschedule={handleRescheduleEvent}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onPrevDay={() => setCurrentDate(currentDate.subtract(1, "day"))}
            onNextDay={() => setCurrentDate(currentDate.add(1, "day"))}
          />
        )
      case "week":
        return (
          <WeekView
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onEventDrop={handleEventDrop}
            onEventReschedule={(event) => handleRescheduleClick(event)}
            onQuickReschedule={handleRescheduleEvent}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onPrevWeek={() => setCurrentDate(currentDate.subtract(1, "week"))}
            onNextWeek={() => setCurrentDate(currentDate.add(1, "week"))}
          />
        )
      case "year":
        return (
          <YearView
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onMonthClick={handleMonthClick}
            onPrevYear={() => setCurrentDate(currentDate.subtract(1, "year"))}
            onNextYear={() => setCurrentDate(currentDate.add(1, "year"))}
          />
        )
      default: 
        return (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/30 overflow-hidden">
            <div className="grid grid-cols-7 bg-gradient-to-r from-gray-100 to-gray-200">
              {WEEKDAYS.map((day, index) => (
                <div
                  key={day}
                  className="p-4 text-center font-bold text-gray-800 border-r border-gray-300 last:border-r-0"
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{SHORT_WEEKDAYS[index]}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDays.map((date, index) => (
                <CalendarDay
                  key={`${index}-${events.length}-${filterType}`}
                  date={date}
                  currentMonth={currentDate}
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                  onDateClick={() => handleDateClick(formatDate(date))}
                  onEventDrop={handleEventDrop}
                  onEventReschedule={(event) => handleRescheduleClick(event)}
                  onQuickReschedule={handleRescheduleEvent}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>
        )
    }
  }
  if (!clientToday) return null

  const isCurrentMonth = currentDate.isSame(clientToday, "month")

  return (
    <div className="max-w-7xl mx-auto p-4 min-h-screen">
      <UserProfile events={events} />

      <div className="container-attractive p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-gray-700">
            <span className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">{filteredEventsCount} Events</span>
            </span>
            {totalConflicts > 0 && allConflicts.length > 0 && allConflicts.some((group) => group.length > 1) && (
              <span className="flex items-center space-x-2 bg-red-100 px-3 py-1 rounded-full">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium">{totalConflicts} Conflicts</span>
              </span>
            )}
            <div className="flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full text-blue-700">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium">Today: {clientToday.format("MMM D")}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">

            <button
              onClick={() => handleAddEventClick()}
              className="hidden md:flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>

            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-sm font-medium text-gray-700"
              >
                <option value="all">All Events ({totalEvents})</option>
                {eventTypes.map((type) => {
                  const typeCount = events.filter((e) => e.type === type).length
                  return (
                    <option key={type} value={type} className="capitalize">
                      {type} ({typeCount})
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-100 via-blue-50 to-purple-100 p-6 mb-6 rounded-2xl shadow-xl border border-blue-100">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            className="flex items-center space-x-2 px-6 py-3 text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 rounded-xl transition-all duration-200 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex items-center space-x-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {getViewTitle()}
            </h2>
            <ViewSelector currentView={currentView} onViewChange={handleViewChange} />

            {!isCurrentMonth && currentView !== "year" && (
              <button
                onClick={handleToday}
                className="flex items-center space-x-1 px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                title="Go to today"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Today</span>
              </button>
            )}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-3 text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 rounded-xl transition-all duration-200 font-medium"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {totalConflicts > 0 && allConflicts.length > 0 && allConflicts.some((group) => group.length > 1) && (
        <div className="container-attractive p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-800 font-semibold text-lg">
                {totalConflicts} scheduling conflict{totalConflicts > 1 ? "s" : ""} detected
              </span>
            </div>
            <button
              onClick={() => {
                const firstConflictEvent = allConflicts[0][0]
                handleRescheduleClick(firstConflictEvent)
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              Resolve Conflicts
            </button>
          </div>
        </div>
      )}

      {renderCalendarView()}
      {currentView === "month" && (
        <div className="container-attractive mt-6 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3"></div>
              {filterType === "all"
                ? `All Events in ${currentDate.format("MMMM YYYY")} (${currentMonthEventsCount})`
                : `${filterType.charAt(0).toUpperCase() + filterType.slice(1)} Events in ${currentDate.format("MMMM YYYY")} (${currentMonthEvents.length})`}
            </h3>
            {filterType !== "all" && (
              <button
                onClick={() => setFilterType("all")}
                className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Clear Filter
              </button>
            )}
          </div>

          {currentMonthEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentMonthEvents
                .sort((a, b) => {
                  const dateCompare = a.date.localeCompare(b.date)
                  if (dateCompare !== 0) return dateCompare
                  return a.startTime.localeCompare(b.startTime)
                })
                .map((event) => {
                  const eventDate = dateUtil(event.date)
                  const isConflicted = allConflicts.some((group) => group.some((e) => e.id === event.id))

                  return (
                    <div
                      key={event.id}
                      className={`p-4 border rounded-xl hover:bg-white/60 cursor-pointer transition-all duration-200 backdrop-blur-sm shadow-md hover:shadow-lg transform hover:scale-105 ${
                        isConflicted
                          ? "border-red-300 bg-gradient-to-br from-red-50 to-orange-50"
                          : "border-gray-200 bg-white/40"
                      }`}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2 flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: event.color }}
                            />
                            {event.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-1 font-medium">
                            {eventDate.format("MMM D, YYYY")} • {formatTime(event.startTime)} -{" "}
                            {formatTime(event.endTime)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full capitalize font-medium">
                            {event.type}
                          </span>
                          {isConflicted && (
                            <span className="text-xs bg-red-200 text-red-700 px-2 py-1 rounded-full font-medium">
                              Conflict
                            </span>
                          )}
                        </div>
                      </div>
                      {event.description && <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>}
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8" />
                </div>
              </div>
              <p className="text-gray-600 italic mb-6 text-lg">
                {filterType === "all"
                  ? `No events scheduled for ${currentDate.format("MMMM YYYY")}`
                  : `No ${filterType} events found for ${currentDate.format("MMMM YYYY")}`}
              </p>
              <button
                onClick={() => handleAddEventClick()}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Add Event</span>
              </button>
            </div>
          )}
        </div>
      )}
      <div className="md:hidden">
        <FloatingActionButton onClick={() => handleAddEventClick()} />
      </div>
      <EventModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={handleCloseEventModal}
        conflictedEvents={conflictedEvents}
        onReschedule={(event) => handleRescheduleClick(event)}
        onDelete={handleDeleteEvent}
      />
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={handleCloseAddEventModal}
        onAddEvent={handleAddEvent}
        selectedDate={selectedDateForNewEvent}
      />
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={handleCloseRescheduleModal}
        event={eventToReschedule}
        allEvents={events}
        onReschedule={handleRescheduleEvent}
        suggestedDate={suggestedRescheduleDate}
      />

      <DragPreview event={dragPreview.event} isVisible={dragPreview.isVisible} position={dragPreview.position} />
    </div>
  )
}



