'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Building2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Club {
  id: string
  name: string
  description: string
  website?: string
  instagram?: string
  facebook?: string
  twitter?: string
}

export default function EditClub() {
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: ''
  })
  
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user?.role === 'CLUB') {
      fetchClub()
    } else if (user && user.role !== 'CLUB') {
      router.push('/')
    }
  }, [user])

  const fetchClub = async () => {
    try {
      const response = await axios.get('/clubs/my/club')
      const clubData = response.data.club
      setClub(clubData)
      setFormData({
        name: clubData.name || '',
        description: clubData.description || '',
        website: clubData.website || '',
        instagram: clubData.instagram || '',
        facebook: clubData.facebook || '',
        twitter: clubData.twitter || ''
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch club data')
      if (error.response?.status === 404) {
        router.push('/club')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await axios.put(`/clubs/${club?.id}`, formData)
      toast.success('Club updated successfully!')
      router.push('/club')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update club')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold title-gradient mb-4">No Club Found</h1>
          <p className="text-slate-600 mb-6">You need to create a club first.</p>
          <Link href="/club" className="btn-primary">
            Go Back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur border-b border-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/club" className="btn-secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            <div>
              <h1 className="text-3xl font-bold title-gradient">Edit Club</h1>
              <p className="text-slate-600">Update your club information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Club Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input-field"
                placeholder="Enter club name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="input-field"
                placeholder="Describe your club..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-2">
                Website URL
              </label>
              <input
                id="website"
                name="website"
                type="url"
                className="input-field"
                placeholder="https://example.com"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-slate-700 mb-2">
                  Instagram
                </label>
                <input
                  id="instagram"
                  name="instagram"
                  type="text"
                  className="input-field"
                  placeholder="@username"
                  value={formData.instagram}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="facebook" className="block text-sm font-medium text-slate-700 mb-2">
                  Facebook
                </label>
                <input
                  id="facebook"
                  name="facebook"
                  type="text"
                  className="input-field"
                  placeholder="Page name"
                  value={formData.facebook}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-slate-700 mb-2">
                  Twitter
                </label>
                <input
                  id="twitter"
                  name="twitter"
                  type="text"
                  className="input-field"
                  placeholder="@username"
                  value={formData.twitter}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link href="/club" className="btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
