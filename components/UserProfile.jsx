"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Bell, Calendar, TrendingUp, Clock, X, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { dateUtil, formatTime } from "@/utils/dateUtils"

export default function UserProfile({ events = [] }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])

  const stats = useMemo(() => {
    const today = dateUtil()
    const todayEvents = events.filter((event) => event.date === today.format("YYYY-MM-DD"))
    const startOfWeek = today.startOf("week")
    const endOfWeek = today.endOf("week")
    const weekEvents = events.filter((event) => {
      const eventDate = dateUtil(event.date)
      return eventDate.isSameOrAfter(startOfWeek) && eventDate.isSameOrBefore(endOfWeek)
    })
    const upcomingEvents = events
      .filter((event) => {
        const eventDate = dateUtil(event.date)
        return eventDate.isAfter(today)
      })
      .slice(0, 5)

    return {
      todayEvents: todayEvents.length,
      weekEvents: weekEvents.length,
      upcomingMeetings: upcomingEvents.length,
      todayEventsList: todayEvents,
    }
  }, [events])


  const generateNotifications = useCallback(() => {
    const newNotifications = []
    const now = new Date()
    const today = dateUtil()

 
    stats.todayEventsList.forEach((event) => {
      const eventStart = dateUtil(`${event.date} ${event.startTime}`)
      const timeDiff = eventStart.getTime() - now.getTime()
      const minutesUntil = Math.floor(timeDiff / (1000 * 60))

      if (minutesUntil > 0 && minutesUntil <= 15) {
        newNotifications.push({
          id: `reminder-${event.id}`,
          type: "reminder",
          title: "Upcoming Event",
          message: `${event.title} starts in ${minutesUntil} minutes`,
          time: formatTime(event.startTime),
          eventId: event.id,
          isRead: false,
        })
      }
    })

   
    if (stats.todayEventsList.length > 0) {
      newNotifications.push({
        id: "events-today",
        type: "new_event",
        title: "Today's Schedule",
        message: `${stats.todayEventsList.length} events scheduled for today`,
        time: "Today",
        isRead: false,
      })
    }

 
    const conflictPairs = []
    events.forEach((event, index) => {
      const hasConflict = events.some((otherEvent, otherIndex) => {
        if (index >= otherIndex || event.date !== otherEvent.date) return false

        const eventStart = dateUtil(`${event.date} ${event.startTime}`)
        const eventEnd = dateUtil(`${event.date} ${event.endTime}`)
        const otherStart = dateUtil(`${otherEvent.date} ${otherEvent.startTime}`)
        const otherEnd = dateUtil(`${otherEvent.date} ${otherEvent.endTime}`)

        return (
          (eventStart.isSameOrBefore(otherStart) && eventEnd.isAfter(otherStart)) ||
          (otherStart.isSameOrBefore(eventStart) && otherEnd.isAfter(eventStart))
        )
      })

      if (hasConflict) {
        conflictPairs.push(event)
      }
    })

    if (conflictPairs.length > 0) {
      newNotifications.push({
        id: "conflicts",
        type: "conflict",
        title: "Schedule Conflicts",
        message: `${conflictPairs.length} conflicting events detected`,
        time: "Now",
        isRead: false,
      })
    }

    return newNotifications
  }, [events, stats.todayEventsList])

  useEffect(() => {
    const newNotifications = generateNotifications()
    setNotifications(newNotifications)
  }, [generateNotifications])

  useEffect(() => {
    const interval = setInterval(() => {
      const newNotifications = generateNotifications()
      setNotifications(newNotifications)
    }, 60000)

    return () => clearInterval(interval)
  }, [generateNotifications])

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }, [])

  const getNotificationIcon = (type) => {
    switch (type) {
      case "reminder":
        return <Clock className="w-4 h-4 text-orange-500" />
      case "new_event":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "conflict":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 mb-6 text-white">
      <div className="flex items-center justify-between">

        <div className="flex items-center space-x-3">
          <Calendar className="w-8 h-8 text-white" />
          <h1 className="text-3xl font-bold text-white">Calendar</h1>
        </div>


        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-6">
            <div className="text-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <div className="flex items-center justify-center space-x-1 text-white">
                <Calendar className="w-4 h-4" />
                <span className="text-xl font-bold">{stats.todayEvents}</span>
              </div>
              <p className="text-xs text-blue-100">Today</p>
            </div>

            <div className="text-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <div className="flex items-center justify-center space-x-1 text-white">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xl font-bold">{stats.weekEvents}</span>
              </div>
              <p className="text-xs text-blue-100">This Week</p>
            </div>

            <div className="text-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <div className="flex items-center justify-center space-x-1 text-white">
                <Clock className="w-4 h-4" />
                <span className="text-xl font-bold">{stats.upcomingMeetings}</span>
              </div>
              <p className="text-xs text-blue-100">Upcoming</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{unreadCount}</span>
                </div>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800">
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.isRead ? "bg-blue-50" : ""
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                              <span className="text-xs text-gray-500">{notification.time}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden mt-6 pt-4 border-t border-white border-opacity-20">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-1 text-white">
              <Calendar className="w-4 h-4" />
              <span className="text-lg font-bold">{stats.todayEvents}</span>
            </div>
            <p className="text-xs text-blue-100">Today</p>
          </div>

          <div className="text-center bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-1 text-white">
              <TrendingUp className="w-4 h-4" />
              <span className="text-lg font-bold">{stats.weekEvents}</span>
            </div>
            <p className="text-xs text-blue-100">This Week</p>
          </div>

          <div className="text-center bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-1 text-white">
              <Clock className="w-4 h-4" />
              <span className="text-lg font-bold">{stats.upcomingMeetings}</span>
            </div>
            <p className="text-xs text-blue-100">Upcoming</p>
          </div>
        </div>
      </div>
    </div>
  )
}
