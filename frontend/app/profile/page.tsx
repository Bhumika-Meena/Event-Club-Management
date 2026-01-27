'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, apiClient } from '../contexts/AuthContext'
import { Header } from '../components/Header'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Shield, Calendar, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Profile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'STUDENT' | 'CLUB' | 'ADMIN'
  phone?: string
  avatar?: string
  createdAt?: string
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchProfile()
    }
  }, [user, authLoading])

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/users/profile')
      setProfile(res.data.user)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Administrator', color: 'bg-red-50 text-red-700 border-red-200' }
      case 'CLUB':
        return { label: 'Club Organizer', color: 'bg-blue-50 text-blue-700 border-blue-200' }
      default:
        return { label: 'Student', color: 'bg-slate-50 text-slate-700 border-slate-200' }
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-32">
          <p className="text-slate-500">Profile not found.</p>
        </div>
      </div>
    )
  }

  const roleBadge = getRoleBadge(profile.role)

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Profile
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Your account information
            </p>
          </div>

          {/* Profile Card */}
          <div className="border border-slate-200 rounded-xl p-6">
            {/* User Info Header */}
            <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-slate-900 truncate">
                  {profile.firstName} {profile.lastName}
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${roleBadge.color}`}>
                    <Shield className="w-3 h-3" />
                    {roleBadge.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-900">{profile.email}</p>
                </div>
              </div>

              {profile.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-900">{profile.phone}</p>
                  </div>
                </div>
              )}

              {profile.createdAt && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Member since</p>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(profile.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {profile.role === 'CLUB' && (
            <div className="mt-6 p-4 border border-slate-200 rounded-xl bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Club Dashboard</p>
                  <p className="text-xs text-slate-500">Manage your club and events</p>
                </div>
                <a 
                  href="/club" 
                  className="text-sm font-medium text-slate-900 hover:underline"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
