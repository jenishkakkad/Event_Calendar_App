'use client'

import { useState, useEffect } from 'react'
import { getDaysInMonth, getFirstDayOfMonth, generateRecurringEvents, isSameDay } from '../../lib/utils'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (events.length > 0) {
      const monthStart = new Date(year, month, 1)
      const monthEnd = new Date(year, month + 1, 0)
      
      const expandedEvents = []
      events.forEach(event => {
        const recurring = generateRecurringEvents(event, monthStart, monthEnd)
        expandedEvents.push(...recurring)
      })
      
      setCalendarEvents(expandedEvents)
    }
  }, [events, year, month])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    }
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(month + direction)
    setCurrentDate(newDate)
  }

  const getEventsForDay = (day) => {
    const dayDate = new Date(year, month, day)
    return calendarEvents.filter(event => 
      isSameDay(new Date(event.startDate), dayDate)
    )
  }

  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day)
      const isToday = isSameDay(new Date(year, month, day), new Date())
      
      days.push(
        <div key={day} className={`h-24 border border-gray-200 p-1 ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 2).map((event, index) => (
              <div
                key={`${event._id}-${index}`}
                className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    }
    
    return days
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => navigateMonth(-1)}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
        >
          Previous
        </button>
        <h2 className="text-xl font-semibold">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={() => navigateMonth(1)}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
        >
          Next
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-700 bg-gray-50 border-b">
            {day}
          </div>
        ))}
        {renderCalendarDays()}
      </div>
    </div>
  )
}