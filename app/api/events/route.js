import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import Event from '../../../lib/models/Event'

export async function GET() {
  try {
    await dbConnect()
    const events = await Event.find({}).sort({ startDate: 1 })
    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const eventData = {
      title: body.title,
      description: body.description || '',
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      isRecurring: body.isRecurring || false,
    }

    // Only add frequency and daysOfWeek if recurring
    if (body.isRecurring) {
      eventData.frequency = body.frequency || 'daily'
      if (body.frequency === 'weekly') {
        eventData.daysOfWeek = body.daysOfWeek || []
      }
    }

    const event = new Event(eventData)
    await event.save()
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 500 })
  }
}