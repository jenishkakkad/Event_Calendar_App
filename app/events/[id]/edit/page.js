'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import EventForm from '../../../components/EventForm'

export default function EditEventPage() {
  const params = useParams()
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

  if (loading) {
    return <div className="text-center py-8">Loading event...</div>
  }

  if (!event) {
    return <div className="text-center py-8 text-red-600">Event not found</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Event</h1>
      <EventForm event={event} isEdit={true} />
    </div>
  )
}