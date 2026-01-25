'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { motion } from 'framer-motion'
import { User, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

interface Profile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'STUDENT' | 'CLUB' | 'ADMIN'
  phone?: string
  avatar?: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/users/profile')
        setProfile(res.data.user)
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Profile not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-full bg-primary-500/10 flex items-center justify-center">
              <User className="h-7 w-7 text-primary-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-sm text-slate-500 capitalize">
                {profile.role.toLowerCase()} account
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary-400" />
              <span className="text-sm text-slate-700">{profile.email}</span>
            </div>
            {profile.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary-400" />
                <span className="text-sm text-slate-700">{profile.phone}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}


