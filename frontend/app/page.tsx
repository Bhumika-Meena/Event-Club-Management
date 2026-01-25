'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './contexts/AuthContext'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Users, Settings, User, Building2 } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-extrabold title-gradient">
                EventPortal
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">
                    Welcome, {user.firstName}!
                  </span>
                  <div className="flex items-center space-x-2">
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" className="btn-secondary">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin
                      </Link>
                    )}
                    {user.role === 'CLUB' && (
                      <Link href="/club" className="btn-secondary">
                        <Building2 className="w-4 h-4 mr-2" />
                        My Club
                      </Link>
                    )}
                    <Link href="/profile" className="btn-secondary">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <Link href="/events" className="btn-primary">
                      <Calendar className="w-4 h-4 mr-2" />
                      Events
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login" className="btn-secondary">
                    Login
                  </Link>
                  <Link href="/register" className="btn-primary">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl font-extrabold mb-6 title-gradient">
            Event & Club Management Portal
          </h1>
          <p className="text-xl text-slate-700 mb-8 max-w-3xl mx-auto">
            Discover, create, and manage events with ease. Connect with clubs, 
            book tickets, and stay updated with the latest happenings in your community.
          </p>
          
          {!user && (
            <div className="flex justify-center space-x-4">
              <Link href="/register" className="btn-primary text-lg px-8 py-3">
                Get Started
              </Link>
              <Link href="/events" className="btn-secondary text-lg px-8 py-3">
                Browse Events
              </Link>
            </div>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="card text-center">
            <Calendar className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Event Management</h3>
            <p className="text-gray-600">
              Create, manage, and track events with real-time booking and attendance.
            </p>
          </div>
          
          <div className="card text-center">
            <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Club Management</h3>
            <p className="text-gray-600">
              Manage your club profile, events, and member engagement effectively.
            </p>
          </div>
          
          <div className="card text-center">
            <Settings className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Admin Dashboard</h3>
            <p className="text-gray-600">
              Comprehensive admin tools for managing users, events, and analytics.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 card"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Platform Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-extrabold title-gradient mb-2">500+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold title-gradient mb-2">50+</div>
              <div className="text-gray-600">Clubs</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold title-gradient mb-2">200+</div>
              <div className="text-gray-600">Events</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold title-gradient mb-2">1000+</div>
              <div className="text-gray-600">Bookings</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
