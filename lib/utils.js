export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

export function formatDate(date) {
  return date.toISOString().split('T')[0]
}

export function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

export function generateRecurringEvents(event, startDate, endDate) {
  const events = []
  const eventStart = new Date(event.startDate)
  const eventEnd = new Date(event.endDate)
  
  if (!event.isRecurring) {
    // For non-recurring events, check if any part of the event falls within the view range
    if (eventEnd >= startDate && eventStart <= endDate) {
      events.push(event)
    }
    return events
  }

  const eventDuration = eventEnd.getTime() - eventStart.getTime()
  
  if (event.frequency === 'daily') {
    let currentDate = new Date(eventStart)
    while (currentDate <= eventEnd && currentDate <= endDate) {
      if (currentDate >= startDate) {
        events.push({
          ...event,
          startDate: new Date(currentDate),
          endDate: new Date(currentDate.getTime() + Math.min(eventDuration, 24 * 60 * 60 * 1000))
        })
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
  } else if (event.frequency === 'weekly') {
    let currentDate = new Date(eventStart)
    while (currentDate <= eventEnd && currentDate <= endDate) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
      if (event.daysOfWeek.includes(dayName) && currentDate >= startDate) {
        events.push({
          ...event,
          startDate: new Date(currentDate),
          endDate: new Date(currentDate.getTime() + Math.min(eventDuration, 24 * 60 * 60 * 1000))
        })
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
  } else if (event.frequency === 'monthly') {
    const originalDay = eventStart.getDate()
    let currentMonth = new Date(eventStart.getFullYear(), eventStart.getMonth(), 1)
    
    while (currentMonth <= eventEnd && currentMonth <= endDate) {
      const daysInCurrentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
      const dayToUse = Math.min(originalDay, daysInCurrentMonth)
      
      const monthlyEventStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayToUse, 
        eventStart.getHours(), eventStart.getMinutes(), eventStart.getSeconds())
      
      // Only generate if this occurrence is within the original event's timeframe
      if (monthlyEventStart <= eventEnd && monthlyEventStart >= startDate) {
        events.push({
          ...event,
          startDate: monthlyEventStart,
          endDate: new Date(monthlyEventStart.getTime() + Math.min(eventDuration, 24 * 60 * 60 * 1000))
        })
      }
      
      currentMonth.setMonth(currentMonth.getMonth() + 1)
    }
  }
  
  return events
}