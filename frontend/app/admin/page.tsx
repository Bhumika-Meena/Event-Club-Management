'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Users, 
  Calendar, 
  Building2, 
  Ticket, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowRight,
  QrCode
} from 'lucide-react'
import { useAuth, apiClient } from '../contexts/AuthContext'
import { Header } from '../components/Header'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface DashboardStats {
  totalUsers: number
  totalClubs: number
  totalEvents: number
  pendingEvents: number
  totalBookings: number
  activeUsers: number
  recentEvents: any[]
  topClubs: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchDashboardStats()
    }
  }, [user])

  const fetchDashboardStats = async () => {
    try {
      const response = await apiClient.get('/admin/dashboard')
      setStats(response.data.stats)
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleEventStatusUpdate = async (eventId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiClient.patch(`/admin/events/${eventId}/status`, { status })
      toast.success(`Event ${status.toLowerCase()} successfully`)
      fetchDashboardStats()
    } catch (error) {
      toast.error('Failed to update event status')
    }
  }

  const pendingEvents = stats?.recentEvents?.filter(event => event.status === 'PENDING') || []

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

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h1 className="text-lg font-semibold text-slate-900 mb-1">Access Denied</h1>
            <p className="text-sm text-slate-500">You don't have permission to access this page.</p>
          </div>
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
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage events, users, and clubs
            </p>
          </div>
          
          <Link 
            href="/check-in" 
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-lg transition-colors"
          >
            <QrCode className="w-4 h-4" />
            Check-in Scanner
          </Link>
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
              <Users className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{stats?.totalUsers || 0}</p>
            <p className="text-sm text-slate-500 mt-1">Total Users</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center mb-4">
              <Building2 className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{stats?.totalClubs || 0}</p>
            <p className="text-sm text-slate-500 mt-1">Active Clubs</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{stats?.totalEvents || 0}</p>
            <p className="text-sm text-slate-500 mt-1">Total Events</p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center mb-4">
              <Ticket className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{stats?.totalBookings || 0}</p>
            <p className="text-sm text-slate-500 mt-1">Total Bookings</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Events - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-xl border border-slate-200"
          >
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">Pending Approval</h2>
                </div>
                {pendingEvents.length > 0 && (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    {pendingEvents.length} pending
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-4">
              {pendingEvents.length > 0 ? (
                <div className="space-y-3">
                  {pendingEvents.slice(0, 4).map((event) => (
                    <div 
                      key={event.id} 
                      className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 mb-1">{event.club.name}</p>
                          <h3 className="text-sm font-medium text-slate-900 mb-1">{event.title}</h3>
                          <p className="text-xs text-slate-500 line-clamp-1">{event.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleEventStatusUpdate(event.id, 'APPROVED')}
                            className="p-2 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEventStatusUpdate(event.id, 'REJECTED')}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">All caught up!</p>
                  <p className="text-xs text-slate-500 mt-1">No events pending approval</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Clubs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white rounded-xl border border-slate-200"
          >
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-slate-600" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">Top Clubs</h2>
              </div>
            </div>
            
            <div className="p-4">
              {stats?.topClubs && stats.topClubs.length > 0 ? (
                <div className="space-y-2">
                  {stats.topClubs.slice(0, 5).map((club, index) => (
                    <div 
                      key={club.id} 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{club.name}</p>
                        <p className="text-xs text-slate-500">{club._count.events} events</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">No clubs yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Events Table */}
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
                  <Calendar className="w-4 h-4 text-slate-600" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">Recent Events</h2>
              </div>
              <Link 
                href="/events" 
                className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          {stats?.recentEvents && stats.recentEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Club</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bookings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">{event.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{event.club.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">
                          {format(new Date(event.date), 'MMM d, yyyy')}
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
                        <p className="text-sm text-slate-600">{event._count.bookings}</p>
                      </td>
                      <td className="px-6 py-4">
                        {event.status === 'PENDING' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEventStatusUpdate(event.id, 'APPROVED')}
                              className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => handleEventStatusUpdate(event.id, 'REJECTED')}
                              className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
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
              <p className="text-xs text-slate-500 mt-1">Events will appear here once created</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
