'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './contexts/AuthContext'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Calendar, 
  Users, 
  LayoutDashboard, 
  Ticket, 
  QrCode,
  BarChart3,
  ArrowRight,
  Building2
} from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ADMIN') {
        router.replace('/admin')
      } else if (user.role === 'CLUB') {
        router.replace('/club')
      } else {
        router.replace('/events')
      }
    }
  }, [user, loading, router])

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-lg font-semibold text-slate-900 tracking-tight">
              EventPortal
            </Link>
            
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
              >
                Log in
              </Link>
              <Link 
                href="/register" 
                className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <p className="text-sm text-slate-500 mb-4">
            For Students & Organizations
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Manage events with a platform built for clubs
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
            Create events, manage bookings, and track attendance. Built for college clubs, organizations, and communities.
          </p>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-lg transition-colors"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/events" 
              className="text-sm font-medium text-slate-700 hover:text-slate-900 px-5 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
            >
              Browse events
            </Link>
          </div>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Large Card - Event Management */}
          <div className="md:col-span-2 md:row-span-2 p-6 rounded-xl border border-slate-200 flex flex-col">
            <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center mb-6">
              <Calendar className="w-5 h-5 text-slate-700" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Event Management
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-auto">
              Create and publish events with customizable details. Set capacity limits, 
              ticket prices, and event schedules. Real-time updates keep attendees informed 
              about any changes.
            </p>
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-mono">
                Events + Bookings + QR Check-in
              </p>
            </div>
          </div>

          {/* Small Card - Booking System */}
          <div className="p-6 rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center mb-4">
              <Ticket className="w-5 h-5 text-slate-700" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Booking System
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Seamless ticket booking with payment integration. Supports both free and paid events.
            </p>
          </div>

          {/* Small Card - QR Check-in */}
          <div className="p-6 rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center mb-4">
              <QrCode className="w-5 h-5 text-slate-700" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              QR Check-in
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Scan QR codes for fast attendee check-in. Track attendance in real-time.
            </p>
          </div>

          {/* Medium Card - Club Dashboard */}
          <div className="p-6 rounded-xl border border-slate-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                Club Dashboard
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Dedicated dashboard for clubs to manage events, view analytics, and track performance.
              </p>
            </div>
          </div>

          {/* Medium Card - Admin Tools */}
          <div className="p-6 rounded-xl border border-slate-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                Admin Tools
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Approve events, manage users, and oversee the entire platform from one place.
              </p>
            </div>
          </div>

          {/* Medium Card - Analytics */}
          <div className="p-6 rounded-xl border border-slate-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                Analytics
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Track bookings, revenue, and attendance with visual reports and insights.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
