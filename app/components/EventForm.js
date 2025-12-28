'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EventForm({ event = null, isEdit = false }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    startDate: event?.startDate ? new Date(event.startDate).toISOString() : '',
    endDate: event?.endDate ? new Date(event.endDate).toISOString() : '',
    isRecurring: event?.isRecurring || false,
    frequency: event?.frequency || 'daily',
    daysOfWeek: event?.daysOfWeek || []
  })

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Separate date + time parts for AM/PM picker and clock preview
  const [startDateOnly, setStartDateOnly] = useState('')
  const [startHour, setStartHour] = useState('12')
  const [startMinute, setStartMinute] = useState('00')
  const [startAmPm, setStartAmPm] = useState('AM')

  const [endDateOnly, setEndDateOnly] = useState('')
  const [endHour, setEndHour] = useState('12')
  const [endMinute, setEndMinute] = useState('00')
  const [endAmPm, setEndAmPm] = useState('AM')

  useEffect(() => {
    // Initialize time parts from provided ISO datetimes (if any)
    if (formData.startDate) {
      const d = new Date(formData.startDate)
      if (!isNaN(d)) {
        setStartDateOnly(d.toISOString().slice(0, 10))
        let h = d.getHours()
        setStartAmPm(h >= 12 ? 'PM' : 'AM')
        h = h % 12
        if (h === 0) h = 12
        setStartHour(String(h).padStart(2, '0'))
        setStartMinute(String(d.getMinutes()).padStart(2, '0'))
      }
    }

    if (formData.endDate) {
      const d2 = new Date(formData.endDate)
      if (!isNaN(d2)) {
        setEndDateOnly(d2.toISOString().slice(0, 10))
        let h2 = d2.getHours()
        setEndAmPm(h2 >= 12 ? 'PM' : 'AM')
        h2 = h2 % 12
        if (h2 === 0) h2 = 12
        setEndHour(String(h2).padStart(2, '0'))
        setEndMinute(String(d2.getMinutes()).padStart(2, '0'))
      }
    }
  }, [])

  const hoursOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  const minuteSteps = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

  const buildISOFromParts = (dateOnly, hour12, minute, ampm) => {
    if (!dateOnly) return ''
    const [y, m, d] = dateOnly.split('-').map(Number)
    let h = Number(hour12)
    if (ampm === 'AM' && h === 12) h = 0
    if (ampm === 'PM' && h !== 12) h = h + 12
    const dt = new Date(y, m - 1, d, h, Number(minute), 0, 0)
    return dt.toISOString()
  }

  // minuteSteps now contains all minutes 00-59; clock preview removed

  const validateForm = () => {
    const newErrors = {}
    const now = new Date()
    const startISO = buildISOFromParts(startDateOnly, startHour, startMinute, startAmPm)
    const endISO = buildISOFromParts(endDateOnly, endHour, endMinute, endAmPm)
    const startDate = startISO ? new Date(startISO) : null
    const endDate = endISO ? new Date(endISO) : null

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }

    // Start date validation
    if (!startISO) {
      newErrors.startDate = 'Start date is required'
    } else if (startDate && startDate < now && !isEdit) {
      newErrors.startDate = 'Start date cannot be in the past'
    }

    // End date validation
    if (!endISO) {
      newErrors.endDate = 'End date is required'
    } else if (startDate && endDate && endDate <= startDate) {
      newErrors.endDate = 'End date must be after start date'
    } else if (startDate && endDate && (endDate - startDate) > (365 * 24 * 60 * 60 * 1000)) {
      newErrors.endDate = 'Event duration cannot exceed 1 year'
    }

    // Description validation
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    // Recurring validation
    if (formData.isRecurring) {
      if (!formData.frequency) {
        newErrors.frequency = 'Frequency is required for recurring events'
      }
      
      if (formData.frequency === 'weekly' && formData.daysOfWeek.length === 0) {
        newErrors.daysOfWeek = 'Please select at least one day for weekly recurring events'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // build final ISO strings from the AM/PM parts
    const finalStartISO = buildISOFromParts(startDateOnly, startHour, startMinute, startAmPm)
    const finalEndISO = buildISOFromParts(endDateOnly, endHour, endMinute, endAmPm)

    setLoading(true)

    try {
      const url = isEdit ? `/api/events/${event._id}` : '/api/events'
      const method = isEdit ? 'PUT' : 'POST'

      const payload = { ...formData, startDate: finalStartISO, endDate: finalEndISO }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok) {
        router.push('/events')
      } else {
        setErrors({ submit: result.error || 'Failed to save event' })
      }
    } catch (error) {
      console.error('Error saving event:', error)
      setErrors({ submit: 'Network error. Please check your connection and try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleDayToggle = (day) => {
    const newDaysOfWeek = formData.daysOfWeek.includes(day)
      ? formData.daysOfWeek.filter(d => d !== day)
      : [...formData.daysOfWeek, day]
    
    handleInputChange('daysOfWeek', newDaysOfWeek)
  }

  const getMinDateTime = () => {
    if (isEdit) return ''
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.title 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder="Enter event title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.description 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder="Enter event description (optional)"
        />
        <div className="mt-1 text-sm text-gray-500">
          {formData.description.length}/500 characters
        </div>
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date & Time *
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={startDateOnly}
              onChange={(e) => setStartDateOnly(e.target.value)}
              min={getMinDateTime() ? getMinDateTime().slice(0,10) : ''}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
            />

            <select value={startHour} onChange={(e) => setStartHour(e.target.value)} className="px-2 py-2 border rounded-md">
              {hoursOptions.map(h => <option key={h} value={h}>{h}</option>)}
            </select>

            <select value={startMinute} onChange={(e) => setStartMinute(e.target.value)} className="px-2 py-2 border rounded-md">
              {minuteSteps.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <select value={startAmPm} onChange={(e) => setStartAmPm(e.target.value)} className="px-2 py-2 border rounded-md">
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          <div className="mt-3">
            {errors.startDate && <p className="text-sm text-red-600">{errors.startDate}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date & Time *
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={endDateOnly}
              onChange={(e) => setEndDateOnly(e.target.value)}
              min={startDateOnly || ''}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
            />

            <select value={endHour} onChange={(e) => setEndHour(e.target.value)} className="px-2 py-2 border rounded-md">
              {hoursOptions.map(h => <option key={h} value={h}>{h}</option>)}
            </select>

            <select value={endMinute} onChange={(e) => setEndMinute(e.target.value)} className="px-2 py-2 border rounded-md">
              {minuteSteps.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <select value={endAmPm} onChange={(e) => setEndAmPm(e.target.value)} className="px-2 py-2 border rounded-md">
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          <div className="mt-3">
            {errors.endDate && <p className="text-sm text-red-600">{errors.endDate}</p>}
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isRecurring}
            onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Recurring Event</span>
        </label>
      </div>

      {formData.isRecurring && (
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency *
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => handleInputChange('frequency', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.frequency 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            {errors.frequency && <p className="mt-1 text-sm text-red-600">{errors.frequency}</p>}
          </div>

          {formData.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days of Week *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {daysOfWeek.map(day => (
                  <label key={day} className="flex items-center bg-white p-2 rounded border hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.daysOfWeek.includes(day)}
                      onChange={() => handleDayToggle(day)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">{day.slice(0, 3)}</span>
                  </label>
                ))}
              </div>
              {errors.daysOfWeek && <p className="mt-1 text-sm text-red-600">{errors.daysOfWeek}</p>}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            isEdit ? 'Update Event' : 'Create Event'
          )}
        </button>
      </div>
    </form>
  )
}