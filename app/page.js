import Calendar from './components/Calendar'

export default function Home() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Event Calendar</h1>
        <p className="text-gray-600">Manage your events and view them in a monthly calendar</p>
      </div>
      <Calendar />
    </div>
  )
}