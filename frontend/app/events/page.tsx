'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, Clock, Filter, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { BookingForm } from '../components/BookingForm'

interface Event {
  id: string
  title: string
  description: string
  venue: string
  date: string
  maxSeats: number
  price: number
  status: string
  club: {
    id: string
    name: string
    logo?: string
  }
  _count: {
    bookings: number
  }
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [bookingEvent, setBookingEvent] = useState<Event | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchEvents()
  }, [filters])

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      
      const response = await axios.get(`/events?${params.toString()}`)
      setEvents(response.data.events)
    } catch (error) {
      toast.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const openEventDetails = (event: Event) => {
    setSelectedEvent(event)
  }

  const closeEventDetails = () => {
    setSelectedEvent(null)
  }

  const openBookingForm = (event: Event) => {
    if (!user) {
      toast.error('Please login to book events')
      return
    }
    setBookingEvent(event)
    setSelectedEvent(null) // Close event details modal if open
  }

  const closeBookingForm = () => {
    setBookingEvent(null)
  }

  const handleBookingSuccess = () => {
    fetchEvents() // Refresh events to update booking count
  }

  const filteredEvents = events.filter(event => {
    if (filters.search) {
      return event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
             event.description.toLowerCase().includes(filters.search.toLowerCase()) ||
             event.club.name.toLowerCase().includes(filters.search.toLowerCase())
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold title-gradient">Events</h1>
              <p className="text-slate-600">Discover and book exciting events</p>
            </div>
            {user?.role === 'CLUB' && (
              <Link href="/events/create" className="btn-primary flex items-center">
                Create Event
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="card mb-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search events..."
                className="input-field"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-primary-400" />
                <select
                  className="input-field pl-10"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">All Events</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-hover"
            >
              <div className="flex items-center mb-4">
                {event.club.logo && (
                  <img
                    src={event.club.logo}
                    alt={event.club.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{event.club.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    event.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h2>
              <p className="text-slate-600 mb-4 line-clamp-3">{event.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-slate-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{format(new Date(event.date), 'h:mm a')}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{event._count.bookings} / {event.maxSeats} booked</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-lg font-bold title-gradient">
                  {event.price > 0 ? `₹${event.price}` : 'Free'}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEventDetails(event)}
                    className="btn-secondary text-sm"
                  >
                    View Details
                  </button>
                  {user && event.status === 'APPROVED' && event._count.bookings < event.maxSeats && (
                    <button
                      onClick={() => openBookingForm(event)}
                      className="btn-primary text-sm"
                    >
                      Book Now
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-primary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No events found</h3>
            <p className="text-slate-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="card max-w-2xl w-full mx-4 relative"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <button
                type="button"
                onClick={closeEventDetails}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                {selectedEvent.club.logo && (
                  <img
                    src={selectedEvent.club.logo}
                    alt={selectedEvent.club.name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm text-slate-500">Hosted by</p>
                  <h3 className="font-semibold text-slate-900">{selectedEvent.club.name}</h3>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {selectedEvent.title}
              </h2>

              <p className="text-slate-600 mb-6 whitespace-pre-line">
                {selectedEvent.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center text-slate-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{format(new Date(selectedEvent.date), 'MMMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center text-slate-700">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{format(new Date(selectedEvent.date), 'h:mm a')}</span>
                  </div>
                  <div className="flex items-center text-slate-700">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{selectedEvent.venue}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-slate-700">
                    <Users className="w-4 h-4 mr-2" />
                    <span>
                      {selectedEvent._count.bookings} / {selectedEvent.maxSeats} seats booked
                    </span>
                  </div>
                  <div className="text-slate-700">
                    <span className="font-medium">Price: </span>
                    <span className="font-semibold">
                      {selectedEvent.price > 0 ? `₹${selectedEvent.price}` : 'Free'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Status: </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        selectedEvent.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : selectedEvent.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedEvent.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEventDetails}
                  className="btn-secondary"
                >
                  Close
                </button>
                {user &&
                  selectedEvent.status === 'APPROVED' &&
                  selectedEvent._count.bookings < selectedEvent.maxSeats && (
                    <button
                      type="button"
                      onClick={() => {
                        closeEventDetails()
                        openBookingForm(selectedEvent)
                      }}
                      className="btn-primary"
                    >
                      Book This Event
                    </button>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Form Modal */}
      {bookingEvent && (
        <BookingForm
          event={bookingEvent}
          isOpen={!!bookingEvent}
          onClose={closeBookingForm}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}
