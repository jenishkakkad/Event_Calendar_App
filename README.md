# Event Management Calendar App

A full-stack event management system built with Next.js, MongoDB, and Tailwind CSS featuring recurring events and a monthly calendar view.

## Features

- ✅ Create, read, update, delete events (CRUD)
- ✅ One-time and recurring events (Daily, Weekly, Monthly)
- ✅ Weekly events with specific weekday selection
- ✅ Monthly calendar view with event display
- ✅ Responsive design with Tailwind CSS
- ✅ Local MongoDB integration

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB (Local)
- **ODM**: Mongoose

## Prerequisites

- Node.js 18+ installed
- MongoDB Community Edition installed and running locally
- MongoDB running on `mongodb://localhost:27017`

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start MongoDB** (make sure MongoDB is running on localhost:27017)

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

5. 📸 Screenshots

### 📅 Calendar View
![Calendar View](/screenshorts/calendar.png)

### ➕ Create Event Form
![Create Event](/screenshorts/•%20eventsnew%20→%20Create%20event.png)

### 📋 Event List
![Event List](/screenshorts/•%20events%20→%20List%20events.png)

### ✏️ Edit Event
![Edit Event](/screenshorts/•%20events[id]edit%20→%20Edit%20event.png)

### 📄 Event Details 
![Event Details](/screenshorts/•%20events[id]%20→%20Event%20details%20(optional).png)

## Project Structure

```
event-calendar-app/
├── app/
│   ├── api/events/          # API routes for events
│   ├── components/          # Reusable components
│   ├── events/              # Event-related pages
│   ├── globals.css          # Global styles
│   ├── layout.js            # Root layout
│   └── page.js              # Home page (calendar)
├── lib/
│   ├── models/Event.js      # Mongoose Event model
│   ├── mongodb.js           # Database connection
│   └── utils.js             # Utility functions
└── ...config files
```

## API Endpoints

- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/[id]` - Get single event
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

## Usage

1. **Calendar View** (`/`) - View events in monthly calendar format
2. **Events List** (`/events`) - View all events in list format
3. **Create Event** (`/events/new`) - Create new one-time or recurring events
4. **Edit Event** (`/events/[id]/edit`) - Edit existing events
5. **View Event** (`/events/[id]`) - View event details

## Recurring Events

- **Daily**: Event repeats every day
- **Weekly**: Event repeats on selected weekdays (Monday, Tuesday, etc.)
- **Monthly**: Event repeats on the same date each month

## Database Schema

```javascript
{
  title: String (required),
  description: String,
  startDate: Date (required),
  endDate: Date (required),
  isRecurring: Boolean,
  frequency: String (daily/weekly/monthly),
  daysOfWeek: [String] // For weekly events
}
```