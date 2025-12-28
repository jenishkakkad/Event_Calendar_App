'use client'

import { useState, useRef, useEffect } from 'react'

export default function DateTimePicker({ value, onChange, label, error, min }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState({ hour: '12', minute: '00', period: 'AM' })
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (value) {
      const date = new Date(value)
      setSelectedDate(date.toISOString().split('T')[0])
      const hour = date.getHours()
      const minute = date.getMinutes()
      setSelectedTime({
        hour: (hour % 12 || 12).toString().padStart(2, '0'),
        minute: minute.toString().padStart(2, '0'),
        period: hour >= 12 ? 'PM' : 'AM'
      })
      setCurrentMonth(date)
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatDisplayValue = () => {
    if (!selectedDate) return ''
    const date = new Date(selectedDate)
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
    return `${dateStr} at ${selectedTime.hour}:${selectedTime.minute} ${selectedTime.period}`
  }

  const handleDateSelect = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateStr = newDate.toISOString().split('T')[0]
    setSelectedDate(dateStr)
    updateDateTime(dateStr, selectedTime)
  }

  const handleTimeChange = (field, value) => {
    const newTime = { ...selectedTime, [field]: value }
    setSelectedTime(newTime)
    if (selectedDate) {
      updateDateTime(selectedDate, newTime)
    }
  }

  const updateDateTime = (date, time) => {
    if (!date || !time.hour || !time.minute) return
    
    let hour = parseInt(time.hour)
    if (time.period === 'PM' && hour !== 12) hour += 12
    if (time.period === 'AM' && hour === 12) hour = 0
    
    const dateTime = new Date(date)
    dateTime.setHours(hour, parseInt(time.minute), 0, 0)
    onChange(dateTime.toISOString().slice(0, 16))
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    const minDate = min ? new Date(min) : null
    
    const days = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day)
      const isToday = dayDate.toDateString() === today.toDateString()
      const isSelected = selectedDate === dayDate.toISOString().split('T')[0]
      const isDisabled = minDate && dayDate < minDate
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleDateSelect(day)}
          disabled={isDisabled}
          className={`h-8 w-8 text-sm rounded-full flex items-center justify-center ${
            isSelected 
              ? 'bg-blue-600 text-white' 
              : isToday 
                ? 'bg-blue-100 text-blue-600 font-semibold'
                : isDisabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      )
    }
    
    return days
  }

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + direction)
    setCurrentMonth(newMonth)
  }

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-md text-left focus:outline-none focus:ring-2 ${
          error 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500'
        } ${!selectedDate ? 'text-gray-400' : 'text-gray-900'}`}
      >
        {formatDisplayValue() || 'Select date and time'}
        <svg className="float-right mt-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
          {/* Calendar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigateMonth(-1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="font-semibold">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                type="button"
                onClick={() => navigateMonth(1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth()}
            </div>
          </div>

          {/* Time Picker */}
          <div className="border-t pt-4">
            <div className="text-sm font-medium text-gray-700 mb-3 text-center">Select Time</div>
            <div className="flex items-center justify-center space-x-2">
              {/* Hour */}
              <select
                value={selectedTime.hour}
                onChange={(e) => handleTimeChange('hour', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hours.map(hour => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </select>
              
              <span className="text-lg font-bold">:</span>
              
              {/* Minute */}
              <select
                value={selectedTime.minute}
                onChange={(e) => handleTimeChange('minute', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {minutes.filter((_, i) => i % 5 === 0).map(minute => (
                  <option key={minute} value={minute}>{minute}</option>
                ))}
              </select>
              
              {/* AM/PM */}
              <select
                value={selectedTime.period}
                onChange={(e) => handleTimeChange('period', e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            
            {/* Clock Display */}
            <div className="mt-4 text-center">
              <div className="inline-block bg-gray-100 px-4 py-2 rounded-lg">
                <div className="text-2xl font-mono font-bold text-gray-800">
                  {selectedTime.hour}:{selectedTime.minute}
                </div>
                <div className="text-sm font-semibold text-gray-600">
                  {selectedTime.period}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}