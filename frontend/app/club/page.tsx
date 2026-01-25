'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Users, TrendingUp, Plus, Edit, BarChart3, User as UserIcon, QrCode } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
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
      const response = await axios.get('/clubs/my/club')
      setClub(response.data.club)
    } catch (error) {
      toast.error('Failed to fetch club data')
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/clubs/my/analytics')
      setAnalytics(response.data.analytics)
    } catch (error) {
      toast.error('Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (user?.role !== 'CLUB') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold title-gradient mb-4">Access Denied</h1>
          <p className="text-slate-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold title-gradient mb-4">No Club Found</h1>
          <p className="text-slate-600 mb-6">You need to create a club first.</p>
          <Link href="/clubs/create" className="btn-primary">
            Create Club
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {club.logo && (
                <img
                  src={club.logo}
                  alt={club.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold title-gradient">{club.name}</h1>
                <p className="text-slate-600">Club Dashboard</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/check-in" className="btn-primary flex items-center gap-1 text-sm">
                <QrCode className="w-4 h-4" />
                <span>Check-In</span>
              </Link>
              <Link href="/profile" className="btn-secondary flex items-center gap-1 text-sm">
                <UserIcon className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <Link href="/events" className="btn-secondary flex items-center gap-1 text-sm">
                <Calendar className="w-4 h-4" />
                <span>Events</span>
              </Link>
              <Link href="/clubs/edit" className="btn-secondary flex items-center gap-1 text-sm">
                <Edit className="w-4 h-4" />
                <span>Edit Club</span>
              </Link>
              <Link href="/events/create" className="btn-secondary flex items-center gap-1 text-sm">
                <Plus className="w-4 h-4" />
                <span>Create Event</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card"
          >
            <div className="flex items-center">
              <Calendar className="w-10 h-10 text-primary-500 bg-primary-500/10 p-2 rounded-xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Events</p>
                <p className="text-2xl font-bold text-slate-900">{analytics?.totalEvents || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center">
              <Users className="w-10 h-10 text-neon-lime bg-neon-lime/10 p-2 rounded-xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Bookings</p>
                <p className="text-2xl font-bold text-slate-900">{analytics?.totalBookings || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center">
              <TrendingUp className="w-10 h-10 text-neon-purple bg-neon-purple/10 p-2 rounded-xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900">${analytics?.totalRevenue || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center">
              <BarChart3 className="w-10 h-10 text-neon-yellow bg-neon-yellow/20 p-2 rounded-xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Avg Attendance</p>
                <p className="text-2xl font-bold text-slate-900">{analytics?.averageAttendance?.toFixed(1) || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Club Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="card"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Club Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600">Description</label>
                <p className="mt-1 text-sm text-slate-900">{club.description || 'No description provided'}</p>
              </div>
              
              {club.website && (
                <div>
                  <label className="block text-sm font-medium text-slate-600">Website</label>
                  <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-500">
                    {club.website}
                  </a>
                </div>
              )}

              <div className="flex gap-4">
                {club.instagram && (
                  <a href={`https://instagram.com/${club.instagram}`} target="_blank" rel="noopener noreferrer" className="text-neon-pink hover:text-neon-purple transition-colors">
                    Instagram: @{club.instagram}
                  </a>
                )}
                {club.facebook && (
                  <a href={`https://facebook.com/${club.facebook}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-500 transition-colors">
                    Facebook: {club.facebook}
                  </a>
                )}
                {club.twitter && (
                  <a href={`https://twitter.com/${club.twitter}`} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-400 transition-colors">
                    Twitter: @{club.twitter}
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Recent Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="card"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Events</h2>
            <div className="space-y-4">
              {club.events.slice(0, 5).map((event) => (
                <div key={event.id} className="rounded-xl border border-white/60 bg-white/70 p-4 backdrop-blur">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-900">{event.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      event.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{format(new Date(event.date), 'MMM dd, yyyy h:mm a')}</p>
                  <p className="text-sm text-slate-500 mb-2">{event.venue}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      {event._count.bookings} / {event.maxSeats} booked
                    </span>
                    <span className="text-sm font-medium title-gradient">
                      {event.price > 0 ? `₹${event.price}` : 'Free'}
                    </span>
                  </div>
                </div>
              ))}
              {club.events.length === 0 && (
                <p className="text-slate-500 text-center py-4">No events created yet</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* All Events Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card mt-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">All Events</h2>
            <Link href="/events/create" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/50">
              <thead className="bg-white/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/70 backdrop-blur divide-y divide-white/40">
                {club.events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{event.title}</div>
                        <div className="text-sm text-slate-500">{event.venue}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {format(new Date(event.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {event._count.bookings} / {event.maxSeats}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-3">
                        <Link href={`/events/${event.id}`} className="text-primary-600 hover:text-primary-500 transition-colors">
                          View
                        </Link>
                        <Link href={`/events/${event.id}/edit`} className="text-neon-lime hover:text-primary-500 transition-colors">
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
