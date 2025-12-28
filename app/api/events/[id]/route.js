import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongodb'
import Event from '../../../../lib/models/Event'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    const event = await Event.findById(params.id)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect()
    const body = await request.json()
    
    const event = await Event.findByIdAndUpdate(
      params.id,
      {
        title: body.title,
        description: body.description || '',
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        isRecurring: body.isRecurring || false,
        frequency: body.frequency || null,
        daysOfWeek: body.daysOfWeek || [],
      },
      { new: true }
    )

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect()
    const event = await Event.findByIdAndDelete(params.id)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}