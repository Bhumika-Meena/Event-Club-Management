'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, Clock, Search, X, Plus, ArrowRight } from 'lucide-react'
import { useAuth, apiClient } from '../contexts/AuthContext'
import { Header } from '../components/Header'
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
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get('/events')
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
    setSelectedEvent(null)
  }

  const closeBookingForm = () => {
    setBookingEvent(null)
  }

  const handleBookingSuccess = () => {
    fetchEvents()
  }

  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.club.name.toLowerCase().includes(query) ||
      event.venue.toLowerCase().includes(query)
    )
  })

  const availableSeats = (event: Event) => event.maxSeats - event._count.bookings
  const isEventFull = (event: Event) => availableSeats(event) <= 0

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Events
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Discover and book upcoming events
            </p>
          </div>
          
          {user?.role === 'CLUB' && (
            <Link 
              href="/events/create" 
              className="inline-flex items-center gap-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by name, venue, or organizer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((event, index) => (
              <motion.article
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all"
              >
                {/* Event Header */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-1">{event.club.name}</p>
                      <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2">
                        {event.title}
                      </h3>
                    </div>
                    {event.status === 'APPROVED' ? (
                      <span className="shrink-0 px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-full">
                        Open
                      </span>
                    ) : (
                      <span className="shrink-0 px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{format(new Date(event.date), 'EEE, MMM d')}</span>
                      <span className="text-slate-300">·</span>
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{format(new Date(event.date), 'h:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>
                        {availableSeats(event) > 0 
                          ? `${availableSeats(event)} seats left`
                          : 'Fully booked'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Footer */}
                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-base font-semibold text-slate-900">
                    {event.price > 0 ? `₹${event.price}` : 'Free'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEventDetails(event)}
                      className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      Details
                    </button>
                    {user && event.status === 'APPROVED' && !isEventFull(event) && (
                      <button
                        onClick={() => openBookingForm(event)}
                        className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-4 py-1.5 rounded-lg transition-colors"
                      >
                        Book
                      </button>
                    )}
                    {!user && event.status === 'APPROVED' && !isEventFull(event) && (
                      <Link
                        href="/login"
                        className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-4 py-1.5 rounded-lg transition-colors"
                      >
                        Book
                      </Link>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No events found</h3>
            <p className="text-sm text-slate-500">
              {searchQuery ? 'Try a different search term' : 'Check back later for upcoming events'}
            </p>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEventDetails}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{selectedEvent.club.name}</p>
                  <h2 className="text-lg font-semibold text-slate-900">{selectedEvent.title}</h2>
                </div>
                <button
                  onClick={closeEventDetails}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-5">
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {selectedEvent.description}
                </p>

                {/* Event Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500">Date</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {format(new Date(selectedEvent.date), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500">Time</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {format(new Date(selectedEvent.date), 'h:mm a')}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500">Venue</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedEvent.venue}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500">Availability</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {availableSeats(selectedEvent)} / {selectedEvent.maxSeats} seats
                    </p>
                  </div>
                </div>

                {/* Price & Status */}
                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl text-white">
                  <div>
                    <p className="text-xs text-slate-400">Price</p>
                    <p className="text-xl font-semibold">
                      {selectedEvent.price > 0 ? `₹${selectedEvent.price}` : 'Free'}
                    </p>
                  </div>
                  {selectedEvent.status === 'APPROVED' ? (
                    <span className="px-3 py-1 text-xs font-medium bg-green-500/20 text-green-300 rounded-full">
                      Open for booking
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-medium bg-amber-500/20 text-amber-300 rounded-full">
                      Pending approval
                    </span>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-3">
                <button
                  onClick={closeEventDetails}
                  className="flex-1 h-11 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                {user && selectedEvent.status === 'APPROVED' && !isEventFull(selectedEvent) && (
                  <button
                    onClick={() => {
                      closeEventDetails()
                      openBookingForm(selectedEvent)
                    }}
                    className="flex-1 h-11 inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Book Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {!user && selectedEvent.status === 'APPROVED' && !isEventFull(selectedEvent) && (
                  <Link
                    href="/login"
                    className="flex-1 h-11 inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Login to Book
                    <ArrowRight className="w-4 h-4" />
                  </Link>
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
