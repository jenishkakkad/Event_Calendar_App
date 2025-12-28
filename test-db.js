const mongoose = require('mongoose')

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/event-calendar')
  .then(() => {
    console.log('✅ Connected to MongoDB')
    
    // Create Event schema
    const EventSchema = new mongoose.Schema({
      title: String,
      description: String,
      startDate: Date,
      endDate: Date,
      isRecurring: Boolean,
      frequency: String,
      daysOfWeek: [String]
    }, { timestamps: true })
    
    const Event = mongoose.model('Event', EventSchema)
    
    // Create a test event
    const testEvent = new Event({
      title: 'Test Event',
      description: 'This is a test event',
      startDate: new Date(),
      endDate: new Date(Date.now() + 3600000), // 1 hour later
      isRecurring: false
    })
    
    return testEvent.save()
  })
  .then((event) => {
    console.log('✅ Test event created:', event.title)
    console.log('✅ Database: event-calendar')
    console.log('✅ Collection: events')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })