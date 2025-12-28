'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' })
      setEvents(events.filter(event => event._id !== id))
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Events</h1>
        <Link
          href="/events/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No events found. <Link href="/events/new" className="text-blue-600 hover:underline">Create your first event</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => (
            <div key={event._id} className="bg-white p-6 rounded-lg shadow border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                  {event.description && (
                    <p className="text-gray-600 mt-1">{event.description}</p>
                  )}
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Start: {formatDate(event.startDate)}</p>
                    <p>End: {formatDate(event.endDate)}</p>
                    {event.isRecurring && (
                      <div className="mt-1">
                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          Recurring: {event.frequency}
                          {event.frequency === 'weekly' && event.daysOfWeek.length > 0 && 
                            ` (${event.daysOfWeek.join(', ')})`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Link
                    href={`/events/${event._id}/edit`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteEvent(event._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}