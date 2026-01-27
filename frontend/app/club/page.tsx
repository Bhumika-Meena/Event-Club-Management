'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Plus, 
  Edit, 
  BarChart3, 
  ArrowRight,
  Clock,
  MapPin,
  QrCode,
  Globe,
  ExternalLink
} from 'lucide-react'
import { useAuth, apiClient } from '../contexts/AuthContext'
import { Header } from '../components/Header'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Club {
  id: string
  name: string
  description: string
  logo?: string
  website?: string
  instagram?: string
  facebook?: string
  twitter?: string
  events: any[]
  _count: {
    events: number
  }
}

interface Analytics {
  totalEvents: number
  totalBookings: number
  upcomingEvents: number
  pastEvents: number
  totalRevenue: number
  averageAttendance: number
}

export default function ClubDashboard() {
  const [club, setClub] = useState<Club | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === 'CLUB') {
      fetchClubData()
      fetchAnalytics()
    }
  }, [user])

  const fetchClubData = async () => {
    try {
      const response = await apiClient.get('/clubs/my/club')
      setClub(response.data.club)
    } catch (error) {
      toast.error('Failed to fetch club data')
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.get('/clubs/my/analytics')
      setAnalytics(response.data.analytics)
    } catch (error) {
      toast.error('Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

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

  if (user?.role !== 'CLUB') {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <h1 className="text-lg font-semibold text-slate-900 mb-1">Access Denied</h1>
            <p className="text-sm text-slate-500">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-md mx-auto px-6 py-32">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h1 className="text-lg font-semibold text-slate-900 mb-2">Create Your Club</h1>
            <p className="text-sm text-slate-500 mb-6">You need to create a club to start managing events.</p>
            <Link 
              href="/clubs/create" 
              className="inline-flex items-center gap-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-lg transition-colors"
            >
              Create Club
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const upcomingEvents = club.events.filter(event => new Date(event.date) > new Date())
  const pendingEvents = club.events.filter(event => event.status === 'PENDING')

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {club.logo ? (
              <img
                src={club.logo}
                alt={club.name}
                className="w-14 h-14 rounded-xl border border-slate-200 object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center">
                <span className="text-white text-xl font-semibold">
                  {club.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                {club.name}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">Club Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              href="/check-in" 
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-colors"
            >
              <QrCode className="w-4 h-4" />
              Check-in
            </Link>
            <Link 
              href="/clubs/edit" 
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <Link 
              href="/events/create" 
              className="inline-flex items-center gap-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Link>
          </div>
        </div>

        {/* Stats Bento Grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="p-5 bg-white rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{analytics?.totalEvents || 0}</p>
            <p className="text-sm text-slate-500 mt-1">Total Events</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{analytics?.totalBookings || 0}</p>
            <p className="text-sm text-slate-500 mt-1">Total Bookings</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">
              {analytics?.totalRevenue ? `₹${analytics.totalRevenue}` : '₹0'}
            </p>
            <p className="text-sm text-slate-500 mt-1">Total Revenue</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">
              {analytics?.averageAttendance?.toFixed(0) || 0}
            </p>
            <p className="text-sm text-slate-500 mt-1">Avg Attendance</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Events - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-xl border border-slate-200"
          >
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-slate-600" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">Upcoming Events</h2>
                </div>
                <Link 
                  href="/events/create" 
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
                >
                  New Event
                  <Plus className="w-4 h-4" />
                </Link>
              </div>
            </div>
            
            <div className="p-4">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 4).map((event) => (
                    <div 
                      key={event.id} 
                      className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium text-slate-900">{event.title}</h3>
                            <span className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${
                              event.status === 'APPROVED' 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : event.status === 'PENDING'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {format(new Date(event.date), 'MMM d, h:mm a')}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {event.venue}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-slate-900">
                            {event.price > 0 ? `₹${event.price}` : 'Free'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {event._count.bookings}/{event.maxSeats} booked
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">No upcoming events</p>
                  <p className="text-xs text-slate-500 mt-1">Create your first event to get started</p>
                  <Link 
                    href="/events/create" 
                    className="inline-flex items-center gap-1 text-sm font-medium text-slate-900 mt-3 hover:underline"
                  >
                    Create Event <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Club Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white rounded-xl border border-slate-200"
          >
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Club Info</h2>
                <Link 
                  href="/clubs/edit" 
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {club.description || 'No description added yet.'}
              </p>
              
              {(club.website || club.instagram || club.facebook || club.twitter) && (
                <div className="space-y-3">
                  {club.website && (
                    <a 
                      href={club.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="truncate">{club.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    </a>
                  )}
                  {club.instagram && (
                    <a 
                      href={`https://instagram.com/${club.instagram}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <span className="w-4 h-4 flex items-center justify-center text-xs">IG</span>
                      @{club.instagram}
                    </a>
                  )}
                  {club.twitter && (
                    <a 
                      href={`https://twitter.com/${club.twitter}`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <span className="w-4 h-4 flex items-center justify-center text-xs">X</span>
                      @{club.twitter}
                    </a>
                  )}
                </div>
              )}

              {pendingEvents.length > 0 && (
                <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-medium text-amber-700">
                    {pendingEvents.length} event{pendingEvents.length > 1 ? 's' : ''} pending approval
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* All Events Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6 bg-white rounded-xl border border-slate-200"
        >
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-slate-600" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">All Events</h2>
              </div>
              <Link 
                href="/events/create" 
                className="inline-flex items-center gap-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create
              </Link>
            </div>
          </div>
          
          {club.events.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bookings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {club.events.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{event.title}</p>
                          <p className="text-xs text-slate-500">{event.venue}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">
                          {format(new Date(event.date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(event.date), 'h:mm a')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          event.status === 'APPROVED' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : event.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{event._count.bookings} / {event.maxSeats}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">
                          {event.price > 0 ? `₹${event.price * event._count.bookings}` : '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link 
                            href={`/events/${event.id}`} 
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            View
                          </Link>
                          <Link 
                            href={`/events/${event.id}/edit`} 
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900">No events yet</p>
              <p className="text-xs text-slate-500 mt-1">Create your first event to get started</p>
              <Link 
                href="/events/create" 
                className="inline-flex items-center gap-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors mt-4"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
