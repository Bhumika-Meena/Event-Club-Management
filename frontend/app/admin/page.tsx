'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, Building2, TrendingUp, CheckCircle, XCircle, Clock, User, QrCode } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

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
      const response = await axios.get('/admin/dashboard')
      setStats(response.data.stats)
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleEventStatusUpdate = async (eventId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await axios.patch(`/admin/events/${eventId}/status`, { status })
      toast.success(`Event ${status.toLowerCase()} successfully`)
      fetchDashboardStats()
    } catch (error) {
      toast.error('Failed to update event status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold title-gradient mb-4">Access Denied</h1>
          <p className="text-slate-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold title-gradient">Admin Dashboard</h1>
            <p className="text-slate-600">Manage users, events, and clubs</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/check-in" className="btn-primary flex items-center gap-1 text-sm">
              <QrCode className="w-4 h-4" />
              <span>Check-In</span>
            </Link>
            <Link href="/profile" className="btn-secondary flex items-center gap-1 text-sm">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Link>
            <Link href="/events" className="btn-secondary flex items-center gap-1 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Events</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card"
          >
            <div className="flex items-center">
              <Users className="w-10 h-10 text-primary-500 bg-primary-500/10 p-2 rounded-xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalUsers || 0}</p>
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
              <Building2 className="w-10 h-10 text-neon-lime bg-neon-lime/10 p-2 rounded-xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Active Clubs</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalClubs || 0}</p>
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
              <Calendar className="w-10 h-10 text-neon-purple bg-neon-purple/10 p-2 rounded-xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Events</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalEvents || 0}</p>
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
              <TrendingUp className="w-10 h-10 text-neon-yellow bg-neon-yellow/20 p-2 rounded-xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Bookings</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalBookings || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Events */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="card"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Pending Events</h2>
            <div className="space-y-4">
              {stats?.recentEvents?.filter(event => event.status === 'PENDING').map((event) => (
                <div key={event.id} className="rounded-xl border border-white/60 bg-white/70 p-4 backdrop-blur">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-900">{event.title}</h3>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{event.club.name}</p>
                  <p className="text-sm text-slate-500 mb-4">{event.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEventStatusUpdate(event.id, 'APPROVED')}
                      className="btn-primary text-sm flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleEventStatusUpdate(event.id, 'REJECTED')}
                      className="btn-danger text-sm flex items-center"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {stats?.recentEvents?.filter(event => event.status === 'PENDING').length === 0 && (
                <p className="text-slate-500 text-center py-4">No pending events</p>
              )}
            </div>
          </motion.div>

          {/* Top Clubs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="card"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Top Clubs</h2>
            <div className="space-y-4">
              {stats?.topClubs?.map((club, index) => (
                <div key={club.id} className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 p-3 backdrop-blur">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{club.name}</h3>
                      <p className="text-sm text-slate-600">{club._count.events} events</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card mt-8"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Events</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/50">
              <thead className="bg-white/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Club
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
                {stats?.recentEvents?.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{event.title}</div>
                        <div className="text-sm text-slate-500">{event.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {event.club.name}
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
                      {event._count.bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {event.status === 'PENDING' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEventStatusUpdate(event.id, 'APPROVED')}
                            className="text-primary-600 hover:text-primary-500 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleEventStatusUpdate(event.id, 'REJECTED')}
                            className="text-rose-500 hover:text-rose-400 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
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
