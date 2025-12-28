import './globals.css'

export const metadata = {
  title: 'Event Calendar App',
  description: 'Manage your events with recurring support',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Event Calendar</h1>
            <div className="space-x-4">
              <a href="/" className="hover:underline">Calendar</a>
              <a href="/events" className="hover:underline">Events</a>
              <a href="/events/new" className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-800">New Event</a>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}