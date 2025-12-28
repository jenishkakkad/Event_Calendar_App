'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvent()
  }, [params.id])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data)
      }
    } catch (error) {
      console.error('Failed to fetch event:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    try {
      await fetch(`/api/events/${params.id}`, { method: 'DELETE' })
      router.push('/events')
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
    return <div className="text-center py-8">Loading event...</div>
  }

  if (!event) {
    return <div className="text-center py-8 text-red-600">Event not found</div>
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
        <div className="flex space-x-2">
          <Link
            href={`/events/${event._id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit
          </Link>
          <button
            onClick={deleteEvent}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        {event.description && (
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700">{event.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start Date & Time</h3>
            <p className="text-gray-700">{formatDate(event.startDate)}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">End Date & Time</h3>
            <p className="text-gray-700">{formatDate(event.endDate)}</p>
          </div>
        </div>

        {event.isRecurring && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Recurring Details</h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">
                <span className="font-medium">Frequency:</span> {event.frequency}
              </p>
              {event.frequency === 'weekly' && event.daysOfWeek.length > 0 && (
                <p className="text-green-800 mt-1">
                  <span className="font-medium">Days:</span> {event.daysOfWeek.join(', ')}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>Created: {formatDate(event.createdAt)}</p>
          <p>Updated: {formatDate(event.updatedAt)}</p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/events"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Events
        </Link>
      </div>
    </div>
  )
}